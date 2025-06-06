"use client"

import type React from "react"
import Link from "next/link"
import { Clock, TrendingUp, TrendingDown, Zap, Droplets } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation" // Import useRouter

// Map color names from data/markets.ts to their Tailwind class prefixes
const colorClassPrefixMap: Record<string, string> = {
  green: "sorocast-green",
  red: "sorocast-red",
  blue: "sorocast-blue",
  purple: "sorocast-purple",
  orange: "sorocast-orange",
  yellow: "sorocast-yellow", // This is our primary/amber
  pink: "sorocast-pink",
  gray: "sorocast-gray",
  default: "sorocast-yellow",
}

// Hex map for direct shadow color generation (using 500 shades)
const colorHexMap: Record<string, string> = {
  green: "#22C55E",
  red: "#EF4444",
  blue: "#3B82F6",
  purple: "#8B5CF6",
  orange: "#F97316",
  yellow: "#F59E0B",
  pink: "#EC4899",
  gray: "#6B7280",
  default: "#F59E0B", // Fallback to yellow
}

function getShadowColorHexWithOpacity(colorName: string, opacity = 0.4): string {
  const lowerColorName = colorName.toLowerCase()
  const hex = colorHexMap[lowerColorName] || colorHexMap["default"]
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0")
  return `${hex}${alpha}`
}

interface MarketOption {
  name: string
  price: string
  color: string
}
interface MarketCardProps {
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

const getHorizontalProgressIndicatorGradient = (optionColor: string): string => {
  const lowerOptionColor = optionColor.toLowerCase()
  const prefix = colorClassPrefixMap[lowerOptionColor] || colorClassPrefixMap["default"]
  return `bg-gradient-to-r from-${prefix}-500 to-${prefix}-400`
}

const getVerticalProgressIndicatorGradient = (optionColor: string): string => {
  const lowerOptionColor = optionColor.toLowerCase()
  const prefix = colorClassPrefixMap[lowerOptionColor] || colorClassPrefixMap["default"]
  // For vertical, often a slightly darker 'to' color or more variance in opacity works well.
  return `bg-gradient-to-b from-${prefix}-500 to-${prefix}-600`
}

export function MarketCard({
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
}: MarketCardProps) {
  const router = useRouter() // Initialize router

  const marketType =
    type ||
    (options.length === 2 && options[0].name === "Yes" && options[1].name === "No"
      ? "binary"
      : options.some((o) => o.name.includes("-"))
        ? "range"
        : "categorical")
  const isBinary = marketType === "binary"

  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-sorocast-green-400" />
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-sorocast-red-400" />
    return null
  }
  const getTrendColor = () => {
    if (trend === "up") return "text-sorocast-green-400"
    if (trend === "down") return "text-sorocast-red-400"
    return "text-zinc-400"
  }

  const sortedOptions = [...options].sort((a, b) => Number.parseFloat(b.price) - Number.parseFloat(a.price))

  // Modified to allow navigation via parent Link
  const handleOptionButtonClick = (e: React.MouseEvent, marketId: string) => {
    // e.preventDefault(); // Prevent default button action if any, but allow click to bubble for Link
    // e.stopPropagation(); // REMOVED to allow click to propagate to parent Link
    // If you wanted the button itself to navigate (e.g. to a specific tab or with params):
    // router.push(`/markets/${marketId}`);
    // For now, we let the parent Link handle the navigation.
    // Any specific "betting logic" that should happen *on this page* before navigating
    // or instead of navigating would go here.
  }

  // Styles for the main clickable button area (text, price)
  const getOptionButtonContentClasses = (optionColor: string) => {
    const lowerOptionColor = optionColor.toLowerCase()
    const prefix = colorClassPrefixMap[lowerOptionColor] || colorClassPrefixMap["default"]
    return cn(
      "w-full h-full py-1 px-3 flex justify-between items-center absolute top-0 left-0 z-10",
      "transition-colors duration-200 ease-out", // For text color transition
      `text-${prefix}-300`,
      "group-hover/btn-outer:text-white",
      "group-focus-visible/btn-outer:text-white",
    )
  }

  // Styles for the container that handles border, shadow, and scaling
  const getOptionContainerClasses = (optionColor: string) => {
    const lowerOptionColor = optionColor.toLowerCase()
    const prefix = colorClassPrefixMap[lowerOptionColor] || colorClassPrefixMap["default"]
    const shadowHexWithOpacity = getShadowColorHexWithOpacity(lowerOptionColor, 0.4)

    return cn(
      "relative w-full rounded-md overflow-hidden group/btn-outer", // group/btn-outer is key
      "transition-all duration-200 ease-out transform", // transform for scale
      `border-2 border-${prefix}-500/70`, // Default border on container
      // Hover styles on container
      `hover:border-${prefix}-400 hover:shadow-[0_0_18px_2px_${shadowHexWithOpacity}]`,
      // Focus-within styles for container (when button inside is focused)
      `focus-within:border-${prefix}-400 focus-within:shadow-[0_0_18px_2px_${shadowHexWithOpacity}] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-zinc-900 focus-within:ring-${prefix}-500`,
      // Active state for scaling
      "active:scale-[0.95]",
    )
  }

  const getOptionBackgroundFillClasses = (optionColor: string) => {
    const lowerOptionColor = optionColor.toLowerCase()
    const prefix = colorClassPrefixMap[lowerOptionColor] || colorClassPrefixMap["default"]
    return cn(
      "absolute top-0 left-0 h-full rounded-l-md", // Keep rounded-l-md for the fill
      `bg-gradient-to-r from-${prefix}-500/40 via-${prefix}-600/30 to-${prefix}-700/20`,
      "opacity-70 group-hover/btn-outer:opacity-100 transition-opacity duration-200",
    )
  }

