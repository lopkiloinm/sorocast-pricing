// Constants from the Rust contract
export const MIN_SEED = 1000 * 1_000_0000 // 1000 XLM
export const MIN_SHARES = 1 // Minimum shares to buy/sell
export const SCALE = 1_000_0000 // For fixed-point math (7 decimals)
export const CREATION_BOND = 1000 * 1_000_0000 // 1000 XLM

/*
 * IMPORTANT: Unit conventions in this file
 *
 * - 1 share = 10^7 stroops = 1 XLM
 * - When a user buys 1 share, they get 10^7 stroops
 * - All internal calculations use stroops
 * - Share counts in function parameters are in ACTUAL SHARES
 * - Inside these functions, we multiply shares by SCALE to get stroops
 * - Cost/refund values returned are in stroops (divide by SCALE to get XLM)
 */

// Types matching the Rust contract
export interface MarketMetadata {
  title: string
  description: string
  category: string
  endDate: number
  resolutionSource: string
  options: string[]
}

export interface SeederInfo {
  seedAmountStroops: number // seeder's liquidity, in stroops (1 XLM = 10_000_000 stroops)
  liquidityParamB: number // seeder's b parameter for LMSR
  prior: number[] // prior probabilities (fixed-point, sum to SCALE)
}

// Map implementation for TypeScript
export class MarketMap<K, V> {
  private map: Map<string, V>

  constructor() {
    this.map = new Map<string, V>()
  }

  set(key: K, value: V): void {
    this.map.set(JSON.stringify(key), value)
  }

  get(key: K): V | undefined {
    return this.map.get(JSON.stringify(key))
  }

  has(key: K): boolean {
    return this.map.has(JSON.stringify(key))
  }

  remove(key: K): void {
    this.map.delete(JSON.stringify(key))
  }

  keys(): K[] {
    return Array.from(this.map.keys()).map((k) => JSON.parse(k))
  }

  values(): V[] {
    return Array.from(this.map.values())
  }

  entries(): [K, V][] {
    return Array.from(this.map.entries()).map(([k, v]) => [JSON.parse(k), v])
  }

  iter(): [K, V][] {
    return this.entries()
  }

  forEach(callback: (value: V, key: K) => void): void {
    this.entries().forEach(([k, v]) => callback(v, k))
  }

  get length(): number {
    return this.map.size
  }

  get len(): number {
    return this.map.size
  }
}

// Fixed-point math helpers
export function toFixed(x: number): number {
  return x / SCALE
}

export function fromFixed(x: number): number {
  return Math.round(x * SCALE)
}

// Math helpers
export function exp(x: number): number {
  return Math.exp(x)
}

export function ln(x: number): number {
  return Math.log(x)
}

// Multi-seeder, multi-prior market cost function
// C(q) = sum_j [ b_j * ln(sum_i pi_j_i * exp(q_i / b_j)) ]
export function marketCost(qSeeders: MarketMap<string, number[]>, seeders: MarketMap<string, SeederInfo>): number {
  let totalCost = 0

  seeders.iter().forEach(([addr, info]) => {
    const b = toFixed(info.liquidityParamB)
    const prior = info.prior
    const qj = qSeeders.get(addr) || Array(prior.length).fill(0)
    const n = prior.length

    let sum = 0
    for (let i = 0; i < n; i++) {
      const pi_i = toFixed(prior[i])
      const qji = toFixed(qj[i] || 0)
      sum += pi_i * exp(qji / b)
    }

    if (sum > 0) {
      totalCost += b * ln(sum)
    }
  })

  return totalCost
}

