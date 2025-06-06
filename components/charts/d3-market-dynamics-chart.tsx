"use client"

import { useEffect, useRef, useState, useMemo } from "react"
// Import Card, CardHeader, CardTitle, CardDescription, but NOT CardContent
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MarketPlot, type PlotDataPoint } from "./d3-market-plot"
import { MarketVisualizerLegend } from "./market-visualizer-legend"
import { useViewportSize } from "@/hooks/use-viewport-size"

const AMM_B_VALUE_BASE = 40
const MAX_QUANTITY_DISPLAY = 250
const PRICE_RESOLUTION = 75

const VERY_SMALL_SCREEN_BREAKPOINT = 420 // For legend layout
const SMALL_SCREEN_BREAKPOINT = 520 // Used for numXTicks adjustment

const MIN_PLOT_WIDTH = 100
const MIN_PLOT_HEIGHT = 60

const LEGEND_DATA = [
  { name: "AMM Ask Curve", color: "#22c55e", dashed: true },
  { name: "AMM Bid Curve", color: "#10b981", dashed: true },
  { name: "Order Book Bids", color: "#3b82f6" },
  { name: "Order Book Asks", color: "#ef4444" },
]

// Data generation functions (generateAmmCurveData, generateOrderBookSideData)
// remain the same and are omitted for brevity.
const generateAmmCurveData = (
  currentMarketPrice: number,
  bValue: number,
  isAskCurve: boolean,
  priceResolution: number,
): PlotDataPoint[] => {
  const data: PlotDataPoint[] = []
  data.push({ price: currentMarketPrice, quantity: 0 })
  const priceLimit = isAskCurve ? 0.999999 : 0.000001
  const priceStep = Math.abs(priceLimit - currentMarketPrice) / priceResolution
  for (let i = 1; i <= priceResolution; i++) {
    let price = isAskCurve ? currentMarketPrice + i * priceStep : currentMarketPrice - i * priceStep
    price = Math.max(0.0000001, Math.min(0.9999999, price))
    if (price <= 0 || price >= 1) continue
    const q_at_current = bValue * Math.log(currentMarketPrice / (1 - currentMarketPrice))
    const q_at_target_price = bValue * Math.log(price / (1 - price))
    const trueQuantityDelta = Math.abs(q_at_target_price - q_at_current)
    data.push({ price, quantity: trueQuantityDelta })
    if (price === priceLimit && i < priceResolution) break
  }
  return data.sort((a, b) => a.price - b.price)
}

