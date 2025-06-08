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
  options: string[] // For a binary market, this will be ["Yes", "No"]
}

export interface SeederInfo {
  seedAmountStroops: number // seeder's liquidity, in stroops (1 XLM = 10_000_000 stroops)
  liquidityParamB: number // seeder's b parameter for LMSR
  prior: number[] // prior probabilities (fixed-point, sum to SCALE)
}

// Represents the state of a single, independent binary market
export interface BinaryMarketState {
  metadata: MarketMetadata
  seeders: MarketMap<string, SeederInfo>
  qSeeders: MarketMap<string, number[]>
  qReal: MarketMap<number, number>
  shares: MarketMap<[string, number], number>
}

// A container for multiple independent binary markets, presented as a single "range" market
export interface MarketContainer {
  id: string
  title: string
  description: string
  category: string
  // A map where the key is the inequality (e.g., "< $70") and the value is its market state
  subMarkets: Map<string, BinaryMarketState>
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

// Simulate buying shares in a specific binary market
// @param buyer - The buyer's address
// @param outcome - The outcome index (0 for Yes, 1 for No)
// @param sharesCount - Number of shares to buy (NOT in stroops - actual share count)
// @param marketState - The state of the specific binary market to trade in
// @returns cost in STROOPS (pure LMSR cost), fee in STROOPS (separate), and new prices (as probabilities 0-1)
export function simulateBuy(
  buyer: string,
  outcome: number,
  sharesCount: number,
  marketState: BinaryMarketState,
): { cost: number; fee: number; newPrices: number[] } {
  if (sharesCount < MIN_SHARES) {
    throw new Error("Shares count must be at least " + MIN_SHARES)
  }

  // Convert sharesCount to stroops (1 share = 10^7 stroops)
  const sharesInStroops = sharesCount * SCALE
  const [totalB, optionsLen] = getDynamicBAndN(marketState.seeders)

  // Cost before (pure LMSR cost)
  const costBefore = marketCost(marketState.qSeeders, marketState.seeders)

  // Create a copy of qSeeders for simulation
  const qSeedersAfter = new MarketMap<string, number[]>()
  marketState.seeders.iter().forEach(([addr, info]) => {
    const qj = marketState.qSeeders.get(addr) || Array(optionsLen).fill(0)
    qSeedersAfter.set(addr, [...qj])
  })

  // Construct delta_q: only outcome index increases
  const deltaQ = Array(optionsLen).fill(0)
  deltaQ[outcome] = sharesInStroops

  // Update each seeder's q-vector proportionally
  marketState.seeders.iter().forEach(([addr, info]) => {
    const qj = qSeedersAfter.get(addr) || Array(optionsLen).fill(0)
    const b_j = info.liquidityParamB

    for (let i = 0; i < optionsLen; i++) {
      const dq = Math.floor((b_j * deltaQ[i]) / totalB)
      qj[i] += dq
    }

    qSeedersAfter.set(addr, qj)
  })

  // Calculate cost after (pure LMSR cost)
  const costAfter = marketCost(qSeedersAfter, marketState.seeders)

  // Calculate pure LMSR cost in stroops (no fees included)
  const costDiff = costAfter - costBefore
  const pureCost = Math.round(costDiff * SCALE) // Convert from XLM units to stroops

  // Fee: separate calculation - flat 0.02 XLM (200,000 stroops) per share
  const fee = 200_000 * sharesCount // 0.02 XLM per share, completely separate from cost

  // Compute new prices
  const newPrices: number[] = []
  for (let i = 0; i < optionsLen; i++) {
    const p = marketPrice(qSeedersAfter, marketState.seeders, i)
    newPrices.push(p)
  }

  return { cost: pureCost, fee: fee, newPrices }
}

// Simulate selling shares in a specific binary market
// @param seller - The seller's address
// @param outcome - The outcome index (0 for Yes, 1 for No)
// @param sharesCount - Number of shares to sell (NOT in stroops - actual share count)
// @param marketState - The state of the specific binary market to trade in
// @returns refund in STROOPS (pure LMSR refund, no fees deducted) and new prices (as probabilities 0-1)
export function simulateSell(
  seller: string,
  outcome: number,
  sharesCount: number,
  marketState: BinaryMarketState,
): { refund: number; newPrices: number[] } {
  if (sharesCount < MIN_SHARES) {
    throw new Error("Shares count must be at least " + MIN_SHARES)
  }

  // Check if seller has enough shares
  const prevShares = marketState.shares.get([seller, outcome]) || 0
  if (prevShares < sharesCount) {
    throw new Error("Not enough shares")
  }

  // Convert sharesCount to stroops (1 share = 10^7 stroops)
  const sharesInStroops = sharesCount * SCALE
  const [totalB, optionsLen] = getDynamicBAndN(marketState.seeders)

  // Cost before (pure LMSR cost)
  const costBefore = marketCost(marketState.qSeeders, marketState.seeders)

  // Create a copy of qSeeders for simulation
  const qSeedersAfter = new MarketMap<string, number[]>()
  marketState.seeders.iter().forEach(([addr, info]) => {
    const qj = marketState.qSeeders.get(addr) || Array(optionsLen).fill(0)
    qSeedersAfter.set(addr, [...qj])
  })

  // Construct delta_q: only outcome index decreases
  const deltaQ = Array(optionsLen).fill(0)
  deltaQ[outcome] = -sharesInStroops

  // Update each seeder's q-vector proportionally
  marketState.seeders.iter().forEach(([addr, info]) => {
    const qj = qSeedersAfter.get(addr) || Array(optionsLen).fill(0)
    const b_j = info.liquidityParamB

    for (let i = 0; i < optionsLen; i++) {
      const dq = Math.floor((b_j * deltaQ[i]) / totalB)
      qj[i] += dq
    }

    qSeedersAfter.set(addr, qj)
  })

  // Calculate cost after (pure LMSR cost)
  const costAfter = marketCost(qSeedersAfter, marketState.seeders)

  // Calculate pure LMSR refund in stroops (no fees deducted)
  const costDiff = costBefore - costAfter
  const pureRefund = Math.round(costDiff * SCALE) // Convert from XLM units to stroops

  // Compute new prices
  const newPrices: number[] = []
  for (let i = 0; i < optionsLen; i++) {
    const p = marketPrice(qSeedersAfter, marketState.seeders, i)
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

// Initialize a single binary market
export function initializeBinaryMarket(
  metadata: MarketMetadata,
  initialSeeders: { address: string; amount: number }[],
): BinaryMarketState {
  const n = metadata.options.length // Should be 2 for binary
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

// Add a new seeder to an existing binary market
// @param marketState - The state of the specific binary market
// @param seederAddress - The seeder's address
// @param seedAmount - Seed amount in STROOPS (multiply XLM by 10^7)
export function addSeeder(marketState: BinaryMarketState, seederAddress: string, seedAmount: number): void {
  // Calculate current market prices
  const prices: number[] = []
  for (let i = 0; i < marketState.metadata.options.length; i++) {
    const price = marketPrice(marketState.qSeeders, marketState.seeders, i)
    prices.push(price)
  }

  // New seeder's priors match current market prices
  const priors = calculatePriorsFromPrices(prices)

  // Calculate b parameter based on seed amount and minimum probability
  const piMin = Math.min(...priors)
  const lnPiMin = ln(toFixed(piMin))
  const b = Math.floor((seedAmount * SCALE) / fromFixed(-lnPiMin))

  // Add the seeder
  marketState.seeders.set(seederAddress, {
    seedAmountStroops: seedAmount,
    liquidityParamB: b,
    prior: priors,
  })

  // Initialize qSeeders with zeros for the new seeder
  marketState.qSeeders.set(seederAddress, Array(marketState.metadata.options.length).fill(0))
}

// Execute a buy operation (not just simulation) on a specific binary market
export function executeBuy(
  buyer: string,
  outcome: number,
  sharesCount: number,
  marketState: BinaryMarketState,
): { cost: number; fee: number; newPrices: number[] } {
  // First simulate the buy to get cost and new prices
  const { cost, fee, newPrices } = simulateBuy(buyer, outcome, sharesCount, marketState)

  // Convert sharesCount to stroops (1 share = 10^7 stroops)
  const sharesInStroops = sharesCount * SCALE
  const [totalB, optionsLen] = getDynamicBAndN(marketState.seeders)

  // Construct delta_q: only outcome index increases
  const deltaQ = Array(optionsLen).fill(0)
  deltaQ[outcome] = sharesInStroops

  // Update each seeder's q-vector proportionally
  marketState.seeders.iter().forEach(([addr, info]) => {
    const qj = marketState.qSeeders.get(addr) || Array(optionsLen).fill(0)
    const b_j = info.liquidityParamB

    for (let i = 0; i < optionsLen; i++) {
      const dq = Math.floor((b_j * deltaQ[i]) / totalB)
      qj[i] += dq
    }

    marketState.qSeeders.set(addr, qj)
  })

  // Update the buyer's shares
  const prevShares = marketState.shares.get([buyer, outcome]) || 0
  marketState.shares.set([buyer, outcome], prevShares + sharesCount)

  // Update qReal
  marketState.qReal = recomputeQ(marketState.qSeeders, marketState.seeders)

  // Distribute fee to seeders
  const feeDistribution = distributeFee(fee, marketState.seeders)

  return { cost, fee, newPrices }
}

// Execute a sell operation (not just simulation) on a specific binary market
export function executeSell(
  seller: string,
  outcome: number,
  sharesCount: number,
  marketState: BinaryMarketState,
): { refund: number; newPrices: number[] } {
  // Check if seller has enough shares
  const prevShares = marketState.shares.get([seller, outcome]) || 0
  if (prevShares < sharesCount) {
    throw new Error("Not enough shares")
  }

  // First simulate the sell to get refund and new prices
  const { refund, newPrices } = simulateSell(seller, outcome, sharesCount, marketState)

  // Convert sharesCount to stroops (1 share = 10^7 stroops)
  const sharesInStroops = sharesCount * SCALE
  const [totalB, optionsLen] = getDynamicBAndN(marketState.seeders)

  // Construct delta_q: only outcome index decreases
  const deltaQ = Array(optionsLen).fill(0)
  deltaQ[outcome] = -sharesInStroops

  // Update each seeder's q-vector proportionally
  marketState.seeders.iter().forEach(([addr, info]) => {
    const qj = marketState.qSeeders.get(addr) || Array(optionsLen).fill(0)
    const b_j = info.liquidityParamB

    for (let i = 0; i < optionsLen; i++) {
      const dq = Math.floor((b_j * deltaQ[i]) / totalB)
      qj[i] += dq
    }

    marketState.qSeeders.set(addr, qj)
  })

  // Update the seller's shares
  marketState.shares.set([seller, outcome], prevShares - sharesCount)

  // Update qReal
  marketState.qReal = recomputeQ(marketState.qSeeders, marketState.seeders)

  return { refund, newPrices }
}

// Creates a container with multiple, independent binary markets
// This replaces the old `createRangeMarketSimulation`
export function createMultiBinaryMarketContainer(
  id: string,
  title: string,
  description: string,
  category: string,
  inequalities: string[], // e.g., ["< $70", "< $85"]
): MarketContainer {
  const subMarkets = new Map<string, BinaryMarketState>()

  inequalities.forEach((inequality) => {
    const metadata: MarketMetadata = {
      title: `${title} - ${inequality}`,
      description,
      category,
      endDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
      resolutionSource: "Oracle",
      options: ["Yes", "No"], // All sub-markets are binary
    }

    // Each sub-market gets its own initial seeder and state
    const initialSeederAmount = 10000 * SCALE // e.g., 10,000 XLM
    const marketState = initializeBinaryMarket(metadata, [
      { address: `initial_seeder_${inequality}`, amount: initialSeederAmount },
    ])

    // You can add more complex, randomized initial trades here if needed
    // to make each sub-market's starting price different.
    // For now, they all start at 50/50.

    subMarkets.set(inequality, marketState)
  })

  return {
    id,
    title,
    description,
    category,
    subMarkets,
  }
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