// Multi-seeder, multi-prior market price function
// p_k = sum_j [ b_j * pi_j_k * exp(q_j_k / b_j) ] / sum_j [ sum_i b_j * pi_j_i * exp(q_j_i / b_j) ]
export function marketPrice(
  qSeeders: MarketMap<string, number[]>,
  seeders: MarketMap<string, SeederInfo>,
  outcome: number,
): number {
  let numerator = 0
  let denominator = 0

  seeders.iter().forEach(([addr, info]) => {
    const b = toFixed(info.liquidityParamB)
    const prior = info.prior
    const qj = qSeeders.get(addr) || Array(prior.length).fill(0)
    const n = prior.length

    // Numerator: b_j * pi_j_k * exp(q_j_k / b_j)
    const pi_k = toFixed(prior[outcome])
    const qjk = toFixed(qj[outcome] || 0)
    numerator += b * pi_k * exp(qjk / b)

    // Denominator: sum_i b_j * pi_j_i * exp(q_j_i / b_j)
    for (let i = 0; i < n; i++) {
      const pi_i = toFixed(prior[i])
      const qji = toFixed(qj[i] || 0)
      denominator += b * pi_i * exp(qji / b)
    }
  })

  if (denominator > 0) {
    return numerator / denominator
  }

  return 0
}

// Get dynamic b and n
export function getDynamicBAndN(seeders: MarketMap<string, SeederInfo>): [number, number] {
  let totalB = 0
  let n = 0

  seeders.iter().forEach(([_addr, info]) => {
    totalB += info.liquidityParamB
    n = info.prior.length // All seeders should have the same number of outcomes
  })

  return [totalB, n]
}

// Recompute q from qSeeders
export function recomputeQ(
  qSeeders: MarketMap<string, number[]>,
  seeders: MarketMap<string, SeederInfo>,
): MarketMap<number, number> {
  const qReal = new MarketMap<number, number>()
  const [totalB, n] = getDynamicBAndN(seeders)

  // Initialize qReal with zeros
  for (let i = 0; i < n; i++) {
    qReal.set(i, 0)
  }

  // Sum up all seeder q values, weighted by their b parameter
  seeders.iter().forEach(([addr, info]) => {
    const qj = qSeeders.get(addr) || Array(n).fill(0)
    const b_j = info.liquidityParamB

    for (let i = 0; i < n; i++) {
      const prev = qReal.get(i) || 0
      qReal.set(i, prev + qj[i])
    }
  })

  return qReal
}

// Simulate buying shares
// @param buyer - The buyer's address
// @param outcome - The outcome index
// @param sharesCount - Number of shares to buy (NOT in stroops - actual share count)
// @param market - The market object
// @returns cost in STROOPS (pure LMSR cost), fee in STROOPS (separate), and new prices (as probabilities 0-1)
export function simulateBuy(
  buyer: string,
  outcome: number,
  sharesCount: number,
  market: {
    metadata: MarketMetadata
    seeders: MarketMap<string, SeederInfo>
    qSeeders: MarketMap<string, number[]>
    qReal: MarketMap<number, number>
    shares: MarketMap<[string, number], number>
  },
): { cost: number; fee: number; newPrices: number[] } {
  if (sharesCount < MIN_SHARES) {
    throw new Error("Shares count must be at least " + MIN_SHARES)
  }

  // Convert sharesCount to stroops (1 share = 10^7 stroops)
  const sharesInStroops = sharesCount * SCALE
  const [totalB, optionsLen] = getDynamicBAndN(market.seeders)

  // Cost before (pure LMSR cost)
  const costBefore = marketCost(market.qSeeders, market.seeders)

  // Create a copy of qSeeders for simulation
  const qSeedersAfter = new MarketMap<string, number[]>()
  market.seeders.iter().forEach(([addr, info]) => {
    const qj = market.qSeeders.get(addr) || Array(optionsLen).fill(0)
    qSeedersAfter.set(addr, [...qj])
  })

  // Construct delta_q: only outcome index increases
  const deltaQ = Array(optionsLen).fill(0)
  deltaQ[outcome] = sharesInStroops

  // Update each seeder's q-vector proportionally
  market.seeders.iter().forEach(([addr, info]) => {
    const qj = qSeedersAfter.get(addr) || Array(optionsLen).fill(0)
    const b_j = info.liquidityParamB

    for (let i = 0; i < optionsLen; i++) {
      const dq = Math.floor((b_j * deltaQ[i]) / totalB)
      qj[i] += dq
    }

    qSeedersAfter.set(addr, qj)
  })

  // Calculate cost after (pure LMSR cost)
  const costAfter = marketCost(qSeedersAfter, market.seeders)

  // Calculate pure LMSR cost in stroops (no fees included)
  const costDiff = costAfter - costBefore
  const pureCost = Math.round(costDiff * SCALE) // Convert from XLM units to stroops

  // Fee: separate calculation - flat 0.02 XLM (200,000 stroops) per share
  const fee = 200_000 * sharesCount // 0.02 XLM per share, completely separate from cost

  // Compute new prices
  const newPrices: number[] = []
  for (let i = 0; i < optionsLen; i++) {
    const p = marketPrice(qSeedersAfter, market.seeders, i)
    newPrices.push(p)
  }

  return { cost: pureCost, fee: fee, newPrices }
}

