"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRightLeft, TrendingUp, Info, AlertCircle } from "lucide-react"

interface BTokenListing {
  seller: string
  bAmount: number
  pricePerB: number
  totalPrice: number
  timestamp: string
}

interface SecondaryMarketInterfaceProps {
  market: any
  userBTokens: number
  onBuy: (amount: number, price: number, seller: string) => void
  onSell: (amount: number, pricePerB: number) => void
  onCancel?: (listingId: string) => void
}

export function SecondaryMarketInterface({
  market,
  userBTokens,
  onBuy,
  onSell,
  onCancel,
}: SecondaryMarketInterfaceProps) {
  const [activeTab, setActiveTab] = useState("buy")
  const [sellAmount, setSellAmount] = useState<number>(0)
  const [sellPrice, setSellPrice] = useState<number>(1.0)
  const [buyAmount, setBuyAmount] = useState<number>(0)
  const [selectedListing, setSelectedListing] = useState<BTokenListing | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Mock data for b-token listings
  const mockListings: BTokenListing[] = [
    {
      seller: "C...XLM3",
      bAmount: 1250.5,
      pricePerB: 0.85,
      totalPrice: 1062.9,
      timestamp: "2 hours ago",
    },
    {
      seller: "C...XLM7",
      bAmount: 750.2,
      pricePerB: 0.92,
      totalPrice: 690.2,
      timestamp: "5 hours ago",
    },
    {
      seller: "C...XLM2",
      bAmount: 2500.0,
      pricePerB: 0.95,
      totalPrice: 2375.0,
      timestamp: "1 day ago",
    },
    {
      seller: "C...XLM9",
      bAmount: 500.0,
      pricePerB: 0.78,
      totalPrice: 390.0,
      timestamp: "2 days ago",
    },
  ]

  // Calculate the estimated value of b-tokens
  const calculateEstimatedBValue = () => {
    // In a real app, this would be a complex calculation
    // For now, use the average price from listings
    if (mockListings.length === 0) return 1.0
    const avgPrice = mockListings.reduce((sum, listing) => sum + listing.pricePerB, 0) / mockListings.length
    return avgPrice
  }

  const estimatedBValue = calculateEstimatedBValue()

  const handleSellAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    if (!isNaN(value) && value >= 0 && value <= userBTokens) {
      setSellAmount(value)
    }
  }

  const handleSellPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    if (!isNaN(value) && value > 0) {
      setSellPrice(value)
    }
  }

  const handleBuyAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedListing) return
    const value = Number.parseFloat(e.target.value)
    if (!isNaN(value) && value >= 0 && value <= selectedListing.bAmount) {
      setBuyAmount(value)
    }
  }

  const handleSelectListing = (listing: BTokenListing) => {
    setSelectedListing(listing)
    setBuyAmount(listing.bAmount) // Default to buying the full amount
  }

  const handleSellSubmit = async () => {
    if (sellAmount <= 0 || sellPrice <= 0) return

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate transaction
      onSell(sellAmount, sellPrice)
      // Reset form
      setSellAmount(0)
      setActiveTab("buy") // Switch to buy tab to see your listing
    } catch (error) {
      console.error("Listing failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuySubmit = async () => {
    if (!selectedListing || buyAmount <= 0) return

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate transaction
      onBuy(buyAmount, selectedListing.pricePerB, selectedListing.seller)
      // Reset form
      setBuyAmount(0)
      setSelectedListing(null)
    } catch (error) {
      console.error("Purchase failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-blue-500" />
          b-token Secondary Market
        </CardTitle>
        <CardDescription>Buy and sell b-tokens to enter or exit liquidity positions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Market Overview */}
        <div className="bg-zinc-800 rounded-lg p-3">
          <h3 className="text-sm font-medium text-white mb-2">Market Overview</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-zinc-400">Total Market b:</div>
            <div className="text-white font-medium">{market.b.toLocaleString()} b</div>
            <div className="text-zinc-400">Your b-tokens:</div>
            <div className="text-white font-medium">{userBTokens.toFixed(1)} b</div>
            <div className="text-zinc-400">Est. Value per b:</div>
            <div className="text-white font-medium">{estimatedBValue.toFixed(2)} XLM</div>
            <div className="text-zinc-400">Your Fee Share:</div>
            <div className="text-white font-medium">{((userBTokens / market.b) * 100).toFixed(2)}%</div>
          </div>
        </div>

        {/* Trading Interface */}
        <Tabs defaultValue="buy" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 bg-zinc-800 border-zinc-700">
            <TabsTrigger value="buy">Buy b-tokens</TabsTrigger>
            <TabsTrigger value="sell">Sell b-tokens</TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="bg-zinc-800 rounded-lg p-3">
                <h3 className="text-sm font-medium text-white mb-2">Available Listings</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {mockListings.length > 0 ? (
                    mockListings.map((listing, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-lg cursor-pointer transition-all ${
                          selectedListing === listing
                            ? "bg-blue-500/20 border border-blue-500/50"
                            : "bg-zinc-700 hover:bg-zinc-600"
                        }`}
                        onClick={() => handleSelectListing(listing)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-sm font-medium text-white">{listing.bAmount.toFixed(1)} b</div>
                            <div className="text-xs text-zinc-400">Seller: {listing.seller}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-white">{listing.pricePerB.toFixed(2)} XLM/b</div>
                            <div className="text-xs text-zinc-400">Listed {listing.timestamp}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-zinc-400 py-4">No listings available</div>
                  )}
                </div>
              </div>

              {selectedListing && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <h3 className="text-sm font-medium text-white mb-2">Purchase b-tokens</h3>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="buyAmount" className="block text-xs text-zinc-400 mb-1">
                        Amount to buy (b)
                      </label>
                      <Input
                        id="buyAmount"
                        type="number"
                        min="0"
                        step="0.1"
                        max={selectedListing.bAmount}
                        value={buyAmount}
                        onChange={handleBuyAmountChange}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                      <div className="flex justify-between text-xs text-zinc-500 mt-1">
                        <span>Min: 0.1 b</span>
                        <span>Max: {selectedListing.bAmount.toFixed(1)} b</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-zinc-400">Price per b:</div>
                      <div className="text-white font-medium text-right">
                        {selectedListing.pricePerB.toFixed(2)} XLM
                      </div>
                      <div className="text-zinc-400">Total Cost:</div>
                      <div className="text-white font-medium text-right">
                        {(buyAmount * selectedListing.pricePerB).toFixed(2)} XLM
                      </div>
                      <div className="text-zinc-400">Fee Share Gain:</div>
                      <div className="text-white font-medium text-right">
                        +{((buyAmount / market.b) * 100).toFixed(2)}%
                      </div>
                    </div>

                    <Button
                      onClick={handleBuySubmit}
                      disabled={isLoading || buyAmount <= 0}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isLoading
                        ? "Processing..."
                        : `Buy ${buyAmount.toFixed(1)} b for ${(buyAmount * selectedListing.pricePerB).toFixed(2)} XLM`}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sell" className="space-y-4 mt-4">
            {userBTokens > 0 ? (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <h3 className="text-sm font-medium text-white mb-2">List b-tokens for Sale</h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="sellAmount" className="block text-xs text-zinc-400 mb-1">
                      Amount to sell (b)
                    </label>
                    <Input
                      id="sellAmount"
                      type="number"
                      min="0.1"
                      step="0.1"
                      max={userBTokens}
                      value={sellAmount}
                      onChange={handleSellAmountChange}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <div className="flex justify-between text-xs text-zinc-500 mt-1">
                      <span>Min: 0.1 b</span>
                      <span>Max: {userBTokens.toFixed(1)} b</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="sellPrice" className="block text-xs text-zinc-400 mb-1">
                      Price per b (XLM)
                    </label>
                    <Input
                      id="sellPrice"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={sellPrice}
                      onChange={handleSellPriceChange}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <div className="flex justify-between text-xs text-zinc-500 mt-1">
                      <span>Market avg: {estimatedBValue.toFixed(2)} XLM/b</span>
                      <span
                        className={
                          sellPrice > estimatedBValue
                            ? "text-yellow-500"
                            : sellPrice < estimatedBValue
                              ? "text-green-500"
                              : ""
                        }
                      >
                        {sellPrice > estimatedBValue
                          ? `+${((sellPrice / estimatedBValue - 1) * 100).toFixed(0)}% above avg`
                          : sellPrice < estimatedBValue
                            ? `${((1 - sellPrice / estimatedBValue) * 100).toFixed(0)}% below avg`
                            : "At market avg"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-zinc-400">Total Value:</div>
                    <div className="text-white font-medium text-right">{(sellAmount * sellPrice).toFixed(2)} XLM</div>
                    <div className="text-zinc-400">Fee Share Loss:</div>
                    <div className="text-white font-medium text-right">
                      -{((sellAmount / market.b) * 100).toFixed(2)}%
                    </div>
                  </div>

                  <Button
                    onClick={handleSellSubmit}
                    disabled={isLoading || sellAmount <= 0 || sellPrice <= 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading
                      ? "Processing..."
                      : `List ${sellAmount.toFixed(1)} b for ${sellPrice.toFixed(2)} XLM each`}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-zinc-400 py-4">
                You don't have any b-tokens to sell. Seed the market or buy b-tokens first.
              </div>
            )}

            {/* Market Information */}
            <div className="bg-zinc-800 rounded-lg p-3">
              <h3 className="text-sm font-medium text-white mb-2">Market Insights</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-zinc-400">
                    Current b-token price trend: <span className="text-green-400">+5.2% (24h)</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-blue-400" />
                  <span className="text-zinc-400">
                    Trading volume: <span className="text-white">2,500 b (24h)</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <span className="text-zinc-400">
                    Market resolves in: <span className="text-white">45 days</span>
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Information Box */}
        <div className="bg-zinc-800 rounded-lg p-3">
          <h3 className="text-sm font-medium text-white mb-2">About b-token Trading</h3>
          <p className="text-xs text-zinc-400">
            b-tokens represent shares of the market's liquidity pool. Owners earn a proportional share of trading fees.
            The value of b-tokens typically decreases as the market approaches resolution, but this can be offset by
            accumulated trading fees.
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            Trading b-tokens allows liquidity providers to enter or exit positions without waiting for market
            resolution. Prices reflect the market's expectations about future trading volume and fees.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
