"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Clock, TrendingUp, TrendingDown, Info, BarChart3, ArrowRightLeft } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
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
  addSeeder,
  createBinaryMarketSimulation,
  createCategoricalMarketSimulation,
  SCALE,
  createRangeMarketSimulation,
} from "@/lib/market-utils"

interface Trade {
  type: "buy" | "sell"
  outcome: string
  shares: string
  price: string
  cost: string
  fee: string
  timestamp: string
  trader: string
}

interface MarketMetadata {
  title: string
  description: string
  category: string
  endDate: number
  resolutionSource: string
  options: string[]
}

export default function MarketPage() {
  const params = useParams()
  const marketId = params.id as string
  const [market, setMarket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("trade")
  const [userShares, setUserShares] = useState<{ [key: string]: number }>({})
  const [recentTrades, setRecentTrades] = useState<Trade[]>([])
  const [userBTokens, setUserBTokens] = useState<number>(0)
  const [userBTokenListings, setUserBTokenListings] = useState<any[]>([])

  useEffect(() => {
    const fetchMarket = async () => {
      setLoading(true)
      const foundMarket = allMarkets.find((m) => m.id === marketId)

      if (foundMarket) {
        let enhancedMarket: any = {}
        const initialUserShares: { [key: string]: number } = {}
        foundMarket.options.forEach((opt: any) => {
          initialUserShares[opt.name] = 0
        })

        const marketType =
          foundMarket.type === "binary" ? "binary" : foundMarket.type === "categorical" ? "categorical" : "ranged"

        let marketSimulation
        if (marketType === "binary") {
          marketSimulation = createBinaryMarketSimulation()
        } else if (marketType === "categorical") {
          marketSimulation = createCategoricalMarketSimulation(foundMarket.options.length)
        } else {
          marketSimulation = createRangeMarketSimulation(foundMarket.options.length)
        }

        const { metadata, seeders: seedersMap, qSeeders, qReal, shares, history } = marketSimulation

        metadata.title = foundMarket.title
        metadata.description = foundMarket.description || "Market description"
        metadata.category = foundMarket.category || ""
        metadata.options = foundMarket.options.map((opt: any) => opt.name)

        const prices: number[] = []
        for (let i = 0; i < metadata.options.length; i++) {
          const price = marketPrice(qSeeders, seedersMap, i)
          prices.push(price)
        }

        const updatedOptions = foundMarket.options.map((option: any, index: number) => {
          return { ...option, price: prices[index].toFixed(3) }
        })

        const displaySeeders: any[] = []
        seedersMap.iter().forEach(([address, info]: [string, any]) => {
          displaySeeders.push({
            address: address === "initial_seeder" ? "C...XLM1" : address,
            amount: toFixed(info.seedAmountStroops).toFixed(0),
            b: toFixed(info.liquidityParamB).toFixed(1),
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          })
        })

        let totalB = 0
        seedersMap.iter().forEach(([_, info]: [string, any]) => {
          totalB += toFixed(info.liquidityParamB)
        })

        let totalLiquidity = 0
        seedersMap.iter().forEach(([_, info]: [string, any]) => {
          totalLiquidity += toFixed(info.seedAmountStroops)
        })

        const simulatedTrades: Trade[] = history
          .filter((event: any) => event.type === "trade")
          .map((event: any) => {
            const outcome = metadata.options[event.outcome]
            return {
              type: event.shares > 0 ? "buy" : "sell",
              outcome,
              shares: Math.abs(event.shares).toString(),
              price: event.prices[event.outcome].toFixed(3),
              cost: Math.abs(event.cost).toFixed(2),
              fee: event.shares > 0 ? (0.02 * event.shares).toFixed(2) : "0.00",
              timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
              trader: event.actor,
            }
          })
          .slice(0, 10)

        enhancedMarket = {
          ...foundMarket,
          options: updatedOptions,
          b: totalB,
          priors: seedersMap.get("initial_seeder")?.prior.map((p: number) => toFixed(p)) || [],
          marketType,
          metadata,
          seeders: displaySeeders,
          seedersMap,
          qSeeders,
          qReal,
          shares,
          totalLiquidity: Math.round(totalLiquidity),
          totalVolume: Math.round(totalLiquidity * 0.5),
          resolutionDate: "November 5, 2024",
          creator: "C...XLM6",
          creationBond: "1000 XLM",
          oracle: "Decentralized Oracle Network",
          category: foundMarket.category,
          tags: ["Politics", "Election", "USA", 2024],
        }
        setMarket(enhancedMarket)
        setUserShares(initialUserShares)
        setRecentTrades(simulatedTrades)
      }
      setTimeout(() => setLoading(false), 500)
    }
    fetchMarket()
  }, [marketId])

  const handleOutcomeSelect = (outcome: string) => setSelectedOutcome(outcome)

  const handleTrade = (outcome: string, sharesNum: number, cost: number) => {
    const newUserShares = { ...userShares }
    const outcomeIndex = market.options.findIndex((option: any) => option.name === outcome)
    if (outcomeIndex === -1) {
      console.error(`Outcome ${outcome} not found`)
      return
    }

    try {
      const marketObj = {
        metadata: market.metadata,
        seeders: market.seedersMap,
        qSeeders: market.qSeeders,
        qReal: market.qReal,
        shares: market.shares,
      }

      let tradeResult, alertMessage, tradeTypeString
      if (sharesNum > 0) {
        // Buy
        tradeResult = executeBuy("user", outcomeIndex, sharesNum, marketObj)
        const costXLM = tradeResult.cost / SCALE
        const feeXLM = tradeResult.fee / SCALE
        const totalCostXLM = costXLM + feeXLM
        alertMessage = `Bought ${sharesNum} shares of ${outcome} for ${totalCostXLM.toFixed(2)} XLM (${costXLM.toFixed(2)} + ${feeXLM.toFixed(2)} fee)`
        tradeTypeString = "buy"
        newUserShares[outcome] = (newUserShares[outcome] || 0) + sharesNum
      } else {
        // Sell
        const absShares = Math.abs(sharesNum)
        if ((newUserShares[outcome] || 0) < absShares) {
          alert(`Not enough shares of ${outcome} to sell.`)
          return
        }
        tradeResult = executeSell("user", outcomeIndex, absShares, marketObj)
        const refundXLM = tradeResult.refund / SCALE
        alertMessage = `Sold ${absShares} shares of ${outcome} for ${refundXLM.toFixed(2)} XLM`
        tradeTypeString = "sell"
        newUserShares[outcome] = (newUserShares[outcome] || 0) - absShares
      }

      setUserShares(newUserShares)
      const updatedOptions = market.options.map((option: any, index: number) => ({
        ...option,
        price: tradeResult.newPrices[index].toFixed(3),
      }))
      setMarket({
        ...market,
        options: updatedOptions,
        qSeeders: marketObj.qSeeders,
        qReal: marketObj.qReal,
        shares: marketObj.shares,
      })

      const newTrade: Trade = {
        type: tradeTypeString as "buy" | "sell",
        outcome,
        shares: Math.abs(sharesNum).toString(),
        price: tradeResult.newPrices[outcomeIndex].toFixed(3),
        cost:
          tradeTypeString === "buy"
            ? ((tradeResult.cost + tradeResult.fee) / SCALE).toFixed(2)
            : (tradeResult.refund / SCALE).toFixed(2),
        fee: tradeTypeString === "buy" ? (tradeResult.fee / SCALE).toFixed(2) : "0.00",
        timestamp: new Date().toISOString(),
        trader: "You",
      }
      setRecentTrades([newTrade, ...recentTrades])
      alert(alertMessage)
    } catch (error) {
      console.error("Trade failed:", error)
      alert(`Trade failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleSeed = (amount: number, bValue: number) => {
    const amountInStroops = amount * SCALE
    const marketObj = {
      metadata: market.metadata,
      seeders: market.seedersMap,
      qSeeders: market.qSeeders,
      qReal: market.qReal,
      shares: market.shares,
    }
    addSeeder(marketObj, "You", amountInStroops)
    const seederInfo = marketObj.seeders.get("You")
    if (!seederInfo) return

    const actualBValue = toFixed(seederInfo.liquidityParamB)
    setUserBTokens(userBTokens + actualBValue)
    const newSeeder = {
      address: "You",
      amount: amount.toString(),
      b: actualBValue.toFixed(1),
      timestamp: new Date().toLocaleDateString(),
    }
    const newPrices: number[] = []
    for (let i = 0; i < market.metadata.options.length; i++) {
      newPrices.push(marketPrice(marketObj.qSeeders, marketObj.seeders, i))
    }
    const updatedOptions = market.options.map((option: any, index: number) => ({
      ...option,
      price: newPrices[index].toFixed(3),
    }))
    setMarket({
      ...market,
      seeders: [...market.seeders, newSeeder],
      seedersMap: marketObj.seeders,
      qSeeders: marketObj.qSeeders,
      options: updatedOptions,
      b: market.b + actualBValue,
      totalLiquidity: market.totalLiquidity + amount,
    })
    alert(`Successfully seeded market with ${amount} XLM and received ${actualBValue.toFixed(1)} b-tokens!`)
    setActiveTab("secondary")
  }

  const handleBuyBTokens = (amount: number, pricePerB: number, seller: string) => {
    const totalCost = amount * pricePerB
    setUserBTokens(userBTokens + amount)
    alert(`Successfully bought ${amount.toFixed(1)} b-tokens for ${totalCost.toFixed(2)} XLM!`)
  }

  const handleSellBTokens = (amount: number, pricePerB: number) => {
    if (amount > userBTokens) {
      alert("You don't have enough b-tokens!")
      return
    }
    const newListing = {
      bAmount: amount,
      pricePerB,
      totalPrice: amount * pricePerB,
      timestamp: new Date().toISOString(),
    }
    setUserBTokenListings([...userBTokenListings, newListing])
    setUserBTokens(userBTokens - amount)
    alert(`Listed ${amount.toFixed(1)} b-tokens for sale at ${pricePerB.toFixed(2)} XLM each!`)
  }

  if (loading) {
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

  if (!market) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Market Not Found</h1>
            <p className="text-zinc-400 mb-6">The market you're looking for doesn't exist or has been removed.</p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const isBinary = market.marketType === "binary"
  const isCategorical = market.marketType === "categorical"
  const isRanged = market.marketType === "ranged"

  const getTrendIcon = () => {
    if (market.trend === "up") return <TrendingUp className="h-4 w-4 text-green-400" />
    if (market.trend === "down") return <TrendingDown className="h-4 w-4 text-red-400" />
    return null
  }
  const getTrendColor = () => {
    if (market.trend === "up") return "text-green-400"
    if (market.trend === "down") return "text-red-400"
    return "text-zinc-400"
  }
  const getOutcomeColor = (index: number) => {
    const colors = ["green", "red", "blue", "purple", "yellow", "orange", "pink", "indigo", "teal", "cyan"]
    return colors[index % colors.length]
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      <main className="flex-1">
        <div className="container px-4 py-4 md:px-6">
          <div className="mb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs text-yellow-500">
                    {market.category}
                  </span>
                  <div className="flex items-center text-xs text-zinc-400">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>Resolves {market.resolutionDate}</span>
                  </div>
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-white">{market.title}</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-xs text-zinc-400">24h Volume</div>
                  <div className="font-medium text-white">${formatNumber(market.totalVolume)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-zinc-400">Liquidity</div>
                  <div className="font-medium text-white">${formatNumber(market.totalLiquidity)}</div>
                </div>
                <div className="relative group flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white focus-visible:ring-yellow-500"
                    aria-describedby="info-tooltip-content"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                  <div
                    id="info-tooltip-content"
                    role="tooltip"
                    className="absolute top-full mt-2 w-max max-w-[calc(100vw-48px)] sm:max-w-xs 
                               left-1/2 -translate-x-1/2 
                               md:left-auto md:right-0 md:-translate-x-0
                               bg-zinc-900 text-zinc-100 text-sm border border-zinc-700 p-3 rounded-md shadow-xl 
                               opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-in-out pointer-events-none z-[60]"
                  >
                    This market uses LMSR (Logarithmic Market Scoring Rule) for pricing. The combined liquidity
                    parameter (b) is {market.b.toFixed(1)} XLM. Higher 'b' means lower price sensitivity to trades.
                    {/* Arrow pointing upwards to the button */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-2 h-2 md:left-auto md:right-2 md:-translate-x-0">
                      <div className="w-full h-full bg-zinc-900 border-l border-t border-zinc-700 transform rotate-45 mt-1"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-zinc-400">{market.description}</p>
          </div>

          {/* Mobile Layout */}
          <div className="block lg:hidden mb-4">
            <Tabs defaultValue="trade" className="w-full">
              <TabsList className="grid grid-cols-4 bg-zinc-900 border-zinc-800">
                <TabsTrigger value="trade">Trade</TabsTrigger>
                <TabsTrigger value="seed">Seed</TabsTrigger>
                <TabsTrigger value="secondary">b-Market</TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
              </TabsList>
              <TabsContent value="trade" className="mt-2">
                <Card className="bg-zinc-900 border-zinc-800 mb-3">
                  <CardHeader className="p-3">
                    <CardTitle className="text-base">Current Prices</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    {isBinary && (
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-zinc-400">Probability</span>
                            <span className="text-white">
                              {(Number.parseFloat(market.options[0].price) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress
                            value={Number.parseFloat(market.options[0].price) * 100}
                            className="h-2 bg-zinc-700"
                          />
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-green-400">Yes: {market.options[0].price}</span>
                            <span className="text-red-400">No: {market.options[1].price}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div
                            className={`p-2 rounded-lg border border-green-500/30 bg-green-500/5 cursor-pointer transition-all ${selectedOutcome === "Yes" ? "ring-1 ring-green-500" : ""}`}
                            onClick={() => handleOutcomeSelect("Yes")}
                          >
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="font-medium text-white">Yes</span>
                              <span className="text-green-400">{market.options[0].price}</span>
                            </div>
                            <div className="text-xs text-zinc-400">Pays 1 XLM if outcome is Yes</div>
                          </div>
                          <div
                            className={`p-2 rounded-lg border border-red-500/30 bg-red-500/5 cursor-pointer transition-all ${selectedOutcome === "No" ? "ring-1 ring-red-500" : ""}`}
                            onClick={() => handleOutcomeSelect("No")}
                          >
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="font-medium text-white">No</span>
                              <span className="text-red-400">{market.options[1].price}</span>
                            </div>
                            <div className="text-xs text-zinc-400">Pays 1 XLM if outcome is No</div>
                          </div>
                        </div>
                      </div>
                    )}
                    {isCategorical && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-2">
                          {market.options.map((option: any, index: number) => {
                            const color = getOutcomeColor(index)
                            return (
                              <div
                                key={option.name}
                                className={`p-2 rounded-lg border border-${color}-500/30 bg-${color}-500/5 cursor-pointer transition-all ${selectedOutcome === option.name ? `ring-1 ring-${color}-500` : ""}`}
                                onClick={() => handleOutcomeSelect(option.name)}
                              >
                                <div className="flex justify-between items-center mb-0.5">
                                  <span className="font-medium text-white">{option.name}</span>
                                  <span className={`text-${color}-400`}>{option.price}</span>
                                </div>
                                <div className="text-xs text-zinc-400">Pays 1 XLM if outcome is {option.name}</div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    {isRanged && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-2">
                          {market.options.map((option: any, index: number) => {
                            const color = getOutcomeColor(index)
                            return (
                              <div
                                key={option.name}
                                className={`p-2 rounded-lg border border-${color}-500/30 bg-${color}-500/5 cursor-pointer transition-all ${selectedOutcome === option.name ? `ring-1 ring-${color}-500` : ""}`}
                                onClick={() => handleOutcomeSelect(option.name)}
                              >
                                <div className="flex justify-between items-center mb-0.5">
                                  <span className="font-medium text-white">{option.name}</span>
                                  <span className={`text-${color}-400`}>{option.price}</span>
                                </div>
                                <div className="text-xs text-zinc-400">Pays 1 XLM if outcome is {option.name}</div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <UnifiedTradeInterface
                  market={market}
                  selectedOutcome={selectedOutcome}
                  userShares={userShares}
                  onSelectOutcome={handleOutcomeSelect}
                  onTrade={handleTrade}
                  qSeeders={market.qSeeders}
                  seeders={market.seedersMap}
                />
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
                <MarketSeedingPanel market={market} onSeed={handleSeed} />
              </TabsContent>
              <TabsContent value="secondary" className="mt-2">
                <SecondaryMarketInterface
                  market={market}
                  userBTokens={userBTokens}
                  onBuy={handleBuyBTokens}
                  onSell={handleSellBTokens}
                />
              </TabsContent>
              <TabsContent value="info" className="mt-2">
                <Card className="bg-zinc-900 border-zinc-800 mb-3">
                  <CardHeader className="p-3">
                    <CardTitle className="text-base">Market Seeders</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="space-y-2">
                      {market.seeders.map((seeder: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-zinc-800 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-white">{seeder.address}</div>
                            <div className="text-xs text-zinc-400">Seeded {seeder.timestamp}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-white">{seeder.b} b</div>
                            <div className="text-xs text-zinc-400">
                              ({((Number(seeder.b) / market.b) * 100).toFixed(1)}% of pool)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <MarketInfoPanel market={market} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="p-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Current Prices</span>
                    <div className="flex items-center gap-1 text-sm">
                      {getTrendIcon()}
                      <span className={`${getTrendColor()}`}>{market.change || "0.0"}%</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  {isBinary && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-zinc-400">Probability</span>
                          <span className="text-white">
                            {(Number.parseFloat(market.options[0].price) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={Number.parseFloat(market.options[0].price) * 100}
                          className="h-2 bg-zinc-700"
                        />
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-green-400">Yes: {market.options[0].price}</span>
                          <span className="text-red-400">No: {market.options[1].price}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div
                          className={`p-2 rounded-lg border border-green-500/30 bg-green-500/5 cursor-pointer transition-all ${selectedOutcome === "Yes" ? "ring-1 ring-green-500" : ""}`}
                          onClick={() => handleOutcomeSelect("Yes")}
                        >
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="font-medium text-white">Yes</span>
                            <span className="text-green-400">{market.options[0].price}</span>
                          </div>
                          <div className="text-xs text-zinc-400">Pays 1 XLM if outcome is Yes</div>
                        </div>
                        <div
                          className={`p-2 rounded-lg border border-red-500/30 bg-red-500/5 cursor-pointer transition-all ${selectedOutcome === "No" ? "ring-1 ring-red-500" : ""}`}
                          onClick={() => handleOutcomeSelect("No")}
                        >
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="font-medium text-white">No</span>
                            <span className="text-red-400">{market.options[1].price}</span>
                          </div>
                          <div className="text-xs text-zinc-400">Pays 1 XLM if outcome is No</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {isCategorical && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {market.options.map((option: any, index: number) => {
                          const color = getOutcomeColor(index)
                          return (
                            <div
                              key={option.name}
                              className={`p-2 rounded-lg border border-${color}-500/30 bg-${color}-500/5 cursor-pointer transition-all ${selectedOutcome === option.name ? `ring-1 ring-${color}-500` : ""}`}
                              onClick={() => handleOutcomeSelect(option.name)}
                            >
                              <div className="flex justify-between items-center mb-0.5">
                                <span className="font-medium text-white">{option.name}</span>
                                <span className={`text-${color}-400`}>{option.price}</span>
                              </div>
                              <div className="text-xs text-zinc-400">Pays 1 XLM if outcome is {option.name}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {isRanged && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {market.options.map((option: any, index: number) => {
                          const color = getOutcomeColor(index)
                          return (
                            <div
                              key={option.name}
                              className={`p-2 rounded-lg border border-${color}-500/30 bg-${color}-500/5 cursor-pointer transition-all ${selectedOutcome === option.name ? `ring-1 ring-${color}-500` : ""}`}
                              onClick={() => handleOutcomeSelect(option.name)}
                            >
                              <div className="flex justify-between items-center mb-0.5">
                                <span className="font-medium text-white">{option.name}</span>
                                <span className={`text-${color}-400`}>{option.price}</span>
                              </div>
                              <div className="text-xs text-zinc-400">Pays 1 XLM if outcome is {option.name}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Tabs defaultValue="trade" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 bg-zinc-900 border-zinc-800">
                  <TabsTrigger value="trade">Trade</TabsTrigger>
                  <TabsTrigger value="seed">Seed</TabsTrigger>
                  <TabsTrigger value="secondary">b-Market</TabsTrigger>
                  <TabsTrigger value="info">Info</TabsTrigger>
                </TabsList>
                <TabsContent value="trade" className="space-y-4 mt-2">
                  <UnifiedTradeInterface
                    market={market}
                    selectedOutcome={selectedOutcome}
                    userShares={userShares}
                    onSelectOutcome={handleOutcomeSelect}
                    onTrade={handleTrade}
                    qSeeders={market.qSeeders}
                    seeders={market.seedersMap}
                  />
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
                  <MarketSeedingPanel market={market} onSeed={handleSeed} />
                </TabsContent>
                <TabsContent value="secondary" className="mt-2">
                  <SecondaryMarketInterface
                    market={market}
                    userBTokens={userBTokens}
                    onBuy={handleBuyBTokens}
                    onSell={handleSellBTokens}
                  />
                </TabsContent>
                <TabsContent value="info" className="mt-2">
                  <MarketInfoPanel market={market} />
                </TabsContent>
              </Tabs>
            </div>
            <div>
              {" "}
              {/* Right Column */}
              <div className="sticky top-20" style={{ zIndex: 10 }}>
                <Card className="bg-zinc-900 border-zinc-800 mb-4">
                  <CardHeader className="p-3">
                    <CardTitle className="text-base">Your Positions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="space-y-2">
                      {Object.entries(userShares).map(
                        ([outcome, shares]) =>
                          shares > 0 && (
                            <div key={outcome} className="flex justify-between items-center p-2 bg-zinc-800 rounded-lg">
                              <div className="text-sm font-medium text-white">{outcome}</div>
                              <div className="text-sm font-medium text-white">{shares} shares</div>
                            </div>
                          ),
                      )}
                      {userBTokens > 0 && (
                        <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1.5">
                              <ArrowRightLeft className="h-4 w-4 text-blue-400" />
                              <span className="text-sm font-medium text-white">b-tokens</span>
                            </div>
                            <div className="text-sm font-medium text-white">{userBTokens.toFixed(1)} b</div>
                          </div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-zinc-400 mb-2">
                            <div>Fee Share:</div>
                            <div className="text-right">{((userBTokens / market.b) * 100).toFixed(2)}%</div>
                            <div>Est. Value:</div>
                            <div className="text-right">{(userBTokens * 0.85).toFixed(2)} XLM</div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                            onClick={() => setActiveTab("secondary")}
                          >
                            <ArrowRightLeft className="h-3 w-3 mr-1" />
                            Trade on Secondary Market
                          </Button>
                        </div>
                      )}
                      {Object.values(userShares).every((s) => s === 0) && userBTokens === 0 && (
                        <div className="text-sm text-zinc-400 text-center py-2">
                          You don't have any positions in this market yet.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader className="p-3">
                    <CardTitle className="text-base">Market Seeders</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="space-y-2">
                      {market.seeders.map((seeder: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-zinc-800 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-white">{seeder.address}</div>
                            <div className="text-xs text-zinc-400">Seeded {seeder.timestamp}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-white">{seeder.b} b</div>
                            <div className="text-xs text-zinc-400">
                              ({((Number(seeder.b) / market.b) * 100).toFixed(1)}% of pool)
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
                        b-tokens represent shares of the market's liquidity pool. Holders earn trading fees proportional
                        to their share. The combined b parameter for this market is {market.b.toFixed(1)} b.
                      </p>
                    </div>
                  </CardFooter>
                </Card>
              </div>
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
