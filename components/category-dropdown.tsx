"use client"

import { useState, useEffect, useRef } from "react"
import { Check, ChevronDown, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"

interface CategoryDropdownProps {
  onCategoryChange: (category: string) => void
  currentCategory: string
}

export function CategoryDropdown({ onCategoryChange, currentCategory }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "politics", label: "Politics" },
    { value: "sports", label: "Sports" },
    { value: "finance", label: "Finance" },
    { value: "crypto", label: "Crypto" },
    { value: "entertainment", label: "Entertainment" },
    { value: "tech", label: "Tech" },
    { value: "science", label: "Science" },
    { value: "climate", label: "Climate" },
    { value: "miscellaneous", label: "Miscellaneous" },
  ]

  const handleCategoryChange = (category: string) => {
    onCategoryChange(category)
    setIsOpen(false)
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

  const getDisplayText = () => {
    const category = categories.find((c) => c.value === currentCategory)
    return category ? category.label : "All Categories"
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        className="border-zinc-800 text-white hover:bg-yellow-500/20 hover:border-yellow-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Tag className="mr-2 h-4 w-4" />
        Categories
        <ChevronDown className="ml-2 h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute mt-2 w-48 rounded-md shadow-lg bg-zinc-900 border border-zinc-800 z-10">
          <div className="py-1">
            <div className="px-4 py-2 text-sm font-medium text-white">Categories</div>
            <div className="border-t border-zinc-800"></div>
            {categories.map((category) => (
              <button
                key={category.value}
                className="flex items-center justify-between w-full px-4 py-2 text-sm text-white hover:bg-zinc-800"
                onClick={() => handleCategoryChange(category.value)}
              >
                {category.label}
                {currentCategory === category.value && <Check className="h-4 w-4 text-yellow-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
