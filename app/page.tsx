"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Plus, ChevronRight, Clock, TrendingUp } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Input } from "@/components/ui/input"
import type { MarketFilters } from "@/components/market-filter-dropdown"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { allMarkets } from "@/data/markets"
import { CategoryFilter } from "@/components/category-filter" // This was popular-categories before, ensure it's the right one or rename
import { TrendingMarkets } from "@/components/trending-markets"
import { Leaderboards } from "@/components/leaderboards"
import { TagFilter } from "@/components/tag-filter"
import { MarketCard } from "@/components/market-card"
import { MarketListItem } from "@/components/market-list-item"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTag, setActiveTag] = useState("All")
  const [timeRange, setTimeRange] = useState("all")
  const [sortBy, setSortBy] = useState("trending")
  const [filters, setFilters] = useState<MarketFilters>({
    status: "all",
    liquidity: "all",
    volume: "all",
    frequency: "all",
  })
  const [category, setCategory] = useState("all") // Assuming this is for CategoryFilter
  const [filteredMarkets, setFilteredMarkets] = useState(allMarkets)
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid")
  const [displayedCount, setDisplayedCount] = useState(viewMode === "grid" ? 12 : 8)
  const [isLoading, setIsLoading] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const router = useRouter()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let result = [...allMarkets]
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((m) => m.title.toLowerCase().includes(query) || m.category.toLowerCase().includes(query))
    }
    if (category !== "all") {
      result = result.filter((m) => m.category.toLowerCase() === category.toLowerCase())
    }
    if (activeTag !== "All") {
      const tagQuery = activeTag.toLowerCase()
      result = result.filter(
        (m) =>
          m.tags?.some((t) => t.toLowerCase().includes(tagQuery)) ||
          m.title.toLowerCase().includes(tagQuery) ||
          m.category.toLowerCase().includes(tagQuery),
      )
    }

    // Apply time range filter
    if (timeRange !== "all") {
      const now = new Date()
      result = result.filter((market) => {
        const endDate = new Date(market.endDate)
        const timeDiff = endDate.getTime() - now.getTime()

        switch (timeRange) {
          case "24h":
            return timeDiff <= 24 * 60 * 60 * 1000 && timeDiff > 0
          case "week":
            return timeDiff <= 7 * 24 * 60 * 60 * 1000 && timeDiff > 0
          case "month":
            return timeDiff <= 30 * 24 * 60 * 60 * 1000 && timeDiff > 0
          default:
            return true
        }
      })
    }

    // Apply status filter
    if (filters.status !== "all") {
      const now = new Date()
      result = result.filter((market) => {
        const endDate = new Date(market.endDate)
        if (filters.status === "open") return endDate > now
        if (filters.status === "closed") return endDate <= now
        return true
      })
    }

    // Apply liquidity filter
    if (filters.liquidity !== "all") {
      result = result.filter((market) => {
        const liquidityValue = Number.parseInt(market.liquidity.replace(/,/g, ""))
        if (filters.liquidity === "high") return liquidityValue > 100000
        if (filters.liquidity === "medium") return liquidityValue > 50000 && liquidityValue <= 100000
        if (filters.liquidity === "low") return liquidityValue <= 50000
        return true
      })
    }

    // Apply volume filter
    if (filters.volume !== "all") {
      result = result.filter((market) => {
        const volumeValue = Number.parseInt(market.volume.replace(/,/g, ""))
        if (filters.volume === "high") return volumeValue > 75000
        if (filters.volume === "medium") return volumeValue > 30000 && volumeValue <= 75000
        if (filters.volume === "low") return volumeValue <= 30000
        return true
      })
    }

    // Apply frequency filter
    if (filters.frequency !== "all") {
      result = result.filter((market) => {
        const hash = market.id.charCodeAt(0) + market.id.charCodeAt(market.id.length - 1)
        if (filters.frequency === "daily") return hash % 3 === 0
        if (filters.frequency === "weekly") return hash % 3 === 1
        if (filters.frequency === "monthly") return hash % 3 === 2
        return true
      })
    }

    // Apply sorting
    switch (sortBy) {
      case "volume":
        result = result.sort(
          (a, b) => Number.parseInt(b.volume.replace(/,/g, "")) - Number.parseInt(a.volume.replace(/,/g, "")),
        )
        break
      case "liquidity":
        result = result.sort(
          (a, b) => Number.parseInt(b.liquidity.replace(/,/g, "")) - Number.parseInt(a.liquidity.replace(/,/g, "")),
        )
        break
      case "newest":
        result = result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "closing":
        result = result.sort((a, b) => {
          const aDate = new Date(a.endDate)
          const bDate = new Date(b.endDate)
          return aDate.getTime() - bDate.getTime()
        })
        break
      case "trending":
      default:
        // Sort by trend (for trending)
        result = result.sort((a, b) => {
          const aValue = a.trend === "up" ? 1 : a.trend === "down" ? -1 : 0
          const bValue = b.trend === "up" ? 1 : b.trend === "down" ? -1 : 0
          return bValue - aValue
        })
        break
    }

    setFilteredMarkets(result)
    setDisplayedCount(viewMode === "grid" ? 12 : 8)
  }, [searchQuery, activeTag, timeRange, sortBy, filters, category, viewMode])

  const loadMore = useCallback(() => {
    if (isLoading || displayedCount >= filteredMarkets.length) return
    setIsLoading(true)
    setTimeout(() => {
      const increment = viewMode === "grid" ? 12 : 8
      setDisplayedCount((prev) => Math.min(prev + increment, filteredMarkets.length))
      setIsLoading(false)
    }, 300)
  }, [isLoading, displayedCount, filteredMarkets.length, viewMode])

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && displayedCount < filteredMarkets.length) loadMore()
      },
      { threshold: 0.1 },
    )
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current)
    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [loadMore, isLoading, displayedCount, filteredMarkets.length])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(1) + "K"
    return num.toString()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(".search-container") && showSearchDropdown)
        setShowSearchDropdown(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showSearchDropdown])

  const searchDropdownItemBaseClass =
    "p-2.5 hover:bg-zinc-800/70 rounded-md cursor-pointer transition-colors duration-150"
  const searchDropdownSectionTitleClass = "text-xs text-zinc-500 px-2.5 mb-1.5 font-medium tracking-wider uppercase"

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 relative">
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute -top-1/4 left-0 w-3/4 h-3/4 bg-radial-gradient from-yellow-600/10 via-transparent to-transparent opacity-60 blur-3xl animate-pulse-slow-1"></div>
          <div className="absolute -bottom-1/4 right-0 w-3/4 h-3/4 bg-radial-gradient from-purple-600/10 via-transparent to-transparent opacity-60 blur-3xl animate-pulse-slow-2"></div>
        </div>
        <div className="container px-4 py-6 md:px-6">
          <div className="mb-6">
            <div className="relative w-full search-container">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-500" />
                <Input
                  placeholder="Search markets or create a new one..."
                  className="h-12 bg-gradient-to-r from-zinc-900/90 to-zinc-800/70 border-zinc-700/90 pl-11 text-white placeholder:text-zinc-500 w-full focus:border-yellow-500/70 focus:shadow-[0_0_20px_2px_theme(colors.yellow.500/0.25)] focus:ring-0 transition-all duration-300 ease-out rounded-lg text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearchDropdown(true)}
                />
              </div>

              {showSearchDropdown && (
                <div className="absolute mt-1.5 w-full bg-gradient-to-b from-zinc-900/95 to-zinc-850/95 backdrop-blur-sm border border-zinc-700/80 rounded-lg shadow-2xl shadow-black/60 z-50 max-h-[500px] overflow-y-auto p-2">
                  {searchQuery === "" ? (
                    <>
                      <div
                        className={`${searchDropdownItemBaseClass} flex items-center justify-between group`}
                        onClick={() => router.push("/create")}
                      >
                        <div className="flex items-center">
                          <div className="bg-yellow-500/15 group-hover:bg-yellow-500/25 p-2 rounded-full mr-3 transition-colors">
                            {" "}
                            <Plus className="h-4.5 w-4.5 text-yellow-400 group-hover:text-yellow-300" />{" "}
                          </div>
                          <span className="text-zinc-100 group-hover:text-white font-medium">Create New Market</span>
                        </div>{" "}
                        <ChevronRight className="h-4.5 w-4.5 text-zinc-500 group-hover:text-yellow-400" />
                      </div>
                      <div className="mt-2 border-t border-zinc-700/70 pt-2">
                        <h3 className={searchDropdownSectionTitleClass}>Popular Searches</h3>
                        {["Bitcoin price", "US Election", "World Cup '26", "AI Safety", "Next James Bond"].map(
                          (term) => (
                            <div
                              key={term}
                              className={`${searchDropdownItemBaseClass} flex items-center group`}
                              onClick={() => {
                                setSearchQuery(term)
                                setShowSearchDropdown(false)
                              }}
                            >
                              <Clock className="h-4 w-4 text-zinc-500 group-hover:text-yellow-500/80 mr-2.5" />{" "}
                              <span className="text-zinc-300 group-hover:text-zinc-100">{term}</span>
                            </div>
                          ),
                        )}
                      </div>
                      <div className="mt-2 border-t border-zinc-700/70 pt-2">
                        <h3 className={searchDropdownSectionTitleClass}>Trending Markets</h3>
                        {allMarkets
                          .filter((m) => m.trend === "up" || m.trend === "down")
                          .slice(0, 3)
                          .map((market) => (
                            <div
                              key={market.id}
                              className={`${searchDropdownItemBaseClass} flex items-center group`}
                              onClick={() => router.push(`/markets/${market.id}`)}
                            >
                              <TrendingUp className="h-4 w-4 text-yellow-500/80 group-hover:text-yellow-400 mr-2.5" />{" "}
                              <span className="text-zinc-300 group-hover:text-zinc-100 truncate">{market.title}</span>
                            </div>
                          ))}
                      </div>
                    </>
                  ) : filteredMarkets.length > 0 ? (
                    <>
                      {filteredMarkets.slice(0, 7).map((market) => (
                        <div
                          key={market.id}
                          className={`${searchDropdownItemBaseClass} group`}
                          onClick={() => {
                            router.push(`/markets/${market.id}`)
                            setShowSearchDropdown(false)
                          }}
                        >
                          <div className="flex items-center">
                            <div className="bg-zinc-800/80 group-hover:bg-zinc-700/80 p-1.5 rounded-md mr-2.5 transition-colors">
                              {" "}
                              <span className="text-xs text-yellow-400 group-hover:text-yellow-300 font-semibold">
                                {market.category.substring(0, 3).toUpperCase()}
                              </span>{" "}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-zinc-100 group-hover:text-white truncate">{market.title}</div>
                              <div className="flex items-center text-xs">
                                <span className="text-yellow-500/90 group-hover:text-yellow-400 mr-2">
                                  {market.category}
                                </span>
                                <span className="text-zinc-500 group-hover:text-zinc-400">
                                  Vol: ${formatNumber(Number.parseInt(market.volume.replace(/,/g, "")))}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredMarkets.length > 7 && (
                        <div className="p-2.5 text-center border-t border-zinc-700/70 mt-1">
                          {" "}
                          <span
                            className="text-sm text-yellow-400 hover:text-yellow-300 cursor-pointer"
                            onClick={() => setShowSearchDropdown(false)}
                          >
                            See all {filteredMarkets.length} results
                          </span>{" "}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-6 text-center">
                      <span className="text-zinc-400">No markets found for "{searchQuery}"</span>
                      <div className="mt-3">
                        {" "}
                        <Button variant="default" onClick={() => router.push("/create")}>
                          {" "}
                          <Plus className="h-4 w-4 mr-2" /> Create "
                          {searchQuery.length > 20 ? searchQuery.substring(0, 17) + "..." : searchQuery}"{" "}
                        </Button>{" "}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            {" "}
            <CategoryFilter /> {/* Ensure this is the correct component; previously PopularCategories */}{" "}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {" "}
            <TrendingMarkets /> <Leaderboards />{" "}
          </div>
          <div className="mb-5">
            {" "}
            <TagFilter
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              activeTag={activeTag}
              onTagChange={setActiveTag}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />{" "}
          </div>
          <div
            className={`${viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" : "space-y-4"}`}
          >
            {filteredMarkets
              .slice(0, displayedCount)
              .map((market) =>
                viewMode === "grid" ? (
                  <MarketCard key={market.id} {...market} />
                ) : (
                  <MarketListItem key={market.id} {...market} />
                ),
              )}
          </div>
          {displayedCount < filteredMarkets.length && (
            <div ref={loadMoreRef} className="h-24 flex items-center justify-center">
              {" "}
              {isLoading && (
                <div className="flex items-center gap-2 text-zinc-400">
                  {" "}
                  <div className="w-5 h-5 border-2 border-zinc-600 border-t-yellow-500 rounded-full animate-spin"></div>{" "}
                  <span>Loading more markets...</span>{" "}
                </div>
              )}{" "}
            </div>
          )}
          {displayedCount >= filteredMarkets.length && filteredMarkets.length > 0 && (
            <div className="flex justify-center mt-10 text-zinc-500">
              {" "}
              <span>You've reached the end of the markets.</span>{" "}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
