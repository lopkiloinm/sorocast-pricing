"use client"

interface Trade {
  type: "buy" | "sell"
  outcome: string
  shares: string
  price: string
  cost: string
  fee: string
  timestamp: string
  trader: string
}

interface MarketActivityTableProps {
  trades: Trade[]
}

export function MarketActivityTable({ trades }: MarketActivityTableProps) {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="px-4 py-2 text-left text-zinc-400 font-medium">Type</th>
            <th className="px-4 py-2 text-left text-zinc-400 font-medium">Outcome</th>
            <th className="px-4 py-2 text-right text-zinc-400 font-medium">Shares</th>
            <th className="px-4 py-2 text-right text-zinc-400 font-medium">Price</th>
            <th className="px-4 py-2 text-right text-zinc-400 font-medium">Cost</th>
            <th className="px-4 py-2 text-right text-zinc-400 font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, index) => (
            <tr key={index} className="border-b border-zinc-800 hover:bg-zinc-800/50">
              <td className="px-4 py-2">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                    trade.type === "buy" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {trade.type === "buy" ? "Buy" : "Sell"}
                </span>
              </td>
              <td className="px-4 py-2 text-white">{trade.outcome}</td>
              <td className="px-4 py-2 text-right text-white">{trade.shares}</td>
              <td className="px-4 py-2 text-right text-white">{trade.price}</td>
              <td className="px-4 py-2 text-right text-white">{trade.cost} XLM</td>
              <td className="px-4 py-2 text-right text-zinc-400">{formatDate(trade.timestamp)}</td>
            </tr>
          ))}
          {trades.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                No trading activity yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