// Simulate selling shares
// @param seller - The seller's address
// @param outcome - The outcome index
// @param sharesCount - Number of shares to sell (NOT in stroops - actual share count)
// @param market - The market object
// @returns refund in STROOPS (pure LMSR refund, no fees deducted) and new prices (as probabilities 0-1)
export function simulateSell(
  seller: string,
  outcome: number,
  sharesCount: number,
  market: {
    metadata: MarketMetadata
    seeders: MarketMap<string, SeederInfo>
    qSeeders: MarketMap<string, number[]>
    qReal: MarketMap<number, number>
    shares: MarketMap<[string, number], number>
  },
): { refund: number; newPrices: number[] } {
  if (sharesCount < MIN_SHARES) {
    throw new Error("Shares count must be at least " + MIN_SHARES)
  }

  // Check if seller has enough shares
  const prevShares = market.shares.get([seller, outcome]) || 0
  if (prevShares < sharesCount) {
    throw new Error("Not enough shares")
  }

  // Convert sharesCount to stroops (1 share = 10^7 stroops)
  const sharesInStroops = sharesCount * SCALE
  const [totalB, optionsLen] = getDynamicBAndN(market.seeders)

  // Cost before (pure LMSR cost)
  const costBefore = marketCost(market.qSeeders, market.seeders)

  // Create a copy of qSeeders for simulation
  const qSeedersAfter = new MarketMap<string, number[]>()
  market.seeders.iter().forEach(([addr, info]) => {
    const qj = market.qSeeders.get(addr) || Array(optionsLen).fill(0)
    qSeedersAfter.set(addr, [...qj])
  })

  // Construct delta_q: only outcome index decreases
  const deltaQ = Array(optionsLen).fill(0)
  deltaQ[outcome] = -sharesInStroops

  // Update each seeder's q-vector proportionally
  market.seeders.iter().forEach(([addr, info]) => {
    const qj = qSeedersAfter.get(addr) || Array(optionsLen).fill(0)
    const b_j = info.liquidityParamB

    for (let i = 0; i < optionsLen; i++) {
      const dq = Math.floor((b_j * deltaQ[i]) / totalB)
      qj[i] += dq
    }

    qSeedersAfter.set(addr, qj)
  })

  // Calculate cost after (pure LMSR cost)
  const costAfter = marketCost(qSeedersAfter, market.seeders)

  // Calculate pure LMSR refund in stroops (no fees deducted)
  const costDiff = costBefore - costAfter
  const pureRefund = Math.round(costDiff * SCALE) // Convert from XLM units to stroops

  // Compute new prices
  const newPrices: number[] = []
  for (let i = 0; i < optionsLen; i++) {
    const p = marketPrice(qSeedersAfter, market.seeders, i)
    newPrices.push(p)
  }

  return { refund: pureRefund, newPrices }
}

