"use client"

import { useState } from "react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const sorocastYellow = "rgba(245, 158, 11, 1)"
const sorocastYellowFill = "rgba(245, 158, 11, 0.8)"
const tickColor = "#E5E7EB" // Light gray for ticks
const gridLineColor = "#52525b" // zinc-600 for grid lines
const axisLineColor = "#71717A" // zinc-500 for axis lines

const chartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  datasets: [
    {
      label: "Balance",
      data: [1200, 1900, 1500, 2100, 2400, 1800, 2850],
      backgroundColor: sorocastYellowFill,
      borderColor: sorocastYellow,
      borderWidth: 1,
      borderRadius: {
        topLeft: 4,
        topRight: 4,
      },
    },
  ],
}

const chartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "hsl(var(--popover))", // Dark background
      titleColor: "#FFFFFF", // White title
      bodyColor: "#FFFFFF", // White body
      borderColor: "hsl(var(--border))",
      borderWidth: 1,
      padding: 10,
      callbacks: {
        label: (context: any) => {
          let label = context.dataset.label || ""
          if (label) {
            label += ": "
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(context.parsed.y)
          }
          return label
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: tickColor,
        font: {
          size: 12,
        },
      },
      border: {
        color: axisLineColor,
      },
    },
    y: {
      grid: {
        color: gridLineColor,
        borderDash: [3, 3],
      },
      ticks: {
        color: tickColor,
        font: {
          size: 12,
        },
      },
      border: {
        color: axisLineColor,
      },
    },
  },
}

export function WalletOverview({ className }: { className?: string }) {
  const [timeRange, setTimeRange] = useState("7d")

  return (
    <Card className={cn("bg-zinc-900 border-zinc-800 text-white", className)}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-sm text-zinc-400 font-medium">Available Balance</CardTitle>
            <div className="text-2xl sm:text-3xl font-bold text-white">$2,850.00</div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 text-white hover:bg-yellow-500/20 hover:border-yellow-500 hover:text-yellow-400"
            >
              Deposit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 text-white hover:bg-yellow-500/20 hover:border-yellow-500 hover:text-yellow-400"
            >
              Withdraw
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <CardTitle className="text-sm font-medium text-white">Balance History</CardTitle>
              <Tabs defaultValue="7d" value={timeRange} onValueChange={setTimeRange} className="w-full sm:w-auto">
                <TabsList className="bg-zinc-900 border border-zinc-800 w-full grid grid-cols-4 h-auto">
                  <TabsTrigger
                    value="7d"
                    className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black py-1.5 text-xs text-zinc-300"
                  >
                    7d
                  </TabsTrigger>
                  <TabsTrigger
                    value="1m"
                    className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black py-1.5 text-xs text-zinc-300"
                  >
                    1m
                  </TabsTrigger>
                  <TabsTrigger
                    value="3m"
                    className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black py-1.5 text-xs text-zinc-300"
                  >
                    3m
                  </TabsTrigger>
                  <TabsTrigger
                    value="1y"
                    className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black py-1.5 text-xs text-zinc-300"
                  >
                    1y
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-4 wallet-overview-chart-card-content">
            <div className="h-[200px] w-full">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-zinc-800 border-zinc-700">
            <CardContent className="p-4">
              <div className="text-sm text-zinc-400">Total Deposited</div>
              <div className="text-lg sm:text-xl font-bold text-white">$3,500.00</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-800 border-zinc-700">
            <CardContent className="p-4">
              <div className="text-sm text-zinc-400">Total Withdrawn</div>
              <div className="text-lg sm:text-xl font-bold text-white">$1,100.00</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-800 border-zinc-700">
            <CardContent className="p-4">
              <div className="text-sm text-zinc-400">Net Profit</div>
              <div className="text-lg sm:text-xl font-bold text-green-500">+$450.00</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
