"use client"

import { useState } from "react"
import { Wallet, TrendingUp, History, Award, ArrowUpRight, ArrowDownRight } from "lucide-react"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ActiveBetsTable } from "@/components/portfolio/active-bets-table"
import { BetHistoryTable } from "@/components/portfolio/bet-history-table"
import { PerformanceMetrics } from "@/components/portfolio/performance-metrics"
import { WalletOverview } from "@/components/portfolio/wallet-overview"

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState("summary") // Default to new "Summary" tab

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      <main className="flex-1 bg-black">
        <div className="container px-4 py-6 md:px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Portfolio Dashboard</h1>
            <p className="text-zinc-400">Manage your positions and track your performance</p>
          </div>

          <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab} className="space-y-4 w-full">
            {/* Replicating TabsList classes from markets/[id]/page.tsx */}
            <TabsList
              className="grid grid-cols-4 bg-zinc-900 border-zinc-800 w-full h-auto p-1 rounded-lg"
              // Note: The original markets/[id] page had TabsList inside a div for mobile,
              // and then a separate TabsList for desktop.
              // For simplicity here, applying the grid directly.
              // If markets/[id] has different classes for different breakpoints for TabsList,
              // we'd need to replicate that too.
              // Assuming this is the primary style for markets/[id] that works.
            >
              <TabsTrigger
                value="summary"
                className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black py-2 text-sm px-3 text-center whitespace-nowrap"
                // Removed flex-shrink-0 as grid items behave differently
              >
                Summary
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black py-2 text-sm px-3 text-center whitespace-nowrap"
              >
                Active
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black py-2 text-sm px-3 text-center whitespace-nowrap"
              >
                History
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black py-2 text-sm px-3 text-center whitespace-nowrap"
              >
                Stats
              </TabsTrigger>
            </TabsList>

            {/* Update TabsContent values to match new trigger values */}
            <TabsContent value="summary" className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Total Balance</CardTitle>
                    <Wallet className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">$2,850.00</div>
                    <p className="text-xs text-zinc-400">+20% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Active Positions</CardTitle>
                    <TrendingUp className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">12</div>
                    <p className="text-xs text-zinc-400">Across 8 markets</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Win Rate</CardTitle>
                    <Award className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">68%</div>
                    <p className="text-xs text-zinc-400">+5% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Total Profit</CardTitle>
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">$450.00</div>
                    <p className="text-xs text-zinc-400">+18.5% ROI</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                <WalletOverview className="lg:col-span-2" />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-white">Position Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-zinc-400">Politics</div>
                          <div className="text-sm text-white">45%</div>
                        </div>
                        <Progress value={45} className="h-2 bg-zinc-700" indicatorClassName="bg-yellow-500" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-zinc-400">Crypto</div>
                          <div className="text-sm text-white">30%</div>
                        </div>
                        <Progress value={30} className="h-2 bg-zinc-700" indicatorClassName="bg-yellow-500" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-zinc-400">Sports</div>
                          <div className="text-sm text-white">15%</div>
                        </div>
                        <Progress value={15} className="h-2 bg-zinc-700" indicatorClassName="bg-yellow-500" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-zinc-400">Entertainment</div>
                          <div className="text-sm text-white">10%</div>
                        </div>
                        <Progress value={10} className="h-2 bg-zinc-700" indicatorClassName="bg-yellow-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                    <CardDescription className="text-zinc-400">Your recent trades and transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border-b border-zinc-800 pb-4 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`rounded-full p-2 ${getActivityIconBackground(activity.type)}`}>
                              {getActivityIcon(activity.type)}
                            </div>
                            <div>
                              <div className="font-medium text-white text-sm sm:text-base">{activity.title}</div>
                              <div className="text-xs text-zinc-400">{activity.date}</div>
                            </div>
                          </div>
                          <div className={`text-sm font-medium ${getActivityAmountColor(activity.type)}`}>
                            {activity.amount}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-white">Active Positions</CardTitle>
                  <CardDescription className="text-zinc-400">Your current open positions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ActiveBetsTable />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-white">Trade History</CardTitle>
                  <CardDescription className="text-zinc-400">Your past trades and outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  <BetHistoryTable />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <PerformanceMetrics />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}

// recentActivity, getActivityIcon, getActivityIconBackground, getActivityAmountColor functions remain the same
const recentActivity = [
  { type: "trade", title: "Trade: Bitcoin above $40k by end of month'", date: "Today, 2:30 PM", amount: "-$100.00" },
  { type: "win", title: "Trade Won: Oscar Best Picture Winner 2024'", date: "Yesterday, 10:15 AM", amount: "+$250.00" },
  { type: "deposit", title: "Deposited funds to wallet", date: "Mar 15, 2023", amount: "+$500.00" },
  { type: "loss", title: "Trade Lost: Super Bowl LVIII Winner'", date: "Mar 12, 2023", amount: "-$75.00" },
  { type: "withdraw", title: "Withdrew funds from wallet", date: "Mar 10, 2023", amount: "-$200.00" },
]

function getActivityIcon(type: string) {
  switch (type) {
    case "trade":
      return <TrendingUp className="h-4 w-4 text-yellow-500" />
    case "win":
      return <ArrowUpRight className="h-4 w-4 text-green-500" />
    case "loss":
      return <ArrowDownRight className="h-4 w-4 text-red-500" />
    case "deposit":
      return <ArrowUpRight className="h-4 w-4 text-blue-500" />
    case "withdraw":
      return <ArrowDownRight className="h-4 w-4 text-purple-500" />
    default:
      return <History className="h-4 w-4 text-zinc-400" />
  }
}

function getActivityIconBackground(type: string) {
  switch (type) {
    case "trade":
      return "bg-yellow-500/10"
    case "win":
      return "bg-green-500/10"
    case "loss":
      return "bg-red-500/10"
    case "deposit":
      return "bg-blue-500/10"
    case "withdraw":
      return "bg-purple-500/10"
    default:
      return "bg-zinc-800"
  }
}

function getActivityAmountColor(type: string) {
  switch (type) {
    case "win":
    case "deposit":
      return "text-green-500"
    case "loss":
    case "withdraw":
    case "trade":
      return "text-red-500"
    default:
      return "text-white"
  }
}