  return (
    <div className="h-full group">
      <Link href={`/markets/${id}`} className="block h-full">
        <div
          className={cn(
            "h-full overflow-hidden border rounded-xl flex flex-col",
            "bg-gradient-to-b from-zinc-800/80 via-zinc-900/90 to-zinc-800/80",
            "border-zinc-700/50",
            "transition-all duration-300 ease-out",
            "group-hover:border-primary/70 group-hover:shadow-[0_0_35px_0px_hsl(var(--primary)/0.25)]",
          )}
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {category}
              </span>
              <div className="flex items-center text-xs text-zinc-400">
                <Clock className="mr-1 h-3 w-3" /> <span>Ends {endDate}</span>
              </div>
            </div>
            <h3 className="mt-3 font-semibold text-zinc-100 line-clamp-2 min-h-[2.75rem] text-base group-hover:text-primary transition-colors duration-200">
              {title}
            </h3>
          </div>
          <div className="px-4 pb-4 flex flex-col flex-grow">
            {isBinary ? (
              <>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <div className="font-medium text-zinc-200">Probability</div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon()} <span className={`text-xs ${getTrendColor()}`}>{change}%</span>
                    </div>
                  </div>
                  <Progress
                    value={Number.parseFloat(options[0].price) * 100}
                    className="h-2.5 bg-gradient-to-r from-zinc-700 to-zinc-600 border border-zinc-500/50 shadow-inner rounded-full"
                    indicatorClassName={cn(
                      "shadow-md rounded-full",
                      getHorizontalProgressIndicatorGradient(options[0].color),
                    )}
                  />
                  <div className="flex justify-between text-xs mt-1.5">
                    <span className="text-sorocast-green-400 font-medium">{options[0].price}</span>
                    <span className="text-sorocast-red-400 font-medium">{options[1].price}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2.5 mt-auto">
                  {options.map((option, index) => (
                    <div key={index} className={cn(getOptionContainerClasses(option.color), "h-[48px]")}>
                      <div
                        className={getOptionBackgroundFillClasses(option.color)}
                        style={{ width: `${Number.parseFloat(option.price) * 100}%` }}
                      ></div>
                      <button
                        type="button" // Explicitly set type to prevent form submission if inside a form
                        className={getOptionButtonContentClasses(option.color)}
                        onClick={(e) => handleOptionButtonClick(e, id)}
                        aria-label={`Trade on ${option.name} at price ${option.price}`}
                      >
                        <span className="inline-block text-sm font-semibold">{option.name}</span>
                        <span className="inline-block text-sm font-bold">${option.price}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <div className="font-medium text-zinc-200">Distribution</div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon()} <span className={`text-xs ${getTrendColor()}`}>{change}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-gradient-to-r from-zinc-700 to-zinc-600 rounded-full overflow-hidden flex border border-zinc-500/50 shadow-inner">
                    {sortedOptions.map((option, index) => (
                      <div
                        key={index}
                        className={cn("h-full shadow-sm", getVerticalProgressIndicatorGradient(option.color))}
                        style={{ width: `${Number.parseFloat(option.price) * 100}%` }}
                        title={`${option.name}: ${option.price}`}
                      ></div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs mt-1.5">
                    <span className="text-zinc-400">Top: {sortedOptions[0].name}</span>
                    <span className="text-zinc-300 font-medium">{sortedOptions[0].price}</span>
                  </div>
                </div>
                <div
                  className={cn(
                    "max-h-[112px] min-h-[70px] overflow-y-auto pr-1 grid grid-cols-1 gap-2 mt-auto",
                    "custom-scrollbar scrollbar-hide", // Added scrollbar-hide
                  )}
                >
                  {options.map((option, index) => (
                    <div key={index} className={cn(getOptionContainerClasses(option.color), "h-10 mb-0.5")}>
                      <div
                        className={getOptionBackgroundFillClasses(option.color)}
                        style={{ width: `${Number.parseFloat(option.price) * 100}%` }}
                      ></div>
                      <button
                        type="button" // Explicitly set type
                        className={getOptionButtonContentClasses(option.color)}
                        onClick={(e) => handleOptionButtonClick(e, id)}
                        aria-label={`Trade on ${option.name} at price ${option.price}`}
                      >
                        <span className="inline-block text-xs">{option.name}</span>
                        <span className="inline-block text-xs font-semibold">${option.price}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="border-t border-zinc-700/50 px-3 py-2.5 bg-gradient-to-t from-zinc-800/70 to-zinc-900/60 rounded-b-xl mt-auto">
            <div className="flex items-center justify-between text-xs w-full">
              <div className="flex items-center text-zinc-400" title="24h Volume">
                <Zap className="w-3.5 h-3.5 mr-1 text-primary/80" />
                <span className="font-medium text-zinc-300">
                  ${formatNumber(Number.parseInt(volume.replace(/,/g, "")))}
                </span>
              </div>
              <span className="text-zinc-600 mx-1">|</span>
              <div className="flex items-center text-zinc-400" title="Liquidity">
                <Droplets className="w-3.5 h-3.5 mr-1 text-sorocast-blue-400/80" />
                <span className="font-medium text-zinc-300">
                  ${formatNumber(Number.parseInt(liquidity.replace(/,/g, "")))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
  if (num >= 1000) return (num / 1000).toFixed(1) + "K"
  return num.toString()
}
