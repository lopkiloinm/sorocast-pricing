"use client"

import { WalletOverview } from "@/components/portfolio/wallet-overview"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function TestChartPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      <main className="flex-1 container mx-auto p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Chart Test Page</h1>
        <div className="bg-zinc-800 p-4 rounded-lg my-4" style={{ border: "2px solid red" }}>
          <p className="text-white mb-2">Attempting to render WalletOverview:</p>
          <WalletOverview className="my-test-wallet-overview" />
        </div>
      </main>
      <Footer />
    </div>
  )
}
