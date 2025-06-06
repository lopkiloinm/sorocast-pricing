"use client"

import { useState } from "react"

interface Position {
  trader: string
  outcome: string
  shares: number
  avgPrice: number
  value: number
  pnl: number
  pnlPercent: number
}

interface MarketPositionsTableProps {
  market: any
}

export function MarketPositionsTable({ market }: MarketPositionsTableProps) {
  const [sortField, setSortField] = useState<keyof Position>("shares")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Generate mock positions data based on market
  const generatePositions = (): Position[] => {
    // In a real app, this would come from the API
    const mockPositions: Position[] = []

    // Generate 5 random positions
    for (let i = 0; i < 5; i++) {
      const outcome = market.options[i % market.options.length].name
      const shares = Math.floor(Math.random() * 1000) + 100
      const avgPrice = Number.parseFloat(market.options[i % market.options.length].price) * 0.9 // Assume bought at 10% discount
      const currentPrice = Number.parseFloat(market.options[i % market.options.length].price)
      const value = shares * currentPrice
      const cost = shares * avgPrice
      const pnl = value - cost
      const pnlPercent = (pnl / cost) * 100

      mockPositions.push({
        trader: `C...XLM${i + 10}`,
        outcome,
        shares,
        avgPrice,
        value,
        pnl,
        pnlPercent,
      })
    }

    return mockPositions
  }

  const positions = generatePositions()

  const handleSort = (field: keyof Position) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const sortedPositions = [...positions].sort((a, b) => {
    const valueA = a[sortField]
    const valueB = b[sortField]

    if (typeof valueA === "number" && typeof valueB === "number") {
      return sortDirection === "asc" ? valueA - valueB : valueB - valueA
    }

    // String comparison
    return sortDirection === "asc"
      ? String(valueA).localeCompare(String(valueB))
      : String(valueB).localeCompare(String(valueA))
  })

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800">
            <th
              className="px-4 py-2 text-left text-zinc-400 font-medium cursor-pointer hover:text-white"
              onClick={() => handleSort("trader")}
            >
              Trader
            </th>
            <th
              className="px-4 py-2 text-left text-zinc-400 font-medium cursor-pointer hover:text-white"
              onClick={() => handleSort("outcome")}
            >
              Outcome
            </th>
            <th
              className="px-4 py-2 text-right text-zinc-400 font-medium cursor-pointer hover:text-white"
              onClick={() => handleSort("shares")}
            >
              Shares
            </th>
            <th
              className="px-4 py-2 text-right text-zinc-400 font-medium cursor-pointer hover:text-white"
              onClick={() => handleSort("avgPrice")}
            >
              Avg Price
            </th>
            <th
              className="px-4 py-2 text-right text-zinc-400 font-medium cursor-pointer hover:text-white"
              onClick={() => handleSort("value")}
            >
              Value
            </th>
            <th
              className="px-4 py-2 text-right text-zinc-400 font-medium cursor-pointer hover:text-white"
              onClick={() => handleSort("pnl")}
            >
              P&L
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedPositions.map((position, index) => (
            <tr key={index} className="border-b border-zinc-800 hover:bg-zinc-800/50">
              <td className="px-4 py-2 text-white">{position.trader}</td>
              <td className="px-4 py-2 text-white">{position.outcome}</td>
              <td className="px-4 py-2 text-right text-white">{position.shares}</td>
              <td className="px-4 py-2 text-right text-white">${position.avgPrice.toFixed(2)}</td>
              <td className="px-4 py-2 text-right text-white">${position.value.toFixed(2)}</td>
              <td className="px-4 py-2 text-right">
                <span className={position.pnl >= 0 ? "text-green-500" : "text-red-500"}>
                  ${position.pnl.toFixed(2)} ({position.pnlPercent.toFixed(1)}%)
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
