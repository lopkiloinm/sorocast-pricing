"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState } from "react"
import Link from "next/link"
import { Clock, TrendingUp, TrendingDown, AlertCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Sample data for active bets
const activeBets = [
  {
    id: "bet-1",
    marketId: "us-election-2024",
    marketTitle: "US Presidential Election 2024",
    category: "Politics",
    option: "Yes",
    betAmount: 200,
    currentOdds: 0.58,
    initialOdds: 0.55,
    potentialReturn: 344.83,
    endDate: "Nov 5, 2024",
    trend: "up",
    totalPool: 5000,
    totalOnOutcome: 2900,
    creatorFee: 2, // 2%
  },
  {
    id: "bet-2",
    marketId: "bitcoin-40k",
    marketTitle: "Bitcoin above $40k by end of month",
    category: "Crypto",
    option: "Yes",
    betAmount: 100,
    currentOdds: 0.67,
    initialOdds: 0.6,
    potentialReturn: 149.25,
    endDate: "May 31, 2023",
    trend: "up",
    totalPool: 3000,
    totalOnOutcome: 2010,
    creatorFee: 3, // 3%
  },
  {
    id: "bet-3",
    marketId: "super-bowl-winner",
    marketTitle: "Super Bowl LVIII Winner",
    category: "Sports",
    option: "Chiefs",
    betAmount: 150,
    currentOdds: 0.3,
    initialOdds: 0.35,
    potentialReturn: 500.0,
    endDate: "Feb 11, 2024",
    trend: "down",
    totalPool: 8000,
    totalOnOutcome: 2400,
    creatorFee: 5, // 5%
  },
  {
    id: "bet-4",
    marketId: "ai-breakthrough",
    marketTitle: "Major AI Breakthrough Announced in 2023",
    category: "Tech",
    option: "Yes",
    betAmount: 75,
    currentOdds: 0.75,
    initialOdds: 0.7,
    potentialReturn: 100.0,
    endDate: "Dec 31, 2023",
    trend: "up",
    totalPool: 2000,
    totalOnOutcome: 1500,
    creatorFee: 1, // 1%
  },
  {
    id: "bet-5",
    marketId: "spacex-mars",
    marketTitle: "SpaceX Mars Mission Announced by 2024",
    category: "Science",
    option: "No",
    betAmount: 125,
    currentOdds: 0.65,
    initialOdds: 0.6,
    potentialReturn: 192.31,
    endDate: "Dec 31, 2024",
    trend: "up",
    totalPool: 4000,
    totalOnOutcome: 2600,
    creatorFee: 2, // 2%
  },
]

export function ActiveBetsTable() {
  const [sellDialogOpen, setSellDialogOpen] = useState(false)
  const [selectedBet, setSelectedBet] = useState<(typeof activeBets)[0] | null>(null)
  const [sellInProgress, setSellInProgress] = useState(false)
  const [sellComplete, setSellComplete] = useState(false)

  const handleSellClick = (bet: (typeof activeBets)[0]) => {
    setSelectedBet(bet)
    setSellDialogOpen(true)
    setSellComplete(false)
  }

  const handleSellConfirm = () => {
    if (!selectedBet) return

    setSellInProgress(true)

    // Simulate API call
    setTimeout(() => {
      setSellInProgress(false)
      setSellComplete(true)
    }, 1500)
  }

  const calculateSellPayout = (bet: (typeof activeBets)[0]) => {
    // Calculate payout based on the formula from the smart contract:
    // payout = (bet_amount * total_on_outcome) / total_pool
    const grossPayout = (bet.betAmount * bet.totalOnOutcome) / bet.totalPool

    // Apply creator fee
    const creatorFeeAmount = (grossPayout * bet.creatorFee) / 100
    const netPayout = grossPayout - creatorFeeAmount

    return {
      gross: grossPayout.toFixed(2),
      fee: creatorFeeAmount.toFixed(2),
      net: netPayout.toFixed(2),
    }
  }

  // Mobile card view for each bet
  const MobileBetCard = ({ bet }: { bet: (typeof activeBets)[0] }) => {
    // Get trend icon and color
    const getTrendIcon = () => {
      if (bet.trend === "up") return <TrendingUp className="h-3 w-3 text-green-400" />
      if (bet.trend === "down") return <TrendingDown className="h-3 w-3 text-red-400" />
      return null
    }

    const getTrendColor = () => {
      if (bet.trend === "up") return "text-green-400"
      if (bet.trend === "down") return "text-red-400"
      return "text-zinc-400"
    }

    // Calculate odds change percentage
    const oddsChange = ((bet.currentOdds - bet.initialOdds) / bet.initialOdds) * 100
    const formattedOddsChange = oddsChange.toFixed(1)
    const oddsChangePrefix = oddsChange > 0 ? "+" : ""

    return (
      <div className="bg-zinc-800 rounded-lg p-4 mb-4">
        <Link href={`/markets/${bet.marketId}`}>
          <div className="font-medium text-white mb-2">{bet.marketTitle}</div>
          <div className="text-xs text-yellow-500 mb-3">{bet.category}</div>
        </Link>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <div className="text-xs text-zinc-400">Your Position</div>
            <div className="text-sm text-yellow-500">{bet.option}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-400">Current Odds</div>
            <div className="flex items-center">
              <span className="text-sm text-white mr-1">{(bet.currentOdds * 100).toFixed(0)}%</span>
              <span className={`text-xs ${getTrendColor()}`}>
                {getTrendIcon()}
                {oddsChangePrefix}
                {formattedOddsChange}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <div className="text-xs text-zinc-400">Amount</div>
            <div className="text-sm text-white">${bet.betAmount.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-400">Potential Return</div>
            <div className="text-sm text-white">${bet.potentialReturn.toFixed(2)}</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-zinc-400">Ends</div>
            <div className="flex items-center text-sm text-zinc-400">
              <Clock className="mr-1 h-3 w-3" />
              {bet.endDate}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-yellow-500/50 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/30 hover:border-yellow-500 hover:text-white"
            onClick={() => handleSellClick(bet)}
          >
            Sell
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Mobile view (cards) */}
      <div className="md:hidden space-y-4">
        {activeBets.map((bet) => (
          <MobileBetCard key={bet.id} bet={bet} />
        ))}
      </div>

      {/* Desktop view (table) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Market</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">Your Position</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">Current Odds</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">Amount</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">Potential Return</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">Ends</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeBets.map((bet) => {
              // Get trend icon and color
              const getTrendIcon = () => {
                if (bet.trend === "up") return <TrendingUp className="h-3 w-3 text-green-400" />
                if (bet.trend === "down") return <TrendingDown className="h-3 w-3 text-red-400" />
                return null
              }

              const getTrendColor = () => {
                if (bet.trend === "up") return "text-green-400"
                if (bet.trend === "down") return "text-red-400"
                return "text-zinc-400"
              }

              // Calculate odds change percentage
              const oddsChange = ((bet.currentOdds - bet.initialOdds) / bet.initialOdds) * 100
              const formattedOddsChange = oddsChange.toFixed(1)
              const oddsChangePrefix = oddsChange > 0 ? "+" : ""

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
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-center">
                      <div className="text-sm text-white">{(bet.currentOdds * 100).toFixed(0)}%</div>
                      <div className="flex items-center gap-1 mt-1">
                        {getTrendIcon()}
                        <span className={`text-xs ${getTrendColor()}`}>
                          {oddsChangePrefix}
                          {formattedOddsChange}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-sm text-white">${bet.betAmount.toFixed(2)}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-sm text-white">${bet.potentialReturn.toFixed(2)}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center text-sm text-zinc-400">
                      <Clock className="mr-1 h-3 w-3" />
                      {bet.endDate}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-yellow-500/50 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/30 hover:border-yellow-500 hover:text-white"
                        onClick={() => handleSellClick(bet)}
                      >
                        Sell
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Sell Position Dialog */}
      <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Close Position</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {sellComplete
                ? "Your position has been sold successfully."
                : "Close your position before market resolution and receive an immediate payout."}
            </DialogDescription>
          </DialogHeader>

          {selectedBet && !sellComplete && (
            <div className="space-y-4 py-2">
              <div className="bg-zinc-800 p-4 rounded-lg">
                <h3 className="font-medium text-white mb-2">{selectedBet.marketTitle}</h3>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-400">Outcome:</span>
                  <span className="text-yellow-500">{selectedBet.option}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-400">Position Amount:</span>
                  <span className="text-white">${selectedBet.betAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Current odds:</span>
                  <span className="text-white">{(selectedBet.currentOdds * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-white">Sell Calculation</h4>
                <div className="bg-zinc-800 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Gross payout:</span>
                    <span className="text-white">${calculateSellPayout(selectedBet).gross}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Creator fee ({selectedBet.creatorFee}%):</span>
                    <span className="text-red-400">-${calculateSellPayout(selectedBet).fee}</span>
                  </div>
                  <div className="border-t border-zinc-700 pt-2 flex justify-between font-medium">
                    <span className="text-zinc-300">Net payout:</span>
                    <span className="text-green-400">${calculateSellPayout(selectedBet).net}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-zinc-300">
                  <p className="font-medium text-yellow-500 mb-1">Important</p>
                  <p>
                    Selling your position now will give you an immediate payout based on the current market odds. If you
                    believe your position will win, holding until market resolution may result in a higher return.
                  </p>
                </div>
              </div>
            </div>
          )}

          {sellComplete && (
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="bg-green-500/20 p-3 rounded-full mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Position Sold!</h3>
              <p className="text-zinc-400 text-center mb-4">
                Your position has been sold and the funds have been transferred to your wallet.
              </p>
              <div className="bg-zinc-800 px-4 py-3 rounded-lg w-full text-center">
                <p className="text-sm text-zinc-400 mb-1">Amount received</p>
                <p className="text-xl font-bold text-green-400">
                  ${selectedBet ? calculateSellPayout(selectedBet).net : "0.00"}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            {!sellComplete ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setSellDialogOpen(false)}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSellConfirm}
                  disabled={sellInProgress}
                  className="bg-yellow-500 text-black hover:bg-yellow-600"
                >
                  {sellInProgress ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-zinc-800 border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    "Confirm Close"
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setSellDialogOpen(false)}
                className="bg-zinc-800 text-white hover:bg-zinc-700 w-full"
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
