"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"

interface MarketProbabilityCurveProps {
  curveData: { shares: number; probability: number }[] // Pre-calculated curve data points
  currentPrice: number // Current price/probability
  balancedPrice: number // Balanced or fair price (usually 1/n)
  userShares: number // User's current shares for the selected outcome
  outcomeIndex: number // Index of the selected outcome
  isBinary: boolean // Whether this is a binary market
  selectedOutcome: string | null // Name of the selected outcome
  onSharesChange?: (shares: number) => void // Callback when user selects shares
  inputShares?: number // Externally controlled shares value
  chartRange?: [number, number] // Custom chart range [min, max]
  getSimulatedTradeDetails?: (
    shares: number,
  ) => { cost: number; fee: number; newProbability: number; error?: string } | null
}

export function MarketProbabilityCurve({
  curveData = [],
  currentPrice = 0.5,
  balancedPrice = 0.5,
  userShares = 0,
  outcomeIndex = 0,
  isBinary = true,
  selectedOutcome = null,
  onSharesChange,
  inputShares,
  chartRange = [-500, 500],
  getSimulatedTradeDetails,
}: MarketProbabilityCurveProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredShares, setHoveredShares] = useState<number | null>(null)
  const [selectedShares, setSelectedShares] = useState<number>(100)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const isMouseOverChartRef = useRef(false)
  const isDraggingRef = useRef(false)
  const lastTouchSharesRef = useRef<number | null>(null)

  // Helper to simulate cost for a given number of shares
  // This is a simple approximation used for visualization purposes only
  // const estimateCostForShares = (shares: number): number => {
  //   if (!curveData || curveData.length < 2) return shares * currentPrice

  //   // Find probability at the given shares position by interpolation
  //   const startProb = currentPrice
  //   const endProb =
  //     shares > 0 ? d3.max(curveData, (d) => d.probability) || 1 : d3.min(curveData, (d) => d.probability) || 0

  //   // Simple integral approximation (area under curve)
  //   // In a real market, this would be calculated precisely using market formulas
  //   const avgPrice = (startProb + endProb) / 2
  //   return shares * avgPrice
  // }

  // Get color scheme based on outcome
  const getOutcomeColors = () => {
    if (isBinary) {
      if (selectedOutcome === "Yes") {
        return {
          line: "#22c55e",
          shading: "rgba(34, 197, 94, 0.4)",
          marker: "#22c55e",
        }
      } else {
        return {
          line: "#ef4444",
          shading: "rgba(239, 68, 68, 0.4)",
          marker: "#ef4444",
        }
      }
    } else {
      // For categorical and ranged, use index-based colors
      const colorSchemes = [
        { line: "#22c55e", shading: "rgba(34, 197, 94, 0.4)", marker: "#22c55e" }, // green
        { line: "#ef4444", shading: "rgba(239, 68, 68, 0.4)", marker: "#ef4444" }, // red
        { line: "#3b82f6", shading: "rgba(59, 130, 246, 0.4)", marker: "#3b82f6" }, // blue
        { line: "#a855f7", shading: "rgba(168, 85, 247, 0.4)", marker: "#a855f7" }, // purple
        { line: "#eab308", shading: "rgba(234, 179, 8, 0.4)", marker: "#eab308" }, // yellow
        { line: "#f97316", shading: "rgba(249, 115, 22, 0.4)", marker: "#f97316" }, // orange
        { line: "#ec4899", shading: "rgba(236, 72, 153, 0.4)", marker: "#ec4899" }, // pink
        { line: "#6366f1", shading: "rgba(99, 102, 241, 0.4)", marker: "#6366f1" }, // indigo
        { line: "#14b8a6", shading: "rgba(20, 184, 166, 0.4)", marker: "#14b8a6" }, // teal
        { line: "#06b6d4", shading: "rgba(6, 182, 212, 0.4)", marker: "#06b6d4" }, // cyan
      ]
      return colorSchemes[outcomeIndex % colorSchemes.length]
    }
  }

  // Find probability for a given share amount by interpolating the curve data
  const getProbabilityAtShares = (shares: number): number => {
    if (!curveData || curveData.length === 0) return currentPrice

    // If shares is outside the domain of curveData, clamp to the closest value
    const minShares = d3.min(curveData, (d) => d.shares) || chartRange[0]
    const maxShares = d3.max(curveData, (d) => d.shares) || chartRange[1]

    if (shares <= minShares) return curveData.find((d) => d.shares === minShares)?.probability || currentPrice
    if (shares >= maxShares) return curveData.find((d) => d.shares === maxShares)?.probability || currentPrice

    // Find the two closest points for interpolation
    let lower = curveData[0]
    let upper = curveData[curveData.length - 1]

    for (let i = 0; i < curveData.length; i++) {
      if (curveData[i].shares <= shares && (i === curveData.length - 1 || curveData[i + 1].shares > shares)) {
        lower = curveData[i]
        upper = i < curveData.length - 1 ? curveData[i + 1] : curveData[i]
        break
      }
    }

    // Perform linear interpolation
    if (upper.shares === lower.shares) return lower.probability

    const ratio = (shares - lower.shares) / (upper.shares - lower.shares)
    return lower.probability + ratio * (upper.probability - lower.probability)
  }

  // Update the shading on the chart
  const updateShading = (shares: number) => {
    if (!svgRef.current || !selectedOutcome) return

    const svg = d3.select(svgRef.current)
    const shadingLayer = svg.select(".shading-layer")
    if (!shadingLayer.node()) return

    // Get the current scales from attributes
    const width = Number.parseFloat(svg.attr("width") || "0") - 60 // Adjust for margins
    const height = Number.parseFloat(svg.attr("height") || "0") - 50 // Adjust for margins

    // Use the custom chart range instead of data-derived domain
    const xDomain = chartRange

    // Create scales
    const xScale = d3.scaleLinear().domain(xDomain).range([0, width])
    const yScale = d3.scaleLinear().domain([0, 1]).range([height, 0])

    // Ensure we don't sell more than we own
    if (shares < -userShares) {
      shares = -userShares
    }

    // Remove existing shading elements
    shadingLayer.selectAll(".shading-area").remove()
    shadingLayer.selectAll(".cost-label").remove()
    shadingLayer.selectAll(".selected-marker").remove()
    shadingLayer.selectAll(".limit-marker").remove()

    const colors = getOutcomeColors()

    // Create points for the shaded area
    const areaPoints = []
    const start = 0
    const end = shares

    // Start at bottom left
    areaPoints.push([xScale(start), height])

    // Go up to the curve at start
    areaPoints.push([xScale(start), yScale(currentPrice)])

    // Add points along the curve from start to end
    const numPoints = 50
    const step = (end - start) / numPoints

    for (let i = 1; i <= numPoints; i++) {
      const s = start + i * step
      const prob = getProbabilityAtShares(s)
      areaPoints.push([xScale(s), yScale(prob)])
    }

    // Go straight down to the bottom at end
    areaPoints.push([xScale(end), height])

    // Create the polygon for shading
    shadingLayer
      .append("polygon")
      .attr("class", "shading-area")
      .attr("points", areaPoints.map((point) => point.join(",")).join(" "))
      .attr("fill", colors.shading)
      .attr("stroke", "none")

    // Add cost annotation
    // const cost = estimateCostForShares(shares)
    // const costLabel =
    //   shares > 0 ? `Cost: ${Math.abs(cost).toFixed(2)} XLM` : `Revenue: ${Math.abs(cost).toFixed(2)} XLM`

    let costLabel = "Calculating..."
    let newPrice = currentPrice // Fallback
    let details
    if (getSimulatedTradeDetails) {
      details = getSimulatedTradeDetails(shares)
      if (details && !details.error) {
        const displayCost = shares > 0 ? details.cost + details.fee : details.cost // For sell, cost is refund
        costLabel =
          shares > 0 ? `Cost: ${displayCost.toFixed(2)} XLM` : `Revenue: ${Math.abs(displayCost).toFixed(2)} XLM`
        newPrice = details.newProbability
      } else if (details && details.error) {
        costLabel = "N/A" // Or details.error
      }
    } else {
      costLabel = "Cost N/A"
    }

    shadingLayer
      .append("text")
      .attr("class", "cost-label")
      .attr("x", xScale(shares / 2))
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "#d4d4d8")
      .attr("font-size", "12px")
      .text(costLabel)

    // Add selected position marker
    // const newPrice = getProbabilityAtShares(shares)
    const finalNewPrice = details && !details.error ? details.newProbability : getProbabilityAtShares(shares)
    shadingLayer
      .append("circle")
      .attr("class", "selected-marker")
      .attr("cx", xScale(shares))
      .attr("cy", yScale(finalNewPrice)) // Use finalNewPrice
      .attr("r", 4)
      .attr("fill", colors.marker)

    // Only show the selling limit marker if it's within the visible chart area
    if (userShares > 0) {
      const limitX = xScale(-userShares)
      // Check if the limit is within the visible chart area
      if (limitX >= 0 && limitX <= width) {
        const limitPrice = getProbabilityAtShares(-userShares)
        shadingLayer
          .append("circle")
          .attr("class", "limit-marker")
          .attr("cx", limitX)
          .attr("cy", yScale(limitPrice))
          .attr("r", 6)
          .attr("fill", "none")
          .attr("stroke", "#f59e0b")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "2,2")
      }
    }
  }

  // Function to notify parent of share changes
  const notifyShareChange = (shares: number) => {
    // Ensure we don't sell more than we own
    if (shares < -userShares) {
      shares = -userShares
    }

    // Round to nearest integer for clarity
    const roundedShares = Math.round(shares)

    // Update local state for shading
    setSelectedShares(roundedShares)

    // Update shading
    updateShading(roundedShares)

    // Notify parent component if callback exists
    if (onSharesChange) {
      onSharesChange(roundedShares)
    }
  }

  // Initialize the chart
  const initializeChart = () => {
    if (!svgRef.current || !containerRef.current || !selectedOutcome || !curveData || curveData.length === 0) return

    // Clear previous chart
    const svgNode = svgRef.current
    while (svgNode.firstChild) {
      svgNode.removeChild(svgNode.firstChild)
    }

    // Set up dimensions
    const margin = { top: 20, right: 20, bottom: 30, left: 40 }
    const width = dimensions.width - margin.left - margin.right
    const height = Math.min(dimensions.height, 250) - margin.top - margin.bottom

    // Always use the custom chart range, never derive from data
    const xMin = chartRange[0]
    const xMax = chartRange[1]

    // Store domain in SVG attributes for later use
    d3.select(svgRef.current).attr("data-x-min", xMin).attr("data-x-max", xMax)

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Create layers
    const gridLayer = svg.append("g").attr("class", "grid-layer")
    const shadingLayer = svg.append("g").attr("class", "shading-layer")
    const chartLayer = svg.append("g").attr("class", "chart-layer")
    const interactiveLayer = svg.append("g").attr("class", "interactive-layer")

    // Set up scales using the custom chart range
    const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, width])
    const yScale = d3.scaleLinear().domain([0, 1]).range([height, 0])

    // Create axes
    const xAxis = d3.axisBottom(xScale).ticks(5)
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.format(".0%")).ticks(5)

    // Add grid lines
    gridLayer
      .append("g")
      .attr("class", "grid")
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
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => ""),
      )
      .attr("color", "#27272a")

    // Add horizontal line at the balanced probability
    gridLayer
      .append("line")
      .attr("x1", 0)
      .attr("y1", yScale(balancedPrice))
      .attr("x2", width)
      .attr("y2", yScale(balancedPrice))
      .attr("stroke", "#71717a")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4")

    // Add label for the balanced probability line
    gridLayer
      .append("text")
      .attr("x", width - 5)
      .attr("y", yScale(balancedPrice) - 5)
      .attr("text-anchor", "end")
      .attr("fill", "#71717a")
      .attr("font-size", "10px")
      .text(`Balanced: ${(balancedPrice * 100).toFixed(1)}%`)

    // Add vertical line at 0 shares (current position) - only if it's within the chart range
    if (0 >= xMin && 0 <= xMax) {
      gridLayer
        .append("line")
        .attr("x1", xScale(0))
        .attr("y1", 0)
        .attr("x2", xScale(0))
        .attr("y2", height)
        .attr("stroke", "#52525b")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4")
    }

    // Add selling limit line if user has shares and it's within the visible chart area
    if (userShares > 0) {
      const limitShares = -userShares
      // Only show the line if it's within the custom chart range
      if (limitShares >= xMin && limitShares <= xMax) {
        gridLayer
          .append("line")
          .attr("x1", xScale(limitShares))
          .attr("y1", 0)
          .attr("x2", xScale(limitShares))
          .attr("y2", height)
          .attr("stroke", "#f59e0b")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "4")
      }
    }

    // Add axes
    chartLayer
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .attr("color", "#71717a")
    chartLayer.select(".x-axis path.domain").attr("stroke", "#52525b") // zinc-600

    chartLayer.append("g").attr("class", "y-axis").call(yAxis).attr("color", "#71717a")
    chartLayer.select(".y-axis path.domain").attr("stroke", "#52525b") // zinc-600

    // Create line generator
    const line = d3
      .line<{ shares: number; probability: number }>()
      .x((d) => xScale(d.shares))
      .y((d) => yScale(d.probability))
      .curve(d3.curveMonotoneX)

    const colors = getOutcomeColors()

    // Filter curve data to only include points within the chart range
    const visibleCurveData = curveData.filter((d) => d.shares >= xMin && d.shares <= xMax)

    // Add probability curve - only the visible portion
    if (visibleCurveData.length > 0) {
      chartLayer
        .append("path")
        .datum(visibleCurveData)
        .attr("fill", "none")
        .attr("stroke", colors.line)
        .attr("stroke-width", 2)
        .attr("d", line)
    }

    // Add current position marker - only if it's within the chart range
    if (0 >= xMin && 0 <= xMax) {
      chartLayer
        .append("circle")
        .attr("cx", xScale(0))
        .attr("cy", yScale(currentPrice))
        .attr("r", 4)
        .attr("fill", colors.marker)
    }

    // Add current probability annotation
    chartLayer
      .append("text")
      .attr("x", 5)
      .attr("y", 15)
      .attr("text-anchor", "start")
      .attr("fill", "#d4d4d8")
      .attr("font-size", "10px")
      .text(`Current price: ${(currentPrice * 100).toFixed(1)}%`)

    // Add user's current shares information if they have any
    if (userShares > 0) {
      chartLayer
        .append("text")
        .attr("x", width - 5)
        .attr("y", 15)
        .attr("text-anchor", "end")
        .attr("fill", "#d4d4d8")
        .attr("font-size", "10px")
        .text(`Your shares: ${userShares}`)
    }

    // Create tooltip
    const focus = interactiveLayer.append("g").attr("class", "focus").style("display", "none")

    focus
      .append("rect")
      .attr("class", "tooltip")
      .attr("width", 140)
      .attr("height", 50)
      .attr("x", 10)
      .attr("y", -22)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("fill", "#18181b")
      .attr("stroke", colors.line)
      .attr("stroke-width", 1)
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
      .attr("class", "tooltip-probability")
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

    focus.append("circle").attr("r", 4).attr("fill", "#ffffff").attr("stroke", colors.line).attr("stroke-width", 2)

    focus
      .append("circle")
      .attr("class", "touch-indicator")
      .attr("r", 12)
      .attr("fill", "none")
      .attr("stroke", colors.line)
      .attr("stroke-width", 2)
      .attr("opacity", 0.5)
      .attr("stroke-dasharray", "3,3")

    // Create overlay for interactions
    const overlay = interactiveLayer
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .style("cursor", "pointer")
      .style("touch-action", "none")

    // Track mouse events
    overlay
      .on("mouseenter", () => {
        isMouseOverChartRef.current = true
      })
      .on("mouseleave", () => {
        isMouseOverChartRef.current = false
        focus.style("display", "none")
        setHoveredShares(null)
      })

    // Handle mouse movement
    overlay.on("mousemove", (event) => {
      if (!isMouseOverChartRef.current) return

      focus.style("display", null)

      const mouse = d3.pointer(event)
      const x0 = xScale.invert(mouse[0])

      // Ensure we don't show selling more than the user owns
      let shares = x0
      if (shares < -userShares) {
        shares = -userShares
      }

      // const probability = getProbabilityAtShares(shares)
      // const cost = estimateCostForShares(shares)
      // const action = shares > 0 ? "Buy" : "Sell"
      // const costLabel =
      //   shares > 0 ? `Cost: ${Math.abs(cost).toFixed(2)} XLM` : `Revenue: ${Math.abs(cost).toFixed(2)} XLM`

      let displayProbability = getProbabilityAtShares(shares) // Fallback
      let displayCostLabel = "Calculating..."
      const action = shares > 0 ? "Buy" : "Sell"

      let details
      if (getSimulatedTradeDetails) {
        details = getSimulatedTradeDetails(shares)
        if (details && !details.error) {
          displayProbability = details.newProbability
          const tooltipDisplayCost = shares > 0 ? details.cost + details.fee : details.cost
          displayCostLabel =
            shares > 0
              ? `Cost: ${tooltipDisplayCost.toFixed(2)} XLM`
              : `Revenue: ${Math.abs(tooltipDisplayCost).toFixed(2)} XLM`
        } else if (details && details.error) {
          displayCostLabel = "N/A" // Or details.error
        }
      } else {
        displayCostLabel = "Cost N/A"
      }

      focus
        .select("circle")
        .filter((_, i, nodes) => d3.select(nodes[i]).attr("r") === "4") // Select the smaller circle
        .attr("cy", 0) // It's relative to the focus group's transform

      focus.attr("transform", `translate(${xScale(shares)},${yScale(displayProbability)})`)
      focus.select(".tooltip-shares").text(`${action}: ${Math.abs(Math.round(shares)).toFixed(0)} shares`) // Round shares for display
      focus.select(".tooltip-probability").text(`New Price: ${(displayProbability * 100).toFixed(1)}%`)
      focus.select(".tooltip-cost").text(displayCostLabel)

      setHoveredShares(shares)
    })

    // Handle click
    overlay.on("click", (event) => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false
        return
      }

      const mouse = d3.pointer(event)
      const shares = xScale.invert(mouse[0])
      notifyShareChange(shares)
    })

    // Touch events
    overlay
      .on("touchstart", (event) => {
        event.preventDefault()
        isMouseOverChartRef.current = true
        isDraggingRef.current = false

        const touch = event.touches[0]
        const svgElement = svgRef.current
        if (!svgElement) return

        const svgRect = svgElement.getBoundingClientRect()
        const touchX = touch.clientX - svgRect.left - margin.left
        const touchShares = xScale.invert(touchX)

        // Ensure we don't show selling more than the user owns
        let shares = touchShares
        if (shares < -userShares) {
          shares = -userShares
        }

        lastTouchSharesRef.current = shares

        // Show tooltip
        focus.style("display", null)

        // const probability = getProbabilityAtShares(shares)
        // const cost = estimateCostForShares(shares)
        // const action = shares > 0 ? "Buy" : "Sell"
        // const costLabel =
        //   shares > 0 ? `Cost: ${Math.abs(cost).toFixed(2)} XLM` : `Revenue: ${Math.abs(cost).toFixed(2)} XLM`

        let displayProbability = getProbabilityAtShares(shares) // Fallback
        let displayCostLabel = "Calculating..."
        const action = shares > 0 ? "Buy" : "Sell"

        let details
        if (getSimulatedTradeDetails) {
          details = getSimulatedTradeDetails(shares)
          if (details && !details.error) {
            displayProbability = details.newProbability
            const tooltipDisplayCost = shares > 0 ? details.cost + details.fee : details.cost
            displayCostLabel =
              shares > 0
                ? `Cost: ${tooltipDisplayCost.toFixed(2)} XLM`
                : `Revenue: ${Math.abs(tooltipDisplayCost).toFixed(2)} XLM`
          } else if (details && details.error) {
            displayCostLabel = "N/A" // Or details.error
          }
        } else {
          displayCostLabel = "Cost N/A"
        }

        focus
          .select("circle")
          .filter((_, i, nodes) => d3.select(nodes[i]).attr("r") === "4") // Select the smaller circle
          .attr("cy", 0) // It's relative to the focus group's transform

        focus.attr("transform", `translate(${xScale(shares)},${yScale(displayProbability)})`)
        focus.select(".tooltip-shares").text(`${action}: ${Math.abs(Math.round(shares)).toFixed(0)} shares`) // Round shares for display
        focus.select(".tooltip-probability").text(`New Price: ${(displayProbability * 100).toFixed(1)}%`)
        focus.select(".tooltip-cost").text(displayCostLabel)

        setHoveredShares(shares)
      })
      .on("touchmove", (event) => {
        event.preventDefault()
        isDraggingRef.current = true

        const touch = event.touches[0]
        const svgElement = svgRef.current
        if (!svgElement) return

        const svgRect = svgElement.getBoundingClientRect()
        const touchX = touch.clientX - svgRect.left - margin.left
        const touchShares = xScale.invert(touchX)

        // Ensure we don't show selling more than the user owns
        let shares = touchShares
        if (shares < -userShares) {
          shares = -userShares
        }

        lastTouchSharesRef.current = shares

        // Show tooltip
        focus.style("display", null)

        // const probability = getProbabilityAtShares(shares)
        // const cost = estimateCostForShares(shares)
        // const action = shares > 0 ? "Buy" : "Sell"
        // const costLabel =
        //   shares > 0 ? `Cost: ${Math.abs(cost).toFixed(2)} XLM` : `Revenue: ${Math.abs(cost).toFixed(2)} XLM`

        let displayProbability = getProbabilityAtShares(shares) // Fallback
        let displayCostLabel = "Calculating..."
        const action = shares > 0 ? "Buy" : "Sell"

        let details
        if (getSimulatedTradeDetails) {
          details = getSimulatedTradeDetails(shares)
          if (details && !details.error) {
            displayProbability = details.newProbability
            const tooltipDisplayCost = shares > 0 ? details.cost + details.fee : details.cost
            displayCostLabel =
              shares > 0
                ? `Cost: ${tooltipDisplayCost.toFixed(2)} XLM`
                : `Revenue: ${Math.abs(tooltipDisplayCost).toFixed(2)} XLM`
          } else if (details && details.error) {
            displayCostLabel = "N/A" // Or details.error
          }
        } else {
          displayCostLabel = "Cost N/A"
        }

        focus
          .select("circle")
          .filter((_, i, nodes) => d3.select(nodes[i]).attr("r") === "4") // Select the smaller circle
          .attr("cy", 0) // It's relative to the focus group's transform

        focus.attr("transform", `translate(${xScale(shares)},${yScale(displayProbability)})`)
        focus.select(".tooltip-shares").text(`${action}: ${Math.abs(Math.round(shares)).toFixed(0)} shares`) // Round shares for display
        focus.select(".tooltip-probability").text(`New Price: ${(displayProbability * 100).toFixed(1)}%`)
        focus.select(".tooltip-cost").text(displayCostLabel)

        setHoveredShares(shares)
        updateShading(Math.round(shares))
      })
      .on("touchend", (event) => {
        event.preventDefault()

        if (lastTouchSharesRef.current !== null) {
          notifyShareChange(lastTouchSharesRef.current)
        }

        isDraggingRef.current = false
        isMouseOverChartRef.current = false
        focus.style("display", "none")
        lastTouchSharesRef.current = null
      })
      .on("touchcancel", (event) => {
        event.preventDefault()
        isDraggingRef.current = false
        isMouseOverChartRef.current = false
        focus.style("display", "none")
        lastTouchSharesRef.current = null
      })

    // Initial shading
    updateShading(selectedShares)

    // Ensure tooltip is hidden initially
    focus.style("display", "none")
  }

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setDimensions({ width, height })
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => {
      if (containerRef.current) {
        resizeObserver.disconnect()
      }
    }
  }, [])

  // Initialize chart when dimensions or key props change
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      initializeChart()
    }
  }, [
    dimensions,
    selectedOutcome,
    curveData,
    currentPrice,
    balancedPrice,
    userShares,
    outcomeIndex,
    chartRange,
    getSimulatedTradeDetails,
  ])

  // Reset selected shares when outcome changes
  useEffect(() => {
    setSelectedShares(100)
  }, [selectedOutcome])

  // Update when input shares change
  useEffect(() => {
    if (inputShares !== undefined && selectedOutcome) {
      setSelectedShares(inputShares)
      updateShading(inputShares)
    }
  }, [inputShares, selectedOutcome])

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col" style={{ minHeight: "200px" }}>
      {selectedOutcome ? (
        <div className="flex-grow">
          <svg ref={svgRef} className="overflow-visible w-full h-full"></svg>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-zinc-400">Select an outcome above to view the price curve</p>
        </div>
      )}
    </div>
  )
}
