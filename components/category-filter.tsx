"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const categories = [
  "All",
  "Politics",
  "Sports",
  "Finance",
  "Crypto",
  "Entertainment",
  "Tech",
  "Science",
  "Climate",
  "Miscellaneous",
]

export function CategoryFilter() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [showLeftScroll, setShowLeftScroll] = useState(false)
  const [showRightScroll, setShowRightScroll] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const checkScroll = () => {
    const container = scrollContainerRef.current
    if (container) {
      setShowLeftScroll(container.scrollLeft > 0)
      setShowRightScroll(container.scrollLeft < container.scrollWidth - container.clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [])

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" })
    }
  }

  return (
    <div className="relative py-2">
      {showLeftScroll && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent pointer-events-none z-10"></div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/80 text-white hover:bg-zinc-800 z-20"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </>
      )}

      <div ref={scrollContainerRef} className="flex space-x-2 overflow-x-auto scrollbar-hide" onScroll={checkScroll}>
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            className={`rounded-full px-4 py-2 text-sm whitespace-nowrap ${
              activeCategory === category
                ? "bg-yellow-500 text-black hover:bg-yellow-600"
                : "border-zinc-700 text-white hover:bg-zinc-800 hover:border-yellow-500"
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {showRightScroll && (
        <>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent pointer-events-none z-10"></div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/80 text-white hover:bg-zinc-800 z-20"
            onClick={scrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  )
}