const generateOrderBookSideData = (
  maxDepth = 150,
  currentMidPrice = 0.5,
  currentSpread = 0.02,
  isBids = true,
  points = 35,
): PlotDataPoint[] => {
  const data: PlotDataPoint[] = []
  const bestPrice = isBids ? currentMidPrice - currentSpread / 2 : currentMidPrice + currentSpread / 2
  // Ensure edgePrice is strictly within 0.01 and 0.99 for initial point
  const edgePrice = Math.max(0.01001, Math.min(0.98999, bestPrice))
  data.push({ price: edgePrice, quantity: 0 })

  let cumulativeDepth = 0
  let currentPriceLevel = edgePrice
  let i = 0

  for (i = 0; i < points; i++) {
    if (cumulativeDepth >= maxDepth) break

    // Price Step Generation
    // Increased base randomness for more varied price steps and potentially wider gaps
    const basePriceStepRandomness = 0.0004 + Math.random() * 0.004 // Previously 0.0002 + Math.random() * 0.0025
    const stepGrowthFactor = 1 + Math.pow(i / points, 1.5) * 1.5 // Price steps get larger further from bestPrice
    let priceStepMagnitude = basePriceStepRandomness * stepGrowthFactor
    priceStepMagnitude = Math.max(priceStepMagnitude, 0.0001) // Ensure a minimum price movement

    if (i > 0 || data.length === 1) {
      // Avoid changing price for the very first data point if it's the edgePrice
      currentPriceLevel = isBids
        ? Math.max(0.01001, currentPriceLevel - priceStepMagnitude) // Keep within bounds
        : Math.min(0.98999, currentPriceLevel + priceStepMagnitude) // Keep within bounds
    }

    // If price hasn't changed enough, force a minimal change to avoid too many points at the exact same price
    // unless we are trying to build a wall. This is implicitly handled by quantity logic now.
    if (data.length > 1 && Math.abs(data[data.length - 1].price - currentPriceLevel) < 0.00005 && i < points - 1) {
      currentPriceLevel = isBids ? currentPriceLevel - 0.0001 : currentPriceLevel + 0.0001
      currentPriceLevel = Math.max(0.01001, Math.min(0.98999, currentPriceLevel))
    }

    // Quantity Addition Logic
    let quantityAddedThisStep
    const remainingDepth = Math.max(0, maxDepth - cumulativeDepth)
    const avgQtyForRemainingSteps =
      points - i > 0 && remainingDepth > 0 ? remainingDepth / (points - i) : remainingDepth

    const randQtyProfile = Math.random()

    if (randQtyProfile < 0.15 && remainingDepth > 0.1 * maxDepth) {
      // 15% chance: large "wall", if enough depth remains
      quantityAddedThisStep = remainingDepth * (Math.random() * 0.25 + 0.15) // Add 15-40% of *total remaining* depth
    } else if (randQtyProfile < 0.75 || (remainingDepth <= 0.1 * maxDepth && remainingDepth > 0)) {
      // 60% chance (0.75-0.15): small, incremental depth
      // Or if remaining depth is small, just add small increments
      quantityAddedThisStep = avgQtyForRemainingSteps * (Math.random() * 0.15 + 0.05) // e.g. 5-20% of avg qty for remaining steps
    } else {
      // 10% chance: medium depth
      quantityAddedThisStep = avgQtyForRemainingSteps * (Math.random() * 0.3 + 0.2) // e.g. 20-50% of avg qty for remaining steps
    }

    quantityAddedThisStep = Math.max(0.01, quantityAddedThisStep) // Ensure at least some quantity is added
    quantityAddedThisStep = Math.min(quantityAddedThisStep, remainingDepth) // Don't exceed remaining depth

    const newCumulativeDepth = Math.min(cumulativeDepth + quantityAddedThisStep, maxDepth)

    // Add point or update existing if price is very similar
    if (data.length > 1 && Math.abs(data[data.length - 1].price - currentPriceLevel) < 0.00001) {
      // If price is effectively the same, update the quantity of the last point (builds up a wall)
      data[data.length - 1].quantity = newCumulativeDepth
    } else {
      // If price has moved, add a new point
      data.push({ price: currentPriceLevel, quantity: newCumulativeDepth })
    }

    cumulativeDepth = newCumulativeDepth

    // Stop if price goes out of sensible bounds
    if ((isBids && currentPriceLevel <= 0.01001) || (!isBids && currentPriceLevel >= 0.98999)) break
  }

  // Ensure the final point reaches maxDepth if not already there
  if (data.length > 0 && data[data.length - 1].quantity < maxDepth) {
    const lastPoint = data[data.length - 1]
    // If we are at the iteration limit or price is at the extreme, force last point to maxDepth
    if (i >= points - 1 || (isBids && lastPoint.price < 0.011) || (!isBids && lastPoint.price > 0.989)) {
      data[data.length - 1].quantity = maxDepth
    } else {
      // Otherwise, add one more point at a slightly further price to represent the full depth
      const finalPriceStep = 0.001 + Math.random() * 0.002 // Small step for the final fill
      const finalPrice = isBids
        ? Math.max(0.01, lastPoint.price - finalPriceStep)
        : Math.min(0.99, lastPoint.price + finalPriceStep)

      if (Math.abs(lastPoint.price - finalPrice) < 0.00001 && data.length > 1) {
        // If final price is too close to last point's price, just update last point
        data[data.length - 1].quantity = maxDepth
      } else {
        data.push({ price: finalPrice, quantity: maxDepth })
      }
    }
  }

  // Filter out points with zero quantity, unless it's the very first point (edgePrice)
  const filteredData = data.filter((d, index) => d.quantity > 0 || index === 0)
  return filteredData.sort((a, b) => (isBids ? b.price - a.price : a.price - b.price))
}

interface MarketVisualizerChartProps {
  width: number
  height: number
}

