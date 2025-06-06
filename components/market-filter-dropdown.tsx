"use client"

import { useState, useEffect, useRef } from "react"
import { Check, ChevronDown, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"

interface MarketFilterDropdownProps {
  onFilterChange: (filters: MarketFilters) => void
  currentFilters: MarketFilters
}

export interface MarketFilters {
  status: "all" | "open" | "closed" | "resolved"
  liquidity: "all" | "high" | "medium" | "low"
  volume: "all" | "high" | "medium" | "low"
  frequency: "all" | "daily" | "weekly" | "monthly"
}

export function MarketFilterDropdown({ onFilterChange, currentFilters }: MarketFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleStatusChange = (status: MarketFilters["status"]) => {
    onFilterChange({ ...currentFilters, status })
  }

  const handleLiquidityChange = (liquidity: MarketFilters["liquidity"]) => {
    onFilterChange({ ...currentFilters, liquidity })
  }

  const handleVolumeChange = (volume: MarketFilters["volume"]) => {
    onFilterChange({ ...currentFilters, volume })
  }

  const handleFrequencyChange = (frequency: MarketFilters["frequency"]) => {
    onFilterChange({ ...currentFilters, frequency })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (currentFilters.status !== "all") count++
    if (currentFilters.liquidity !== "all") count++
    if (currentFilters.volume !== "all") count++
    if (currentFilters.frequency !== "all") count++
    return count
  }

  // Handle clicks outside of the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    // Add event listener when dropdown is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const activeCount = getActiveFiltersCount()

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        className="border-zinc-800 text-white hover:bg-yellow-500/20 hover:border-yellow-500 relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter className="mr-2 h-4 w-4" />
        Filter
        {activeCount > 0 && (
          <span className="ml-2 h-5 w-5 rounded-full bg-yellow-500 text-xs text-black flex items-center justify-center">
            {activeCount}
          </span>
        )}
        <ChevronDown className="ml-2 h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute mt-2 w-56 rounded-md shadow-lg bg-zinc-900 border border-zinc-800 z-10">
          <div className="py-1">
            <div className="px-4 py-2 text-sm font-medium text-white">Filter Markets</div>
            <div className="border-t border-zinc-800"></div>

            <div className="px-4 py-2">
              <div className="text-xs text-zinc-400 mb-1">Status</div>
              <div className="space-y-1">
                <button
                  className="flex items-center justify-between w-full px-2 py-1 text-sm text-white hover:bg-zinc-800 rounded"
                  onClick={() => handleStatusChange("all")}
                >
                  All
                  {currentFilters.status === "all" && <Check className="h-4 w-4 text-yellow-500" />}
                </button>
                <button
                  className="flex items-center justify-between w-full px-2 py-1 text-sm text-white hover:bg-zinc-800 rounded"
                  onClick={() => handleStatusChange("open")}
                >
                  Open
                  {currentFilters.status === "open" && <Check className="h-4 w-4 text-yellow-500" />}
                </button>
                <button
                  className="flex items-center justify-between w-full px-2 py-1 text-sm text-white hover:bg-zinc-800 rounded"
                  onClick={() => handleStatusChange("closed")}
                >
                  Closed
                  {currentFilters.status === "closed" && <Check className="h-4 w-4 text-yellow-500" />}
                </button>
                <button
                  className="flex items-center justify-between w-full px-2 py-1 text-sm text-white hover:bg-zinc-800 rounded"
                  onClick={() => handleStatusChange("resolved")}
                >
                  Resolved
                  {currentFilters.status === "resolved" && <Check className="h-4 w-4 text-yellow-500" />}
                </button>
              </div>
            </div>

            <div className="border-t border-zinc-800 my-1"></div>

            <div className="px-4 py-2">
              <div className="text-xs text-zinc-400 mb-1">Liquidity</div>
              <div className="space-y-1">
                <button
                  className="flex items-center justify-between w-full px-2 py-1 text-sm text-white hover:bg-zinc-800 rounded"
                  onClick={() => handleLiquidityChange("all")}
                >
                  All
                  {currentFilters.liquidity === "all" && <Check className="h-4 w-4 text-yellow-500" />}
                </button>
                <button
                  className="flex items-center justify-between w-full px-2 py-1 text-sm text-white hover:bg-zinc-800 rounded"
                  onClick={() => handleLiquidityChange("high")}
                >
                  High (&gt;$100K)
                  {currentFilters.liquidity === "high" && <Check className="h-4 w-4 text-yellow-500" />}
                </button>
                <button
                  className="flex items-center justify-between w-full px-2 py-1 text-sm text-white hover:bg-zinc-800 rounded"
                  onClick={() => handleLiquidityChange("medium")}
                >
                  Medium ($50K-$100K)
                  {currentFilters.liquidity === "medium" && <Check className="h-4 w-4 text-yellow-500" />}
                </button>
                <button
                  className="flex items-center justify-between w-full px-2 py-1 text-sm text-white hover:bg-zinc-800 rounded"
                  onClick={() => handleLiquidityChange("low")}
                >
                  Low (&lt;$50K)
                  {currentFilters.liquidity === "low" && <Check className="h-4 w-4 text-yellow-500" />}
                </button>
              </div>
            </div>

            <div className="border-t border-zinc-800 my-1"></div>

            <div className="px-4 py-2">
              <div className="text-xs text-zinc-400 mb-1">Volume</div>
              <div className="space-y-1">
                <button
                  className="flex items-center justify-between w-full px-2 py-1 text-sm text-white hover:bg-zinc-800 rounded"
                  onClick={() => handleVolumeChange("all")}
                >
                  All
                  {currentFilters.volume === "all" && <Check className="h-4 w-4 text-yellow-500" />}
                </button>
                <button
                  className="flex items-center justify-between w-full px-2 py-1 text-sm text-white hover:bg-zinc-800 rounded"
                  onClick={() => handleVolumeChange("high")}
                >
                  High (&gt;$75K)
                  {currentFilters.volume === "high" && <Check className="h-4 w-4 text-yellow-500" />}
                </button>
                <button
                  className="flex items-center justify-between w-full px-2 py-1 text-sm text-white hover:bg-zinc-800 rounded"
                  onClick={() => handleVolumeChange("medium")}
                >
                  Medium ($30K-$75K)
                  {currentFilters.volume === "medium" && <Check className="h-4 w-4 text-yellow-500" />}
                </button>
                <button
                  className="flex items-center justify-between w-full px-2 py-1 text-sm text-white hover:bg-zinc-800 rounded"
                  onClick={() => handleVolumeChange("low")}
                >
                  Low (&lt;$30K)
                  {currentFilters.volume === "low" && <Check className="h-4 w-4 text-yellow-500" />}
                </button>
              </div>
            </div>

            <div className="border-t border-zinc-800 my-1"></div>

            <div className="px-4 py-2">
              <div className="text-xs text-zinc-400 mb-1">Trading Frequency</div>
              <div className="space-y-1">
                <button
                  className="flex items-center justify-between w-full px-2 py-1 text-sm text-white hover:bg-zinc-800 rounded"
                  onClick={() => handleFrequencyChange("all")}
                >
                  All
                  {currentFilters.frequency === "all" && <Check className="h-4 w-4 text-yellow-500" />}
                </button>
                <button
                  className="flex items-center justify-between w-full px-2 py-1 text-sm text-white hover:bg-zinc-800 rounded"
                  onClick={() => handleFrequencyChange("daily")}
                >
                  Daily
                  {currentFilters.frequency === "daily" && <Check className="h-4 w-4 text-yellow-500" />}
                </button>
                <button
                  className="flex items-center justify-between w-full px-2 py-1 text-sm text-white hover:bg-zinc-800 rounded"
                  onClick={() => handleFrequencyChange("weekly")}
                >
                  Weekly
                  {currentFilters.frequency === "weekly" && <Check className="h-4 w-4 text-yellow-500" />}
                </button>
                <button
                  className="flex items-center justify-between w-full px-2 py-1 text-sm text-white hover:bg-zinc-800 rounded"
                  onClick={() => handleFrequencyChange("monthly")}
                >
                  Monthly
                  {currentFilters.frequency === "monthly" && <Check className="h-4 w-4 text-yellow-500" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
