"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const isCreatePage = pathname === "/create"
  const isPortfolioPage = pathname === "/portfolio"
  const isAboutPage = pathname === "/about"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center gap-2">
          <Logo className="h-7 w-7" />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-white">Sorocast</span>
            <span className="text-xs text-yellow-500">Fair Prices</span> {/* Updated Tagline */}
          </div>
        </Link>
        <nav className="hidden md:flex flex-1 items-center gap-6">
          <Link
            href="/create"
            className={`text-sm font-medium ${isCreatePage ? "text-yellow-500" : "text-zinc-400 hover:text-white"}`}
          >
            Create Market
          </Link>
          <Link
            href="/portfolio"
            className={`text-sm font-medium ${isPortfolioPage ? "text-yellow-500" : "text-zinc-400 hover:text-white"}`}
          >
            Portfolio
          </Link>
          <Link
            href="/about"
            className={`text-sm font-medium ${isAboutPage ? "text-yellow-500" : "text-zinc-400 hover:text-white"}`}
          >
            About
          </Link>
        </nav>
        <div className="hidden md:flex items-center gap-4 ml-auto">
          <Button variant="outline" className="border-white text-white hover:bg-yellow-500/20 hover:border-yellow-500">
            Connect Passkey
          </Button>
        </div>
        <button className="ml-auto md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
          {isMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
        </button>
      </div>
      {isMenuOpen && (
        <div className="container md:hidden">
          <nav className="flex flex-col gap-4 p-4">
            <Link
              href="/create"
              className={`text-sm font-medium ${isCreatePage ? "text-yellow-500" : "text-zinc-400 hover:text-white"}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Create Market
            </Link>
            <Link
              href="/portfolio"
              className={`text-sm font-medium ${isPortfolioPage ? "text-yellow-500" : "text-zinc-400 hover:text-white"}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Portfolio
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium ${isAboutPage ? "text-yellow-500" : "text-zinc-400 hover:text-white"}`}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <Button
                variant="outline"
                className="w-full border-white text-white hover:bg-yellow-500/20 hover:border-yellow-500"
                onClick={() => setIsMenuOpen(false)}
              >
                Connect Passkey
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