// Distribute fee to seeders proportionally to their b parameter
export function distributeFee(fee: number, seeders: MarketMap<string, SeederInfo>): MarketMap<string, number> {
  const feeDistribution = new MarketMap<string, number>()
  const totalB = seeders.iter().reduce((sum, [_, info]) => sum + info.liquidityParamB, 0)

  if (totalB === 0 || fee === 0) {
    return feeDistribution
  }

  let distributed = 0
  const seederEntries = seeders.iter()
  const n = seederEntries.length

  seederEntries.forEach(([addr, info], i) => {
    let seederFee

    if (i === n - 1) {
      // Last seeder gets the remainder to avoid rounding errors
      seederFee = fee - distributed
    } else {
      // Proportional to b parameter
      seederFee = Math.floor((fee * info.liquidityParamB) / totalB)
      distributed += seederFee
    }

    if (seederFee > 0) {
      feeDistribution.set(addr, seederFee)
    }
  })

  return feeDistribution
}

// Initialize a market with uniform priors
export function initializeMarket(
  metadata: MarketMetadata,
  initialSeeders: { address: string; amount: number }[],
): {
  metadata: MarketMetadata
  seeders: MarketMap<string, SeederInfo>
  qSeeders: MarketMap<string, number[]>
  qReal: MarketMap<number, number>
  shares: MarketMap<[string, number], number>
} {
  const n = metadata.options.length
  const seeders = new MarketMap<string, SeederInfo>()
  const qSeeders = new MarketMap<string, number[]>()
  const qReal = new MarketMap<number, number>()
  const shares = new MarketMap<[string, number], number>()

  // Initialize with uniform priors for all seeders
  initialSeeders.forEach(({ address, amount }) => {
    // Create uniform prior
    const priorValue = Math.floor(SCALE / n)
    const prior: number[] = Array(n).fill(priorValue)

    // Adjust last value to ensure sum is exactly SCALE
    const sum = prior.reduce((a, b) => a + b, 0)
    prior[n - 1] += SCALE - sum

    // Calculate b parameter
    const piMin = Math.min(...prior.map((p) => p))
    const lnPiMin = ln(toFixed(piMin))
    const b = Math.floor((amount * SCALE) / fromFixed(-lnPiMin))

    // Add seeder
    seeders.set(address, {
      seedAmountStroops: amount,
      liquidityParamB: b,
      prior,
    })

    // Initialize qSeeders with zeros
    qSeeders.set(address, Array(n).fill(0))
  })

  // Initialize qReal with zeros
  for (let i = 0; i < n; i++) {
    qReal.set(i, 0)
  }

  return { metadata, seeders, qSeeders, qReal, shares }
}

// Calculate priors from current market prices
export function calculatePriorsFromPrices(prices: number[]): number[] {
  // Priors should match current prices when a new seeder joins
  const priors = prices.map((p) => Math.round(p * SCALE))

  // Ensure priors sum to exactly SCALE
  const sum = priors.reduce((a, b) => a + b, 0)
  if (sum !== SCALE) {
    const diff = SCALE - sum
    priors[priors.length - 1] += diff
  }

  return priors
}

// Add a new seeder to an existing market
// @param market - The market object
// @param seederAddress - The seeder's address
// @param seedAmount - Seed amount in STROOPS (multiply XLM by 10^7)
export function addSeeder(
  market: {
    metadata: MarketMetadata
    seeders: MarketMap<string, SeederInfo>
    qSeeders: MarketMap<string, number[]>
    qReal: MarketMap<number, number>
    shares: MarketMap<[string, number], number>
  },
  seederAddress: string,
  seedAmount: number,
): void {
  // Calculate current market prices
  const prices: number[] = []
  for (let i = 0; i < market.metadata.options.length; i++) {
    const price = marketPrice(market.qSeeders, market.seeders, i)
    prices.push(price)
  }

  // New seeder's priors match current market prices
  const priors = calculatePriorsFromPrices(prices)

  // Calculate b parameter based on seed amount and minimum probability
  const piMin = Math.min(...priors)
  const lnPiMin = ln(toFixed(piMin))
  const b = Math.floor((seedAmount * SCALE) / fromFixed(-lnPiMin))

  // Add the seeder
  market.seeders.set(seederAddress, {
    seedAmountStroops: seedAmount,
    liquidityParamB: b,
    prior: priors,
  })

  // Initialize qSeeders with zeros for the new seeder
  market.qSeeders.set(seederAddress, Array(market.metadata.options.length).fill(0))
}

