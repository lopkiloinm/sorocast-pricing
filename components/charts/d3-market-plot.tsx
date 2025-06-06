"use client"

import type React from "react"
import { useEffect, useRef, useMemo, useState } from "react"
import * as d3 from "d3"

const ANIMATION_TRANSITION_DURATION = 200

export interface PlotDataPoint {
  price: number
  quantity: number
}

interface MarketPlotProps {
  width: number
  height: number
  ammAskData: PlotDataPoint[]
  ammBidData: PlotDataPoint[]
  bidData: PlotDataPoint[]
  askData: PlotDataPoint[]
  maxQuantityDisplay: number
  numXTicks?: number
  numYTicks?: number
}

export const MarketPlot: React.FC<MarketPlotProps> = ({
  width,
  height,
  ammAskData,
  ammBidData,
  bidData,
  askData,
  maxQuantityDisplay,
  numXTicks = 5,
  numYTicks = 5,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [isInitialRender, setIsInitialRender] = useState(true)
  const clipPathId = useMemo(() => `plot-clip-${Math.random().toString(36).substring(7)}`, [])

  const margin = useMemo(
    () => ({
      top: 10,
      right: 30,
      bottom: 40,
      left: 55,
    }),
    [],
  )

  const innerWidth = useMemo(() => Math.max(0, width - margin.left - margin.right), [width, margin])
  const innerHeight = useMemo(() => Math.max(0, height - margin.top - margin.bottom), [height, margin])

  const xScale = useMemo(() => d3.scaleLinear().domain([0, 1]).range([0, innerWidth]), [innerWidth])
  const yScale = useMemo(
    () => d3.scaleLinear().domain([0, maxQuantityDisplay]).range([innerHeight, 0]).nice(numYTicks),
    [innerHeight, maxQuantityDisplay, numYTicks],
  )

  const ammLineGenerator = useMemo(
    () =>
      d3
        .line<PlotDataPoint>()
        .x((d) => xScale(d.price))
        .y((d) => yScale(d.quantity))
        .curve(d3.curveMonotoneX),
    [xScale, yScale],
  )

  const orderBookBidLine = useMemo(
    () =>
      d3
        .line<PlotDataPoint>()
        .x((d) => xScale(d.price))
        .y((d) => yScale(d.quantity))
        .curve(d3.curveStepBefore),
    [xScale, yScale],
  )

  const orderBookAskLine = useMemo(
    () =>
      d3
        .line<PlotDataPoint>()
        .x((d) => xScale(d.price))
        .y((d) => yScale(d.quantity))
        .curve(d3.curveStepAfter),
    [xScale, yScale],
  )

  useEffect(() => {
    if (!svgRef.current || innerWidth <= 0 || innerHeight <= 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const mainGroup = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    mainGroup
      .append("clipPath")
      .attr("id", clipPathId)
      .append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)

    const plotArea = mainGroup.append("g").attr("class", "plot-area").attr("clip-path", `url(#${clipPathId})`)

    plotArea
      .append("path")
      .attr("class", "amm-ask-curve")
      .attr("fill", "none")
      .attr("stroke", "#22c55e")
      .attr("stroke-width", 2.5)
      .attr("stroke-dasharray", "5 3")
    plotArea
      .append("path")
      .attr("class", "amm-bid-curve")
      .attr("fill", "none")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 2.5)
      .attr("stroke-dasharray", "5 3")
    plotArea
      .append("path")
      .attr("class", "bid-line")
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
    plotArea
      .append("path")
      .attr("class", "ask-line")
      .attr("fill", "none")
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2)

    const xAxisCall = d3.axisBottom(xScale).ticks(numXTicks).tickFormat(d3.format("$.2f"))
    const yAxisCall = d3.axisLeft(yScale).ticks(numYTicks)

    mainGroup
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxisCall)
      .selectAll(".tick text")
      .each(function (d, i, nodes) {
        const selection = d3.select(this)
        if (selection.empty()) return
        const value = selection.datum() as number
        if (value === 0 || (xScale.domain()[0] === value && i === 0)) {
          selection.style("text-anchor", "start")
        } else if (value === 1 || (xScale.domain()[1] === value && i === nodes.length - 1)) {
          selection.style("text-anchor", "end")
        } else {
          selection.style("text-anchor", "middle")
        }
      })

    mainGroup.select<SVGPathElement>(".x-axis path.domain").attr("stroke", "rgb(113 113 122)") // zinc-500

    mainGroup
      .select<SVGGElement>(".x-axis")
      .append("text")
      .attr("class", "axis-label")
      .attr("x", innerWidth / 2)
      .attr("y", margin.bottom - 5)
      .attr("text-anchor", "middle")
      .style("fill", "rgb(161 161 170)")
      .style("font-size", "12px")
      .text("Price per Share")

    mainGroup.append("g").attr("class", "y-axis").call(yAxisCall)

    mainGroup.select<SVGPathElement>(".y-axis path.domain").attr("stroke", "rgb(113 113 122)") // zinc-500

    mainGroup
      .select<SVGGElement>(".y-axis")
      .append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .style("fill", "rgb(161 161 170)")
      .style("font-size", "12px")
      .text("Cumulative Quantity / Depth")

    const t = isInitialRender
      ? d3.transition().duration(0)
      : d3.transition().duration(ANIMATION_TRANSITION_DURATION).ease(d3.easeLinear)

    plotArea.select<SVGPathElement>(".amm-ask-curve").datum(ammAskData).transition(t).attr("d", ammLineGenerator)
    plotArea.select<SVGPathElement>(".amm-bid-curve").datum(ammBidData).transition(t).attr("d", ammLineGenerator)

    const validBidData =
      bidData.length > 1
        ? bidData
        : [
            { price: 0, quantity: 0 },
            { price: 0, quantity: 0 },
          ]
    plotArea.select<SVGPathElement>(".bid-line").datum(validBidData).transition(t).attr("d", orderBookBidLine)

    const validAskData =
      askData.length > 1
        ? askData
        : [
            { price: 1, quantity: 0 },
            { price: 1, quantity: 0 },
          ]
    plotArea.select<SVGPathElement>(".ask-line").datum(validAskData).transition(t).attr("d", orderBookAskLine)

    if (isInitialRender) setIsInitialRender(false)
  }, [
    width,
    height,
    innerWidth,
    innerHeight,
    xScale,
    yScale,
    numXTicks,
    numYTicks,
    margin,
    ammAskData,
    ammBidData,
    bidData,
    askData,
    ammLineGenerator,
    orderBookBidLine,
    orderBookAskLine,
    isInitialRender,
    clipPathId,
  ])

  return <svg ref={svgRef} width={width} height={height}></svg>
}
