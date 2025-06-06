import { Button } from "@/components/ui/button"

interface BuyActionCardProps {
  type: "yes" | "no"
}

export function BuyActionCard({ type }: BuyActionCardProps) {
  const isYes = type === "yes"

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <Button
        variant="outline"
        className={`w-full h-12 text-lg font-bold ${
          isYes
            ? "border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/30 hover:border-green-500 hover:text-white"
            : "border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/30 hover:border-red-500 hover:text-white"
        }`}
      >
        Buy {isYes ? "Yes" : "No"}
      </Button>
    </div>
  )
}
