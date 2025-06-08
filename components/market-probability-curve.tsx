"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"

interface MarketProbabilityCurveProps {
  // Data for the single curve to be plotted
  // x: shares for the current action (always positive, 0 to maxSharesOnAxis)
  // y: probability of the outcome being displayed
  curveDataPoints: { x: number; y: number }[]
  currentProbability: number // Current probability of the displayed outcome (at x=0 shares for action)
  isSellAction: boolean // True if the current context is selling the displayed outcome
  sellLimitShares?: number // Max shares user can sell of this outcome (only if isSellAction)
  onSharesChange?: (sharesForAction: number) => void // Callback with selected shares for action
  inputSharesForAction?: number // Externally controlled shares for action from UI input
  maxSharesOnAxis: number // Defines the x-axis range [0, maxSharesOnAxis]
  // Simulates trade for 'sharesForAction' of the 'displayOutcome'
  getSimulatedTradeDetailsForChart?: (
    sharesForAction: number,
  ) => { cost: number; fee: number; newProbability: number; error?: string } | null
  outcomeName: "Yes" | "No" // For axis labels and tooltips
  lineColor: string
  shadingColor: string
  sellLimitLineColor?: string
}

export function MarketProbabilityCurve({
  curveDataPoints = [],
  currentProbability = 0.5,
  isSellAction = false,
  sellLimitShares,
  onSharesChange,
  inputSharesForAction,
  maxSharesOnAxis = 500,
  getSimulatedTradeDetailsForChart,
  outcomeName = "Yes",
  lineColor = "#22c55e",
  shadingColor = "rgba(34, 197, 94, 0.4)",
  sellLimitLineColor = "#f59e0b",
}: MarketProbabilityCurveProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedShares, setSelectedShares] = useState<number>(0) // Shares for action
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const isDraggingRef = useRef(false)
  const lastTouchSharesRef = useRef<number | null>(null)

  const getProbAtShares = (shares: number): number => {
    if (!curveDataPoints || curveDataPoints.length === 0) return currentProbability
    if (shares <= 0) return curveDataPoints.find((d) => d.x === 0)?.y ?? currentProbability
    if (shares >= maxSharesOnAxis) return curveDataPoints.find((d) => d.x === maxSharesOnAxis)?.y ?? currentProbability

    let lower = curveDataPoints[0],
      upper = curveDataPoints[curveDataPoints.length - 1]
    for (let i = 0; i < curveDataPoints.length; i++) {
      if (curveDataPoints[i].x <= shares && (i === curveDataPoints.length - 1 || curveDataPoints[i + 1].x > shares)) {
        lower = curveDataPoints[i]
        upper = i < curveDataPoints.length - 1 ? curveDataPoints[i + 1] : curveDataPoints[i]
        break
      }
    }
    if (upper.x === lower.x) return lower.y
    const ratio = (shares - lower.x) / (upper.x - lower.x)
    return lower.y + ratio * (upper.y - lower.y)
  }

  const updateShading = (sharesForAction: number) => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    const shadingLayer = svg.select(".shading-layer")
    if (!shadingLayer.node()) return

    const chartWidth = Number.parseFloat(svg.attr("data-chart-width") || "0")
    const chartHeight = Number.parseFloat(svg.attr("data-chart-height") || "0")
    const xScale = d3.scaleLinear().domain([0, maxSharesOnAxis]).range([0, chartWidth])
    const yScale = d3.scaleLinear().domain([0, 1]).range([chartHeight, 0])

    let clampedShares = sharesForAction
    if (isSellAction && sellLimitShares !== undefined && sharesForAction > sellLimitShares) {
      clampedShares = sellLimitShares
    }
    clampedShares = Math.max(0, Math.min(clampedShares, maxSharesOnAxis))

    shadingLayer.selectAll("*").remove()

    const areaPoints = []
    const startX = 0 // Always start shading from 0 shares for action
    const endX = clampedShares

    areaPoints.push([xScale(startX), chartHeight]) // Bottom-left at current shares
    areaPoints.push([xScale(startX), yScale(currentProbability)]) // Top-left at current shares

    const numPoints = 50
    const step = (endX - startX) / numPoints
    for (let i = 1; i <= numPoints; i++) {
      const s = startX + i * step
      areaPoints.push([xScale(s), yScale(getProbAtShares(s))])
    }
    areaPoints.push([xScale(endX), chartHeight]) // Bottom-right at selected shares

    shadingLayer
      .append("polygon")
      .attr("class", "shading-area")
      .attr("points", areaPoints.map((p) => p.join(",")).join(" "))
      .attr("fill", shadingColor)

    let finalMarkerProb = currentProbability
    if (getSimulatedTradeDetailsForChart) {
      const details = getSimulatedTradeDetailsForChart(clampedShares)
      if (details && !details.error) finalMarkerProb = details.newProbability
    } else {
      finalMarkerProb = getProbAtShares(clampedShares)
    }

    shadingLayer
      .append("circle")
      .attr("class", "selected-marker")
      .attr("cx", xScale(clampedShares))
      .attr("cy", yScale(finalMarkerProb))
      .attr("r", 4)
      .attr("fill", lineColor)
  }

  const notifySharesChange = (shares: number) => {
    let clampedShares = shares
    if (isSellAction && sellLimitShares !== undefined && shares > sellLimitShares) {
      clampedShares = sellLimitShares
    }
    clampedShares = Math.max(0, Math.min(clampedShares, maxSharesOnAxis))
    const roundedShares = Math.round(clampedShares)

    setSelectedShares(roundedShares)
    updateShading(roundedShares)
    if (onSharesChange) onSharesChange(roundedShares)
  }

  const initializeChart = () => {
    if (!svgRef.current || !containerRef.current || !curveDataPoints || curveDataPoints.length === 0) return

    const svgNode = svgRef.current
    while (svgNode.firstChild) svgNode.removeChild(svgNode.firstChild)

    const margin = { top: 20, right: 20, bottom: 30, left: 40 }
    const width = dimensions.width - margin.left - margin.right
    const height = Math.min(dimensions.height, 250) - margin.top - margin.bottom // Keep chart height reasonable

    // Store chart dimensions for updateShading
    d3.select(svgRef.current).attr("data-chart-width", width).attr("data-chart-height", height)

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const gridLayer = svg.append("g").attr("class", "grid-layer")
    const shadingLayer = svg.append("g").attr("class", "shading-layer")
    const chartLayer = svg.append("g").attr("class", "chart-layer")
    const interactiveLayer = svg.append("g").attr("class", "interactive-layer")

    const xScale = d3.scaleLinear().domain([0, maxSharesOnAxis]).range([0, width])
    const yScale = d3.scaleLinear().domain([0, 1]).range([height, 0])

    gridLayer
      .append("g")
      .attr("class", "grid x")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(-height)
          .tickFormat(() => ""),
      )
      .attr("color", "#27272a")
    gridLayer
      .append("g")
      .attr("class", "grid y")
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => ""),
      )
      .attr("color", "#27272a")

    if (isSellAction && sellLimitShares !== undefined && sellLimitShares <= maxSharesOnAxis) {
      gridLayer
        .append("line")
        .attr("x1", xScale(sellLimitShares))
        .attr("y1", 0)
        .attr("x2", xScale(sellLimitShares))
        .attr("y2", height)
        .attr("stroke", sellLimitLineColor)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4")
    }

    const xAxis = d3.axisBottom(xScale).ticks(5)
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.format(".0%")).ticks(5)
    chartLayer
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .attr("color", "#71717a")
    chartLayer.select(".x-axis path.domain").attr("stroke", "#52525b")
    chartLayer.append("g").attr("class", "y-axis").call(yAxis).attr("color", "#71717a")
    chartLayer.select(".y-axis path.domain").attr("stroke", "#52525b")

    const lineGen = d3
      .line<{ x: number; y: number }>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(d3.curveMonotoneX)
    const visibleCurveData = curveDataPoints.filter((d) => d.x >= 0 && d.x <= maxSharesOnAxis)
    if (visibleCurveData.length > 0) {
      chartLayer
        .append("path")
        .datum(visibleCurveData)
        .attr("fill", "none")
        .attr("stroke", lineColor)
        .attr("stroke-width", 2)
        .attr("d", lineGen)
    }

    chartLayer
      .append("circle")
      .attr("cx", xScale(0))
      .attr("cy", yScale(currentProbability))
      .attr("r", 4)
      .attr("fill", lineColor)

    // Tooltip
    const focus = interactiveLayer.append("g").attr("class", "focus").style("display", "none")
    focus
      .append("rect")
      .attr("class", "tooltip")
      .attr("width", 160)
      .attr("height", 50)
      .attr("x", 10)
      .attr("y", -22)
      .attr("rx", 4)
      .attr("fill", "#18181b")
      .attr("stroke", lineColor)
      .attr("opacity", 0.9)
    focus
      .append("text")
      .attr("class", "tooltip-shares")
      .attr("x", 15)
      .attr("y", -7)
      .attr("fill", "#d4d4d8")
      .attr("font-size", "10px")
    focus
      .append("text")
      .attr("class", "tooltip-prob")
      .attr("x", 15)
      .attr("y", 8)
      .attr("fill", "#d4d4d8")
      .attr("font-size", "10px")
    focus
      .append("text")
      .attr("class", "tooltip-cost")
      .attr("x", 15)
      .attr("y", 23)
      .attr("fill", "#d4d4d8")
      .attr("font-size", "10px")
    focus
      .append("circle")
      .attr("class", "focus-marker")
      .attr("r", 4)
      .attr("fill", "#ffffff")
      .attr("stroke", lineColor)
      .attr("stroke-width", 2)

    const overlay = interactiveLayer
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .style("cursor", "pointer")
      .style("touch-action", "none")

    const handleInteraction = (event: any, isTouch = false) => {
      focus.style("display", null)
      const [mouseX] = d3.pointer(event, overlay.node())
      let shares = xScale.invert(mouseX)
      if (isSellAction && sellLimitShares !== undefined && shares > sellLimitShares) shares = sellLimitShares
      shares = Math.max(0, Math.min(shares, maxSharesOnAxis))

      const newProb = getProbAtShares(shares)
      let costText = "Calculating..."
      if (getSimulatedTradeDetailsForChart) {
        const details = getSimulatedTradeDetailsForChart(shares)
        if (details && !details.error) {
          costText = isSellAction
            ? `Est. Rev: ${Math.abs(details.cost).toFixed(2)}`
            : `Est. Cost: ${(details.cost + details.fee).toFixed(2)}`
        } else if (details && details.error) costText = "N/A"
      }

      focus.attr("transform", `translate(${xScale(shares)},${yScale(newProb)})`)
      focus
        .select(".tooltip-shares")
        .text(`${isSellAction ? "Sell" : "Buy"} ${Math.round(shares)} ${outcomeName} Shares`)
      focus.select(".tooltip-prob").text(`New P(${outcomeName}): ${(newProb * 100).toFixed(1)}%`)
      focus.select(".tooltip-cost").text(costText)
      if (isTouch) lastTouchSharesRef.current = shares
    }

    overlay
      .on("mouseleave", () => focus.style("display", "none"))
      .on("mousemove", (e) => handleInteraction(e))
      .on("click", (e) => {
        if (isDraggingRef.current) {
          isDraggingRef.current = false
          return
        }
        const [mouseX] = d3.pointer(e, overlay.node())
        notifySharesChange(xScale.invert(mouseX))
      })
      .on("touchstart", (e) => {
        e.preventDefault()
        isDraggingRef.current = false
        handleInteraction(e.touches[0], true)
      })
      .on("touchmove", (e) => {
        e.preventDefault()
        isDraggingRef.current = true
        handleInteraction(e.touches[0], true)
        if (lastTouchSharesRef.current !== null) updateShading(Math.round(lastTouchSharesRef.current))
      })
      .on("touchend", (e) => {
        e.preventDefault()
        if (lastTouchSharesRef.current !== null) notifySharesChange(lastTouchSharesRef.current)
        isDraggingRef.current = false
        focus.style("display", "none")
        lastTouchSharesRef.current = null
      })

    updateShading(selectedShares)
    focus.style("display", "none")
  }

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver((entries) => setDimensions(entries[0].contentRect))
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) initializeChart()
  }, [
    dimensions,
    curveDataPoints,
    currentProbability,
    isSellAction,
    sellLimitShares,
    maxSharesOnAxis,
    outcomeName,
    lineColor,
  ])

  useEffect(() => {
    if (inputSharesForAction !== undefined) {
      const clamped = Math.max(0, Math.min(inputSharesForAction, maxSharesOnAxis))
      setSelectedShares(clamped)
      updateShading(clamped)
    }
  }, [inputSharesForAction, maxSharesOnAxis])

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col" style={{ minHeight: "200px" }}>
      <div className="flex-grow">
        <svg ref={svgRef} className="overflow-visible w-full h-full"></svg>
      </div>
    </div>
  )
}