export function MarketVisualizerChart({ width: totalWidthPx, height: totalHeightPx }: MarketVisualizerChartProps) {
  const viewport = useViewportSize()
  const animationFrameRef = useRef<number | null>(null)
  const plotContainerRef = useRef<HTMLDivElement>(null) // Renamed for clarity

  const [dynamicParams, setDynamicParams] = useState({
    ammCurrentPrice: 0.5,
    orderBookMidPrice: 0.5,
    orderBookSpread: 0.04,
    bidMaxDepth: 130,
    askMaxDepth: 130,
    ammBValue: AMM_B_VALUE_BASE,
  })

  useEffect(() => {
    let startTime: number | null = null
    const animateParams = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsedTime = (timestamp - startTime) / 1000
      setDynamicParams({
        ammCurrentPrice: Math.max(0.01, Math.min(0.99, 0.5 + 0.45 * Math.sin(elapsedTime * 0.3))),
        orderBookMidPrice: Math.max(0.01, Math.min(0.99, 0.5 + 0.43 * Math.sin(elapsedTime * 0.25 + 0.3))),
        orderBookSpread: 0.015 + 0.03 * ((1 + Math.cos(elapsedTime * 0.45)) / 2),
        bidMaxDepth: 100 + 90 * ((1 + Math.sin(elapsedTime * 0.2)) / 2),
        askMaxDepth: 90 + 80 * ((1 + Math.cos(elapsedTime * 0.28 + 0.8)) / 2),
        ammBValue: AMM_B_VALUE_BASE + 15 * Math.sin(elapsedTime * 0.15),
      })
      animationFrameRef.current = requestAnimationFrame(animateParams)
    }
    animationFrameRef.current = requestAnimationFrame(animateParams)
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  const ammAskData = useMemo(
    () => generateAmmCurveData(dynamicParams.ammCurrentPrice, dynamicParams.ammBValue, true, PRICE_RESOLUTION),
    [dynamicParams.ammCurrentPrice, dynamicParams.ammBValue],
  )
  const ammBidData = useMemo(
    () => generateAmmCurveData(dynamicParams.ammCurrentPrice, dynamicParams.ammBValue, false, PRICE_RESOLUTION),
    [dynamicParams.ammCurrentPrice, dynamicParams.ammBValue],
  )
  const bidData = useMemo(
    () =>
      generateOrderBookSideData(
        dynamicParams.bidMaxDepth,
        dynamicParams.orderBookMidPrice,
        dynamicParams.orderBookSpread,
        true,
      ),
    [dynamicParams.bidMaxDepth, dynamicParams.orderBookMidPrice, dynamicParams.orderBookSpread],
  )
  const askData = useMemo(
    () =>
      generateOrderBookSideData(
        dynamicParams.askMaxDepth,
        dynamicParams.orderBookMidPrice,
        dynamicParams.orderBookSpread,
        false,
      ),
    [dynamicParams.askMaxDepth, dynamicParams.orderBookMidPrice, dynamicParams.orderBookSpread],
  )

  const [plotDimensions, setPlotDimensions] = useState({ width: 0, height: 0 })
  const legendLayout = totalWidthPx < VERY_SMALL_SCREEN_BREAKPOINT ? "stacked" : "horizontal"

  useEffect(() => {
    if (
      totalWidthPx <= 0 ||
      totalHeightPx <= 0 ||
      !plotContainerRef.current // Ensure the plot container div ref is available
    ) {
      setPlotDimensions({ width: 0, height: 0 })
      return
    }

    const containerEl = plotContainerRef.current
    const availableWidthForPlot = containerEl.clientWidth
    const availableHeightForPlot = containerEl.clientHeight

    setPlotDimensions({
      width: Math.max(MIN_PLOT_WIDTH, availableWidthForPlot),
      height: Math.max(MIN_PLOT_HEIGHT, availableHeightForPlot),
    })
  }, [totalWidthPx, totalHeightPx, viewport.width, viewport.height, legendLayout])

  const numXTicks = useMemo(() => {
    if (plotDimensions.width < SMALL_SCREEN_BREAKPOINT - 100) return 3
    return 5
  }, [plotDimensions.width])

  const numYTicks = useMemo(() => {
    if (plotDimensions.height < 200) return 3
    return 5
  }, [plotDimensions.height])

  if (totalWidthPx <= 0 || totalHeightPx <= 0) {
    return null
  }

  return (
    <Card
      style={{
        width: totalWidthPx,
        height: totalHeightPx,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <CardHeader className="p-3">
        {" "}
        {/* Reduced padding for header */}
        <CardTitle>Comparing Market Liquidity: AMM vs. Order Book</CardTitle>
        <CardDescription>
          Animated visualization showing how an Automated Market Maker's (AMM) pricing curve offers continuous liquidity
          across a range of prices, contrasted with a traditional order book's discrete depth levels and bid-ask spread.
          Observe the dynamic shifts as market conditions evolve.
        </CardDescription>
      </CardHeader>
      <MarketVisualizerLegend data={LEGEND_DATA} layout={legendLayout} />
      {/* Plain div used for the plot container, replacing CardContent */}
      <div
        ref={plotContainerRef}
        style={{
          flexGrow: 1, // Takes all available vertical space
          padding: 0, // Explicitly no padding
          minHeight: 0, // Crucial for flex-grow
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden", // To contain the plot
          position: "relative", // Often useful for positioning child SVG
        }}
      >
        {plotDimensions.width > 0 && plotDimensions.height > 0 && (
          <MarketPlot
            width={plotDimensions.width}
            height={plotDimensions.height}
            ammAskData={ammAskData}
            ammBidData={ammBidData}
            bidData={bidData}
            askData={askData}
            maxQuantityDisplay={MAX_QUANTITY_DISPLAY}
            numXTicks={numXTicks}
            numYTicks={numYTicks}
          />
        )}
      </div>
    </Card>
  )
}
