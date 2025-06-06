"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InlineMath, BlockMath } from "@/components/math-components"

interface MarketInfoPanelProps {
  market: any
}

export function MarketInfoPanel({ market }: MarketInfoPanelProps) {
  return (
    <div className="space-y-4">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg">Market Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-zinc-400">Category</div>
              <div className="text-white">{market.category}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-400">Resolution Date</div>
              <div className="text-white">{market.resolutionDate}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-400">Creator</div>
              <div className="text-white">{market.creator}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-400">Creation Bond</div>
              <div className="text-white">{market.creationBond}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-400">Oracle</div>
              <div className="text-white">{market.oracle}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-400">Created</div>
              <div className="text-white">{market.createdAt}</div>
            </div>
          </div>

          <div>
            <div className="text-sm text-zinc-400 mb-1">Tags</div>
            <div className="flex flex-wrap gap-2">
              {market.tags.map((tag: string, index: number) => (
                <span key={index} className="inline-block rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg">LMSR Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-zinc-400">Liquidity Parameter (b)</div>
              <div className="text-white">{market.b.toFixed(1)} XLM</div>
            </div>
            <div>
              <div className="text-sm text-zinc-400">Fee Structure</div>
              <div className="text-white">0.02 XLM per share</div>
            </div>
          </div>

          <div className="bg-zinc-800 rounded-lg p-4">
            <div className="text-sm font-medium text-white mb-2">LMSR Cost Function</div>
            <div className="text-center my-4">
              <BlockMath math={`C(\\vec{q}) = b \\cdot \\ln\\left(\\sum_i \\pi(\\theta_i) \\cdot e^{q_i/b}\\right)`} />
            </div>
            <p className="text-sm text-zinc-400">
              The cost function determines how much traders pay to buy shares. The market maintains a cost function
              where <InlineMath math={`\\vec{q}`} /> is the vector of shares outstanding, <InlineMath math={`b`} /> is
              the liquidity parameter, and <InlineMath math={`\\pi(\\theta_i)`} /> is the prior probability for outcome
              i.
            </p>
          </div>

          <div className="bg-zinc-800 rounded-lg p-4">
            <div className="text-sm font-medium text-white mb-2">Price Calculation</div>
            <div className="text-center my-4">
              <BlockMath
                math={`p_i = \\frac{\\pi(\\theta_i) \\cdot e^{q_i/b}}{\\sum_k \\pi(\\theta_k) \\cdot e^{q_k/b}}`}
              />
            </div>
            <p className="text-sm text-zinc-400">
              This formula determines the price (probability) for each outcome based on the current state of the market.
              Prices always sum to 1, ensuring they can be interpreted as probabilities.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg">Resolution Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-400 mb-4">This market will resolve according to the following rules:</p>
          <ul className="space-y-2 text-zinc-300">
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 mt-1">•</span>
              <span>The market will resolve to YES if the specified event occurs before the resolution date.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 mt-1">•</span>
              <span>
                The market will resolve to NO if the specified event does not occur before the resolution date.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 mt-1">•</span>
              <span>The market creator will provide evidence for resolution.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 mt-1">•</span>
              <span>The final resolution will be determined by the oracle system.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 mt-1">•</span>
              <span>
                In case of ambiguity, the market will be resolved according to the most reasonable interpretation of the
                market question.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