// Simulate a complete market lifecycle
// Note: The history events store values in XLM for display purposes
// - cost is in XLM (already converted from stroops)
// - seedAmount is in XLM
// - bValue is in XLM
export function simulateMarket(
  title: string,
  options: string[],
  trades: Array<{
    trader: string
    outcome: number
    shares: number
    afterTrade?: () => void
  }>,
): {
  metadata: MarketMetadata
  seeders: MarketMap<string, SeederInfo>
  qSeeders: MarketMap<string, number[]>
  qReal: MarketMap<number, number>
  shares: MarketMap<[string, number], number>
  history: Array<{
    type: "trade" | "seed"
    actor: string
    outcome?: number
    shares?: number
    cost?: number
    seedAmount?: number
    bValue?: number
    prices: number[]
    timestamp: number
  }>
} {
  // Create metadata
  const metadata: MarketMetadata = {
    title,
    description: "Simulated market",
    category: "Simulation",
    endDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    resolutionSource: "Oracle",
    options,
  }

  // Initialize with a single seeder
  const seeders = new MarketMap<string, SeederInfo>()
  const qSeeders = new MarketMap<string, number[]>()
  const qReal = new MarketMap<number, number>()
  const shares = new MarketMap<[string, number], number>()
  const history: any[] = []

  // Initial seeder with uniform priors
  const initialSeed = 10000 * SCALE
  const n = options.length
  const priorValue = Math.floor(SCALE / n)
  const prior = Array(n).fill(priorValue)

  // Adjust last value to ensure sum is exactly SCALE
  const sum = prior.reduce((a, b) => a + b, 0)
  prior[n - 1] += SCALE - sum

  // Calculate initial b
  const piMin = Math.min(...prior)
  const lnPiMin = ln(toFixed(piMin))
  const b = Math.floor((initialSeed * SCALE) / fromFixed(-lnPiMin))

  seeders.set("initial_seeder", {
    seedAmountStroops: initialSeed,
    liquidityParamB: b,
    prior,
  })

  // Initialize qSeeders with zeros
  qSeeders.set("initial_seeder", Array(n).fill(0))

  // Initialize qReal with zeros
  for (let i = 0; i < n; i++) {
    qReal.set(i, 0)
  }

  // Record initial state
  const initialPrices: number[] = []
  for (let i = 0; i < n; i++) {
    const price = marketPrice(qSeeders, seeders, i)
    initialPrices.push(price)
  }

  history.push({
    type: "seed",
    actor: "initial_seeder",
    seedAmount: toFixed(initialSeed), // Convert stroops to XLM for display
    bValue: toFixed(b), // Convert stroops to XLM for display
    prices: initialPrices,
    timestamp: 0,
  })

  // Execute trades
  let timestamp = 1
  for (const trade of trades) {
    if (trade.shares > 0) {
      // Buying - use executeBuy to actually update the market state
      const { cost, fee, newPrices } = executeBuy(trade.trader, trade.outcome, trade.shares, {
        metadata,
        seeders,
        qSeeders,
        qReal,
        shares,
      })

      history.push({
        type: "trade",
        actor: trade.trader,
        outcome: trade.outcome,
        shares: trade.shares,
        cost: toFixed(cost),
        prices: newPrices,
        timestamp: timestamp++,
      })
    } else if (trade.shares < 0) {
      // Selling - use executeSell to actually update the market state
      const sharesToSell = Math.abs(trade.shares)
      const currentShares = shares.get([trade.trader, trade.outcome]) || 0

      if (currentShares >= sharesToSell) {
        const { refund, newPrices } = executeSell(trade.trader, trade.outcome, sharesToSell, {
          metadata,
          seeders,
          qSeeders,
          qReal,
          shares,
        })

        history.push({
          type: "trade",
          actor: trade.trader,
          outcome: trade.outcome,
          shares: -sharesToSell,
          cost: -toFixed(refund),
          prices: newPrices,
          timestamp: timestamp++,
        })
      }
    }

    // Execute callback if provided (e.g., to add a new seeder)
    if (trade.afterTrade) {
      trade.afterTrade()
    }
  }

  return { metadata, seeders, qSeeders, qReal, shares, history }
}

