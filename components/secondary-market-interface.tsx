"use client"

import { TabsContent } from "@/components/ui/tabs"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRightLeft, ShoppingCart, Tag } from "lucide-react"
import type { BinaryMarketState } from "@/lib/market-utils"

interface SecondaryMarketInterfaceProps {
  market: BinaryMarketState // The specific sub-market
  userBTokens: number // User's b-tokens for this specific sub-market
  inequality: string // The inequality string, e.g. "< $70"
  onBuy: (amount: number, pricePerB: number, seller: string) => void
  onSell: (amount: number, pricePerB: number) => void
}

// Mock data for b-token listings
const mockBTokenListings = [
  { id: "1", seller: "UserA", amount: 50, pricePerB: 0.95, inequality: "< $70" },
  { id: "2", seller: "UserB", amount: 100, pricePerB: 0.92, inequality: "< $70" },
  { id: "3", seller: "UserC", amount: 20, pricePerB: 1.05, inequality: "< $85" },
]

export function SecondaryMarketInterface({
  market,
  userBTokens,
  inequality,
  onBuy,
  onSell,
}: SecondaryMarketInterfaceProps) {
  const [activeTab, setActiveTab] = useState("buy")
  const [sellAmount, setSellAmount] = useState("")
  const [sellPrice, setSellPrice] = useState("")

  const relevantListings = mockBTokenListings.filter((l) => l.inequality === inequality)

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = Number.parseFloat(sellAmount)
    const priceNum = Number.parseFloat(sellPrice)
    if (!isNaN(amountNum) && !isNaN(priceNum) && amountNum > 0 && priceNum > 0) {
      onSell(amountNum, priceNum)
      setSellAmount("")
      setSellPrice("")
    } else {
      alert("Please enter valid amount and price.")
    }
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-blue-500" />
          b-token Market for: <span className="text-primary">{inequality}</span>
        </CardTitle>
        <CardDescription>Trade b-tokens, which represent shares of this price level's liquidity pool.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-zinc-800 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Your b-tokens for {inequality}:</span>
            <span className="text-sm font-medium text-white">{userBTokens.toFixed(1)} b</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
            <TabsTrigger value="buy">Buy b-tokens</TabsTrigger>
            <TabsTrigger value="sell">Sell b-tokens</TabsTrigger>
          </TabsList>
          <TabsContent value="buy" className="mt-4">
            <div className="space-y-3">
              {relevantListings.length === 0 && (
                <p className="text-sm text-zinc-400 text-center py-4">
                  No b-tokens currently listed for sale for {inequality}.
                </p>
              )}
              {relevantListings.map((listing) => (
                <div key={listing.id} className="p-3 bg-zinc-800 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-white">{listing.amount} b-tokens</p>
                    <p className="text-xs text-zinc-400">Price: {listing.pricePerB.toFixed(2)} XLM / b-token</p>
                    <p className="text-xs text-zinc-400">Seller: {listing.seller}</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => onBuy(listing.amount, listing.pricePerB, listing.seller)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="sell" className="mt-4">
            <form onSubmit={handleSellSubmit} className="space-y-4">
              <div>
                <label htmlFor="sell-amount" className="block text-sm font-medium text-white mb-1">
                  Amount of b-tokens to Sell
                </label>
                <Input
                  id="sell-amount"
                  type="number"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  placeholder="e.g., 10.5"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  min="0.1"
                  step="0.1"
                  max={userBTokens}
                />
              </div>
              <div>
                <label htmlFor="sell-price" className="block text-sm font-medium text-white mb-1">
                  Price per b-token (XLM)
                </label>
                <Input
                  id="sell-price"
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  placeholder="e.g., 0.98"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  min="0.01"
                  step="0.01"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Tag className="h-4 w-4 mr-2" />
                List b-tokens for Sale
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-zinc-500">The secondary market for b-tokens is driven by users. Prices may vary.</p>
      </CardFooter>
    </Card>
  )
}
