"use client"

import { Zap } from "lucide-react" // Removed ArrowUpRight, ArrowDownRight
import { useRouter } from "next/navigation"
import { allMarkets, type Market } from "@/data/markets"

export function TrendingMarkets() {
  const router = useRouter()
  const trending = allMarkets
    .filter((market) => market.trend === "up" || market.trend === "down") // Still using trend to identify "trending" markets
    .sort((a, b) => {
      const trendAIsUp = a.trend === "up"
      const trendBIsUp = b.trend === "up"
      if (trendAIsUp && !trendBIsUp) return -1
      if (!trendAIsUp && trendBIsUp) return 1
      return Math.abs(Number.parseFloat(b.change || "0")) - Math.abs(Number.parseFloat(a.change || "0"))
    })
    .slice(0, 3)

  const getDisplayChance = (market: Market): string => {
    if (market.options && market.options.length > 0 && market.options[0].price) {
      const price = Number.parseFloat(market.options[0].price)
      if (!isNaN(price)) {
        return (price * 100).toFixed(0) + "%"
      }
    }
    // Fallback if price is not available or market is not binary/primary option based
    // For categorical markets, this might need a different representation or be N/A
    if (market.marketType === "categorical" && market.options.length > 0) {
      // Find the option with the highest price for categorical markets as a proxy
      let highestPrice = 0
      let bestOptionName = ""
      market.options.forEach((opt) => {
        const price = Number.parseFloat(opt.price)
        if (!isNaN(price) && price > highestPrice) {
          highestPrice = price
          bestOptionName = opt.name
        }
      })
      if (bestOptionName) {
        return `${(highestPrice * 100).toFixed(0)}% (${bestOptionName.substring(0, 10)}${bestOptionName.length > 10 ? "..." : ""})`
      }
    }
    return "N/A"
  }

  return (
    <div className="bg-gradient-to-bl from-zinc-900/90 via-zinc-950 to-black border border-zinc-800/70 rounded-xl p-4 shadow-lg transition-all duration-300 ease-out hover:border-purple-500/50 hover:shadow-[0_0_25px_0px_theme(colors.purple.600/0.2)] h-full flex flex-col">
      <div className="flex items-center mb-4 shrink-0">
        <Zap className="h-5 w-5 text-purple-400 mr-2" />
        <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Trending Markets
        </h2>
      </div>
      <div className="space-y-2.5 flex-grow">
        {trending.length > 0 ? (
          trending.map((market) => (
            <div
              key={market.id}
              className="flex items-center justify-between bg-zinc-800/50 hover:bg-zinc-700/60 p-2.5 rounded-lg transition-all duration-200 ease-out cursor-pointer group hover:shadow-[0_0_15px_-5px_theme(colors.purple.500/0.3)] min-h-[3.75rem]"
              onClick={() => router.push(`/markets/${market.id}`)}
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-zinc-100 group-hover:text-white text-xs sm:text-sm font-medium line-clamp-1 transition-colors">
                  {market.title}
                </h3>
                <p className="text-xs text-zinc-400 group-hover:text-zinc-300 line-clamp-1 transition-colors">
                  {market.category}
                </p>
              </div>
              <div className="flex items-center ml-2 shrink-0">
                <span
                  className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors" // Neutral color
                >
                  {getDisplayChance(market)}
                </span>
                {/* Removed Arrow Icons */}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-500 text-sm">No trending markets at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