// Create a realistic binary market simulation
export function createBinaryMarketSimulation() {
  const market = {
    metadata: null as any,
    seeders: null as any,
    qSeeders: null as any,
    qReal: null as any,
    shares: null as any,
    history: null as any,
  }

  const simulation = simulateMarket(
    "Will the candidate win the election?",
    ["Yes", "No"],
    [
      // Initial trades to move the market
      { trader: "trader1", outcome: 0, shares: 1000 }, // Buy Yes
      { trader: "trader2", outcome: 1, shares: 500 }, // Buy No
      { trader: "trader3", outcome: 0, shares: 2000 }, // Buy Yes

      // Add second seeder after some trading
      {
        trader: "trader4",
        outcome: 0,
        shares: 500,
        afterTrade: () => {
          if (market.metadata) {
            addSeeder(
              {
                metadata: market.metadata,
                seeders: market.seeders,
                qSeeders: market.qSeeders,
                qReal: market.qReal,
                shares: market.shares,
              },
              "seeder2",
              3000 * SCALE,
            )

            // Record seeding event
            const prices: number[] = []
            for (let i = 0; i < 2; i++) {
              const price = marketPrice(market.qSeeders, market.seeders, i)
              prices.push(price)
            }

            const seederInfo = market.seeders.get("seeder2")!
            market.history.push({
              type: "seed",
              actor: "seeder2",
              seedAmount: toFixed(seederInfo.seedAmountStroops),
              bValue: toFixed(seederInfo.liquidityParamB),
              prices,
              timestamp: market.history.length,
            })
          }
        },
      },

      // More trading after second seeder
      { trader: "trader5", outcome: 1, shares: 1500 }, // Buy No
      { trader: "trader1", outcome: 0, shares: -500 }, // Sell Yes
      { trader: "trader6", outcome: 0, shares: 1000 }, // Buy Yes

      // Add third seeder
      {
        trader: "trader7",
        outcome: 1,
        shares: 800,
        afterTrade: () => {
          if (market.metadata) {
            addSeeder(
              {
                metadata: market.metadata,
                seeders: market.seeders,
                qSeeders: market.qSeeders,
                qReal: market.qReal,
                shares: market.shares,
              },
              "seeder3",
              2000 * SCALE,
            )

            // Record seeding event
            const prices: number[] = []
            for (let i = 0; i < 2; i++) {
              const price = marketPrice(market.qSeeders, market.seeders, i)
              prices.push(price)
            }

            const seederInfo = market.seeders.get("seeder3")!
            market.history.push({
              type: "seed",
              actor: "seeder3",
              seedAmount: toFixed(seederInfo.seedAmountStroops),
              bValue: toFixed(seederInfo.liquidityParamB),
              prices,
              timestamp: market.history.length,
            })
          }
        },
      },

      // Final trades
      { trader: "trader8", outcome: 0, shares: 1200 },
      { trader: "trader2", outcome: 1, shares: -300 }, // Sell No
    ],
  )

  // Store the market reference for the callbacks
  market.metadata = simulation.metadata
  market.seeders = simulation.seeders
  market.qSeeders = simulation.qSeeders
  market.qReal = simulation.qReal
  market.shares = simulation.shares
  market.history = simulation.history

  return simulation
}

