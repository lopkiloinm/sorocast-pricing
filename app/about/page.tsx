"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { InlineMath, BlockMath } from "@/components/math-components"
import { useState, useEffect, useRef } from "react"
// Updated import for the D3 chart
import { MarketVisualizerChart } from "@/components/charts/d3-market-dynamics-chart"

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState("")
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200 // Adjusted for navbar height
      setShowScrollTop(window.scrollY > 300)

      const sections = document.querySelectorAll("section[id]")
      let currentSection = ""
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop
        const sectionHeight = (section as HTMLElement).offsetHeight
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSection = section.id
        }
      })
      setActiveSection(currentSection)
    }

    window.addEventListener("scroll", handleScroll)
    // Set initial active section
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const [chartDimensions, setChartDimensions] = useState({ width: 600, height: 400 }) // Initial default dimensions

  useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        const newWidth = chartContainerRef.current.offsetWidth
        if (newWidth > 0) {
          // Set height to 70% of the viewport height.
          // Width is determined by the container's width (respecting max-w-4xl).
          const newHeight = window.innerHeight * 0.7
          setChartDimensions({ width: newWidth, height: Math.max(300, newHeight) }) // Ensure a minimum height
        }
      } else {
        // Fallback if ref is not yet available or width is 0
        const fallbackWidth = Math.min(window.innerWidth * 0.9, 1024) // e.g. 90vw, max 1024px
        setChartDimensions({ width: fallbackWidth, height: window.innerHeight * 0.6 })
      }
    }

    // Initial call to set dimensions
    updateDimensions()

    const observer = new ResizeObserver(() => {
      updateDimensions()
    })

    if (chartContainerRef.current) {
      observer.observe(chartContainerRef.current)
    }

    window.addEventListener("resize", updateDimensions)

    return () => {
      if (chartContainerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(chartContainerRef.current)
      }
      observer.disconnect()
      window.removeEventListener("resize", updateDimensions)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 text-blue-500 text-sm font-medium mb-6">
              <span>📚</span>
              <span>Documentation</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
              How Sorocast Works
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto">
              Decentralized prediction markets powered by mathematics and game theory
            </p>
          </div>

          {/* Introduction */}
          <section id="introduction" className="mb-12 md:mb-24 scroll-mt-32">
            <div className="text-center mb-12">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 block">🌟</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Introduction</h2>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                A revolutionary approach to prediction markets using automated market makers
              </p>
            </div>
            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-zinc-300 leading-relaxed text-center max-w-3xl mx-auto">
                Sorocast reimagines prediction markets by eliminating traditional order books in favor of algorithmic
                market making. Our novel multi-seeder LMSR implementation creates always-available liquidity while
                maintaining mathematical elegance and fairness. This documentation explains the theory, implementation,
                and economics behind our decentralized prediction market protocol.
              </p>
            </div>
          </section>

          {/* Goal & Vision */}
          <section id="goal" className="mb-12 md:mb-24 scroll-mt-32">
            <div className="text-center mb-12">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 block">🎯</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Goal & Vision</h2>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur-sm border border-zinc-800">
              <p className="text-xl sm:text-2xl text-white font-semibold mb-8 text-center">
                Enable open, on-chain prediction markets to crowdsource insights and incentivize accurate forecasting
                using Soroban smart contracts.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-black/40 rounded-2xl p-4 sm:p-6 backdrop-blur">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-blue-500">✦</span> Platform Capabilities
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">•</span>
                      <span className="text-zinc-300">
                        Create and trade on outcome-based markets for any event - elections, sports, crypto trends, and
                        more
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">•</span>
                      <span className="text-zinc-300">
                        Use conditional tokens and liquidity pools for transparent, trustless market resolution
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">•</span>
                      <span className="text-zinc-300">
                        Implement reputation and staking mechanics to ensure market quality and truthful participation
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-black/40 rounded-2xl p-4 sm:p-6 backdrop-blur">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-purple-500">✦</span> Ecosystem Impact
                  </h3>
                  <p className="text-zinc-300 leading-relaxed">
                    Brings powerful crowd-driven forecasting to the Stellar ecosystem, showcasing the utility of oracles
                    and smart contracts while opening new DeFi-aligned use cases for speculation, governance, and
                    collective intelligence.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* The Disruption */}
          <section id="disruption" className="mb-12 md:mb-24 scroll-mt-32">
            <div className="text-center mb-12">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 block">🌊</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">The Disruption</h2>
              <p className="text-zinc-400 text-lg">Race to Zero Platform Fees</p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl"></div>
              <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 border border-zinc-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                  <span className="text-blue-500 font-semibold">OPEN SOURCE REVOLUTION</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                </div>

                <p className="text-xl sm:text-2xl text-white font-medium mb-8 text-center">
                  This platform will be completely open-sourced, creating a fundamental disruption in the prediction
                  market space.
                </p>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 mb-8">
                  <div className="text-center">
                    <div className="text-4xl mb-3">🔓</div>
                    <h4 className="text-lg font-semibold text-white mb-2">Fully Open</h4>
                    <p className="text-sm text-zinc-400">All smart contracts and UI code open-sourced and verifiable</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-3">🤖</div>
                    <h4 className="text-lg font-semibold text-white mb-2">Code is Law</h4>
                    <p className="text-sm text-zinc-400">
                      No administrators, no company cuts, only transparent smart contracts
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-3">🔍</div>
                    <h4 className="text-lg font-semibold text-white mb-2">Verifiable</h4>
                    <p className="text-sm text-zinc-400">Compile code yourself and verify bytecode hashes on-chain</p>
                  </div>
                </div>

                <div className="bg-red-600/10 border border-red-600/30 rounded-2xl p-4 sm:p-6">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-red-500">⚠️</span> Author Disclaimer
                  </h4>
                  <p className="text-zinc-300">
                    <strong>The author receives no fees from this platform.</strong> This documentation serves as a
                    complete specification enabling anyone to build competing implementations. The goal is to
                    commoditize prediction market infrastructure and drive platform fees to zero through open
                    competition.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* The Problem */}
          <section id="problem" className="mb-12 md:mb-24 scroll-mt-32">
            <div className="text-center mb-12">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 block">🧠</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                The Problem with Order Books
              </h2>
            </div>

            <div className="bg-zinc-900/50 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur border border-zinc-800">
              <div className="grid gap-4 md:grid-cols-2 mb-8">
                <div className="bg-red-600/10 rounded-2xl p-4 sm:p-6 border border-red-600/20">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-red-500">❌</span> Liquidity Issues
                  </h3>
                  <p className="text-zinc-300 leading-relaxed">
                    Traditional order books require matching buyers and sellers. If you want to buy YES at $0.70,
                    someone must sell NO at $0.30. This creates friction, wide spreads, and poor liquidity, especially
                    in niche markets.
                  </p>
                </div>

                <div className="bg-red-600/10 rounded-2xl p-4 sm:p-6 border border-red-600/20">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-red-500">❌</span> Price Slippage
                  </h3>
                  <p className="text-zinc-300 leading-relaxed">
                    The "thin market" problem means large trades cause significant price movement. This discourages
                    informed traders from participating, reducing the market's ability to aggregate information
                    effectively.
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-lg text-zinc-400">
                  These fundamental flaws limit prediction markets' potential for accurate price discovery
                </p>
              </div>
            </div>
          </section>

          {/* LMSR Solution */}
          <section id="lmsr-solution" className="mb-12 md:mb-24 scroll-mt-32">
            <div className="text-center mb-12">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 block">⚙️</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                LMSR: Always Available Pricing
              </h2>
            </div>

            <div className="bg-gradient-to-br from-green-600/10 to-blue-600/10 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur border border-zinc-800">
              <p className="text-xl sm:text-2xl text-white font-medium mb-8 text-center">
                The Logarithmic Market Scoring Rule (LMSR) eliminates the need for counterparties through algorithmic
                market making.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-black/40 rounded-2xl p-4 sm:p-6 backdrop-blur">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-600/20 flex items-center justify-center">
                      <span className="text-2xl">💧</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white">Seeders</h3>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    Provide initial capital that creates market liquidity and earn fees from trades. Think of seeders as
                    the insurance companies - they take on risk to make markets possible and profit from trading
                    activity, not from predicting outcomes.
                  </p>
                </div>

                <div className="bg-black/40 rounded-2xl p-4 sm:p-6 backdrop-blur">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                      <span className="text-2xl">📈</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white">Traders</h3>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    Buy or sell shares based on their beliefs about outcome probabilities. Traders profit when they buy
                    shares at prices lower than the true probability of an event occurring.
                  </p>
                </div>
              </div>

              <div className="mt-8 p-4 sm:p-6 bg-blue-600/10 rounded-2xl border border-blue-600/30">
                <p className="text-zinc-300 text-center">
                  <strong>Key Innovation:</strong> LMSR provides continuous pricing based on mathematical formulas,
                  ensuring traders can always buy or sell at deterministic prices regardless of market activity.
                </p>
              </div>
            </div>
          </section>

          {/* Visualizing Market Liquidity Section */}
          <section id="liquidity-visualization" className="mb-12 md:mb-24 scroll-mt-32">
            <div className="text-center mb-12">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 block">📊</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                Visualizing Market Dynamics
              </h2>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                An animated comparison illustrating how an Automated Market Maker's (AMM) pricing curve offers
                continuous liquidity across a range of prices, contrasted with a traditional order book's discrete depth
                levels and bid-ask spread. Observe the dynamic shifts as market conditions evolve.
              </p>
            </div>
            <div ref={chartContainerRef} className="w-full">
              <MarketVisualizerChart width={chartDimensions.width} height={chartDimensions.height} />
            </div>
            {/* Smaller note section below the chart */}
            <div className="mt-6 text-center">
              <p className="text-zinc-400 text-sm italic max-w-2xl mx-auto">
                Keen-eyed and mathematically inclined viewers might notice a resemblance between the AMM graph,
                particularly the shape of the buy and sell curves, and an inverted logistic function. This is indeed an
                expected characteristic. LMSR utilizes a softmax function to determine pricing. When you consider a
                cross-section of the softmax function in one particular direction (isolating the probability of one
                outcome against all others), it mathematically simplifies to a logistic function. Therefore, the
                observed sigmoidal shape in the visualization is a direct consequence of the underlying mathematics and
                is to scale. More detailed explanations of the mathematical underpinnings are provided in later
                sections.
              </p>
            </div>
          </section>

          {/* LMSR vs Order Books */}
          <section id="comparison" className="mb-12 md:mb-24 scroll-mt-32">
            <div className="text-center mb-12">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 block">⚖️</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">LMSR vs Order Books</h2>
            </div>

            <div className="space-y-8">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-green-600/10 rounded-3xl p-4 sm:p-6 md:p-8 border border-green-600/30">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="text-green-500">✓</span> LMSR Advantages
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">•</span>
                      <span className="text-zinc-300">Always available liquidity without counterparties</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">•</span>
                      <span className="text-zinc-300">Deterministic pricing based on mathematical formulas</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">•</span>
                      <span className="text-zinc-300">Works well in low-volume markets</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">•</span>
                      <span className="text-zinc-300">Bounded loss for liquidity providers</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">•</span>
                      <span className="text-zinc-300">No bid-ask spread (in the traditional sense)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-red-600/10 rounded-3xl p-4 sm:p-6 md:p-8 border border-red-600/30">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="text-red-500">✗</span> LMSR Challenges
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 mt-1">•</span>
                      <span className="text-zinc-300">Seeders likely lose most capital at resolution</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 mt-1">•</span>
                      <span className="text-zinc-300">Seeder returns depend on uncertain trading volume</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 mt-1">•</span>
                      <span className="text-zinc-300">Price impact for large trades can be significant</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 mt-1">•</span>
                      <span className="text-zinc-300">More complex mathematics than order books</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 mt-1">•</span>
                      <span className="text-zinc-300">Requires initial seeding capital</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-zinc-900/50 rounded-3xl p-4 sm:p-6 md:p-8 backdrop-blur border border-zinc-800">
                <h4 className="text-xl font-semibold text-white mb-4 text-center">💰 Money Conservation Principle</h4>
                <p className="text-zinc-300 text-center max-w-2xl mx-auto">
                  <strong>All money is fully collateralized and conserved within the market.</strong> The protocol
                  itself never takes any funds - all money flows only between participants (seeders and traders). This
                  creates a zero-sum game where profits and losses balance exactly, ensuring market integrity.
                </p>
              </div>
            </div>
          </section>

          {/* Novel Multi-Seeder LMSR */}
          <section id="novel-implementation" className="mb-12 md:mb-24 scroll-mt-32">
            <div className="text-center mb-12">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 block">🔄</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">A Novel Multi-Seeder LMSR</h2>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 blur-3xl"></div>
              <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 border border-zinc-800">
                <div className="bg-purple-600/10 rounded-2xl p-4 sm:p-6 border border-purple-600/30 mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Revolutionary Design</h3>
                  <p className="text-zinc-300 leading-relaxed">
                    <strong>Sorocast implements a custom LMSR that allows seeders to join at any time</strong>, even
                    after trading has started. Traditional implementations have a fixed liquidity parameter set at
                    market creation - ours dynamically grows as new seeders join.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-400 font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Dynamic Liquidity</h4>
                      <p className="text-zinc-300">
                        The effective liquidity parameter <InlineMath math={`B = \\sum_j b^{(j)}`} /> increases as new
                        seeders join, improving market depth over time.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-400 font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Individual Markets</h4>
                      <p className="text-zinc-300">
                        Each seeder has their own market. When traders trade, <InlineMath math={`\\frac{b^{(j)}}{B}`} />
                        shares are traded in each seeder's individual market proportionally.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-400 font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Unified Interface</h4>
                      <p className="text-zinc-300">
                        Traders see a single market with unified pricing, while the protocol manages the complexity of
                        multiple individual markets seamlessly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mathematics */}
          <section id="mathematics" className="mb-12 md:mb-24 scroll-mt-32">
            <div className="text-center mb-12">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 block">📐</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">The Mathematics</h2>
            </div>

            <div className="space-y-8">
              {/* Cost Function */}
              <div className="bg-zinc-900/50 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur border border-zinc-800">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Cost Function</h3>
                <p className="text-zinc-300 mb-6">
                  The LMSR uses a cost function that determines how much traders pay to buy shares. This function
                  ensures that prices always sum to 1 (100%) and provides bounded loss for liquidity providers.
                </p>
                <div className="overflow-x-auto">
                  <div className="text-yellow-500 text-center text-xs sm:text-sm md:text-base">
                    <BlockMath
                      math={`C(\\vec{q}) = \\sum_{j \\in \\text{seeders}} b_j \\cdot \\ln\\left(\\sum_i \\pi_j(\\theta_i) \\cdot e^{q_j^{(i)}/b_j}\\right) + K`}
                    />
                  </div>
                </div>
                <p className="text-zinc-300 mt-6">
                  The market maintains a cost function where <InlineMath math={`\\vec{q}_j`} /> is the vector of shares
                  outstanding for seeder j, <InlineMath math={`b_j`} /> is the liquidity parameter for seeder j,{" "}
                  <InlineMath math={`\\pi_j(\\theta_i)`} /> is seeder j's prior probability for outcome i, and{" "}
                  <InlineMath math={`K`} /> is an arbitrary constant. Only the difference in cost matters, not the
                  actual value, similar to comparing definite to indefinite integrals.
                </p>
              </div>

              {/* Liquidity Parameter */}
              <div className="bg-zinc-900/50 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur border border-zinc-800">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Liquidity Parameter Calculation</h3>
                <p className="text-zinc-300 mb-6">
                  The liquidity parameter <InlineMath math={`b`} /> determines market depth and maximum loss. For the
                  initial seeder with uniform prior <InlineMath math={`\\pi(\\theta) = 1/n`} /> for all outcomes:
                </p>
                <div className="overflow-x-auto">
                  <div className="text-yellow-500 text-center text-xs sm:text-sm md:text-base">
                    <BlockMath math={`b_{initial} = \\frac{\\text{seed}}{\\ln(n)}`} />
                  </div>
                </div>
                <p className="text-zinc-300 mb-6">
                  For subsequent seeders joining at current market probabilities <InlineMath math={`\\pi(\\theta)`} />:
                </p>
                <div className="overflow-x-auto">
                  <div className="text-yellow-500 text-center text-xs sm:text-sm md:text-base">
                    <BlockMath math={`b_{seeder} = \\frac{\\text{seed}}{-\\ln(\\pi_{min})}`} />
                  </div>
                </div>
                <p className="text-zinc-300 mt-6">
                  Where <InlineMath math={`\\pi_{min} = \\min_{\\theta} \\pi(\\theta)`} /> is the minimum probability
                  across all outcomes at the time of seeding.
                </p>
              </div>

              {/* Multiple Seeders Mathematics */}
              <div className="bg-zinc-900/50 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur border border-zinc-800">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Multiple Seeders Mathematics</h3>
                <p className="text-zinc-300 mb-6">
                  When multiple seeders join a market, each with their own priors and b values, they don't simply
                  combine into one larger b parameter. Instead:
                </p>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Individual Cost Functions</h4>
                    <p className="text-zinc-300 mb-3">
                      Each seeder j has their own cost function based on their individual b value and prior:
                    </p>
                    <div className="overflow-x-auto">
                      <div className="text-yellow-500 text-center text-xs sm:text-sm md:text-base">
                        <BlockMath
                          math={`C_j(\\vec{q}) = b_j \\cdot \\ln\\left(\\sum_i \\pi_j(\\theta_i) \\cdot e^{q_i/b_j}\\right)`}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Proportional q-splitting</h4>
                    <p className="text-zinc-300 mb-3">
                      Unlike the single universal shares vector <InlineMath math={`\\vec{q}`} /> for a single seeder
                      LMSR, each new seeder j gets a brand new <InlineMath math={`\\vec{q}^{(j)} := \\mathbf{0}`} />{" "}
                      initialized when they seed and updated like so when somebody trades:
                    </p>
                    <div className="overflow-x-auto">
                      <div className="text-yellow-500 text-center text-xs sm:text-sm md:text-base">
                        <BlockMath
                          math={`\\vec{q}^{(j)}\\leftarrow\\vec{q}^{(j)}+\\frac{b^{(j)}}{B}\\vec{\\delta q}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Combined Cost Function</h4>
                    <p className="text-zinc-300 mb-3">
                      The combined cost function is the sum of individual cost functions, each incorporating the
                      seeder's prior and shares sold:
                    </p>
                    <div className="overflow-x-auto">
                      <div className="text-yellow-500 text-center text-xs sm:text-sm md:text-base">
                        <BlockMath
                          math={`C(\\vec{q}) = \\sum_{j \\in \\text{seeders}} b_j \\cdot \\ln\\left(\\sum_i \\pi_j(\\theta_i) \\cdot e^{q_j^{(i)}/b_j}\\right) + K`}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Combined Pricing</h4>
                    <p className="text-zinc-300 mb-3">
                      The market price for outcome i is determined by the contributions from all seeders, each with
                      their own priors:
                    </p>
                    <div className="overflow-x-auto">
                      <div className="text-yellow-500 text-center text-xs sm:text-sm md:text-base">
                        <BlockMath
                          math={`p_i(\\vec{q}) = \\frac{\\sum_{j \\in \\text{seeders}} b_j \\pi_j(\\theta_i) \\cdot e^{q_j^{(i)}/b_j}}{\\sum_{j \\in \\text{seeders}} b_j \\sum_k \\pi_j(\\theta_k) \\cdot e^{q_j^{(k)}/b_j}}`}
                        />
                      </div>
                    </div>
                    <p className="text-zinc-300 mt-3">
                      Where <InlineMath math={`\\pi_j(\\theta_i)`} /> is seeder j's prior probability for outcome i,{" "}
                      <InlineMath math={`\\vec{q}_j`} /> is their shares sold, and <InlineMath math={`b_j`} /> is seeder
                      j's liquidity parameter.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">New Seeder Price Neutrality</h4>
                  <p className="text-zinc-300 mb-3">
                    When new seeders join, their priors are set to current market prices. This ensures that adding a new
                    seeder doesn't immediately change market prices. If a new seeder's priors were different from
                    current prices, their entry would shift the market, creating potential manipulation opportunities:
                  </p>
                  <div className="overflow-x-auto">
                    <div className="text-yellow-500 text-center text-xs sm:text-sm md:text-base">
                      <BlockMath math={`\\pi_j(\\theta_i)=p_i`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Derivation */}
              <div className="bg-zinc-900/50 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur border border-zinc-800">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Price Calculation</h3>
                <p className="text-zinc-300 mb-6">
                  For a single seeder with prior <InlineMath math={`\\pi(\\theta_i)`} /> for outcome i, prices are
                  calculated as:
                </p>
                <div className="overflow-x-auto">
                  <div className="text-yellow-500 text-center text-xs sm:text-sm md:text-base space-y-2">
                    <BlockMath math={`p_i = \\frac{\\partial C}{\\partial q_i}`} />
                    <BlockMath
                      math={`= \\frac{\\pi(\\theta_i) \\cdot e^{q_i/b}}{\\sum_k \\pi(\\theta_k) \\cdot e^{q_k/b}}`}
                    />
                  </div>
                </div>
                <p className="text-zinc-300 mb-6">
                  With multiple seeders, each with their own priors and liquidity parameters, the price is:
                </p>
                <div className="overflow-x-auto">
                  <div className="text-yellow-500 text-center text-xs sm:text-sm md:text-base space-y-2">
                    <BlockMath
                      math={`p_i = \\sum_{j \\in \\text{seeders}} \\frac{b^{(j)}}{B}p_j^{(i)} = \\sum_{j \\in \\text{seeders}} \\frac{b^{(j)}}{B} \\frac{\\partial C^{(j)}}{\\partial q_j^{(i)}} `}
                    />
                    <BlockMath
                      math={`= \\frac{\\sum_{j \\in \\text{seeders}} b_j \\pi_j(\\theta_i) \\cdot e^{q_j^{(i)}/b_j}}{\\sum_{j \\in \\text{seeders}} b_j \\sum_k \\pi_j(\\theta_k) \\cdot e^{q_j^{(k)}/b_j}}`}
                    />
                  </div>
                </div>
                <p className="text-zinc-300 mt-6">
                  Prices always sum to one: <InlineMath math={`\\sum_{i=1}^{n} p_i = 1`} />. This property ensures that
                  the prices can be interpreted as probabilities.
                </p>
              </div>

              {/* Trading Cost */}
              <div className="bg-zinc-900/50 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur border border-zinc-800">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Cost of Trading</h3>
                <p className="text-zinc-300 mb-6">
                  When traders buy or sell shares, they pay the difference in the total cost function before and after
                  the trade:
                </p>
                <div className="overflow-x-auto">
                  <div className="text-yellow-500 text-center text-xs sm:text-sm md:text-base space-y-2">
                    <BlockMath
                      math={`\\text{Cost} = C_{\\text{total}}(\\vec{q} + \\Delta\\vec{q}) - C_{\\text{total}}(\\vec{q})`}
                    />
                    <BlockMath math={`= \\int_{\\gamma} \\nabla C_{\\text{total}}(\\vec{u}) \\cdot d\\vec{u}`} />
                    <BlockMath math={`= \\int_{\\gamma} \\vec{p}(\\vec{u}) \\cdot d\\vec{u}`} />
                  </div>
                </div>

                <p className="text-zinc-300 mb-6">
                  This can be decomposed as the sum of individual cost contributions from all seeders:
                </p>

                <div className="overflow-x-auto">
                  <div className="text-yellow-500 text-center text-xs sm:text-sm md:text-base space-y-2">
                    <BlockMath
                      math={`\\text{Cost} = \\sum_{i} \\left[C_i\\left(\\vec{q}^{(i)} + \\frac{b^{(i)}}{B} \\Delta\\vec{q}\\right) - C_i(\\vec{q}^{(i)})\\right]`}
                    />
                    <BlockMath
                      math={`= \\sum_{i} \\int_{\\gamma_i} \\nabla C_i(\\vec{u}^{(i)}) \\cdot d\\vec{u}^{(i)}`}
                    />
                    <BlockMath
                      math={`= \\sum_{i} \\int_{\\gamma_i} \\vec{p}^{(i)}(\\vec{u}^{(i)}) \\cdot d\\vec{u}^{(i)}`}
                    />
                  </div>
                </div>
                <p className="text-zinc-300 mt-6">
                  Each seeder's individual cost function contributes to the total cost of the trade. This ensures that
                  the risk is properly distributed among seeders according to their individual b values and priors.
                </p>
              </div>

              {/* Fees */}
              <div className="bg-zinc-900/50 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur border border-zinc-800">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Fee Structure</h3>
                <p className="text-zinc-300 mb-6">
                  Fees are only applied to buy orders, not sell orders. The fee structure is designed to award seeders
                  for taking the risk while not being too high to drive away prospective buyers:
                </p>

                <div className="overflow-x-auto">
                  <div className="text-yellow-500 text-center text-xs sm:text-sm md:text-base">
                    <BlockMath math={`\\text{Fee} = 0.02 \\text{ XLM} \\times \\text{number of shares}`} />
                  </div>
                </div>
                <p className="text-zinc-300 mt-6">
                  This constant fee ensures seeders receive compensation for providing liquidity, while keeping trading
                  costs predictable and reasonable for traders.
                </p>
              </div>
            </div>
          </section>

          {/* Seeder Economics */}
          <section id="seeder-economics" className="mb-12 md:mb-24 scroll-mt-32">
            <div className="text-center mb-12">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 block">💰</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Seeder Economics</h2>
              <p className="text-zinc-400 text-lg">The Business of Uncertainty</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-600/10 to-orange-600/10 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur border border-zinc-800">
              <div className="text-center mb-8">
                <p className="text-xl sm:text-2xl text-white font-semibold">Seeders are uncertainty merchants.</p>
                <p className="text-zinc-400 mt-2">They profit from the journey, not the destination.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-black/40 rounded-2xl p-4 sm:p-6 backdrop-blur">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">💸</span>
                    <h3 className="text-xl font-semibold text-white">Fee Collection</h3>
                  </div>
                  <p className="text-zinc-300">
                    Earn fees on every trade. The more trading activity, the more fees collected. High-volume
                    controversial markets are a seeder's best friend.
                  </p>
                </div>

                <div className="bg-black/40 rounded-2xl p-4 sm:p-6 backdrop-blur">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">🎲</span>
                    <h3 className="text-xl font-semibold text-white">Uncertainty Profits</h3>
                  </div>
                  <p className="text-zinc-300">
                    Markets that stay uncertain and active generate the most fees. Price swings and changing sentiment
                    create trading volume.
                  </p>
                </div>

                <div className="bg-black/40 rounded-2xl p-4 sm:p-6 backdrop-blur">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">🏆</span>
                    <h3 className="text-xl font-semibold text-white">Underdog Windfalls</h3>
                  </div>
                  <p className="text-zinc-300">
                    If a low-probability outcome wins, seeders can make significant profits on their capital in addition
                    to collected fees.
                  </p>
                </div>
              </div>

              <div className="mt-8 p-4 sm:p-6 bg-blue-600/10 rounded-2xl border border-blue-600/30">
                <p className="text-zinc-300 text-center">
                  <strong>The ideal seeder market:</strong> Stays controversial for a long time, generates high volume
                  with traders on both sides, and has multiple price swings as new information emerges.
                </p>
              </div>
            </div>
          </section>

          {/* Secondary Market */}
          <section id="secondary-market" className="mb-12 md:mb-24 scroll-mt-32">
            <div className="text-center mb-12">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 block">🔄</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                Secondary Market for b-tokens
              </h2>
            </div>

            <div className="bg-zinc-900/50 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur border border-zinc-800">
              <p className="text-xl sm:text-2xl text-white font-medium mb-8 text-center">
                Seeders can exit positions before market resolution through our innovative secondary market.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div className="bg-black/40 rounded-2xl p-4 sm:p-6 text-center">
                  <div className="text-4xl mb-4">🪙</div>
                  <h3 className="text-lg font-semibold text-white mb-2">b-tokens</h3>
                  <p className="text-sm text-zinc-400">
                    Your seed becomes b-tokens representing your share of market liquidity and fee rights
                  </p>
                </div>

                <div className="bg-black/40 rounded-2xl p-4 sm:p-6 text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-lg font-semibold text-white mb-2">Order Book</h3>
                  <p className="text-sm text-zinc-400">
                    Simple auction mechanism where buyers and sellers set their own prices
                  </p>
                </div>

                <div className="bg-black/40 rounded-2xl p-4 sm:p-6 text-center">
                  <div className="text-4xl mb-4">💱</div>
                  <h3 className="text-lg font-semibold text-white mb-2">Dynamic Pricing</h3>
                  <p className="text-sm text-zinc-400">
                    b-tokens trade at premiums or discounts based on market conditions
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="bg-green-600/10 rounded-2xl p-4 sm:p-6 border border-green-600/30">
                  <h4 className="font-semibold text-white mb-3">For Sellers</h4>
                  <ul className="text-sm text-zinc-300 space-y-2">
                    <li>• Exit positions before resolution</li>
                    <li>• Realize profits early</li>
                    <li>• Manage risk exposure</li>
                    <li>• Redeploy capital efficiently</li>
                  </ul>
                </div>

                <div className="bg-blue-600/10 rounded-2xl p-4 sm:p-6 border border-blue-600/30">
                  <h4 className="font-semibold text-white mb-3">For Buyers</h4>
                  <ul className="text-sm text-zinc-300 space-y-2">
                    <li>• Enter established markets</li>
                    <li>• Buy b-tokens at discounts</li>
                    <li>• Acquire specific b-values</li>
                    <li>• Diversify across markets</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* How to Participate */}
          <section id="how-to-participate" className="mb-12 md:mb-24 scroll-mt-32">
            <div className="text-center mb-12">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 block">💡</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">How to Participate</h2>
            </div>

            <div className="space-y-8">
              {/* Trading */}
              <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur border border-zinc-800">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center">
                    {" "}
                    {/* Changed rounded-2xl to rounded-full */}
                    <span className="text-3xl">📈</span>
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">Trading</h3>
                    <p className="text-zinc-400">Buy low, sell high, profit from knowledge</p>
                  </div>
                </div>

                <p className="text-zinc-300 mb-6 leading-relaxed">
                  Buy shares when you believe the market price is wrong. Your profit comes from the difference between
                  your purchase price and the final resolution price (1 XLM for winning outcomes, 0 for losing).
                </p>

                <div className="bg-black/40 rounded-2xl p-4 sm:p-6 mb-6">
                  <p className="text-zinc-400">
                    <span className="text-white font-semibold">Example:</span> If a market shows 30% chance of an event
                    but you believe it's 70%, buy YES shares. If correct, you profit from the 40% difference.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Trading Strategies</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">•</span>
                      <div>
                        <span className="text-white font-medium">Value Trading:</span>
                        <span className="text-zinc-400 text-sm block">Buy underpriced outcomes based on analysis</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">•</span>
                      <div>
                        <span className="text-white font-medium">Momentum Trading:</span>
                        <span className="text-zinc-400 text-sm block">Follow market trends and sentiment</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">•</span>
                      <div>
                        <span className="text-white font-medium">Arbitrage:</span>
                        <span className="text-zinc-400 text-sm block">Exploit price differences across markets</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">•</span>
                      <div>
                        <span className="text-white font-medium">Hedging:</span>
                        <span className="text-zinc-400 text-sm block">Use markets to offset real-world risks</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seeding */}
              <div className="bg-gradient-to-br from-yellow-600/10 to-orange-600/10 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur border border-zinc-800">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-yellow-600/20 flex items-center justify-center">
                    {" "}
                    {/* Changed rounded-2xl to rounded-full */}
                    <span className="text-3xl">💧</span>
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">Seeding</h3>
                    <p className="text-zinc-400">Provide liquidity, collect fees, enable markets</p>
                  </div>
                </div>

                <p className="text-zinc-300 mb-6 leading-relaxed">
                  Provide liquidity to markets and earn fees from trading activity. Your profit comes primarily from
                  collecting fees during the market's active life, though you can also profit if an underdog outcome
                  wins.
                </p>

                <div className="bg-black/40 rounded-2xl p-4 sm:p-6 mb-6">
                  <p className="text-zinc-400">
                    <span className="text-white font-semibold">Example:</span> Seed 1000 XLM in a market that generates
                    100,000 XLM volume. With 2% fees, you collect 2,000 XLM. If a 10% underdog wins, you could profit
                    even more.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Seeding Strategies</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <span className="text-yellow-400 mt-1">•</span>
                      <div>
                        <span className="text-white font-medium">Volume Hunting:</span>
                        <span className="text-zinc-400 text-sm block">Target controversial, high-activity markets</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-yellow-400 mt-1">•</span>
                      <div>
                        <span className="text-white font-medium">Early Entry:</span>
                        <span className="text-zinc-400 text-sm block">Seed markets with long time horizons</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-yellow-400 mt-1">•</span>
                      <div>
                        <span className="text-white font-medium">Active Management:</span>
                        <span className="text-zinc-400 text-sm block">Trade your own markets for extra profit</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-yellow-400 mt-1">•</span>
                      <div>
                        <span className="text-white font-medium">Portfolio Approach:</span>
                        <span className="text-zinc-400 text-sm block">Diversify across multiple markets</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Market Parameters */}
          <section id="market-parameters" className="mb-12 md:mb-24 scroll-mt-32">
            <div className="text-center mb-12">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 block">🏛️</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Market Parameters</h2>
            </div>

            <div className="bg-zinc-900/50 rounded-3xl overflow-hidden backdrop-blur border border-zinc-800">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="px-4 py-5 text-left">
                        <span className="text-zinc-400 text-xs uppercase tracking-wider">Parameter</span>
                      </th>
                      <th className="px-4 py-5 text-left">
                        <span className="text-zinc-400 text-xs uppercase tracking-wider">Value</span>
                      </th>
                      <th className="px-4 py-5 text-left">
                        <span className="text-zinc-400 text-xs uppercase tracking-wider">Purpose</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    <tr className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-5">
                        <span className="text-white font-medium">Creation Bond</span>
                      </td>
                      <td className="px-4 py-5">
                        <span className="text-zinc-300 font-mono">1000 XLM</span>
                      </td>
                      <td className="px-4 py-5">
                        <span className="text-zinc-400 text-sm">
                          Prevents spam markets and ensures creator commitment. Returned after successful resolution.
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-5">
                        <span className="text-white font-medium">Minimum Seed</span>
                      </td>
                      <td className="px-4 py-5">
                        <span className="text-zinc-300 font-mono">1000 XLM</span>
                      </td>
                      <td className="px-4 py-5">
                        <span className="text-zinc-400 text-sm">
                          Ensures sufficient liquidity for trading. Higher seeds create deeper markets.
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-5">
                        <span className="text-white font-medium">Fee Structure</span>
                      </td>
                      <td className="px-4 py-5">
                        <span className="text-zinc-300 font-mono">0.02 XLM/share</span>
                      </td>
                      <td className="px-4 py-5">
                        <span className="text-zinc-400 text-sm">
                          Flat fee per share to encourage trading volume and price discovery.
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-5">
                        <span className="text-white font-medium">Liquidity (b)</span>
                      </td>
                      <td className="px-4 py-5">
                        <span className="text-zinc-300 font-mono">Dynamic</span>
                      </td>
                      <td className="px-4 py-5">
                        <span className="text-zinc-400 text-sm">
                          Calculated as <InlineMath math={`b = \\text{seed}/(-\\ln(\\pi_{min}))`} /> for each seeder.
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-5">
                        <span className="text-white font-medium">Resolution Time</span>
                      </td>
                      <td className="px-4 py-5">
                        <span className="text-zinc-300 font-mono">Creator Set</span>
                      </td>
                      <td className="px-4 py-5">
                        <span className="text-zinc-400 text-sm">
                          When the market will resolve. Can be date or event-based.
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="px-4 py-4 bg-amber-600/10 border-t border-amber-600/30">
                <p className="text-amber-500 text-sm italic">
                  Note: Parameters are subject to change based on testing and market feedback. These values are
                  placeholders for initial markets.
                </p>
              </div>
            </div>
          </section>

          {/* Fair Market Design */}
          <section id="fairness" className="mb-12 md:mb-24 scroll-mt-32">
            <div className="text-center mb-12">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 block">📏</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Fair Market Design</h2>
            </div>

            <div className="space-y-8">
              <div className="bg-gradient-to-br from-green-600/10 to-blue-600/10 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur border border-zinc-800">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">Starting Fair</h3>
                <p className="text-zinc-300 mb-6 text-center max-w-2xl mx-auto">
                  All markets begin with uniform priors where each outcome has equal probability, ensuring a neutral
                  starting point without bias.
                </p>
                <div className="bg-black/40 rounded-2xl p-4 sm:p-6 text-center">
                  <div className="text-yellow-500 text-xs sm:text-sm md:text-base">
                    <BlockMath math={`\\pi(\\theta_i) = \\frac{1}{n} \\quad \\forall i \\in \\{1, 2, ..., n\\}`} />
                  </div>
                </div>
                <p className="text-zinc-300 mt-6 text-center">
                  Starting with uniform priors ensures no manipulation and provides a fair starting point. For the
                  initial seeder, the minimum probability is <InlineMath math={`\\pi_{min} = 1/n`} />, so their maximum
                  loss is <InlineMath math={`b_{initial} \\cdot \\ln(n) = \\text{seed}`} />.
                </p>
              </div>

              <div className="bg-zinc-900/50 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur border border-zinc-800">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-8 text-center">Market Rules</h3>
                <div className="grid gap-4 max-w-3xl mx-auto">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-400">✓</span>
                    </div>
                    <p className="text-zinc-300">
                      Seeders can also trade to correct prices if they believe the market is mispriced, aligning their
                      incentives with market accuracy
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-400">✓</span>
                    </div>
                    <p className="text-zinc-300">
                      New seeders enter at current prices, preventing dilution of existing positions and ensuring fair
                      participation
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-400">✓</span>
                    </div>
                    <p className="text-zinc-300">
                      Seed capital is locked until market resolution, preventing liquidity withdrawal attacks
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-400">✓</span>
                    </div>
                    <p className="text-zinc-300">
                      Trading fees are distributed proportionally to seeders based on their individual b values
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-400">✓</span>
                    </div>
                    <p className="text-zinc-300">
                      Market creators must post a bond to create markets, ensuring they have skin in the game
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Implementation */}
          <section id="technical-implementation" className="mb-12 md:mb-24 scroll-mt-32">
            <div className="text-center mb-12">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 block">💻</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Technical Implementation</h2>
            </div>

            <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur border border-zinc-800">
              <p className="text-zinc-300 mb-8 text-center text-lg">
                Built on Stellar blockchain for fast, low-cost transactions with robust smart contracts.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-black/40 rounded-2xl p-4 sm:p-6 backdrop-blur">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
                      <span className="text-purple-400">🔗</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Smart Contracts</h3>
                  </div>
                  <p className="text-zinc-400 text-sm">
                    On-chain contracts for market creation, trading, seeding, and resolution with full transparency
                  </p>
                </div>

                <div className="bg-black/40 rounded-2xl p-4 sm:p-6 backdrop-blur">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
                      <span className="text-purple-400">📊</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">LMSR Calculations</h3>
                  </div>
                  <p className="text-zinc-400 text-sm">
                    On-chain mathematical operations for transparent and verifiable pricing using fixed-point arithmetic
                  </p>
                </div>

                <div className="bg-black/40 rounded-2xl p-4 sm:p-6 backdrop-blur">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
                      <span className="text-purple-400">🔮</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Oracle System</h3>
                  </div>
                  <p className="text-zinc-400 text-sm">
                    Decentralized oracle system for reliable market resolution without central authority
                  </p>
                </div>

                <div className="bg-black/40 rounded-2xl p-4 sm:p-6 backdrop-blur">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
                      <span className="text-purple-400">🌐</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Web Interface</h3>
                  </div>
                  <p className="text-zinc-400 text-sm">
                    User-friendly interface for market creation, trading, and portfolio management
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Mathematical Implementation Details */}
          <section id="math-implementation" className="mb-12 md:mb-24 scroll-mt-32">
            <div className="text-center mb-12">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 block">🔬</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                Mathematical Implementation Details
              </h2>
            </div>

            <div className="space-y-8">
              <div className="bg-zinc-900/50 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur border border-zinc-800">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Fixed-Point Arithmetic</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <div>
                      <h4 className="text-white font-medium mb-1">Stroop Conversion</h4>
                      <p className="text-zinc-400 text-sm">
                        XLM amounts multiplied by 10⁷ to convert to stroops (1 XLM = 10⁷ stroops) XLM amounts multiplied
                        by 10⁷ to convert to stroops (1 XLM = 10⁷ stroops), ensuring all calculations work with integers
                        and maintain precision down to the smallest unit
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <div>
                      <h4 className="text-white font-medium mb-1">Rust Fixed Crate</h4>
                      <p className="text-zinc-400 text-sm">
                        Uses the Rust <span className="font-mono text-blue-400">fixed</span> crate's built-in ln() and
                        exp() functions, which provide deterministic results across all blockchain nodes without custom
                        implementations
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <div>
                      <h4 className="text-white font-medium mb-1">Deterministic Results</h4>
                      <p className="text-zinc-400 text-sm">
                        The <span className="font-mono text-blue-400">fixed</span> crate ensures identical results
                        across all network nodes, preventing consensus issues that could arise from floating-point
                        arithmetic
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur border border-zinc-800">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Computational Efficiency</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-black/40 rounded-2xl p-4 sm:p-6">
                    <h4 className="text-lg font-medium text-white mb-3">LMSR Operations</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-zinc-400">ln() and exp():</span>
                        <span className="text-green-400 font-mono">~10-50ns</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-zinc-400">Cost function:</span>
                        <span className="text-green-400 font-mono">~100ns</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-zinc-400">Price calc:</span>
                        <span className="text-green-400 font-mono">~50ns</span>
                      </li>
                      <li className="flex justify-between border-t border-zinc-700 pt-2">
                        <span className="text-white">Total per trade:</span>
                        <span className="text-green-400 font-mono">~200ns</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-black/40 rounded-2xl p-4 sm:p-6">
                    <h4 className="text-lg font-medium text-white mb-3">Cryptographic Operations</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-zinc-400">Ed25519 verification:</span>
                        <span className="text-amber-400 font-mono">~50-100μs</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-zinc-400">Transaction auth:</span>
                        <span className="text-amber-400 font-mono">~100-200μs</span>
                      </li>
                      <li className="flex justify-between border-t border-zinc-700 pt-2">
                        <span className="text-white">Crypto overhead:</span>
                        <span className="text-amber-400 font-mono">~300μs</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm mt-4 text-center">
                  Mathematical operations are 1000x faster than cryptographic operations, making LMSR calculations
                  negligible in terms of computational cost.
                </p>
              </div>
            </div>
          </section>

          {/* Risk Warning */}
          <section id="risk-warning" className="mb-12 md:mb-24 scroll-mt-32">
            <div className="text-center mb-12">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 block">🔐</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Risk Warning</h2>
            </div>

            <div className="bg-red-950 border border-red-900 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12">
              <p className="text-zinc-300 mb-6 text-lg font-semibold text-center">
                All prediction market participation involves risk:
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-900/50 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-500">⚠️</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Seeders</h4>
                    <p className="text-zinc-300">
                      Should expect to lose most or all seed capital at resolution. Profitability depends entirely on
                      collecting sufficient trading fees during the market's active life, which cannot be guaranteed.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-900/50 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-500">⚠️</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Traders</h4>
                    <p className="text-zinc-300">
                      Can lose their entire stake if they bet on incorrect outcomes or sell at unfavorable prices.
                      Market manipulation and unexpected events can impact outcomes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 sm:p-6 bg-black/30 rounded-2xl text-center">
                <p className="text-zinc-300 font-medium">
                  Only participate with funds you can afford to lose. Past performance of similar markets is not
                  indicative of future results.
                </p>
              </div>
            </div>
          </section>

          {/* Further Reading */}
          <section id="further-reading" className="mb-12 md:mb-24 scroll-mt-32">
            {" "}
            {/* Added ID here */}
            <div className="text-center mb-12">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 block">📚</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Further Reading</h2>
            </div>
            <div className="bg-zinc-900/50 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur border border-zinc-800">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">📄</span>
                  <span className="text-zinc-300">
                    Ludwig Boltzmann, "Studien über das Gleichgewicht der lebendigen Kraft zwischen bewegten materiellen
                    Punkten" (1868)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">📄</span>
                  <span className="text-zinc-300">
                    Robin Hanson, "Logarithmic Market Scoring Rules for Modular Combinatorial Information Aggregation"
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">📄</span>
                  <span className="text-zinc-300">
                    Abraham Othman, et al., "Automated Market Makers for Prediction Markets"
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">📄</span>
                  <span className="text-zinc-300">Sorocast Technical Whitepaper (coming soon)</span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all z-50"
          aria-label="Scroll to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      <Footer />
    </div>
  )
}
