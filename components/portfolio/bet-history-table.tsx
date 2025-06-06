"use client"

import Link from "next/link"
import { Check, X } from "lucide-react"

// Sample data for bet history
const betHistory = [
  {
    id: "hist-1",
    marketId: "oscar-best-picture",
    marketTitle: "Oscar Best Picture Winner 2024",
    category: "Entertainment",
    option: "Oppenheimer",
    betAmount: 100,
    odds: 0.4,
    outcome: "win",
    payout: 250,
    profit: 150,
    resolvedDate: "Mar 10, 2024",
  },
  {
    id: "hist-2",
    marketId: "super-bowl-2023",
    marketTitle: "Super Bowl LVII Winner",
    category: "Sports",
    option: "Eagles",
    betAmount: 75,
    odds: 0.35,
    outcome: "loss",
    payout: 0,
    profit: -75,
    resolvedDate: "Feb 12, 2023",
  },
  {
    id: "hist-3",
    marketId: "eth-merge",
    marketTitle: "ETH Price 3 Months After Merge",
    category: "Crypto",
    option: "$1500-$2000",
    betAmount: 120,
    odds: 0.3,
    outcome: "win",
    payout: 400,
    profit: 280,
    resolvedDate: "Dec 15, 2022",
  },
  {
    id: "hist-4",
    marketId: "midterm-elections",
    marketTitle: "US Midterm Elections 2022 - Senate Control",
    category: "Politics",
    option: "Democrats",
    betAmount: 200,
    odds: 0.45,
    outcome: "win",
    payout: 444.44,
    profit: 244.44,
    resolvedDate: "Nov 8, 2022",
  },
  {
    id: "hist-5",
    marketId: "world-cup-2022",
    marketTitle: "FIFA World Cup 2022 Winner",
    category: "Sports",
    option: "Brazil",
    betAmount: 150,
    odds: 0.25,
    outcome: "loss",
    payout: 0,
    profit: -150,
    resolvedDate: "Dec 18, 2022",
  },
  {
    id: "hist-6",
    marketId: "twitter-ceo",
    marketTitle: "Twitter CEO by End of 2022",
    category: "Tech",
    option: "Elon Musk",
    betAmount: 100,
    odds: 0.6,
    outcome: "win",
    payout: 166.67,
    profit: 66.67,
    resolvedDate: "Oct 27, 2022",
  },
  {
    id: "hist-7",
    marketId: "inflation-2022",
    marketTitle: "US Inflation Rate December 2022",
    category: "Finance",
    option: "6.0% - 7.0%",
    betAmount: 80,
    odds: 0.35,
    outcome: "win",
    payout: 228.57,
    profit: 148.57,
    resolvedDate: "Jan 12, 2023",
  },
]

export function BetHistoryTable() {
  // Mobile card view for each bet history item
  const MobileHistoryCard = ({ bet }: { bet: (typeof betHistory)[0] }) => {
    // Get outcome styling
    const getOutcomeIcon = () => {
      if (bet.outcome === "win") return <Check className="h-4 w-4 text-green-500" />
      return <X className="h-4 w-4 text-red-500" />
    }

    const getOutcomeClass = () => {
      if (bet.outcome === "win") return "bg-green-500/10 text-green-500"
      return "bg-red-500/10 text-red-500"
    }

    const getProfitClass = () => {
      if (bet.profit > 0) return "text-green-500"
      return "text-red-500"
    }

    const getProfitPrefix = () => {
      if (bet.profit > 0) return "+"
      return ""
    }

    return (
      <div className="bg-zinc-800 rounded-lg p-4 mb-4">
        <Link href={`/markets/${bet.marketId}`}>
          <div className="font-medium text-white mb-2">{bet.marketTitle}</div>
          <div className="text-xs text-yellow-500 mb-3">{bet.category}</div>
        </Link>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <div className="text-xs text-zinc-400">Position</div>
            <div className="text-sm text-yellow-500">{bet.option}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-400">Outcome</div>
            <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${getOutcomeClass()}`}>
              {getOutcomeIcon()}
              <span>{bet.outcome === "win" ? "Won" : "Lost"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <div className="text-xs text-zinc-400">Traded</div>
            <div className="text-sm text-white">${bet.betAmount.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-400">Payout</div>
            <div className="text-sm text-white">${bet.payout.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-400">Profit/Loss</div>
            <div className={`text-sm font-medium ${getProfitClass()}`}>
              {getProfitPrefix()}${Math.abs(bet.profit).toFixed(2)}
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs text-zinc-400">Resolved</div>
          <div className="text-sm text-zinc-400">{bet.resolvedDate}</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Mobile view (cards) */}
      <div className="md:hidden space-y-4">
        {betHistory.map((bet) => (
          <MobileHistoryCard key={bet.id} bet={bet} />
        ))}
      </div>

      {/* Desktop view (table) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Market</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">Position</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">Amount Traded</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">Odds</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">Outcome</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">Payout</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">Profit/Loss</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">Resolved</th>
            </tr>
          </thead>
          <tbody>
            {betHistory.map((bet) => {
              // Get outcome styling
              const getOutcomeIcon = () => {
                if (bet.outcome === "win") return <Check className="h-4 w-4 text-green-500" />
                return <X className="h-4 w-4 text-red-500" />
              }

              const getOutcomeClass = () => {
                if (bet.outcome === "win") return "bg-green-500/10 text-green-500"
                return "bg-red-500/10 text-red-500"
              }

              const getProfitClass = () => {
                if (bet.profit > 0) return "text-green-500"
                return "text-red-500"
              }

              const getProfitPrefix = () => {
                if (bet.profit > 0) return "+"
                return ""
              }

              return (
                <tr key={bet.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                  <td className="px-4 py-3">
                    <Link href={`/markets/${bet.marketId}`} className="block">
                      <div className="font-medium text-white">{bet.marketTitle}</div>
                      <div className="text-xs text-yellow-500">{bet.category}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-block rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-sm text-yellow-500">
                      {bet.option}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-sm text-white">${bet.betAmount.toFixed(2)}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-sm text-white">{(bet.odds * 100).toFixed(0)}%</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm ${getOutcomeClass()}`}
                    >
                      {getOutcomeIcon()}
                      <span>{bet.outcome === "win" ? "Won" : "Lost"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-sm text-white">${bet.payout.toFixed(2)}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className={`text-sm font-medium ${getProfitClass()}`}>
                      {getProfitPrefix()}${Math.abs(bet.profit).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-sm text-zinc-400">{bet.resolvedDate}</div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
