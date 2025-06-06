"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Info, AlertCircle, Shield, ArrowRightLeft } from "lucide-react"
import { ln } from "@/lib/market-utils"

interface MarketSeedingPanelProps {
  market: any
  onSeed: (amount: number, bValue: number) => void
}

export function MarketSeedingPanel({ market, onSeed }: MarketSeedingPanelProps) {
  const [seedAmount, setSeedAmount] = useState<number>(1000)
  const [bValue, setBValue] = useState<number>(0)
  const [feeShare, setFeeShare] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Get the minimum probability across all outcomes
  const getMinProbability = () => {
    if (market.type === "binary") {
      return Math.min(Number.parseFloat(market.options[0].price), Number.parseFloat(market.options[1].price))
    } else if (market.type === "categorical") {
      return Math.min(...market.options.map((option: any) => Number.parseFloat(option.price)))
    } else if (market.type === "range") {
      return Math.min(...market.options.map((option: any) => Number.parseFloat(option.price)))
    }
    return 0.01 // Fallback
  }

  // Calculate the b-value based on the seed amount and minimum probability
  const calculateBValue = (amount: number) => {
    const minProb = getMinProbability()
    // Formula: b = seed / (-ln(π_min))
    const lnPiMin = ln(minProb)
    if (lnPiMin === 0) {
      return 0
    }
    return amount / -lnPiMin
  }

  // Calculate the fee share percentage
  const calculateFeeShare = (newBValue: number) => {
    const totalB = market.b + newBValue
    return (newBValue / totalB) * 100
  }

  // Update calculations when seed amount changes
  useEffect(() => {
    if (seedAmount > 0) {
      const newBValue = calculateBValue(seedAmount)
      setBValue(newBValue)
      setFeeShare(calculateFeeShare(newBValue))
    }
  }, [seedAmount, market])

  const handleSeedAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    if (!isNaN(value) && value >= 0) {
      setSeedAmount(value)
    }
  }

  const handleSeedSubmit = async () => {
    if (seedAmount < 1000) return // Minimum seed amount

    setIsLoading(true)
    try {
      // In a real implementation, this would call a smart contract
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate transaction
      onSeed(seedAmount, bValue)
      // Reset or keep the form as needed
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
          Provide Market Liquidity
        </CardTitle>
        <CardDescription>Seed this market to earn fees from trading activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Market State */}
        <div className="bg-zinc-800 rounded-lg p-3">
          <h3 className="text-sm font-medium text-white mb-2">Current Market State</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-zinc-400">Total Liquidity (b):</div>
            <div className="text-white font-medium">{market.b.toLocaleString()} XLM</div>

            <div className="text-zinc-400">Current Probabilities:</div>
            <div className="text-white">
              {market.options.map((option: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span>{option.name}:</span>
                  <span>{(Number.parseFloat(option.price) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>

            <div className="text-zinc-400">
              Min Probability (π<sub>min</sub>):
            </div>
            <div className="text-white font-medium">{(getMinProbability() * 100).toFixed(1)}%</div>
          </div>
        </div>

        {/* Seed Amount Input */}
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

        {/* Calculated Values */}
        <div className="bg-zinc-800 rounded-lg p-3">
          <h3 className="text-sm font-medium text-white mb-2">Your Seeding Parameters</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">b-tokens you'll receive:</span>
              <span className="text-white font-medium">{bValue.toFixed(1)} b</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Fee Share:</span>
              <span className="text-white font-medium">{feeShare.toFixed(2)}%</span>
            </div>

            <div className="text-xs text-zinc-500 mt-1">
              Formula: b = seed / (-ln(π<sub>min</sub>)) = {seedAmount} / (-ln({getMinProbability().toFixed(2)})) ≈{" "}
              {bValue.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Information Box */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <div className="flex gap-2">
            <Info className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-white mb-1">b-tokens Explained</h4>
              <p className="text-xs text-zinc-400">
                When you seed a market, your XLM is converted into b-tokens representing your share of the market's
                liquidity pool. Your b-tokens determine your share of trading fees and can be traded on the secondary
                market at any time.
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                <strong>Important:</strong> The original seed amount is absorbed into the market. You own b-tokens, not
                your original XLM. The value of b-tokens fluctuates based on market conditions and accumulated fees.
              </p>
            </div>
          </div>
        </div>

        {/* Secondary Market Box */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="flex gap-2">
            <ArrowRightLeft className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-white mb-1">Secondary Market</h4>
              <p className="text-xs text-zinc-400">
                b-tokens can be bought and sold on the secondary market at any time. The price of b-tokens depends on:
              </p>
              <ul className="text-xs text-zinc-400 list-disc list-inside mt-1 space-y-0.5">
                <li>Accumulated trading fees</li>
                <li>Expected future trading volume</li>
                <li>Time until market resolution</li>
                <li>Current probability distribution</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Warning Box */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-white mb-1">Risk Warning</h4>
              <p className="text-xs text-zinc-400">
                Your seed amount of {seedAmount.toLocaleString()} XLM will be converted to {bValue.toFixed(1)} b-tokens.
                The value of b-tokens can fluctuate significantly and may be worth less than your initial seed amount.
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
          {isLoading ? "Processing..." : `Seed Market with ${seedAmount.toLocaleString()} XLM`}
        </Button>
      </CardFooter>
    </Card>
  )
}
