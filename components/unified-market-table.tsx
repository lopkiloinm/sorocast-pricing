"use client"

import type React from "react"
import Link from "next/link"
import { Clock, TrendingUp, TrendingDown } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Consistent color mapping with MarketCard
const colorClassPrefixMap: Record<string, string> = {
  green: "sorocast-green",
  red: "sorocast-red",
  blue: "sorocast-blue",
  purple: "sorocast-purple",
  orange: "sorocast-orange",
  yellow: "sorocast-yellow", // Primary/amber
  pink: "sorocast-pink",
  gray: "sorocast-gray",
  default: "sorocast-yellow",
}

// Helper for horizontal progress gradients, consistent with MarketCard
const getHorizontalProgressIndicatorGradient = (optionColor: string): string => {
  const lowerOptionColor = optionColor.toLowerCase()
  const prefix = colorClassPrefixMap[lowerOptionColor] || colorClassPrefixMap["default"]
  return `bg-gradient-to-r from-${prefix}-500 to-${prefix}-400`
}

interface MarketOption {
  name: string
  price: string
  color: string
}

interface Market {
  id: string
  title: string
  category: string
  endDate: string
  options: MarketOption[]
  volume: string
  trend?: "up" | "down" | "neutral"
  change?: string
  type?: "binary" | "categorical" | "range"
}

export function UnifiedMarketTable() {
  const handleTradeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Betting logic
  }

  const markets: Market[] = [
    {
      id: "bitcoin-40k",
      title: "Bitcoin above $40k by end of month",
      category: "Crypto",
      endDate: "May 31, 2023",
      options: [
        { name: "Yes", price: "0.67", color: "green" },
        { name: "No", price: "0.33", color: "red" },
      ],
      volume: "45,230",
      trend: "up",
      change: "+2.5",
      type: "binary",
    },
    {
      id: "fed-chair",
      title: "Next Fed Chair Appointment",
      category: "Politics",
      endDate: "Dec 15, 2023",
      options: [
        { name: "Powell", price: "0.45", color: "blue" },
        { name: "Brainard", price: "0.30", color: "green" },
        { name: "Clarida", price: "0.15", color: "purple" },
        { name: "Other", price: "0.10", color: "orange" },
      ],
      volume: "67,890",
      trend: "neutral",
      change: "0.0",
      type: "categorical",
    },
    {
      id: "sp500-eoy",
      title: "S&P 500 EOY 2023",
      category: "Finance",
      endDate: "Dec 31, 2023",
      options: [
        { name: "<4000", price: "0.10", color: "red" },
        { name: "4000-4250", price: "0.15", color: "orange" },
        { name: "4251-4500", price: "0.30", color: "yellow" },
        { name: "4501-4750", price: "0.25", color: "green" },
        { name: "4751-5000", price: "0.15", color: "blue" },
        { name: ">5000", price: "0.05", color: "purple" },
      ],
      volume: "89,120",
      trend: "up",
      change: "+1.2",
      type: "range",
    },
    // Add more example markets if needed
  ]

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-zinc-700/60 shadow-xl shadow-black/30 bg-gradient-to-b from-zinc-800/70 to-zinc-900/80">
      <table className="w-full min-w-[700px]">
        <thead className="border-b-2 border-zinc-700/80 bg-gradient-to-b from-zinc-700/50 to-zinc-800/40">
          <tr>
            <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Market
            </th>
            <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Ends
            </th>
            <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Options
            </th>
            <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Volume
            </th>
            <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-700/70">
          {markets.map((market) => {
            const marketType =
              market.type ||
              (market.options.length === 2 && market.options[0].name === "Yes" && market.options[1].name === "No"
                ? "binary"
                : market.options.some((o) => o.name.includes("-") || o.name.includes("<") || o.name.includes(">"))
                  ? "range"
                  : "categorical")

            const isBinary = marketType === "binary"

            const getTrendIcon = () => {
              if (market.trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-sorocast-green-400" />
              if (market.trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-sorocast-red-400" />
              return null
            }

            const getTrendColor = () => {
              if (market.trend === "up") return "text-sorocast-green-400"
              if (market.trend === "down") return "text-sorocast-red-400"
              return "text-zinc-400"
            }

            const sortedOptions = [...market.options].sort(
              (a, b) => Number.parseFloat(b.price) - Number.parseFloat(a.price),
            )
            const topOption = sortedOptions[0]
            const topOptionPrefix = colorClassPrefixMap[topOption.color.toLowerCase()] || colorClassPrefixMap["default"]

            return (
              <tr key={market.id} className="group transition-all duration-200 ease-out hover:bg-primary/10">
                <td className="px-4 py-4 align-top">
                  <Link href={`/markets/${market.id}`} className="block">
                    <div className="font-semibold text-sm text-zinc-100 group-hover:text-primary transition-colors">
                      {market.title}
                    </div>
                    <div className="text-xs text-primary/80 group-hover:text-primary transition-colors">
                      {market.category}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-4 text-center align-top">
                  <Link href={`/markets/${market.id}`} className="block">
                    <div className="flex items-center justify-center text-sm text-zinc-400">
                      <Clock className="mr-1.5 h-3.5 w-3.5" />
                      {market.endDate}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-4 align-top">
                  <Link href={`/markets/${market.id}`} className="block">
                    {isBinary ? (
                      <div className="flex flex-col items-center">
                        <div className="w-full max-w-[120px] mb-1.5">
                          <Progress
                            value={Number.parseFloat(market.options[0].price) * 100}
                            className="h-2.5 bg-gradient-to-r from-zinc-700 to-zinc-600 border border-zinc-500/50 shadow-inner rounded-full"
                            indicatorClassName={cn(
                              "shadow-md rounded-full",
                              getHorizontalProgressIndicatorGradient(market.options[0].color),
                            )}
                          />
                        </div>
                        <div className="flex justify-between w-full max-w-[120px] text-xs">
                          <span className="text-sorocast-green-400 font-medium">{market.options[0].price}</span>
                          <span className="text-sorocast-red-400 font-medium">{market.options[1].price}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={cn(
                            "px-2.5 py-1 rounded text-xs font-medium mb-1 border",
                            `text-${topOptionPrefix}-300 border-${topOptionPrefix}-500/40 bg-gradient-to-br from-${topOptionPrefix}-600/20 to-${topOptionPrefix}-700/10`,
                          )}
                        >
                          {topOption.name}: {topOption.price}
                        </div>
                        <div className="text-xs text-zinc-500">+{market.options.length - 1} more</div>
                      </div>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-4 text-center align-top">
                  <Link href={`/markets/${market.id}`} className="block">
                    <div className="text-sm text-zinc-100 font-medium">${market.volume}</div>
                    {market.change && market.trend !== "neutral" && (
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {getTrendIcon()}
                        <span className={`text-xs font-medium ${getTrendColor()}`}>{market.change}%</span>
                      </div>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-4 text-center align-top">
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-4 text-xs" // Enhanced outline style will be applied via button.tsx
                      onClick={handleTradeClick}
                    >
                      Trade
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