// Create a categorical market simulation
export function createCategoricalMarketSimulation(numOptions = 5) {
  const market = {
    metadata: null as any,
    seeders: null as any,
    qSeeders: null as any,
    qReal: null as any,
    shares: null as any,
    history: null as any,
  }

  // Generate option names based on the number of options
  const options = Array.from({ length: numOptions }, (_, i) => `Option ${i + 1}`)

  const simulation = simulateMarket("Who will win the tournament?", options, [
    // Initial trades - dynamically create trades for each option
    ...options.map((_, index) => ({
      trader: `trader${index + 1}`,
      outcome: index,
      shares: 500 + Math.floor(Math.random() * 1000),
    })),

    // Add second seeder
    {
      trader: "trader_extra",
      outcome: 0,
      shares: 1000,
      afterTrade: () => {
        if (market.metadata) {
          addSeeder(
            {
              metadata: market.metadata,
              seeders: market.seeders,
              qSeeders: market.qSeeders,
              qReal: market.qReal,
              shares: market.shares,
            },
            "seeder2",
            5000 * SCALE,
          )

          // Record seeding event
          const prices: number[] = []
          for (let i = 0; i < numOptions; i++) {
            const price = marketPrice(market.qSeeders, market.seeders, i)
            prices.push(price)
          }

          const seederInfo = market.seeders.get("seeder2")!
          market.history.push({
            type: "seed",
            actor: "seeder2",
            seedAmount: toFixed(seederInfo.seedAmountStroops),
            bValue: toFixed(seederInfo.liquidityParamB),
            prices,
            timestamp: market.history.length,
          })
        }
      },
    },

    // More trades - dynamically create more trades
    ...options.map((_, index) => ({
      trader: `trader${index + 10}`,
      outcome: index,
      shares: 300 + Math.floor(Math.random() * 1200),
    })),

    // Add some sell trades
    ...options.slice(0, 3).map((_, index) => ({
      trader: `trader${index + 1}`,
      outcome: index,
      shares: -Math.floor(Math.random() * 300),
    })),
  ])

  // Store the market reference for the callbacks
  market.metadata = simulation.metadata
  market.seeders = simulation.seeders
  market.qSeeders = simulation.qSeeders
  market.qReal = simulation.qReal
  market.shares = simulation.shares
  market.history = simulation.history

  return simulation
}

// Create a range market simulation with flexible number of ranges
export function createRangeMarketSimulation(numRanges = 5) {
  const market = {
    metadata: null as any,
    seeders: null as any,
    qSeeders: null as any,
    qReal: null as any,
    shares: null as any,
    history: null as any,
  }

  // Generate range names based on the number of ranges
  const ranges = Array.from({ length: numRanges }, (_, i) => `Range ${i + 1}`)

  const simulation = simulateMarket("Price Range Prediction", ranges, [
    // Initial trades - dynamically create trades for each range
    ...ranges.map((_, index) => ({
      trader: `trader${index + 1}`,
      outcome: index,
      shares: 400 + Math.floor(Math.random() * 800),
    })),

    // Add second seeder
    {
      trader: "trader_extra",
      outcome: 0,
      shares: 800,
      afterTrade: () => {
        if (market.metadata) {
          addSeeder(
            {
              metadata: market.metadata,
              seeders: market.seeders,
              qSeeders: market.qSeeders,
              qReal: market.qReal,
              shares: market.shares,
            },
            "seeder2",
            4000 * SCALE,
          )

          // Record seeding event
          const prices: number[] = []
          for (let i = 0; i < numRanges; i++) {
            const price = marketPrice(market.qSeeders, market.seeders, i)
            prices.push(price)
          }

          const seederInfo = market.seeders.get("seeder2")!
          market.history.push({
            type: "seed",
            actor: "seeder2",
            seedAmount: toFixed(seederInfo.seedAmountStroops),
            bValue: toFixed(seederInfo.liquidityParamB),
            prices,
            timestamp: market.history.length,
          })
        }
      },
    },

    // More trades - dynamically create more trades
    ...ranges.map((_, index) => ({
      trader: `trader${index + 10}`,
      outcome: index,
      shares: 200 + Math.floor(Math.random() * 1000),
    })),

    // Add some sell trades
    ...ranges.slice(0, 3).map((_, index) => ({
      trader: `trader${index + 1}`,
      outcome: index,
      shares: -Math.floor(Math.random() * 200),
    })),
  ])

  // Store the market reference for the callbacks
  market.metadata = simulation.metadata
  market.seeders = simulation.seeders
  market.qSeeders = simulation.qSeeders
  market.qReal = simulation.qReal
  market.shares = simulation.shares
  market.history = simulation.history

  return simulation
}

