"use client"

import { MarketVisualizerChart } from "@/components/charts/d3-market-dynamics-chart"
import { useViewportSize } from "@/hooks/use-viewport-size"
import { Navbar } from "@/components/navbar" // Optional: if you want navbar
import { Footer } from "@/components/footer" // Optional: if you want footer

export default function VisualizerPage() {
  const viewport = useViewportSize()

  // Calculate available height, excluding Navbar and Footer if they are present and have fixed heights
  // This is a rough estimation; precise calculation might need refs to Navbar/Footer
  const NAVBAR_HEIGHT_APPROX = 64 // Adjust if your navbar height is different
  const FOOTER_HEIGHT_APPROX = 80 // Adjust if your footer height is different
  const CHART_MARGIN_Y = 16 // Some breathing room top and bottom

  // Determine if Navbar/Footer are part of the layout for this specific page
  const includeNavbar = true
  const includeFooter = true

  let chartHeight = viewport.height
  if (includeNavbar) chartHeight -= NAVBAR_HEIGHT_APPROX
  if (includeFooter) chartHeight -= FOOTER_HEIGHT_APPROX
  chartHeight -= CHART_MARGIN_Y * 2
  chartHeight = Math.max(200, chartHeight) // Ensure a minimum height

  // Chart width can be viewport width minus some margin
  const CHART_MARGIN_X = 32 // Breathing room left and right
  let chartWidth = viewport.width - CHART_MARGIN_X * 2
  chartWidth = Math.max(300, chartWidth) // Ensure a minimum width

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50">
      {includeNavbar && <Navbar />}
      <main
        className="flex-1 flex flex-col items-center justify-center p-4"
        // The p-4 on main provides the CHART_MARGIN_X/Y effectively if chartWidth/Height are viewport.width/height
      >
        {viewport.width > 0 && viewport.height > 0 ? (
          <MarketVisualizerChart width={chartWidth} height={chartHeight} />
        ) : (
          <div className="text-center">Loading chart dimensions...</div>
        )}
      </main>
      {includeFooter && <Footer />}
    </div>
  )
}
