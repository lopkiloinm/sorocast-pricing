"use client"

import { useState } from "react"
import { Line, Pie, Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const tickColor = "#E5E7EB" // Light gray for ticks
const gridLineColor = "#52525b" // zinc-600 for grid lines
const axisLineColor = "#71717A" // zinc-500 for axis lines
const legendTextColor = "#E5E7EB" // Light gray for legend text

// Common Tooltip Style
const commonTooltipOptions = {
  backgroundColor: "hsl(var(--popover))", // Dark background
  titleColor: "#FFFFFF", // White title
  bodyColor: "#FFFFFF", // White body
  borderColor: "hsl(var(--border))",
  borderWidth: 1,
  padding: 10,
  cornerRadius: 4,
}

const sorocastYellow = "#EAB308"
const sorocastYellowFill = "rgba(234, 179, 8, 0.8)"
const sorocastYellowAreaFill = "rgba(234, 179, 8, 0.3)"

const sorocastGreen = "#10B981"
const sorocastGreenAreaFill = "rgba(16, 185, 129, 0.3)"

const sorocastRed = "#EF4444"
const sorocastRedFill = "rgba(239, 68, 68, 0.8)"

// --- Profit/Loss Over Time (Area Chart) ---
const monthlyPerformanceData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  datasets: [
    {
      label: "Profit/Loss",
      data: [50, -30, 120, 80, -20, 150, 100],
      borderColor: sorocastYellow,
      backgroundColor: sorocastYellowAreaFill,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: sorocastYellow,
      pointBorderColor: sorocastYellow,
      borderWidth: 2,
    },
  ],
}

const profitLossChartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      ...commonTooltipOptions,
      callbacks: {
        label: (context: any) => `${context.dataset.label}: $${context.parsed.y}`,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: { color: tickColor, font: { size: 12 } },
      border: { color: axisLineColor },
    },
    y: {
      grid: {
        color: gridLineColor,
        borderDash: [3, 3],
      },
      ticks: { color: tickColor, font: { size: 12 } },
      border: { color: axisLineColor },
    },
  },
}

// --- Win Rate (Line Chart) ---
const winRateData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  datasets: [
    {
      label: "Win Rate",
      data: [60, 37.5, 70, 71.4, 50, 75, 66.7],
      borderColor: sorocastGreen,
      backgroundColor: sorocastGreenAreaFill,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: sorocastGreen,
      pointBorderColor: sorocastGreen,
      borderWidth: 2,
    },
  ],
}
const winRateChartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      ...commonTooltipOptions,
      callbacks: { label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y}%` },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: tickColor },
      border: { color: axisLineColor },
    },
    y: {
      grid: { color: gridLineColor, borderDash: [3, 3] },
      ticks: { color: tickColor, callback: (val: any) => `${val}%` },
      border: { color: axisLineColor },
    },
  },
}

// --- Bets by Category (Pie Chart) ---
const categoryPerformance = [
  { name: "Politics", value: 35, profit: 180 },
  { name: "Crypto", value: 25, profit: 120 },
  { name: "Sports", value: 20, profit: -50 },
  { name: "Entertainment", value: 10, profit: 80 },
  { name: "Tech", value: 10, profit: 120 },
]
const PIE_COLORS = ["#EAB308", "#3B82F6", "#EF4444", "#10B981", "#8B5CF6"]

const betsByCategoryData = {
  labels: categoryPerformance.map((c) => c.name),
  datasets: [
    {
      label: "Bets by Category",
      data: categoryPerformance.map((c) => c.value),
      backgroundColor: PIE_COLORS,
      borderWidth: 0, // No border for pie segments
    },
  ],
}
const betsByCategoryOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right",
      labels: {
        color: legendTextColor, // Light legend text
        usePointStyle: true,
        boxWidth: 8,
        padding: 15,
      },
    },
    tooltip: {
      ...commonTooltipOptions,
      callbacks: {
        label: (ctx: any) => {
          const total = ctx.dataset.data.reduce((sum: number, val: number) => sum + val, 0)
          const percentage = ((ctx.parsed / total) * 100).toFixed(1)
          return `${ctx.label}: ${ctx.parsed} (${percentage}%)`
        },
      },
    },
  },
}

// --- Profit by Category (Bar Chart) ---
const profitByCategoryData = {
  labels: categoryPerformance.map((c) => c.name),
  datasets: [
    {
      label: "Profit by Category",
      data: categoryPerformance.map((c) => c.profit),
      backgroundColor: categoryPerformance.map((c) => (c.profit >= 0 ? sorocastYellowFill : sorocastRedFill)),
      borderColor: categoryPerformance.map((c) => (c.profit >= 0 ? sorocastYellow : sorocastRed)),
      borderWidth: 1,
      borderRadius: {
        topLeft: 4,
        topRight: 4,
      },
    },
  ],
}
const profitByCategoryOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      ...commonTooltipOptions,
      callbacks: { label: (ctx: any) => `${ctx.dataset.label}: $${ctx.parsed.y}` },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: tickColor },
      border: { color: axisLineColor },
    },
    y: {
      grid: { color: gridLineColor, borderDash: [3, 3] },
      ticks: { color: tickColor },
      border: { color: axisLineColor },
    },
  },
}

export function PerformanceMetrics({ className }: { className?: string }) {
  const [timeRange, setTimeRange] = useState("3m")

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex justify-end">
        <Tabs defaultValue="3m" value={timeRange} onValueChange={setTimeRange} className="w-full">
          <TabsList className="bg-zinc-900 border border-zinc-800 w-full grid grid-cols-5 h-auto">
            {["1m", "3m", "6m", "1y", "All"].map((val) => (
              <TabsTrigger
                key={val}
                value={val.toLowerCase()}
                className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black py-2 text-sm text-zinc-300"
              >
                {val}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">Profit/Loss Over Time</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-[250px] sm:h-[300px] w-full">
              <Line data={monthlyPerformanceData} options={profitLossChartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">Win Rate</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-[250px] sm:h-[300px] w-full">
              <Line data={winRateData} options={winRateChartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">Bets by Category</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-[250px] sm:h-[300px] w-full">
              <Pie data={betsByCategoryData} options={betsByCategoryOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">Profit by Category</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-[250px] sm:h-[300px] w-full">
              <Bar data={profitByCategoryData} options={profitByCategoryOptions} />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4">
            <div className="text-sm text-zinc-400">Total Bets</div>
            <div className="text-xl sm:text-2xl font-bold text-white">57</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4">
            <div className="text-sm text-zinc-400">Win Rate</div>
            <div className="text-xl sm:text-2xl font-bold text-white">68%</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4">
            <div className="text-sm text-zinc-400">Average Bet Size</div>
            <div className="text-xl sm:text-2xl font-bold text-white">$125.40</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4">
            <div className="text-sm text-zinc-400">ROI</div>
            <div className="text-xl sm:text-2xl font-bold text-green-500">+18.5%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
