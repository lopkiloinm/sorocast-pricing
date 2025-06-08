"use client"

import { Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { allMarkets } from "@/data/markets"

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
  if (num >= 1000) return (num / 1000).toFixed(1) + "K"
  return num.toString()
}

export function TrendingMarkets() {
  const router = useRouter()
  // Redefine "trending" as highest volume markets
  const trending = allMarkets
    .sort((a, b) => Number.parseInt(b.volume.replace(/,/g, "")) - Number.parseInt(a.volume.replace(/,/g, "")))
    .slice(0, 3)

  return (
    <div className="bg-gradient-to-bl from-zinc-900/90 via-zinc-950 to-black border border-zinc-800/70 rounded-xl p-4 shadow-lg transition-all duration-300 ease-out hover:border-purple-500/50 hover:shadow-[0_0_25px_0px_theme(colors.purple.600/0.2)] h-full flex flex-col">
      <div className="flex items-center mb-4 shrink-0">
        <Zap className="h-5 w-5 text-purple-400 mr-2" />
        <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Highest Volume
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
                <span className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                  ${formatNumber(Number.parseInt(market.volume.replace(/,/g, "")))}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-500 text-sm">No active markets at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
