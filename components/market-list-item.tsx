"use client"

import type React from "react"

import Link from "next/link"
import { Clock, TrendingUp, TrendingDown } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface MarketOption {
  name: string
  price: string
  color: string
}

interface MarketListItemProps {
  id: string
  title: string
  category: string
  endDate: string
  options: MarketOption[]
  liquidity: string
  volume: string
  trend?: "up" | "down" | "neutral"
  change?: string
  type?: "binary" | "categorical" | "range"
}

export function MarketListItem({
  id,
  title,
  category,
  endDate,
  options,
  liquidity,
  volume,
  trend = "neutral",
  change = "0.00",
  type,
}: MarketListItemProps) {
  // Determine market type if not explicitly provided
  const marketType =
    type ||
    (options.length === 2 && options[0].name === "Yes" && options[1].name === "No"
      ? "binary"
      : options.some((o) => o.name.includes("-"))
        ? "range"
        : "categorical")

  const isBinary = marketType === "binary"

  // Get trend icon and color
  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="h-3 w-3 text-green-400" />
    if (trend === "down") return <TrendingDown className="h-3 w-3 text-red-400" />
    return null
  }

  const getTrendColor = () => {
    if (trend === "up") return "text-green-400"
    if (trend === "down") return "text-red-400"
    return "text-zinc-400"
  }

  // Calculate the highest price option for categorical/range markets
  const sortedOptions = [...options].sort((a, b) => Number.parseFloat(b.price) - Number.parseFloat(a.price))
  const topOption = sortedOptions[0]

  // Handle bet button click
  const handleTradeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Betting logic would go here
  }

  return (
    <div className="w-full">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg transition-all duration-200 hover:border-yellow-500 hover:shadow-lg hover:shadow-yellow-500/10">
        <div className="p-3">
          {/* Mobile Layout */}
          <div className="block sm:hidden">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="inline-block rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-500">
                  {category}
                </span>
                <div className="flex items-center text-xs text-zinc-400">
                  <Clock className="mr-1 h-3 w-3" />
                  <span>{endDate}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-xs border-yellow-500/50 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/30 hover:border-yellow-500 hover:text-white"
                onClick={handleTradeClick}
              >
                Trade
              </Button>
            </div>

            <Link href={`/markets/${id}`}>
              <h3 className="font-semibold text-white hover:text-yellow-500 transition-colors text-sm mb-3 leading-tight">
                {title}
              </h3>
            </Link>

            {isBinary ? (
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Probability</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon()}
                    <span className={`${getTrendColor()}`}>{change}%</span>
                  </div>
                </div>
                <Progress value={Number.parseFloat(options[0].price) * 100} className="h-1.5 bg-zinc-700" />
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-green-400">{options[0].price}</span>
                  <span className="text-red-400">{options[1].price}</span>
                </div>
              </div>
            ) : (
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Top Option</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon()}
                    <span className={`${getTrendColor()}`}>{change}%</span>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${getTextColor(topOption.color)} text-center bg-zinc-800`}>
                  {topOption.name}: {topOption.price}
                </div>
              </div>
            )}

            <div className="flex justify-between text-xs">
              <div>
                <span className="text-zinc-400">Vol: </span>
                <span className="text-white">${formatNumber(Number.parseInt(volume.replace(/,/g, "")))}</span>
              </div>
              <div>
                <span className="text-zinc-400">Liq: </span>
                <span className="text-white">${formatNumber(Number.parseInt(liquidity.replace(/,/g, "")))}</span>
              </div>
            </div>
          </div>

          {/* Desktop/Tablet Layout */}
          <div className="hidden sm:block">
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-500">
                    {category}
                  </span>
                  <div className="flex items-center text-xs text-zinc-400">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>Ends {endDate}</span>
                  </div>
                </div>
                <Link href={`/markets/${id}`}>
                  <h3 className="font-semibold text-white hover:text-yellow-500 transition-colors text-sm leading-tight">
                    {title}
                  </h3>
                </Link>
              </div>

              {isBinary ? (
                <div className="w-32 lg:w-40">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400">Probability</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon()}
                      <span className={`${getTrendColor()}`}>{change}%</span>
                    </div>
                  </div>
                  <Progress value={Number.parseFloat(options[0].price) * 100} className="h-1.5 bg-zinc-700" />
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-green-400">{options[0].price}</span>
                    <span className="text-red-400">{options[1].price}</span>
                  </div>
                </div>
              ) : (
                <div className="w-32 lg:w-40">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400">Top Option</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon()}
                      <span className={`${getTrendColor()}`}>{change}%</span>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${getTextColor(topOption.color)} text-center bg-zinc-800`}>
                    {topOption.name}: {topOption.price}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-xs">
                <div className="text-center">
                  <div className="text-zinc-400">Volume</div>
                  <div className="font-medium text-white">
                    ${formatNumber(Number.parseInt(volume.replace(/,/g, "")))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-zinc-400">Liquidity</div>
                  <div className="font-medium text-white">
                    ${formatNumber(Number.parseInt(liquidity.replace(/,/g, "")))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-3 border-yellow-500/50 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/30 hover:border-yellow-500 hover:text-white"
                  onClick={handleTradeClick}
                >
                  Trade
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getTextColor(color: string): string {
  switch (color) {
    case "blue":
      return "text-blue-400"
    case "green":
      return "text-green-400"
    case "red":
      return "text-red-400"
    case "purple":
      return "text-purple-400"
    case "orange":
      return "text-orange-400"
    case "yellow":
      return "text-yellow-400"
    default:
      return "text-yellow-400"
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}
