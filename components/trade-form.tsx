"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, AlertCircle } from "lucide-react"
import { calculateCost, calculateProbability } from "@/lib/market-utils"

interface TradeFormProps {
  market: any
  selectedOutcome: string | null
  onSelectOutcome: (outcome: string) => void
}

export function TradeForm({ market, selectedOutcome, onSelectOutcome }: TradeFormProps) {
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")
  const [shares, setShares] = useState<string>("100")
  const [cost, setCost] = useState<number>(0)
  const [fee, setFee] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)
  const [newProbability, setNewProbability] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isBinary =
    market.type === "binary" ||
    (market.options.length === 2 && market.options[0].name === "Yes" && market.options[1].name === "No")

  // Calculate cost based on LMSR formula
  useEffect(() => {
    if (!selectedOutcome || !shares || Number.isNaN(Number.parseFloat(shares))) {
      setCost(0)
      setFee(0)
      setTotal(0)
      setNewProbability(null)
      return
    }

    const sharesNum = Number.parseFloat(shares)

    // Validate
    if (sharesNum <= 0) {
      setError("Shares must be greater than 0")
      setCost(0)
      setFee(0)
      setTotal(0)
      setNewProbability(null)
      return
    } else {
      setError(null)
    }

    const b = market.b
    const outcomeIndex = selectedOutcome === "Yes" ? 0 : 1

    // Create a copy of q for calculations
    const tempQ = [...market.q]

    // Calculate current probability
    const currentProb = calculateProbability(b, tempQ, market.priors, outcomeIndex)

    // Calculate cost and new probability
    let calculatedCost = 0
    let calculatedNewProb = 0

    if (tradeType === "buy") {
      // For buying, add shares
      calculatedCost = calculateCost(b, tempQ, market.priors, outcomeIndex, sharesNum)

      // Update q for new probability calculation
      tempQ[outcomeIndex] += sharesNum
      calculatedNewProb = calculateProbability(b, tempQ, market.priors, outcomeIndex)
    } else {
      // For selling, subtract shares
      calculatedCost = calculateCost(b, tempQ, market.priors, outcomeIndex, -sharesNum)

      // Update q for new probability calculation
      tempQ[outcomeIndex] -= sharesNum
      calculatedNewProb = calculateProbability(b, tempQ, market.priors, outcomeIndex)

      // Selling cost is negative, but we display as positive
      calculatedCost = Math.abs(calculatedCost)
    }

    // Calculate fee (only for buys)
    const calculatedFee = tradeType === "buy" ? sharesNum * 0.02 : 0

    setCost(calculatedCost)
    setFee(calculatedFee)
    setTotal(tradeType === "buy" ? calculatedCost + calculatedFee : calculatedCost)
    setNewProbability(calculatedNewProb)
  }, [selectedOutcome, shares, tradeType, market])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would submit the trade to the blockchain
    alert(
      `${tradeType === "buy" ? "Bought" : "Sold"} ${shares} shares of ${selectedOutcome} for ${total.toFixed(2)} XLM`,
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Outcome Selection */}
      {!selectedOutcome && (
        <div className="mb-2">
          <div className="text-xs text-zinc-400 mb-1">Select an outcome to trade</div>
          <div className="grid grid-cols-2 gap-2">
            {market.options.map((option: any, index: number) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                className={`border-${option.color}-500/30 bg-${option.color}-500/5 hover:bg-${option.color}-500/10 hover:border-${option.color}-500/50 py-1 h-auto`}
                onClick={() => onSelectOutcome(option.name)}
              >
                {option.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {selectedOutcome && (
        <>
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-white">Trading {selectedOutcome}</div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onSelectOutcome("")}
              className="text-xs text-zinc-400 hover:text-white h-6 px-2"
            >
              Change
            </Button>
          </div>

          <Tabs defaultValue="buy" className="w-full" onValueChange={(value) => setTradeType(value as "buy" | "sell")}>
            <TabsList className="grid grid-cols-2 bg-zinc-800 h-8">
              <TabsTrigger value="buy" className="text-xs py-1">
                Buy
              </TabsTrigger>
              <TabsTrigger value="sell" className="text-xs py-1">
                Sell
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buy" className="space-y-2 mt-2">
              <div>
                <label htmlFor="shares" className="block text-xs font-medium text-zinc-400 mb-1">
                  Shares to Buy
                </label>
                <Input
                  id="shares"
                  type="number"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 h-8 text-sm"
                  min="1"
                  step="1"
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

              {newProbability !== null && (
                <div className="bg-zinc-800 rounded-lg p-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">New Price:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-white">{(newProbability * 100).toFixed(1)}%</span>
                      <ArrowRight className="h-3 w-3 text-zinc-400" />
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white h-8 text-sm"
                disabled={!!error || !shares || Number.parseFloat(shares) <= 0}
              >
                Buy {shares} Shares
              </Button>
            </TabsContent>

            <TabsContent value="sell" className="space-y-2 mt-2">
              <div>
                <label htmlFor="shares-sell" className="block text-xs font-medium text-zinc-400 mb-1">
                  Shares to Sell
                </label>
                <Input
                  id="shares-sell"
                  type="number"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 h-8 text-sm"
                  min="1"
                  step="1"
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

              {newProbability !== null && (
                <div className="bg-zinc-800 rounded-lg p-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">New Price:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-white">{(newProbability * 100).toFixed(1)}%</span>
                      <ArrowRight className="h-3 w-3 text-zinc-400" />
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white h-8 text-sm"
                disabled={!!error || !shares || Number.parseFloat(shares) <= 0}
              >
                Sell {shares} Shares
              </Button>
            </TabsContent>
          </Tabs>
        </>
      )}
    </form>
  )
}
