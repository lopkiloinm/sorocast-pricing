"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button" // Using the updated Button

const categories = [
  { name: "Trending", icon: "🔥" },
  { name: "UCL", icon: "⚽" },
  { name: "Trump", icon: "🇺🇸" },
  { name: "Musk", icon: "🚀" },
  { name: "AI", icon: "🤖" },
  { name: "Climate", icon: "🌍" },
  { name: "Stocks", icon: "📈" },
  { name: "Crypto", icon: "₿" },
  { name: "Politics", icon: "🏛️" },
  { name: "Gaming", icon: "🎮" },
  { name: "Movies", icon: "🎬" },
]

export function PopularCategories() {
  const [showLeftScroll, setShowLeftScroll] = useState(false)
  const [showRightScroll, setShowRightScroll] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const checkScroll = () => {
    const container = scrollContainerRef.current
    if (container) {
      setShowLeftScroll(container.scrollLeft > 5)
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

  const scroll = (amount: number) => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollBy({ left: amount, behavior: "smooth" })
  }

  return (
    <div className="relative">
      {showLeftScroll && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none z-10" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/60 hover:bg-zinc-800/80 z-20 !shadow-none hover:!shadow-[0_0_10px_0px_theme(colors.yellow.500/0.2)]"
            onClick={() => scroll(-200)}
          >
            {" "}
            <ChevronLeft className="h-3.5 w-3.5" />{" "}
          </Button>
        </>
      )}
      <div
        ref={scrollContainerRef}
        className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2 pt-1 px-0.5"
        onScroll={checkScroll}
      >
        {categories.map((category) => (
          <Button
            key={category.name}
            variant="outline"
            className="!rounded-full px-3.5 py-1.5 text-xs whitespace-nowrap !border-zinc-700/80 !text-zinc-300 hover:!text-yellow-300 hover:!border-yellow-500/60 flex items-center gap-1.5 !bg-zinc-800/60 hover:!bg-yellow-500/10" // Using updated Button variants and direct class overrides for specifics
          >
            <span className="text-sm">{category.icon}</span>
            {category.name}
          </Button>
        ))}
      </div>
      {showRightScroll && (
        <>
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none z-10" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/60 hover:bg-zinc-800/80 z-20 !shadow-none hover:!shadow-[0_0_10px_0px_theme(colors.yellow.500/0.2)]"
            onClick={() => scroll(200)}
          >
            {" "}
            <ChevronRight className="h-3.5 w-3.5" />{" "}
          </Button>
        </>
      )}
    </div>
  )
}
