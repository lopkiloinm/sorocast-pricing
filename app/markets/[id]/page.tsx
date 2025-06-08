"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Clock, BarChart3, ArrowRightLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { allMarkets } from "@/data/markets"
import { UnifiedTradeInterface } from "@/components/unified-trade-interface"
import { MarketActivityTable } from "@/components/market-activity-table"
import { MarketInfoPanel } from "@/components/market-info-panel"
import { MarketSeedingPanel } from "@/components/market-seeding-panel"
import { SecondaryMarketInterface } from "@/components/secondary-market-interface"
import {
  executeBuy,
  executeSell,
  marketPrice,
  toFixed,
  addSeeder as addSeederToSubMarket,
  SCALE,
  createMultiBinaryMarketContainer,
  type MarketContainer,
} from "@/lib/market-utils"

interface TradeLogEntry {
  type: "Buy Yes" | "Buy No" | "Sell Yes" | "Sell No" // Expanded types
  outcome: string
  shares: string
  price: string
  cost: string
  fee: string
  timestamp: string
  trader: string
}

export default function MarketPage() {
  const params = useParams()
  const marketId = params.id as string

  const [marketContainer, setMarketContainer] = useState<MarketContainer | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedInequality, setSelectedInequality] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("trade")
  const [userShares, setUserShares] = useState<{ [key: string]: { yes: number; no: number } }>({})
  const [recentTrades, setRecentTrades] = useState<TradeLogEntry[]>([])
  const [userBTokens, setUserBTokens] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    const fetchMarket = async () => {
      setLoading(true)
      const foundMarketData = allMarkets.find((m) => m.id === marketId)
      if (foundMarketData && foundMarketData.options && foundMarketData.options.length > 0) {
        const inequalities = foundMarketData.options.map((o) => o.name).filter(Boolean) as string[]
        if (inequalities.length === 0) {
          setLoading(false)
          return
        }

        const container = createMultiBinaryMarketContainer(
          foundMarketData.id,
          foundMarketData.title,
          foundMarketData.description || "",
          foundMarketData.category || "",
          inequalities,
        )
        setMarketContainer(container)
        setSelectedInequality(inequalities[0])
        const initialShares: { [key: string]: { yes: number; no: number } } = {}
        inequalities.forEach((iq) => {
          initialShares[iq] = { yes: 0, no: 0 }
        })
        setUserShares(initialShares)
        const initialBTokens: { [key: string]: number } = {}
        inequalities.forEach((iq) => {
          initialBTokens[iq] = 0
        })
        setUserBTokens(initialBTokens)
      } else {
        setMarketContainer(null)
        setSelectedInequality(null)
      }
      setTimeout(() => setLoading(false), 500)
    }
    fetchMarket()
  }, [marketId])

  const handleTrade = ({
    assetType, // "yes" or "no"
    action, // "buy" or "sell"
    sharesToTrade,
    totalCostOrRefundStroops,
    totalFeeStroops,
  }: {
    assetType: "yes" | "no"
    action: "buy" | "sell"
    sharesToTrade: number
    totalCostOrRefundStroops: number
    totalFeeStroops: number
  }) => {
    if (!marketContainer || !selectedInequality) return

    const subMarketState = marketContainer.subMarkets.get(selectedInequality)
    if (!subMarketState) {
      console.error("Sub-market not found")
      return
    }

    // Determine outcomeIndex based on assetType
    const outcomeIndex = assetType === "yes" ? 0 : 1

    try {
      let tradeResult: any
      let uiActionType: TradeLogEntry["type"]
      let alertMessage: string

      const currentYes = userShares[selectedInequality]?.yes || 0
      const currentNo = userShares[selectedInequality]?.no || 0
      let newYes = currentYes
      let newNo = currentNo

      if (action === "buy") {
        tradeResult = executeBuy("user", outcomeIndex, sharesToTrade, subMarketState)
        if (assetType === "yes") {
          uiActionType = "Buy Yes"
          newYes += sharesToTrade
          alertMessage = `Bought ${sharesToTrade} 'Yes' shares for '${selectedInequality}'. Cost: ${(totalCostOrRefundStroops / SCALE).toFixed(2)} XLM (Fee: ${(totalFeeStroops / SCALE).toFixed(2)} XLM)`
        } else {
          // assetType === "no"
          uiActionType = "Buy No"
          newNo += sharesToTrade
          alertMessage = `Bought ${sharesToTrade} 'No' shares for '${selectedInequality}'. Cost: ${(totalCostOrRefundStroops / SCALE).toFixed(2)} XLM (Fee: ${(totalFeeStroops / SCALE).toFixed(2)} XLM)`
        }
      } else {
        // action === "sell"
        tradeResult = executeSell("user", outcomeIndex, sharesToTrade, subMarketState)
        if (assetType === "yes") {
          uiActionType = "Sell Yes"
          newYes -= sharesToTrade
          alertMessage = `Sold ${sharesToTrade} 'Yes' shares for '${selectedInequality}'. Received: ${(totalCostOrRefundStroops / SCALE).toFixed(2)} XLM`
        } else {
          // assetType === "no"
          uiActionType = "Sell No"
          newNo -= sharesToTrade
          alertMessage = `Sold ${sharesToTrade} 'No' shares for '${selectedInequality}'. Received: ${(totalCostOrRefundStroops / SCALE).toFixed(2)} XLM`
        }
      }

      setUserShares({ ...userShares, [selectedInequality]: { yes: newYes, no: newNo } })
      marketContainer.subMarkets.set(selectedInequality, subMarketState)
      setMarketContainer({ ...marketContainer })

      const priceOfTradedAsset = tradeResult.newPrices[outcomeIndex]
      const newTradeEntry: TradeLogEntry = {
        type: uiActionType,
        outcome: selectedInequality,
        shares: sharesToTrade.toString(),
        price: priceOfTradedAsset.toFixed(3),
        cost: (totalCostOrRefundStroops / SCALE).toFixed(2),
        fee: (totalFeeStroops / SCALE).toFixed(2),
        timestamp: new Date().toISOString(),
        trader: "You",
      }
      setRecentTrades([newTradeEntry, ...recentTrades].slice(0, 10))
      alert(alertMessage)
    } catch (error) {
      console.error("Trade failed:", error)
      alert(`Trade failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleSeed = (amount: number, bValueFromPanel: number) => {
    if (!marketContainer || !selectedInequality) return
    const subMarketState = marketContainer.subMarkets.get(selectedInequality)
    if (!subMarketState) return

    const amountInStroops = amount * SCALE
    addSeederToSubMarket(subMarketState, "You", amountInStroops)
    const seederInfo = subMarketState.seeders.get("You")
    if (!seederInfo) return

    const actualBValue = toFixed(seederInfo.liquidityParamB)
    setUserBTokens({ ...userBTokens, [selectedInequality]: (userBTokens[selectedInequality] || 0) + actualBValue })
    marketContainer.subMarkets.set(selectedInequality, subMarketState)
    setMarketContainer({ ...marketContainer })
    alert(`Seeded '${selectedInequality}' with ${amount} XLM, received ${actualBValue.toFixed(1)} b-tokens!`)
    setActiveTab("secondary")
  }

  const handleBuyBTokens = (amount: number, pricePerB: number, seller: string) => {
    if (!selectedInequality) return
    setUserBTokens({ ...userBTokens, [selectedInequality]: (userBTokens[selectedInequality] || 0) + amount })
    alert(`Bought ${amount.toFixed(1)} b-tokens for ${selectedInequality}!`)
  }

  const handleSellBTokens = (amount: number, pricePerB: number) => {
    if (!selectedInequality) return
    if (amount > (userBTokens[selectedInequality] || 0)) {
      alert("Not enough b-tokens!")
      return
    }
    setUserBTokens({ ...userBTokens, [selectedInequality]: (userBTokens[selectedInequality] || 0) - amount })
    alert(`Listed ${amount.toFixed(1)} b-tokens for ${selectedInequality} for sale!`)
  }

  if (loading || !marketContainer) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-64 bg-zinc-800 rounded mb-4"></div>
            <div className="h-4 w-48 bg-zinc-800 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }
  const activeSubMarket = selectedInequality ? marketContainer.subMarkets.get(selectedInequality) : null
  const marketData = allMarkets.find((m) => m.id === marketId)
  if (!marketData) return <div>Market data not found.</div>

  const totalLiquidity = Array.from(marketContainer.subMarkets.values()).reduce(
    (acc, sm) => acc + toFixed(Array.from(sm.seeders.values()).reduce((s, si) => s + si.seedAmountStroops, 0)),
    0,
  )
  const totalVolume = totalLiquidity * 0.5 // Placeholder
  const currentMarketB = activeSubMarket
    ? toFixed(Array.from(activeSubMarket.seeders.values()).reduce((s, si) => s + si.liquidityParamB, 0))
    : 0

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      <main className="flex-1">
        <div className="container px-4 py-4 md:px-6">
          {/* Header Section */}
          <div className="mb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs text-yellow-500">
                    {marketContainer.category}
                  </span>
                  <div className="flex items-center text-xs text-zinc-400">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>Resolves {marketData.endDate}</span>
                  </div>
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-white">{marketContainer.title}</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-xs text-zinc-400">24h Vol</div>
                  <div className="font-medium text-white">${formatNumber(totalVolume)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-zinc-400">Liquidity</div>
                  <div className="font-medium text-white">${formatNumber(totalLiquidity)}</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-zinc-400">{marketContainer.description}</p>
          </div>

          {/* Mobile Layout */}
          <div className="block lg:hidden mb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 bg-zinc-900 border-zinc-800">
                <TabsTrigger value="trade">Trade</TabsTrigger>
                <TabsTrigger value="seed">Seed</TabsTrigger>
                <TabsTrigger value="secondary">b-Market</TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
              </TabsList>
              <TabsContent value="trade" className="mt-2">
                <Card className="bg-zinc-900 border-zinc-800 mb-3">
                  <CardHeader className="p-3">
                    <CardTitle className="text-base">Price Levels</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="grid grid-cols-1 gap-2">
                      {marketData.options.map((option) => {
                        const subM = marketContainer.subMarkets.get(option.name)
                        const price = subM ? marketPrice(subM.qSeeders, subM.seeders, 0) : 0
                        return (
                          <div
                            key={option.name}
                            className={`p-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 cursor-pointer ${selectedInequality === option.name ? "ring-1 ring-yellow-500" : ""}`}
                            onClick={() => setSelectedInequality(option.name)}
                          >
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="font-medium text-white">{option.name}</span>
                              <span className="text-yellow-400">{price.toFixed(2)}</span>
                            </div>
                            <div className="text-xs text-zinc-400">Pays 1 XLM if Yes</div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
                {activeSubMarket && selectedInequality && marketData && (
                  <UnifiedTradeInterface
                    market={{
                      ...activeSubMarket,
                      marketType: "range",
                      range: marketData.range || { min: 0, max: 100 },
                    }}
                    selectedRange={selectedInequality}
                    userYesShares={userShares[selectedInequality]?.yes || 0}
                    userNoShares={userShares[selectedInequality]?.no || 0}
                    onTradeSubmit={handleTrade}
                  />
                )}
                <Card className="bg-zinc-900 border-zinc-800 mt-3">
                  <CardHeader className="p-3">
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <MarketActivityTable trades={recentTrades} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="seed" className="mt-2">
                {activeSubMarket && selectedInequality && (
                  <MarketSeedingPanel market={activeSubMarket} onSeed={handleSeed} inequality={selectedInequality} />
                )}
              </TabsContent>
              <TabsContent value="secondary" className="mt-2">
                {activeSubMarket && selectedInequality && (
                  <SecondaryMarketInterface
                    market={activeSubMarket}
                    userBTokens={userBTokens[selectedInequality] || 0}
                    onBuy={handleBuyBTokens}
                    onSell={handleSellBTokens}
                    inequality={selectedInequality}
                  />
                )}
              </TabsContent>
              <TabsContent value="info" className="mt-2">
                {activeSubMarket && <MarketInfoPanel market={activeSubMarket} />}
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="p-3">
                  <CardTitle className="text-base">Price Levels</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {marketData.options.map((option) => {
                      const subM = marketContainer.subMarkets.get(option.name)
                      const price = subM ? marketPrice(subM.qSeeders, subM.seeders, 0) : 0
                      return (
                        <div
                          key={option.name}
                          className={`p-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 cursor-pointer ${selectedInequality === option.name ? "ring-1 ring-yellow-500" : ""}`}
                          onClick={() => setSelectedInequality(option.name)}
                        >
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="font-medium text-white">{option.name}</span>
                            <span className="text-yellow-400">{price.toFixed(2)}</span>
                          </div>
                          <div className="text-xs text-zinc-400">Pays 1 XLM if Yes</div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 bg-zinc-900 border-zinc-800">
                  <TabsTrigger value="trade">Trade</TabsTrigger>
                  <TabsTrigger value="seed">Seed</TabsTrigger>
                  <TabsTrigger value="secondary">b-Market</TabsTrigger>
                  <TabsTrigger value="info">Info</TabsTrigger>
                </TabsList>
                <TabsContent value="trade" className="space-y-4 mt-2">
                  {activeSubMarket && selectedInequality && marketData && (
                    <UnifiedTradeInterface
                      market={{
                        ...activeSubMarket,
                        marketType: "range",
                        range: marketData.range || { min: 0, max: 100 },
                      }}
                      selectedRange={selectedInequality}
                      userYesShares={userShares[selectedInequality]?.yes || 0}
                      userNoShares={userShares[selectedInequality]?.no || 0}
                      onTradeSubmit={handleTrade}
                    />
                  )}
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="p-3">
                      <CardTitle className="text-base">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <MarketActivityTable trades={recentTrades} />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="seed" className="mt-2">
                  {activeSubMarket && selectedInequality && (
                    <MarketSeedingPanel market={activeSubMarket} onSeed={handleSeed} inequality={selectedInequality} />
                  )}
                </TabsContent>
                <TabsContent value="secondary" className="mt-2">
                  {activeSubMarket && selectedInequality && (
                    <SecondaryMarketInterface
                      market={activeSubMarket}
                      userBTokens={userBTokens[selectedInequality] || 0}
                      onBuy={handleBuyBTokens}
                      onSell={handleSellBTokens}
                      inequality={selectedInequality}
                    />
                  )}
                </TabsContent>
                <TabsContent value="info" className="mt-2">
                  {activeSubMarket && <MarketInfoPanel market={activeSubMarket} />}
                </TabsContent>
              </Tabs>
            </div>
            {/* Right Column */}
            <div className="sticky top-20" style={{ zIndex: 10 }}>
              <Card className="bg-zinc-900 border-zinc-800 mb-4">
                <CardHeader className="p-3">
                  <CardTitle className="text-base">Your Positions</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="space-y-2">
                    {Object.entries(userShares).map(([ineq, shares]) => {
                      const { yes: yesShares, no: noShares } = shares
                      return (
                        <div key={ineq}>
                          {yesShares > 0 && (
                            <div className="flex justify-between items-center p-2 bg-zinc-800 rounded-lg mb-1">
                              <div>
                                <div className="text-sm font-medium text-white">{ineq}</div>
                                <div className="text-xs text-zinc-400">Yes Shares</div>
                              </div>
                              <div className="text-sm font-medium text-white">{yesShares}</div>
                            </div>
                          )}
                          {noShares > 0 && (
                            <div className="flex justify-between items-center p-2 bg-zinc-800 rounded-lg">
                              <div>
                                <div className="text-sm font-medium text-white">{ineq}</div>
                                <div className="text-xs text-zinc-400">No Shares</div>
                              </div>
                              <div className="text-sm font-medium text-white">{noShares}</div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {Object.entries(userBTokens).map(
                      ([ineq, bAmount]) =>
                        bAmount > 0 && (
                          <div key={`${ineq}-bt`} className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center gap-1.5">
                                <ArrowRightLeft className="h-4 w-4 text-blue-400" />
                                <span className="text-sm font-medium text-white">b-tokens ({ineq})</span>
                              </div>
                              <div className="text-sm font-medium text-white">{bAmount.toFixed(1)} b</div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full text-xs border-blue-500/50 text-blue-400 hover:bg-blue-500/20 mt-1"
                              onClick={() => {
                                setSelectedInequality(ineq)
                                setActiveTab("secondary")
                              }}
                            >
                              Trade b-tokens
                            </Button>
                          </div>
                        ),
                    )}
                    {Object.values(userShares).every((s) => s.yes === 0 && s.no === 0) &&
                      Object.values(userBTokens).every((b) => b === 0) && (
                        <div className="text-sm text-zinc-400 text-center py-2">No positions yet.</div>
                      )}
                  </div>
                </CardContent>
              </Card>
              {activeSubMarket && selectedInequality && (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader className="p-3">
                    <CardTitle className="text-base">
                      Seeders for <span className="text-primary">{selectedInequality}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="space-y-2">
                      {Array.from(activeSubMarket.seeders.entries()).map(([addr, sInfo], idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-zinc-800 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {addr === `initial_seeder_${selectedInequality}` || addr === "You"
                                ? addr
                                : `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`}
                            </div>
                            <div className="text-xs text-zinc-400">
                              Seeded: {toFixed(sInfo.seedAmountStroops).toFixed(0)} XLM
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-white">
                              {toFixed(sInfo.liquidityParamB).toFixed(1)} b
                            </div>
                            <div className="text-xs text-zinc-400">
                              ({((toFixed(sInfo.liquidityParamB) / currentMarketB) * 100 || 0).toFixed(1)}% pool)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-zinc-800 bg-zinc-950 rounded-b-lg p-3">
                    <div className="w-full">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <BarChart3 className="h-3.5 w-3.5 text-yellow-500" />
                        <span className="text-xs font-medium text-yellow-500">b-token Economics</span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        b-tokens for '{selectedInequality}' represent shares of its specific liquidity pool. Combined b:{" "}
                        {currentMarketB.toFixed(1)} b.
                      </p>
                    </div>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
  if (num >= 1000) return (num / 1000).toFixed(1) + "K"
  return num.toString()
}
