// data/markets.ts

export interface MarketOption {
  name: string // e.g., "< $70"
  // The price here is the 'Yes' price for this binary market
  price: string
  color: string
}

export interface Market {
  id: string
  title: string
  category: string
  endDate: string
  // Each option represents an independent binary market
  options: MarketOption[]
  // Liquidity and Volume are now aggregates of all sub-markets
  liquidity: string
  volume: string
  type: "range"
  createdAt: string
  description: string
  // The 'range' property is now informational for the overall asset
  range: { min: number; max: number }
  tags?: string[]
}

export const allMarkets: Market[] = [
  {
    id: "bitcoin-price-eoy-2025",
    title: "Bitcoin Price by EOY 2025",
    category: "Crypto",
    endDate: "Dec 31, 2025",
    options: [
      { name: "< $50,000", price: "0.10", color: "red" },
      { name: "< $75,000", price: "0.30", color: "orange" },
      { name: "< $100,000", price: "0.65", color: "yellow" },
      { name: "< $125,000", price: "0.85", color: "green" },
      { name: "< $150,000", price: "0.95", color: "blue" },
    ],
    liquidity: "1,250,000",
    volume: "850,000",
    type: "range",
    createdAt: "2025-01-10",
    description: "Trade on whether the price of Bitcoin (BTC) will be below certain levels by the end of 2025.",
    range: { min: 40000, max: 150000 },
    tags: ["BTC", "Crypto", "High Volatility"],
  },
  {
    id: "ethereum-price-eoy-2025",
    title: "Ethereum Price by EOY 2025",
    category: "Crypto",
    endDate: "Dec 31, 2025",
    options: [
      { name: "< $3,000", price: "0.15", color: "red" },
      { name: "< $4,000", price: "0.40", color: "orange" },
      { name: "< $5,000", price: "0.70", color: "yellow" },
      { name: "< $6,000", price: "0.90", color: "green" },
    ],
    liquidity: "980,000",
    volume: "620,000",
    type: "range",
    createdAt: "2025-01-15",
    description: "Trade on whether the price of Ethereum (ETH) will be below certain levels by the end of 2025.",
    range: { min: 2500, max: 7000 },
    tags: ["ETH", "Crypto", "DeFi"],
  },
  {
    id: "apple-stock-eoy-2025",
    title: "Apple (AAPL) Stock Price by EOY 2025",
    category: "Stocks",
    endDate: "Dec 31, 2025",
    options: [
      { name: "< $200", price: "0.10", color: "red" },
      { name: "< $225", price: "0.35", color: "orange" },
      { name: "< $250", price: "0.75", color: "green" },
      { name: "< $275", price: "0.90", color: "blue" },
    ],
    liquidity: "2,500,000",
    volume: "1,800,000",
    type: "range",
    createdAt: "2025-02-01",
    description: "Trade on whether Apple's (AAPL) stock price will be below certain levels at the end of 2025.",
    range: { min: 180, max: 300 },
    tags: ["AAPL", "Tech Stocks", "FAANG"],
  },
  {
    id: "gold-price-eoy-2025",
    title: "Gold Price per Ounce by EOY 2025",
    category: "Commodities",
    endDate: "Dec 31, 2025",
    options: [
      { name: "< $2,000", price: "0.15", color: "red" },
      { name: "< $2,200", price: "0.45", color: "orange" },
      { name: "< $2,400", price: "0.80", color: "yellow" },
      { name: "< $2,600", price: "0.95", color: "green" },
    ],
    liquidity: "750,000",
    volume: "450,000",
    type: "range",
    createdAt: "2025-03-01",
    description: "Trade on whether the spot price of Gold (XAU/USD) will be below certain levels at the end of 2025.",
    range: { min: 1800, max: 2800 },
    tags: ["Gold", "Metals", "Safe Haven"],
  },
  {
    id: "oil-price-eoy-2025",
    title: "WTI Crude Oil Price by EOY 2025",
    category: "Commodities",
    endDate: "Dec 31, 2025",
    options: [
      { name: "< $70", price: "0.35", color: "green" },
      { name: "< $85", price: "0.65", color: "yellow" },
      { name: "< $100", price: "0.85", color: "orange" },
      { name: "< $115", price: "0.95", color: "red" },
    ],
    liquidity: "880,000",
    volume: "560,000",
    type: "range",
    createdAt: "2025-02-15",
    description: "Trade on whether the price of WTI Crude Oil will be below certain levels at the end of 2025.",
    range: { min: 60, max: 130 },
    tags: ["Oil", "Energy", "Inflation"],
  },
]
