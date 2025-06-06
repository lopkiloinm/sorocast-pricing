"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, ZoomIn, ZoomOut, RefreshCw } from "lucide-react"
import { MarketProbabilityCurve } from "@/components/market-probability-curve"
import { simulateBuy, simulateSell, MarketMap, MIN_SHARES, SCALE } from "@/lib/market-utils"

// Simple debounce hook implementation to avoid the import error
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

interface UnifiedTradeInterfaceProps {
  market: any
  selectedOutcome: string | null
  userShares: { [key: string]: number }
  onSelectOutcome: (outcome: string) => void
  onTrade: (outcome: string, shares: number, cost: number) => void
  qSeeders?: any
  seeders?: any
}

export function UnifiedTradeInterface({
  market,
  selectedOutcome,
  userShares,
  onSelectOutcome,
  onTrade,
  qSeeders,
  seeders,
}: UnifiedTradeInterfaceProps) {
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")
  const [shares, setShares] = useState<string>("100")
  const [cost, setCost] = useState<number>(0)
  const [fee, setFee] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)
  const [newProbability, setNewProbability] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [chartCost, setChartCost] = useState<number>(0)
  const debouncedShares = useDebounce(shares, 500)

  // Chart range state
  const [minShares, setMinShares] = useState<string>("-500")
  const [maxShares, setMaxShares] = useState<string>("500")
  const [chartRange, setChartRange] = useState<[number, number]>([-500, 500])
  const debouncedMinShares = useDebounce(minShares, 500)
  const debouncedMaxShares = useDebounce(maxShares, 500)

  const isBinary = market?.marketType === "binary"
  const isCategorical = market?.marketType === "categorical"
  const isRanged = market?.marketType === "ranged"

  // Update chart range when min/max inputs change
  useEffect(() => {
    const min = Number.parseFloat(debouncedMinShares)
    const max = Number.parseFloat(debouncedMaxShares)

    if (!isNaN(min) && !isNaN(max) && min < max) {
      setChartRange([min, max])
    }
  }, [debouncedMinShares, debouncedMaxShares])

  // Reset chart range to default
  const resetChartRange = () => {
    const defaultRange = market?.b ? [-market.b, market.b] : [-500, 500]
    setMinShares(defaultRange[0].toString())
    setMaxShares(defaultRange[1].toString())
    setChartRange(defaultRange)
  }

  // Zoom in (reduce range by 50%)
  const zoomIn = () => {
    const center = (chartRange[0] + chartRange[1]) / 2
    const range = chartRange[1] - chartRange[0]
    const newRange = range / 2
    const newMin = center - newRange / 2
    const newMax = center + newRange / 2
    setMinShares(newMin.toFixed(0))
    setMaxShares(newMax.toFixed(0))
    setChartRange([newMin, newMax])
  }

  // Zoom out (increase range by 100%)
  const zoomOut = () => {
    const center = (chartRange[0] + chartRange[1]) / 2
    const range = chartRange[1] - chartRange[0]
    const newRange = range * 2
    const newMin = center - newRange / 2
    const newMax = center + newRange / 2
    setMinShares(newMin.toFixed(0))
    setMaxShares(newMax.toFixed(0))
    setChartRange([newMin, newMax])
  }

  // Get the outcome index based on the selected outcome
  const getOutcomeIndex = () => {
    if (!selectedOutcome || !market?.options) return 0
    return market.options.findIndex((option: any) => option.name === selectedOutcome)
  }

  // Get user's current shares for the selected outcome
  const getUserShares = () => {
    if (!selectedOutcome) return 0
    return userShares[selectedOutcome] || 0
  }

  // Generate curve data for the chart
  const generateCurveData = () => {
    if (!market || !selectedOutcome) return []

    const outcomeIndex = getOutcomeIndex()
    if (outcomeIndex === -1) return []

    // Generate data points using actual LMSR math
    const curveData = []
    const maxSharesValue = Math.max(Math.abs(chartRange[0]), Math.abs(chartRange[1]))
    const numPoints = 50 // Reduced for performance

    // Create market object for simulation
    const marketObj = {
      metadata: market.metadata,
      seeders: market.seedersMap,
      qSeeders: market.qSeeders,
      qReal: market.qReal,
      shares: market.shares,
    }

    // Get current price for the selected outcome
    const currentPrice = getCurrentPrice()

    // Add the current point (0 shares, current price)
    curveData.push({
      shares: 0,
      probability: currentPrice,
    })

    // Generate buy points within the chart range
    const buyStep = (chartRange[1] - 0) / (numPoints / 2)
    for (let i = 1; i <= numPoints / 2; i++) {
      const shares = i * buyStep
      if (shares <= 0) continue

      try {
        // Use actual simulateBuy function
        const { newPrices } = simulateBuy("simulation_user", outcomeIndex, shares, marketObj)

        curveData.push({
          shares: shares,
          probability: newPrices[outcomeIndex],
        })
      } catch (error) {
        console.error("Error simulating buy:", error)
      }
    }

    // Generate sell points within the chart range
    const currentUserShares = getUserShares()
    const maxSellShares = Math.min(
      currentUserShares > 0 ? currentUserShares : Math.abs(chartRange[0]),
      Math.abs(chartRange[0]),
    )

    if (maxSellShares > 0) {
      // Create a temporary market object with shares for the simulation user
      const tempMarketObj = {
        metadata: market.metadata,
        seeders: market.seedersMap,
        qSeeders: market.qSeeders,
        qReal: market.qReal,
        shares: new MarketMap<[string, number], number>(),
      }

      // Add shares for the simulation user
      tempMarketObj.shares.set(["simulation_user", outcomeIndex], maxSellShares)

      const sellStep = (0 - chartRange[0]) / (numPoints / 2)
      for (let i = 1; i <= numPoints / 2; i++) {
        const sellShares = i * sellStep
        if (sellShares <= 0) continue
        if (sellShares > maxSellShares) break

        try {
          // Use actual simulateSell function
          const { newPrices } = simulateSell("simulation_user", outcomeIndex, sellShares, tempMarketObj)

          curveData.push({
            shares: -sellShares,
            probability: newPrices[outcomeIndex],
          })
        } catch (error) {
          console.error("Error simulating sell:", error)
        }
      }
    }

    // Sort by shares amount
    curveData.sort((a, b) => a.shares - b.shares)

    return curveData
  }

  const getSimulatedTradeDetailsForChart = (
    sharesToSimulate: number,
  ): { cost: number; fee: number; newProbability: number; error?: string } | null => {
    if (
      !selectedOutcome ||
      Number.isNaN(sharesToSimulate) ||
      !market ||
      !market.seedersMap ||
      !market.qSeeders ||
      !market.qReal ||
      !market.shares
    ) {
      return null
    }

    const outcomeIndex = getOutcomeIndex()
    const currentUserShares = getUserShares() // Actual user's shares

    const simTradeType = sharesToSimulate >= 0 ? "buy" : "sell"
    const sharesNumAbs = Math.abs(sharesToSimulate)

    if (sharesNumAbs < MIN_SHARES && sharesNumAbs !== 0) {
      // Allow 0 for initial state
      return { cost: 0, fee: 0, newProbability: getCurrentPrice(), error: `Min ${MIN_SHARES} shares` }
    }
    if (simTradeType === "sell" && sharesNumAbs > currentUserShares) {
      return { cost: 0, fee: 0, newProbability: getCurrentPrice(), error: `Max ${currentUserShares} sell` }
    }

    try {
      const simulatedSharesMap = new MarketMap<[string, number], number>()
      market.shares.entries().forEach(([key, value]) => {
        simulatedSharesMap.set(key, value)
      })

      if (simTradeType === "sell") {
        const existingSimUserShares = simulatedSharesMap.get(["chart_sim_user", outcomeIndex]) || 0
        simulatedSharesMap.set(
          ["chart_sim_user", outcomeIndex],
          Math.max(existingSimUserShares, sharesNumAbs, currentUserShares),
        )
      }

      const marketObjForSimulation = {
        metadata: market.metadata,
        seeders: market.seedersMap,
        qSeeders: market.qSeeders,
        qReal: market.qReal,
        shares: simulatedSharesMap,
      }

      if (simTradeType === "buy") {
        if (sharesNumAbs === 0) return { cost: 0, fee: 0, newProbability: getCurrentPrice() }

        const {
          cost: costStroops,
          fee: feeStroops,
          newPrices,
        } = simulateBuy("chart_sim_user", outcomeIndex, sharesNumAbs, marketObjForSimulation)
        return {
          cost: costStroops / SCALE,
          fee: feeStroops / SCALE,
          newProbability: newPrices[outcomeIndex],
        }
      } else {
        // sell
        if (sharesNumAbs === 0) return { cost: 0, fee: 0, newProbability: getCurrentPrice() }

        const { refund: refundStroops, newPrices } = simulateSell(
          "chart_sim_user",
          outcomeIndex,
          sharesNumAbs,
          marketObjForSimulation,
        )
        return {
          cost: refundStroops / SCALE, // For sell, "cost" is what user receives
          fee: 0,
          newProbability: newPrices[outcomeIndex],
        }
      }
    } catch (e: any) {
      console.error("Chart sim error:", e)
      return { cost: 0, fee: 0, newProbability: getCurrentPrice(), error: e.message || "Sim Error" }
    }
  }

  // Calculate cost based on simplified LMSR cost function
  useEffect(() => {
    if (
      !selectedOutcome ||
      !debouncedShares ||
      Number.isNaN(Number.parseFloat(debouncedShares)) ||
      !market ||
      !market.seedersMap ||
      !market.qSeeders ||
      !market.qReal ||
      !market.shares
    ) {
      setCost(0)
      setFee(0)
      setTotal(0)
      setNewProbability(null)
      setChartCost(0)
      setError(null) // Clear previous errors
      return
    }

    const sharesNum = Number.parseFloat(debouncedShares)
    const outcomeIndex = getOutcomeIndex()
    const currentUserShares = getUserShares() // This is from the userShares prop (simple object)

    // Local validation before attempting simulation
    if (sharesNum < MIN_SHARES) {
      // MIN_SHARES from market-utils
      setError(`Shares must be at least ${MIN_SHARES}.`)
      setCost(0)
      setFee(0)
      setTotal(0)
      setNewProbability(null)
      setChartCost(0)
      return
    }
    if (tradeType === "sell" && sharesNum > currentUserShares) {
      setError(`You only have ${currentUserShares} shares of ${selectedOutcome} to sell.`)
      setCost(0)
      setFee(0)
      setTotal(0)
      setNewProbability(null)
      setChartCost(0)
      return
    }
    setError(null) // Clear error if validation passes

    try {
      // Prepare the market object for simulation
      // Clone the shares map for sell simulation to ensure the simulation user has enough shares
      const simulatedSharesMap = new MarketMap<[string, number], number>()
      market.shares.entries().forEach(([key, value]) => {
        simulatedSharesMap.set(key, value)
      })

      if (tradeType === "sell") {
        // Ensure our simulation user has enough shares for the simulateSell internal check
        // The actual user's shares are checked above, this is for the simulation function's logic
        const existingSimUserShares = simulatedSharesMap.get(["simulation_user_for_ui", outcomeIndex]) || 0
        simulatedSharesMap.set(
          ["simulation_user_for_ui", outcomeIndex],
          Math.max(existingSimUserShares, sharesNum, currentUserShares),
        )
      }

      const marketObjForSimulation = {
        metadata: market.metadata,
        seeders: market.seedersMap, // Use market.seedersMap from the market prop
        qSeeders: market.qSeeders, // Use market.qSeeders from the market prop
        qReal: market.qReal,
        shares: simulatedSharesMap, // Use the cloned and potentially modified shares map
      }

      if (tradeType === "buy") {
        const {
          cost: costStroops,
          fee: feeStroops,
          newPrices,
        } = simulateBuy(
          "simulation_user_for_ui", // A dummy user for simulation purposes
          outcomeIndex,
          sharesNum,
          marketObjForSimulation,
        )

        const calculatedCost = costStroops / SCALE
        const calculatedFee = feeStroops / SCALE
        const calculatedTotal = calculatedCost + calculatedFee

        setCost(calculatedCost)
        setFee(calculatedFee)
        setTotal(calculatedTotal)
        setChartCost(calculatedCost) // For highlighting on chart
        setNewProbability(newPrices[outcomeIndex])
      } else {
        // tradeType === "sell"
        const { refund: refundStroops, newPrices } = simulateSell(
          "simulation_user_for_ui", // A dummy user for simulation purposes
          outcomeIndex,
          sharesNum,
          marketObjForSimulation,
        )

        const calculatedRefund = refundStroops / SCALE

        setCost(calculatedRefund) // "Cost" here means what the user receives
        setFee(0) // Sell operations typically have no explicit fee in this model (fees are on buy)
        setTotal(calculatedRefund)
        setChartCost(-calculatedRefund) // Negative for chart representation of sell
        setNewProbability(newPrices[outcomeIndex])
      }
    } catch (e: any) {
      console.error("Error during trade simulation:", e)
      setError(e.message || "Error calculating trade.")
      setCost(0)
      setFee(0)
      setTotal(0)
      setNewProbability(null)
      setChartCost(0)
    }
  }, [debouncedShares, selectedOutcome, tradeType, market, userShares])

  const handleSharesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShares(e.target.value)
  }

  const handleQuickAmount = (amount: number) => {
    setShares(amount.toString())
  }

  const handleTradeTypeChange = (value: string) => {
    setTradeType(value as "buy" | "sell")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOutcome || error) return

    const sharesNum = Number.parseFloat(shares)
    const effectiveShares = tradeType === "buy" ? sharesNum : -sharesNum

    onTrade(selectedOutcome, effectiveShares, total)

    // Reset shares input after trade
    setShares("100")
  }

  const handleChartClick = (newShares: number) => {
    // Update the trade type based on the sign of shares
    if (newShares < 0) {
      setTradeType("sell")
    } else {
      setTradeType("buy")
    }

    // Update the shares input (use absolute value for the input)
    setShares(Math.abs(Math.round(newShares)).toString())
  }

  // Get current market price
  const getCurrentPrice = () => {
    if (!selectedOutcome || !market?.options) return 0.5
    const option = market.options.find((opt: any) => opt.name === selectedOutcome)
    // Make sure we're parsing the price as a number
    return option ? Number.parseFloat(option.price) : 0.5
  }

  // Get balanced price (1/n for n outcomes)
  const getBalancedPrice = () => {
    if (!market?.options || market.options.length === 0) return 0.5
    return 1 / market.options.length
  }

  // Calculate average price (cost per share)
  const getAveragePrice = () => {
    if (!shares || Number.parseFloat(shares) <= 0) return 0
    const sharesNum = Number.parseFloat(shares)
    return cost / sharesNum
  }

  const currentPrice = getCurrentPrice()
  const averagePrice = getAveragePrice()

  // Get color for outcome
  const getOutcomeColor = () => {
    if (!selectedOutcome) return "green"

    if (isBinary) {
      return selectedOutcome === "Yes" ? "green" : "red"
    }

    if (isRanged) {
      return "yellow"
    }

    // For categorical, use index-based color
    const index = getOutcomeIndex()
    const colors = ["green", "red", "blue", "purple", "yellow", "orange", "pink", "indigo", "teal", "cyan"]
    return colors[index % colors.length]
  }

  const outcomeColor = getOutcomeColor()

  // Get button classes based on outcome color
  const getButtonClasses = (isDisabled: boolean) => {
    // Changed text-white to text-black for the main action buttons
    const baseClasses = "w-full text-black h-8 text-sm"

    if (isDisabled) {
      return `${baseClasses} opacity-50 cursor-not-allowed bg-zinc-600`
    }

    // Use the outcome color for both buy and sell buttons
    switch (outcomeColor) {
      case "green":
        return `${baseClasses} bg-green-600 hover:bg-green-700`
      case "red":
        return `${baseClasses} bg-red-600 hover:bg-red-700`
      case "blue":
        return `${baseClasses} bg-blue-600 hover:bg-blue-700`
      case "purple":
        return `${baseClasses} bg-purple-600 hover:bg-purple-700`
      case "yellow":
        return `${baseClasses} bg-yellow-600 hover:bg-yellow-700`
      case "orange":
        return `${baseClasses} bg-orange-600 hover:bg-orange-700`
      case "pink":
        return `${baseClasses} bg-pink-600 hover:bg-pink-700`
      case "indigo":
        return `${baseClasses} bg-indigo-600 hover:bg-indigo-700`
      case "teal":
        return `${baseClasses} bg-teal-600 hover:bg-teal-700`
      case "cyan":
        return `${baseClasses} bg-cyan-600 hover:bg-cyan-700`
      default:
        return `${baseClasses} bg-green-600 hover:bg-green-700`
    }
  }

  const buyButtonDisabled = !!error || !shares || Number.parseFloat(shares) <= 0
  const sellButtonDisabled =
    !!error ||
    !shares ||
    Number.parseFloat(shares) <= 0 ||
    Number.parseFloat(shares) > (userShares[selectedOutcome] || 0)

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="p-3">
        <CardTitle className="text-base">Trade</CardTitle>
        {!selectedOutcome && <div className="text-xs text-zinc-400">Select an outcome above to start trading</div>}
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {selectedOutcome ? (
          <div className="space-y-4">
            <div className="text-sm font-medium text-white">Trading {selectedOutcome}</div>

            {/* Chart Section - Show for all market types */}
            <div className="flex flex-col">
              {/* Chart Range Controls */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1">
                  <label htmlFor="min-shares" className="block text-xs font-medium text-zinc-400 mb-1">
                    Min Shares
                  </label>
                  <Input
                    id="min-shares"
                    type="number"
                    value={minShares}
                    onChange={(e) => setMinShares(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 h-7 text-xs"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="max-shares" className="block text-xs font-medium text-zinc-400 mb-1">
                    Max Shares
                  </label>
                  <Input
                    id="max-shares"
                    type="number"
                    value={maxShares}
                    onChange={(e) => setMaxShares(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 h-7 text-xs"
                  />
                </div>
                <div className="flex flex-col justify-end gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                    onClick={zoomIn}
                    title="Zoom In"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex flex-col justify-end gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                    onClick={zoomOut}
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex flex-col justify-end gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                    onClick={resetChartRange}
                    title="Reset Zoom"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Price Curve Chart */}
              <div className="relative" style={{ height: "200px" }}>
                {market && (
                  <MarketProbabilityCurve
                    curveData={generateCurveData()}
                    currentPrice={currentPrice}
                    balancedPrice={getBalancedPrice()}
                    userShares={getUserShares()}
                    outcomeIndex={getOutcomeIndex()}
                    isBinary={isBinary}
                    selectedOutcome={selectedOutcome}
                    onSharesChange={handleChartClick}
                    inputShares={tradeType === "buy" ? Number(shares) : -Number(shares)}
                    chartRange={chartRange}
                    getSimulatedTradeDetails={getSimulatedTradeDetailsForChart}
                  />
                )}
              </div>

              {/* Chart instructions - completely separate from the chart */}
              <div className="bg-zinc-800/30 rounded p-2 mt-1">
                <p className="text-xs text-zinc-400">
                  <span className="font-medium">Tap or drag</span> on the chart to select shares.
                  {getUserShares() > 0 && (
                    <>
                      {" "}
                      <span className="inline-block">Orange line = max sell limit.</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Form Section */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Tabs defaultValue="buy" value={tradeType} onValueChange={handleTradeTypeChange} className="w-full">
                  <TabsList className="grid grid-cols-2 bg-zinc-800 h-8">
                    <TabsTrigger value="buy" className="text-xs py-1">
                      Buy
                    </TabsTrigger>
                    <TabsTrigger value="sell" className="text-xs py-1">
                      Sell
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="buy" className="space-y-3 mt-3">
                    <div>
                      <label htmlFor="shares" className="block text-xs font-medium text-zinc-400 mb-1">
                        Shares to Buy
                      </label>
                      <Input
                        id="shares"
                        type="number"
                        value={shares}
                        onChange={handleSharesChange}
                        className="bg-zinc-800 border-zinc-700 h-8 text-sm"
                        min="1"
                        step="1"
                      />
                      <div className="grid grid-cols-4 gap-1 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
                          onClick={() => handleQuickAmount(10)}
                        >
                          10
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
                          onClick={() => handleQuickAmount(50)}
                        >
                          50
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
                          onClick={() => handleQuickAmount(100)}
                        >
                          100
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
                          onClick={() => handleQuickAmount(500)}
                        >
                          500
                        </Button>
                      </div>
                    </div>

                    {error && (
                      <div className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {error}
                      </div>
                    )}

                    <div className="bg-zinc-800 rounded-lg p-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Cost:</span>
                        <span className="text-white">{cost.toFixed(2)} XLM</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Fee:</span>
                        <span className="text-white">{fee.toFixed(2)} XLM</span>
                      </div>
                      <div className="border-t border-zinc-700 my-1 pt-1"></div>
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-zinc-300">Total:</span>
                        <span className="text-white">{total.toFixed(2)} XLM</span>
                      </div>
                    </div>

                    <div className="bg-zinc-800 rounded-lg p-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Current Price:</span>
                        <span className="text-white">{(currentPrice * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Average Price:</span>
                        <span className="text-white">{(averagePrice * 100).toFixed(1)}%</span>
                      </div>
                      {newProbability !== null && (
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-400">New Price:</span>
                          <span className="text-white">{(newProbability * 100).toFixed(1)}%</span>
                        </div>
                      )}
                    </div>

                    <Button type="submit" className={getButtonClasses(buyButtonDisabled)} disabled={buyButtonDisabled}>
                      Buy {shares} Shares
                    </Button>
                  </TabsContent>

                  <TabsContent value="sell" className="space-y-3 mt-3">
                    <div>
                      <label htmlFor="shares-sell" className="block text-xs font-medium text-zinc-400 mb-1">
                        Shares to Sell
                      </label>
                      <Input
                        id="shares-sell"
                        type="number"
                        value={shares}
                        onChange={handleSharesChange}
                        className="bg-zinc-800 border-zinc-700 h-8 text-sm"
                        min="1"
                        max={userShares[selectedOutcome] || 0}
                        step="1"
                      />
                      <div className="grid grid-cols-4 gap-1 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
                          onClick={() => handleQuickAmount(Math.min(10, userShares[selectedOutcome] || 0))}
                          disabled={!userShares[selectedOutcome] || userShares[selectedOutcome] < 1}
                        >
                          10
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
                          onClick={() => handleQuickAmount(Math.min(50, userShares[selectedOutcome] || 0))}
                          disabled={!userShares[selectedOutcome] || userShares[selectedOutcome] < 1}
                        >
                          50
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
                          onClick={() => handleQuickAmount(Math.min(100, userShares[selectedOutcome] || 0))}
                          disabled={!userShares[selectedOutcome] || userShares[selectedOutcome] < 1}
                        >
                          100
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
                          onClick={() => handleQuickAmount(Math.min(500, userShares[selectedOutcome] || 0))}
                          disabled={!userShares[selectedOutcome] || userShares[selectedOutcome] < 1}
                        >
                          500
                        </Button>
                      </div>
                    </div>

                    {error && (
                      <div className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {error}
                      </div>
                    )}

                    <div className="bg-zinc-800 rounded-lg p-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Receive:</span>
                        <span className="text-white">{cost.toFixed(2)} XLM</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Fee:</span>
                        <span className="text-white">0.00 XLM</span>
                      </div>
                      <div className="border-t border-zinc-700 my-1 pt-1"></div>
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-zinc-300">Total:</span>
                        <span className="text-white">{total.toFixed(2)} XLM</span>
                      </div>
                    </div>

                    <div className="bg-zinc-800 rounded-lg p-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Current Price:</span>
                        <span className="text-white">{(currentPrice * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Average Price:</span>
                        <span className="text-white">{(averagePrice * 100).toFixed(1)}%</span>
                      </div>
                      {newProbability !== null && (
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-400">New Price:</span>
                          <span className="text-white">{(newProbability * 100).toFixed(1)}%</span>
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className={getButtonClasses(sellButtonDisabled)}
                      disabled={sellButtonDisabled}
                    >
                      Sell {shares} Shares
                    </Button>
                  </TabsContent>
                </Tabs>
              </form>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-zinc-400">Select an outcome above to start trading</div>
        )}
      </CardContent>
      <CardFooter className="border-t border-zinc-800 bg-zinc-950 rounded-b-lg p-3">
        <div className="w-full">
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-medium text-amber-500">Trading Fees</span>
          </div>
          <p className="text-xs text-zinc-400">
            A fee of 0.02 XLM per share is applied to buy orders. No fees are applied to sell orders.
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