// Calculate cost
export function calculateCost(b: number, q: number[], priors: number[], outcomeIndex: number): number {
  // Placeholder implementation
  return 0
}

// Calculate probability
export function calculateProbability(b: number, q: number[], priors: number[], outcomeIndex: number): number {
  // Placeholder implementation
  return 0.5
}

// Execute a buy operation (not just simulation)
export function executeBuy(
  buyer: string,
  outcome: number,
  sharesCount: number,
  market: {
    metadata: MarketMetadata
    seeders: MarketMap<string, SeederInfo>
    qSeeders: MarketMap<string, number[]>
    qReal: MarketMap<number, number>
    shares: MarketMap<[string, number], number>
  },
): { cost: number; fee: number; newPrices: number[] } {
  // First simulate the buy to get cost and new prices
  const { cost, fee, newPrices } = simulateBuy(buyer, outcome, sharesCount, market)

  // Convert sharesCount to stroops (1 share = 10^7 stroops)
  const sharesInStroops = sharesCount * SCALE
  const [totalB, optionsLen] = getDynamicBAndN(market.seeders)

  // Construct delta_q: only outcome index increases
  const deltaQ = Array(optionsLen).fill(0)
  deltaQ[outcome] = sharesInStroops

  // Update each seeder's q-vector proportionally
  market.seeders.iter().forEach(([addr, info]) => {
    const qj = market.qSeeders.get(addr) || Array(optionsLen).fill(0)
    const b_j = info.liquidityParamB

    for (let i = 0; i < optionsLen; i++) {
      const dq = Math.floor((b_j * deltaQ[i]) / totalB)
      qj[i] += dq
    }

    market.qSeeders.set(addr, qj)
  })

  // Update the buyer's shares
  const prevShares = market.shares.get([buyer, outcome]) || 0
  market.shares.set([buyer, outcome], prevShares + sharesCount)

  // Update qReal
  market.qReal = recomputeQ(market.qSeeders, market.seeders)

  // Distribute fee to seeders
  const feeDistribution = distributeFee(fee, market.seeders)

  return { cost, fee, newPrices }
}

// Execute a sell operation (not just simulation)
export function executeSell(
  seller: string,
  outcome: number,
  sharesCount: number,
  market: {
    metadata: MarketMetadata
    seeders: MarketMap<string, SeederInfo>
    qSeeders: MarketMap<string, number[]>
    qReal: MarketMap<number, number>
    shares: MarketMap<[string, number], number>
  },
): { refund: number; newPrices: number[] } {
  // Check if seller has enough shares
  const prevShares = market.shares.get([seller, outcome]) || 0
  if (prevShares < sharesCount) {
    throw new Error("Not enough shares")
  }

  // First simulate the sell to get refund and new prices
  const { refund, newPrices } = simulateSell(seller, outcome, sharesCount, market)

  // Convert sharesCount to stroops (1 share = 10^7 stroops)
  const sharesInStroops = sharesCount * SCALE
  const [totalB, optionsLen] = getDynamicBAndN(market.seeders)

  // Construct delta_q: only outcome index decreases
  const deltaQ = Array(optionsLen).fill(0)
  deltaQ[outcome] = -sharesInStroops

  // Update each seeder's q-vector proportionally
  market.seeders.iter().forEach(([addr, info]) => {
    const qj = market.qSeeders.get(addr) || Array(optionsLen).fill(0)
    const b_j = info.liquidityParamB

    for (let i = 0; i < optionsLen; i++) {
      const dq = Math.floor((b_j * deltaQ[i]) / totalB)
      qj[i] += dq
    }

    market.qSeeders.set(addr, qj)
  })

  // Update the seller's shares
  market.shares.set([seller, outcome], prevShares - sharesCount)

  // Update qReal
  market.qReal = recomputeQ(market.qSeeders, market.seeders)

  return { refund, newPrices }
}
