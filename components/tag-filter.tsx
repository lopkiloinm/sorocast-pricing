"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, LayoutGrid, List, ChevronDown, SortAsc, Clock } from "lucide-react"
import { Button } from "@/components/ui/button" // Using the updated Button

interface TagFilterProps {
  viewMode: "list" | "grid"
  onViewModeChange: (mode: "list" | "grid") => void
  activeTag: string
  onTagChange: (tag: string) => void
  timeRange: string
  onTimeRangeChange: (range: string) => void
  sortBy: string
  onSortChange: (sort: string) => void
}

export function TagFilter({
  viewMode,
  onViewModeChange,
  activeTag,
  onTagChange,
  timeRange,
  onTimeRangeChange,
  sortBy,
  onSortChange,
}: TagFilterProps) {
  const [showLeftScroll, setShowLeftScroll] = useState(false)
  const [showRightScroll, setShowRightScroll] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const sortDropdownRef = useRef<HTMLDivElement>(null)
  const timeDropdownRef = useRef<HTMLDivElement>(null)

  const tags = ["All", "UCL", "Trump", "AI", "Bitcoin", "Elon Musk", "World Cup", "Climate", "Stocks", "Crypto"]
  const timeRanges = [
    { value: "all", label: "All Time" },
    { value: "24h", label: "Last 24h" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
  ]
  const sortOptions = [
    { value: "trending", label: "Trending" },
    { value: "volume", label: "Volume" },
    { value: "liquidity", label: "Liquidity" },
    { value: "newest", label: "Newest" },
    { value: "closing", label: "Closing Soon" },
  ]

  const checkScroll = () => {
    const container = scrollContainerRef.current
    if (container) {
      setShowLeftScroll(container.scrollLeft > 5) // Add a small buffer
      setShowRightScroll(container.scrollLeft < container.scrollWidth - container.clientWidth - 5)
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      checkScroll()
      container.addEventListener("scroll", checkScroll)
      window.addEventListener("resize", checkScroll)
      return () => {
        container.removeEventListener("scroll", checkScroll)
        window.removeEventListener("resize", checkScroll)
      }
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) setShowSortDropdown(false)
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) setShowTimeDropdown(false)
    }
    if (showSortDropdown || showTimeDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showSortDropdown, showTimeDropdown])

  const scroll = (amount: number) => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollBy({ left: amount, behavior: "smooth" })
  }

  return (
    <div className="border-b border-zinc-800/70 pb-3.5">
      <div className="relative mb-3.5">
        {showLeftScroll && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-transparent pointer-events-none z-10" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 bg-black/60 hover:bg-zinc-800/80 z-20 !shadow-none hover:!shadow-[0_0_10px_0px_theme(colors.yellow.500/0.2)]"
              onClick={() => scroll(-200)}
            >
              {" "}
              <ChevronLeft className="h-4 w-4" />{" "}
            </Button>
          </>
        )}
        <div
          ref={scrollContainerRef}
          className="flex items-center space-x-2 overflow-x-auto scrollbar-hide px-0.5 py-1"
          onScroll={checkScroll}
        >
          {tags.map((tag) => (
            <Button
              key={tag}
              variant={activeTag === tag ? "default" : "secondary"}
              size="sm"
              className={`whitespace-nowrap px-3.5 py-1.5 h-auto text-xs font-medium !rounded-md ${activeTag !== tag ? "!bg-gradient-to-r !from-zinc-800/80 !to-zinc-700/70 !text-zinc-300 hover:!text-yellow-300 hover:!border-yellow-500/50 !border !border-zinc-700/0 hover:!shadow-[0_0_10px_0px_theme(colors.yellow.500/0.2)]" : "!shadow-lg !shadow-yellow-500/30"}`}
              onClick={() => onTagChange(tag)}
            >
              {tag === "All" ? tag : `#${tag}`}
            </Button>
          ))}
        </div>
        {showRightScroll && (
          <>
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-zinc-950 via-zinc-950/90 to-transparent pointer-events-none z-10" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 bg-black/60 hover:bg-zinc-800/80 z-20 !shadow-none hover:!shadow-[0_0_10px_0px_theme(colors.yellow.500/0.2)]"
              onClick={() => scroll(200)}
            >
              {" "}
              <ChevronRight className="h-4 w-4" />{" "}
            </Button>
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {[
            {
              id: "time",
              label: timeRanges.find((r) => r.value === timeRange)?.label || "Time",
              icon: Clock,
              dropdownState: showTimeDropdown,
              setDropdownState: setShowTimeDropdown,
              options: timeRanges,
              action: onTimeRangeChange,
              ref: timeDropdownRef,
              widthClass: "w-32",
            },
            {
              id: "sort",
              label: sortOptions.find((o) => o.value === sortBy)?.label || "Sort",
              icon: SortAsc,
              dropdownState: showSortDropdown,
              setDropdownState: setShowSortDropdown,
              options: sortOptions,
              action: onSortChange,
              ref: sortDropdownRef,
              widthClass: "w-36",
            },
          ].map((dd) => (
            <div key={dd.id} className="relative" ref={dd.ref}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs !border-zinc-700 !bg-zinc-800/70 !text-zinc-300 hover:!border-yellow-500/60 hover:!text-yellow-300"
                onClick={() => dd.setDropdownState(!dd.dropdownState)}
              >
                <dd.icon className="h-3.5 w-3.5 mr-1.5" /> {dd.label}{" "}
                <ChevronDown
                  className={`h-3.5 w-3.5 ml-1.5 transition-transform duration-200 ${dd.dropdownState ? "rotate-180" : ""}`}
                />
              </Button>
              {dd.dropdownState && (
                <div
                  className={`absolute top-full left-0 mt-1.5 z-50 bg-gradient-to-b from-zinc-900 to-zinc-800 border border-zinc-700/90 rounded-md shadow-xl shadow-black/50 py-1 ${dd.widthClass}`}
                >
                  {dd.options.map((opt) => (
                    <button
                      key={opt.value}
                      className={`block w-full px-3 py-1.5 text-xs text-left transition-colors duration-150 ${(dd.id === "time" ? timeRange : sortBy) === opt.value ? "bg-yellow-500/25 text-yellow-300" : "text-zinc-300 hover:bg-zinc-700/80 hover:text-white"}`}
                      onClick={() => {
                        dd.action(opt.value)
                        dd.setDropdownState(false)
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center rounded-md border border-zinc-700/80 overflow-hidden bg-zinc-800/60">
          {[
            { view: "list", icon: List, label: "List view" },
            { view: "grid", icon: LayoutGrid, label: "Grid view" },
          ].map((item, idx) => (
            <React.Fragment key={item.view}>
              {idx > 0 && <div className="w-px h-5 bg-zinc-700/70 self-center"></div>}
              <Button
                variant="ghost"
                size="icon"
                title={item.label}
                className={`h-8 w-8 !rounded-none ${viewMode === item.view ? "!bg-yellow-500/20 !text-yellow-400 !shadow-[inset_0_0_5px_0px_theme(colors.yellow.500/0.25)]" : "!text-zinc-400 hover:!text-yellow-500/90 hover:!bg-zinc-700/70"}`}
                onClick={() => onViewModeChange(item.view as "list" | "grid")}
              >
                <item.icon className="h-4 w-4" /> <span className="sr-only">{item.label}</span>
              </Button>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
