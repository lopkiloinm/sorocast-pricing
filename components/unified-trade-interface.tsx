"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, ZoomIn, ZoomOut, RefreshCw } from "lucide-react"
import { MarketProbabilityCurve } from "@/components/market-probability-curve"
import {
  simulateBuy,
  simulateSell,
  MarketMap,
  MIN_SHARES,
  SCALE,
  type BinaryMarketState,
  marketPrice,
} from "@/lib/market-utils"

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

type ActionType = "buy_yes" | "sell_yes" | "buy_no" | "sell_no"

interface UnifiedTradeInterfaceProps {
  market: BinaryMarketState & { marketType: "range"; range: { min: number; max: number } }
  selectedRange: string | null
  userYesShares: number
  userNoShares: number
  onTradeSubmit: (params: {
    assetType: "yes" | "no"
    action: "buy" | "sell"
    sharesToTrade: number
    totalCostOrRefundStroops: number
    totalFeeStroops: number
  }) => void
}

const MAX_SHARES_ON_CHART_AXIS = 1000 // Default max for chart x-axis

export function UnifiedTradeInterface({
  market,
  selectedRange,
  userYesShares,
  userNoShares,
  onTradeSubmit,
}: UnifiedTradeInterfaceProps) {
  const [activeAction, setActiveAction] = useState<ActionType>("buy_yes")
  const [sharesInput, setSharesInput] = useState<string>("100") // Always positive
  const [cost, setCost] = useState<number>(0)
  const [fee, setFee] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)
  const [newPYesFromSim, setNewPYesFromSim] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const debouncedSharesInput = useDebounce(sharesInput, 500)

  // Chart zoom/pan state for the positive shares axis [0, currentMaxSharesOnAxis]
  const [currentMaxSharesOnAxis, setCurrentMaxSharesOnAxis] = useState(MAX_SHARES_ON_CHART_AXIS)

  const { action1, label1, action2, label2 } = useMemo(() => {
    if (userYesShares > 0) return { action1: "buy_yes", label1: "Buy Yes", action2: "sell_yes", label2: "Sell Yes" }
    if (userNoShares > 0) return { action1: "buy_no", label1: "Buy No", action2: "sell_no", label2: "Sell No" }
    return { action1: "buy_yes", label1: "Buy Yes", action2: "buy_no", label2: "Buy No" }
  }, [userYesShares, userNoShares])

  useEffect(() => {
    if (activeAction !== action1 && activeAction !== action2) setActiveAction(action1)
    setSharesInput("100") // Reset shares input on tab change
    setError(null)
  }, [action1, action2, selectedRange, activeAction])

  const resetChartRange = () => setCurrentMaxSharesOnAxis(MAX_SHARES_ON_CHART_AXIS)
  const zoomInChart = () => setCurrentMaxSharesOnAxis((prev) => Math.max(MIN_SHARES * 2, Math.round(prev / 1.5)))
  const zoomOutChart = () => setCurrentMaxSharesOnAxis((prev) => Math.min(50000, Math.round(prev * 1.5)))

  const currentPYes = market ? marketPrice(market.qSeeders, market.seeders, 0) : 0.5
  const currentPNo = 1 - currentPYes

  const displayOutcomeForChart = useMemo(() => (activeAction.endsWith("yes") ? "yes" : "no"), [activeAction])
  const isSellActionForChart = useMemo(() => activeAction.startsWith("sell"), [activeAction])

  const currentProbabilityForChart = displayOutcomeForChart === "yes" ? currentPYes : currentPNo
  const sellLimitForChart = isSellActionForChart
    ? displayOutcomeForChart === "yes"
      ? userYesShares
      : userNoShares
    : undefined

  const chartColors = useMemo(() => {
    return displayOutcomeForChart === "yes"
      ? { line: "#22c55e", shading: "rgba(34, 197, 94, 0.3)", sellLimit: "#f59e0b" }
      : { line: "#3b82f6", shading: "rgba(59, 130, 246, 0.3)", sellLimit: "#ec4899" }
  }, [displayOutcomeForChart])

  const generateCurveDataForChart = useCallback(() => {
    if (!market || !selectedRange) return []
    const points: { x: number; y: number }[] = []
    const numPointsOnCurve = 50
    const step = currentMaxSharesOnAxis / numPointsOnCurve

    for (let i = 0; i <= numPointsOnCurve; i++) {
      const sharesForAction = i * step // This is always positive, shares for the current action
      let sharesEffectOnPYes: number

      switch (activeAction) {
        case "buy_yes":
          sharesEffectOnPYes = sharesForAction
          break
        case "sell_yes":
          sharesEffectOnPYes = -sharesForAction
          break
        case "buy_no":
          sharesEffectOnPYes = -sharesForAction
          break
        case "sell_no":
          sharesEffectOnPYes = sharesForAction
          break
        default:
          sharesEffectOnPYes = 0
      }

      let pYesAfterEffect = currentPYes,
        pNoAfterEffect = currentPNo
      if (sharesForAction > 0) {
        // Only simulate if shares are changing
        try {
          if (sharesEffectOnPYes >= 0) {
            // Buy Yes or Sell No
            const simOutcomeIndex = activeAction === "buy_yes" ? 0 : 1 // 0 for Yes, 1 for No
            // If selling No, we simulate buying Yes with equivalent shares to find P(Yes) effect
            // If buying Yes, simulate buying Yes
            const { newPrices } = simulateBuy("sim_curve", 0, Math.abs(sharesEffectOnPYes), market)
            pYesAfterEffect = newPrices[0]
            pNoAfterEffect = newPrices[1]
          } else {
            // Sell Yes or Buy No
            const simOutcomeIndex = activeAction === "sell_yes" ? 0 : 1
            // If buying No, simulate selling Yes with equivalent shares
            // If selling Yes, simulate selling Yes
            const tempMarket = { ...market, shares: new MarketMap(market.shares.entries()) }
            tempMarket.shares.set(["sim_curve_sell", 0], Math.abs(sharesEffectOnPYes))
            const { newPrices } = simulateSell("sim_curve_sell", 0, Math.abs(sharesEffectOnPYes), tempMarket)
            pYesAfterEffect = newPrices[0]
            pNoAfterEffect = newPrices[1]
          }
        } catch (e) {
          /* ignore sim errors for curve, fallback to current */
        }
      }
      points.push({
        x: sharesForAction,
        y: displayOutcomeForChart === "yes" ? pYesAfterEffect : pNoAfterEffect,
      })
    }
    return points
  }, [market, selectedRange, activeAction, currentPYes, currentPNo, displayOutcomeForChart, currentMaxSharesOnAxis])

  const getSimulatedTradeDetailsForChartProp = useCallback(
    (sharesForActionFromChart: number) => {
      if (!selectedRange || !market || sharesForActionFromChart < 0) return null // sharesForActionFromChart is always positive from chart
      if (sharesForActionFromChart === 0) return { cost: 0, fee: 0, newProbability: currentProbabilityForChart }
      if (sharesForActionFromChart < MIN_SHARES)
        return { cost: 0, fee: 0, newProbability: currentProbabilityForChart, error: `Min ${MIN_SHARES} shares` }

      const outcomeIndexToSim = activeAction.endsWith("yes") ? 0 : 1
      const isBuyAction = activeAction.startsWith("buy")

      try {
        if (isBuyAction) {
          const {
            cost: c,
            fee: f,
            newPrices,
          } = simulateBuy("sim_chart_prop", outcomeIndexToSim, sharesForActionFromChart, market)
          return {
            cost: c / SCALE,
            fee: f / SCALE,
            newProbability: displayOutcomeForChart === "yes" ? newPrices[0] : newPrices[1],
          }
        } else {
          // Sell action
          if (sellLimitForChart !== undefined && sharesForActionFromChart > sellLimitForChart) {
            return {
              cost: 0,
              fee: 0,
              newProbability: currentProbabilityForChart,
              error: `Max ${sellLimitForChart} to sell`,
            }
          }
          const tempM = { ...market, shares: new MarketMap(market.shares.entries()) }
          tempM.shares.set(["sim_chart_prop_sell", outcomeIndexToSim], sharesForActionFromChart)
          const { refund: r, newPrices } = simulateSell(
            "sim_chart_prop_sell",
            outcomeIndexToSim,
            sharesForActionFromChart,
            tempM,
          )
          return {
            cost: r / SCALE, // refund is positive
            fee: 0,
            newProbability: displayOutcomeForChart === "yes" ? newPrices[0] : newPrices[1],
          }
        }
      } catch (e: any) {
        return { cost: 0, fee: 0, newProbability: currentProbabilityForChart, error: e.message || "Sim Error" }
      }
    },
    [market, selectedRange, activeAction, displayOutcomeForChart, currentProbabilityForChart, sellLimitForChart],
  )

  useEffect(() => {
    if (!selectedRange || !debouncedSharesInput || Number.isNaN(Number.parseFloat(debouncedSharesInput)) || !market) {
      setCost(0)
      setFee(0)
      setTotal(0)
      setNewPYesFromSim(null)
      setError(null)
      return
    }
    const sharesToTradeNum = Number.parseFloat(debouncedSharesInput) // Always positive from input
    if (sharesToTradeNum <= 0) {
      setError(`Shares must be positive.`)
      return
    }
    if (sharesToTradeNum < MIN_SHARES) {
      setError(`Min ${MIN_SHARES} shares.`)
      return
    }

    const maxTradable = activeAction.startsWith("sell")
      ? activeAction === "sell_yes"
        ? userYesShares
        : userNoShares
      : Number.POSITIVE_INFINITY
    if (sharesToTradeNum > maxTradable) {
      setError(`Max ${maxTradable} shares to sell.`)
      return
    }
    setError(null)

    const outcomeIndexToSim = activeAction.endsWith("yes") ? 0 : 1
    const isBuyAction = activeAction.startsWith("buy")

    try {
      if (isBuyAction) {
        const { cost: cs, fee: fs, newPrices } = simulateBuy("sim_ui", outcomeIndexToSim, sharesToTradeNum, market)
        setCost(cs / SCALE)
        setFee(fs / SCALE)
        setTotal((cs + fs) / SCALE)
        setNewPYesFromSim(newPrices[0])
      } else {
        const tempM = { ...market, shares: new MarketMap(market.shares.entries()) }
        tempM.shares.set(["sim_ui_sell", outcomeIndexToSim], sharesToTradeNum)
        const { refund: rs, newPrices } = simulateSell("sim_ui_sell", outcomeIndexToSim, sharesToTradeNum, tempM)
        setCost(rs / SCALE)
        setFee(0)
        setTotal(rs / SCALE)
        setNewPYesFromSim(newPrices[0])
      }
    } catch (e: any) {
      setError(e.message || "Error calculating trade.")
    }
  }, [debouncedSharesInput, selectedRange, activeAction, market, userYesShares, userNoShares])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRange || error) return
    const sharesToTradeNum = Number.parseFloat(sharesInput) // Always positive
    const assetType: "yes" | "no" = activeAction.endsWith("yes") ? "yes" : "no"
    const action: "buy" | "sell" = activeAction.startsWith("buy") ? "buy" : "sell"
    const feeStroops = action === "buy" ? fee * SCALE : 0
    onTradeSubmit({
      assetType,
      action,
      sharesToTrade: sharesToTradeNum,
      totalCostOrRefundStroops: total * SCALE,
      totalFeeStroops: feeStroops,
    })
    setSharesInput("100")
  }

  // Chart interaction gives positive sharesForAction
  const handleChartClick = (sharesForActionFromChart: number) => {
    setSharesInput(Math.round(sharesForActionFromChart).toString())
  }

  // sharesInput is always positive from the form
  const inputSharesForChartProp = !error && sharesInput ? Number.parseFloat(sharesInput) : 0

  const displayAssetTypeForUI = activeAction.endsWith("yes") ? "Yes" : "No"
  const currentPriceForUI = displayAssetTypeForUI === "Yes" ? currentPYes : currentPNo
  const newPriceForUI =
    newPYesFromSim !== null ? (displayAssetTypeForUI === "Yes" ? newPYesFromSim : 1 - newPYesFromSim) : null
  const avgPriceForUI = sharesInput && Number.parseFloat(sharesInput) > 0 ? cost / Number.parseFloat(sharesInput) : 0
  const buttonDisabled = !!error || !sharesInput || Number.parseFloat(sharesInput) <= 0
  const maxSellAmountForInput = activeAction.startsWith("sell")
    ? activeAction === "sell_yes"
      ? userYesShares
      : userNoShares
    : undefined

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="p-3">
        <CardTitle className="text-base">Trade</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {selectedRange ? (
          <div className="space-y-4">
            <div className="text-sm font-medium text-white">
              Trade on: <span className="font-bold text-primary">{selectedRange}</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-xs text-zinc-400 mr-1">Chart X-Max:</span>
                <Input
                  id="max-shares-axis"
                  type="number"
                  value={currentMaxSharesOnAxis}
                  onChange={(e) =>
                    setCurrentMaxSharesOnAxis(
                      Math.max(MIN_SHARES * 2, Number(e.target.value) || MAX_SHARES_ON_CHART_AXIS),
                    )
                  }
                  className="bg-zinc-800 h-7 text-xs w-20"
                  placeholder="Max X"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 bg-zinc-800 hover:bg-zinc-700"
                  onClick={zoomInChart}
                  title="Zoom In X-Axis"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 bg-zinc-800 hover:bg-zinc-700"
                  onClick={zoomOutChart}
                  title="Zoom Out X-Axis"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 bg-zinc-800 hover:bg-zinc-700"
                  onClick={resetChartRange}
                  title="Reset Zoom"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="relative" style={{ height: "200px" }}>
                {market && (
                  <MarketProbabilityCurve
                    curveDataPoints={generateCurveDataForChart()}
                    currentProbability={currentProbabilityForChart}
                    isSellAction={isSellActionForChart}
                    sellLimitShares={sellLimitForChart}
                    onSharesChange={handleChartClick}
                    inputSharesForAction={inputSharesForChartProp}
                    maxSharesOnAxis={currentMaxSharesOnAxis}
                    getSimulatedTradeDetailsForChart={getSimulatedTradeDetailsForChartProp}
                    outcomeName={displayOutcomeForChart === "yes" ? "Yes" : "No"}
                    lineColor={chartColors.line}
                    shadingColor={chartColors.shading}
                    sellLimitLineColor={chartColors.sellLimit}
                  />
                )}
              </div>
              <div className="bg-zinc-800/30 rounded p-2 mt-1 text-xs text-zinc-400">
                Chart shows P({displayOutcomeForChart === "yes" ? "Yes" : "No"}). X-axis: Shares to{" "}
                {isSellActionForChart ? "Sell" : "Buy"}.
                {isSellActionForChart && sellLimitForChart !== undefined && (
                  <span className="inline-block"> Orange line = max sell limit.</span>
                )}
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Tabs value={activeAction} onValueChange={(v) => setActiveAction(v as ActionType)} className="w-full">
                <TabsList className="grid grid-cols-2 bg-zinc-800 h-8">
                  <TabsTrigger value={action1} className="text-xs py-1">
                    {label1}
                  </TabsTrigger>
                  <TabsTrigger value={action2} className="text-xs py-1">
                    {label2}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value={activeAction} className="space-y-3 mt-3">
                  <div>
                    <label htmlFor={`shares-${activeAction}`} className="block text-xs font-medium text-zinc-400 mb-1">
                      Shares to {activeAction.startsWith("buy") ? "Buy" : "Sell"}{" "}
                      {activeAction.endsWith("yes") ? "Yes" : "No"}
                      {maxSellAmountForInput !== undefined && ` (Max: ${maxSellAmountForInput})`}
                    </label>
                    <Input
                      id={`shares-${activeAction}`}
                      type="number"
                      value={sharesInput}
                      onChange={(e) => setSharesInput(e.target.value)}
                      className="bg-zinc-800 h-8 text-sm"
                      min="0"
                      step="1"
                      max={maxSellAmountForInput?.toString()}
                    />
                  </div>
                  {error && (
                    <div className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {error}
                    </div>
                  )}
                  <div className="bg-zinc-800 rounded-lg p-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">{activeAction.startsWith("sell") ? "Receive:" : "Cost:"}</span>
                      <span className="text-white">{cost.toFixed(2)} XLM</span>
                    </div>
                    {activeAction.startsWith("buy") && (
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Fee:</span>
                        <span className="text-white">{fee.toFixed(2)} XLM</span>
                      </div>
                    )}
                    <div className="border-t border-zinc-700 my-1 pt-1"></div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-zinc-300">
                        {activeAction.startsWith("sell") ? "Total Received:" : "Total Cost:"}
                      </span>
                      <span className="text-white">{total.toFixed(2)} XLM</span>
                    </div>
                  </div>
                  <div className="bg-zinc-800 rounded-lg p-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Current Price ({displayAssetTypeForUI}):</span>
                      <span className="text-white">{(currentPriceForUI * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Avg. Price ({displayAssetTypeForUI}):</span>
                      <span className="text-white">{(avgPriceForUI * 100).toFixed(1)}%</span>
                    </div>
                    {newPriceForUI !== null && (
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">New Price ({displayAssetTypeForUI}):</span>
                        <span className="text-white">{(newPriceForUI * 100).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className={`w-full text-black h-8 text-sm ${activeAction === "buy_yes" ? "bg-green-600 hover:bg-green-700" : activeAction === "buy_no" ? "bg-sky-500 hover:bg-sky-600" : activeAction === "sell_yes" ? "bg-orange-500 hover:bg-orange-600" : "bg-pink-500 hover:bg-pink-600"}`}
                    disabled={buttonDisabled}
                  >
                    {activeAction.startsWith("buy") ? "Buy" : "Sell"} {sharesInput || "0"}{" "}
                    {activeAction.endsWith("yes") ? "Yes" : "No"} Shares
                  </Button>
                </TabsContent>
              </Tabs>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 text-zinc-400">Select a price level to start trading</div>
        )}
      </CardContent>
    </Card>
  )
}
