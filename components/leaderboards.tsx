import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown } from "lucide-react"

const leadersData = [
  { id: "dkindbrady", rank: 1, name: "DKindBrady", amount: "$17.23M", avatarInitial: "D" },
  { id: "sguru", rank: 2, name: "SGURU", amount: "$10.23M", avatarInitial: "S" },
  { id: "tbfdude", rank: 3, name: "TBFDude", amount: "$9.23M", avatarInitial: "T" },
  { id: "cryptobot", rank: 4, name: "CryptoBot", amount: "$8.55M", avatarInitial: "C" },
  { id: "propheto", rank: 5, name: "ProphetO", amount: "$7.98M", avatarInitial: "P" },
]

export function Leaderboards() {
  return (
    <div className="bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-black border border-zinc-800/70 rounded-xl p-4 shadow-lg transition-all duration-300 ease-out hover:border-yellow-500/50 hover:shadow-[0_0_25px_0px_theme(colors.yellow.600/0.2)] h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
          Leaderboards
        </h2>
        <div className="flex space-x-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-zinc-800/70 hover:bg-yellow-500/20 hover:text-yellow-400 !shadow-none hover:!shadow-[0_0_10px_0px_theme(colors.yellow.500/0.25)]"
          >
            <TrendingUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-zinc-800/70 hover:bg-purple-500/20 hover:text-purple-400 !shadow-none hover:!shadow-[0_0_10px_0px_theme(colors.purple.500/0.25)]"
          >
            <TrendingDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2.5 flex-grow">
        {leadersData.slice(0, 3).map(
          (
            leader, // Changed to slice(0, 3)
          ) => (
            <div
              key={leader.id}
              className="flex items-center bg-zinc-800/50 hover:bg-zinc-700/60 p-2.5 rounded-lg transition-all duration-200 ease-out group hover:shadow-[0_0_15px_-5px_theme(colors.yellow.500/0.3)] min-h-[3.75rem]"
            >
              <div className="w-7 text-zinc-400 group-hover:text-yellow-400 font-medium text-center text-sm transition-colors">
                {leader.rank}
              </div>
              <div className="h-8 w-8 rounded-full overflow-hidden mx-2.5 bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center ring-1 ring-zinc-600 group-hover:ring-yellow-500/50 transition-all">
                <span className="text-teal-400 group-hover:text-teal-300 font-bold text-xs transition-colors">
                  {leader.avatarInitial}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-zinc-100 group-hover:text-white text-sm font-medium truncate transition-colors">
                  {leader.name}
                </h3>
              </div>
              <div className="text-zinc-200 group-hover:text-yellow-300 font-semibold ml-2 text-sm transition-colors shrink-0">
                {leader.amount}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  )
}
