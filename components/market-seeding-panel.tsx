"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Info, AlertCircle, Shield } from "lucide-react"
import { ln, toFixed, type BinaryMarketState, marketPrice } from "@/lib/market-utils"

interface MarketSeedingPanelProps {
  market: BinaryMarketState // Now receives a single binary sub-market
  inequality: string // To display which inequality is being seeded
  onSeed: (amount: number, bValue: number) => void
}

export function MarketSeedingPanel({ market, inequality, onSeed }: MarketSeedingPanelProps) {
  const [seedAmount, setSeedAmount] = useState<number>(1000)
  const [bValue, setBValue] = useState<number>(0)
  const [feeShare, setFeeShare] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const currentMarketB = Array.from(market.seeders.values()).reduce((sum, s) => sum + toFixed(s.liquidityParamB), 0)
  const currentYesPrice = marketPrice(market.qSeeders, market.seeders, 0)
  const currentNoPrice = marketPrice(market.qSeeders, market.seeders, 1)

  const getMinProbability = () => {
    // For a binary market, it's the min of P(Yes) and P(No)
    return Math.min(currentYesPrice, currentNoPrice)
  }

  const calculateBValue = (amount: number) => {
    const minProb = getMinProbability()
    if (minProb <= 0 || minProb >= 1) return 0 // Avoid ln(0) or ln(negative)
    const lnPiMin = ln(minProb)
    if (lnPiMin === 0) return 0
    return amount / -lnPiMin // This is an approximation; actual b is set in market-utils
  }

  const calculateFeeShare = (newBValue: number) => {
    const totalB = currentMarketB + newBValue
    return totalB > 0 ? (newBValue / totalB) * 100 : 0
  }

  useEffect(() => {
    if (seedAmount > 0) {
      const newBValue = calculateBValue(seedAmount)
      setBValue(newBValue)
      setFeeShare(calculateFeeShare(newBValue))
    }
  }, [seedAmount, market, currentMarketB]) // Add currentMarketB dependency

  const handleSeedAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    if (!isNaN(value) && value >= 0) {
      setSeedAmount(value)
    }
  }

  const handleSeedSubmit = async () => {
    if (seedAmount < 1000) return

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onSeed(seedAmount, bValue) // bValue calculated here is an estimate
    } catch (error) {
      console.error("Seeding failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-yellow-500" />
          Provide Liquidity for: <span className="text-primary">{inequality}</span>
        </CardTitle>
        <CardDescription>Seed this specific price level to earn fees from its trading activity.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-zinc-800 rounded-lg p-3">
          <h3 className="text-sm font-medium text-white mb-2">Current State for {inequality}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-zinc-400">Total Liquidity (b):</div>
            <div className="text-white font-medium">{currentMarketB.toFixed(1)} b</div>
            <div className="text-zinc-400">Current P(Yes):</div>
            <div className="text-white font-medium">{(currentYesPrice * 100).toFixed(1)}%</div>
            <div className="text-zinc-400">
              Min Probability (π<sub>min</sub>):
            </div>
            <div className="text-white font-medium">{(getMinProbability() * 100).toFixed(1)}%</div>
          </div>
        </div>

        <div>
          <label htmlFor="seedAmount" className="block text-sm font-medium text-white mb-1">
            Seed Amount (XLM)
          </label>
          <Input
            id="seedAmount"
            type="number"
            min="1000"
            step="100"
            value={seedAmount}
            onChange={handleSeedAmountChange}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
          <p className="text-xs text-zinc-500 mt-1">Minimum seed: 1,000 XLM</p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-3">
          <h3 className="text-sm font-medium text-white mb-2">Your Seeding Parameters</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Est. b-tokens you'll receive:</span>
              <span className="text-white font-medium">{bValue.toFixed(1)} b</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Est. Fee Share:</span>
              <span className="text-white font-medium">{feeShare.toFixed(2)}%</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Formula: b ≈ seed / (-ln(π<sub>min</sub>))
            </div>
          </div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <div className="flex gap-2">
            <Info className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-white mb-1">b-tokens Explained</h4>
              <p className="text-xs text-zinc-400">
                b-tokens represent your share of this specific price level's liquidity pool.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-white mb-1">Risk Warning</h4>
              <p className="text-xs text-zinc-400">
                Your seed amount of {seedAmount.toLocaleString()} XLM will be converted to b-tokens for '{inequality}'.
                The value can fluctuate.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSeedSubmit}
          disabled={isLoading || seedAmount < 1000}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
        >
          {isLoading ? "Processing..." : `Seed '${inequality}' with ${seedAmount.toLocaleString()} XLM`}
        </Button>
      </CardFooter>
    </Card>
  )
}
