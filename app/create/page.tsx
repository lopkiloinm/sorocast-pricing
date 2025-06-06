"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowRight,
  BarChart,
  Check,
  ChevronRight,
  HelpCircle,
  Info,
  Plus,
  Shield,
  Tag,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function CreateMarketPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [marketType, setMarketType] = useState<"binary" | "categorical" | "range">("binary")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    endDate: "",
    resolutionSource: "",
    liquidityPool: 1000,
    creatorFee: 2.0,
    allowAdditionalOptions: false,
    options: [
      { name: "Yes", initialProbability: 50 },
      { name: "No", initialProbability: 50 },
    ],
    ranges: [
      { min: "", max: "", initialProbability: 20 },
      { min: "", max: "", initialProbability: 20 },
      { min: "", max: "", initialProbability: 20 },
      { min: "", max: "", initialProbability: 20 },
      { min: "", max: "", initialProbability: 20 },
    ],
    unit: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleOptionChange = (index: number, field: string, value: string | number) => {
    const newOptions = [...formData.options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    setFormData({ ...formData, options: newOptions })
  }

  const handleRangeChange = (index: number, field: string, value: string | number) => {
    const newRanges = [...formData.ranges]
    newRanges[index] = { ...newRanges[index], [field]: value }
    setFormData({ ...formData, ranges: newRanges })
  }

  const addOption = () => {
    // Recalculate probabilities to make room for new option
    const currentOptions = [...formData.options]
    const newProbability = Math.floor(100 / (currentOptions.length + 1))
    const adjustedOptions = currentOptions.map((option) => ({
      ...option,
      initialProbability: newProbability,
    }))

    adjustedOptions.push({ name: "", initialProbability: newProbability })
    setFormData({ ...formData, options: adjustedOptions })
  }

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) return // Minimum 2 options

    const newOptions = [...formData.options]
    newOptions.splice(index, 1)

    // Redistribute probabilities
    const newProbability = Math.floor(100 / newOptions.length)
    const adjustedOptions = newOptions.map((option) => ({
      ...option,
      initialProbability: newProbability,
    }))

    setFormData({ ...formData, options: adjustedOptions })
  }

  const validateStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() !== "" && formData.description.trim() !== "" && formData.category !== ""
      case 2:
        if (marketType === "binary") {
          return true // Binary options are pre-filled
        } else if (marketType === "categorical") {
          return formData.options.every((option) => option.name.trim() !== "")
        } else if (marketType === "range") {
          return (
            formData.ranges.every(
              (range) => range.min.toString().trim() !== "" && range.max.toString().trim() !== "",
            ) && formData.unit.trim() !== ""
          )
        }
        return false
      case 3:
        return formData.endDate !== "" && formData.resolutionSource.trim() !== ""
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const handleSubmit = () => {
    // Here you would submit the market creation transaction to the blockchain
    // For now, we'll just simulate success and redirect
    console.log("Market creation data:", formData)

    // Redirect to a success page or back to markets
    router.push("/markets")
  }

  const totalProbability = () => {
    if (marketType === "categorical") {
      return formData.options.reduce((sum, option) => sum + option.initialProbability, 0)
    } else if (marketType === "range") {
      return formData.ranges.reduce((sum, range) => sum + range.initialProbability, 0)
    }
    return 100 // Binary is always 100
  }

  // Calculate progress bar width based on step
  const getProgressWidth = () => {
    if (step === 1) return "0%"
    if (step === 2) return "20%"
    if (step === 3) return "40%"
    if (step === 4) return "60%"
    if (step === 5) return "80%"
    return "0%"
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      <main className="flex-1">
        <div className="container px-4 py-6 md:px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Create a Market</h1>
            <p className="text-zinc-400">Set up a new prediction market on Sorocast</p>

            {/* Step Progress Bar */}
            <div className="mt-6 mb-8">
              {/* Stake Requirement Banner */}
              <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-yellow-500 mr-2" />
                  <span className="text-sm text-yellow-500">1000 XLM stake required to create a market</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="ml-auto -mr-2 h-8 w-8 p-0 text-zinc-400">
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-800 text-white border-zinc-700">
                        <p className="max-w-[200px]">
                          Creating a market requires a 1000 XLM stake to ensure quality markets and prevent spam. This
                          stake is returned when the market resolves correctly.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Simple Progress Bar */}
              <div className="relative mb-4">
                {/* Step circles with labels */}
                <div className="flex justify-between relative">
                  {["Info", "Options", "Resolution", "Economics", "Review"].map((label, index) => {
                    const stepNum = index + 1
                    const isActive = step === stepNum
                    const isCompleted = step > stepNum

                    return (
                      <div key={index} className="flex flex-col items-center relative" style={{ width: "20%" }}>
                        {/* Circle */}
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full border-2 mb-1 z-10
            ${
              isCompleted
                ? "bg-yellow-500 border-yellow-500 text-black"
                : isActive
                  ? "border-yellow-500 bg-zinc-900 text-yellow-500"
                  : "border-zinc-700 bg-zinc-900 text-zinc-500"
            }`}
                        >
                          {isCompleted ? <Check className="h-4 w-4" /> : <span className="text-xs">{stepNum}</span>}
                        </div>

                        {/* Label */}
                        <span
                          className={`text-xs ${isActive ? "block" : "hidden sm:block"} 
            ${isCompleted ? "text-yellow-500" : isActive ? "text-white" : "text-zinc-500"}`}
                        >
                          {label}
                        </span>
                      </div>
                    )
                  })}

                  {/* Progress line - positioned to align with circle centers */}
                  <div className="absolute top-4 left-0 w-full h-0.5 -translate-y-1/2 bg-zinc-700">
                    <div
                      className="h-full bg-yellow-500 transition-all duration-300"
                      style={{ width: getProgressWidth() }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Main content area */}
            <div>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">
                    {step === 1 && "Basic Information"}
                    {step === 2 && "Market Options"}
                    {step === 3 && "Resolution Details"}
                    {step === 4 && "Market Economics"}
                    {step === 5 && "Review & Create"}
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    {step === 1 && "Define what your market is about"}
                    {step === 2 && "Set up the possible outcomes for your market"}
                    {step === 3 && "Specify when and how your market will resolve"}
                    {step === 4 && "Configure the economic parameters of your market"}
                    {step === 5 && "Review all details before creating your market"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Step 1: Basic Information */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-white">
                          Market Title
                        </Label>
                        <Input
                          id="title"
                          name="title"
                          placeholder="e.g., Will Bitcoin exceed $100,000 by end of 2024?"
                          className="bg-zinc-800 border-zinc-700 text-white"
                          value={formData.title}
                          onChange={handleInputChange}
                        />
                        <p className="text-xs text-zinc-400">
                          Clear, specific titles perform better. Aim for 10-15 words.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-white">
                          Market Description
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Provide details about this market, including how it will be resolved..."
                          className="bg-zinc-800 border-zinc-700 text-white min-h-[120px]"
                          value={formData.description}
                          onChange={handleInputChange}
                        />
                        <p className="text-xs text-zinc-400">
                          Include all relevant details that traders need to know. Be specific about what constitutes a
                          valid outcome.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-white">
                          Category
                        </Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                            <SelectItem value="politics">Politics</SelectItem>
                            <SelectItem value="crypto">Crypto</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="sports">Sports</SelectItem>
                            <SelectItem value="entertainment">Entertainment</SelectItem>
                            <SelectItem value="tech">Tech</SelectItem>
                            <SelectItem value="science">Science</SelectItem>
                            <SelectItem value="climate">Climate</SelectItem>
                            <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-zinc-400">
                          Categorizing your market helps traders find it more easily.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Market Type</Label>
                        <RadioGroup
                          value={marketType}
                          onValueChange={(value) => setMarketType(value as "binary" | "categorical" | "range")}
                          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                        >
                          <div
                            className={`flex flex-col items-center justify-between rounded-lg border p-4 ${
                              marketType === "binary"
                                ? "border-yellow-500 bg-yellow-500/10"
                                : "border-zinc-700 bg-zinc-800"
                            }`}
                          >
                            <RadioGroupItem value="binary" id="binary" className="sr-only" />
                            <Label
                              htmlFor="binary"
                              className="flex flex-col items-center justify-between cursor-pointer"
                            >
                              <div className="mb-2 rounded-full bg-yellow-500/20 p-2">
                                <Check className="h-4 w-4 text-yellow-500" />
                              </div>
                              <div className="font-medium text-white">Binary</div>
                              <div className="text-xs text-center text-zinc-400 mt-1">Yes/No outcomes</div>
                            </Label>
                          </div>

                          <div
                            className={`flex flex-col items-center justify-between rounded-lg border p-4 ${
                              marketType === "categorical"
                                ? "border-yellow-500 bg-yellow-500/10"
                                : "border-zinc-700 bg-zinc-800"
                            }`}
                          >
                            <RadioGroupItem value="categorical" id="categorical" className="sr-only" />
                            <Label
                              htmlFor="categorical"
                              className="flex flex-col items-center justify-between cursor-pointer"
                            >
                              <div className="mb-2 rounded-full bg-yellow-500/20 p-2">
                                <Tag className="h-4 w-4 text-yellow-500" />
                              </div>
                              <div className="font-medium text-white">Categorical</div>
                              <div className="text-xs text-center text-zinc-400 mt-1">Multiple options</div>
                            </Label>
                          </div>

                          <div
                            className={`flex flex-col items-center justify-between rounded-lg border p-4 ${
                              marketType === "range"
                                ? "border-yellow-500 bg-yellow-500/10"
                                : "border-zinc-700 bg-zinc-800"
                            }`}
                          >
                            <RadioGroupItem value="range" id="range" className="sr-only" />
                            <Label
                              htmlFor="range"
                              className="flex flex-col items-center justify-between cursor-pointer"
                            >
                              <div className="mb-2 rounded-full bg-yellow-500/20 p-2">
                                <BarChart className="h-4 w-4 text-yellow-500" />
                              </div>
                              <div className="font-medium text-white">Range</div>
                              <div className="text-xs text-center text-zinc-400 mt-1">Numeric ranges</div>
                            </Label>
                          </div>
                        </RadioGroup>
                        <p className="text-xs text-zinc-400">
                          The type of market determines how outcomes are structured.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Market Options */}
                  {step === 2 && (
                    <div className="space-y-6">
                      {marketType === "binary" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-white">Binary Options</h3>
                            <div className="text-sm text-zinc-400">Total: {totalProbability()}%</div>
                          </div>

                          <div className="space-y-4">
                            {formData.options.map((option, index) => (
                              <div key={index} className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                  <div className="flex-1">
                                    <Label htmlFor={`option-${index}`} className="text-white mb-2 block">
                                      Option Name
                                    </Label>
                                    <Input
                                      id={`option-${index}`}
                                      value={option.name}
                                      onChange={(e) => handleOptionChange(index, "name", e.target.value)}
                                      className="bg-zinc-700 border-zinc-600 text-white"
                                      disabled={index < 2} // Yes/No can't be changed for binary
                                    />
                                  </div>
                                  <div className="w-full sm:w-32">
                                    <Label htmlFor={`probability-${index}`} className="text-white mb-2 block">
                                      Initial %
                                    </Label>
                                    <Input
                                      id={`probability-${index}`}
                                      type="number"
                                      min="1"
                                      max="99"
                                      value={option.initialProbability}
                                      onChange={(e) => {
                                        const newValue = Number.parseInt(e.target.value)
                                        if (isNaN(newValue)) return

                                        // For binary, automatically adjust the other option
                                        if (index === 0) {
                                          handleOptionChange(0, "initialProbability", newValue)
                                          handleOptionChange(1, "initialProbability", 100 - newValue)
                                        } else {
                                          handleOptionChange(1, "initialProbability", newValue)
                                          handleOptionChange(0, "initialProbability", 100 - newValue)
                                        }
                                      }}
                                      className="bg-zinc-700 border-zinc-600 text-white"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                            <div className="flex items-center">
                              <Info className="h-5 w-5 text-yellow-500 mr-2" />
                              <p className="text-sm text-zinc-400">
                                Binary markets have fixed Yes/No options. Initial probabilities must sum to 100%.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {marketType === "categorical" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-white">Categorical Options</h3>
                            <div
                              className={`text-sm ${totalProbability() === 100 ? "text-green-500" : "text-red-500"}`}
                            >
                              Total: {totalProbability()}%
                            </div>
                          </div>

                          <div className="space-y-4">
                            {formData.options.map((option, index) => (
                              <div key={index} className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                  <div className="flex-1">
                                    <Label htmlFor={`option-${index}`} className="text-white mb-2 block">
                                      Option Name
                                    </Label>
                                    <Input
                                      id={`option-${index}`}
                                      value={option.name}
                                      onChange={(e) => handleOptionChange(index, "name", e.target.value)}
                                      placeholder={`Option ${index + 1}`}
                                      className="bg-zinc-700 border-zinc-600 text-white"
                                    />
                                  </div>
                                  <div className="w-full sm:w-32">
                                    <Label htmlFor={`probability-${index}`} className="text-white mb-2 block">
                                      Initial %
                                    </Label>
                                    <Input
                                      id={`probability-${index}`}
                                      type="number"
                                      min="1"
                                      max="99"
                                      value={option.initialProbability}
                                      onChange={(e) => {
                                        const newValue = Number.parseInt(e.target.value)
                                        if (isNaN(newValue)) return
                                        handleOptionChange(index, "initialProbability", newValue)
                                      }}
                                      className="bg-zinc-700 border-zinc-600 text-white"
                                    />
                                  </div>
                                  <div className="flex items-end">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeOption(index)}
                                      disabled={formData.options.length <= 2}
                                      className="text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={addOption}
                            className="w-full border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-yellow-500"
                          >
                            <Plus className="mr-2 h-4 w-4" /> Add Option
                          </Button>

                          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                            <div className="flex items-center">
                              <Info className="h-5 w-5 text-yellow-500 mr-2" />
                              <p className="text-sm text-zinc-400">
                                Categorical markets allow multiple options. Initial probabilities should sum to 100%.
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="allowAdditionalOptions"
                                checked={formData.allowAdditionalOptions}
                                onChange={(e) => setFormData({ ...formData, allowAdditionalOptions: e.target.checked })}
                                className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-yellow-500"
                              />
                              <Label htmlFor="allowAdditionalOptions" className="ml-2 text-white">
                                Allow users to add more options after market creation
                              </Label>
                            </div>
                            <p className="text-xs text-zinc-400 ml-6">
                              This allows the community to add missing options, but may dilute liquidity across more
                              outcomes.
                            </p>
                          </div>
                        </div>
                      )}

                      {marketType === "range" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-white">Range Options</h3>
                            <div
                              className={`text-sm ${totalProbability() === 100 ? "text-green-500" : "text-red-500"}`}
                            >
                              Total: {totalProbability()}%
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="unit" className="text-white">
                              Unit
                            </Label>
                            <Input
                              id="unit"
                              name="unit"
                              placeholder="e.g., USD, points, degrees, etc."
                              className="bg-zinc-800 border-zinc-700 text-white"
                              value={formData.unit}
                              onChange={handleInputChange}
                            />
                            <p className="text-xs text-zinc-400">
                              Specify the unit of measurement for your ranges (e.g., USD for price predictions).
                            </p>
                          </div>

                          <div className="space-y-4">
                            {formData.ranges.map((range, index) => (
                              <div key={index} className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                  <div className="w-full sm:w-1/3">
                                    <Label htmlFor={`min-${index}`} className="text-white mb-2 block">
                                      Min Value
                                    </Label>
                                    <Input
                                      id={`min-${index}`}
                                      value={range.min}
                                      onChange={(e) => handleRangeChange(index, "min", e.target.value)}
                                      placeholder={index === 0 ? "Below" : ""}
                                      className="bg-zinc-700 border-zinc-600 text-white"
                                    />
                                  </div>
                                  <div className="w-full sm:w-1/3">
                                    <Label htmlFor={`max-${index}`} className="text-white mb-2 block">
                                      Max Value
                                    </Label>
                                    <Input
                                      id={`max-${index}`}
                                      value={range.max}
                                      onChange={(e) => handleRangeChange(index, "max", e.target.value)}
                                      placeholder={index === formData.ranges.length - 1 ? "Above" : ""}
                                      className="bg-zinc-700 border-zinc-600 text-white"
                                    />
                                  </div>
                                  <div className="w-full sm:w-1/4">
                                    <Label htmlFor={`probability-${index}`} className="text-white mb-2 block">
                                      Initial %
                                    </Label>
                                    <Input
                                      id={`probability-${index}`}
                                      type="number"
                                      min="1"
                                      max="99"
                                      value={range.initialProbability}
                                      onChange={(e) => {
                                        const newValue = Number.parseInt(e.target.value)
                                        if (isNaN(newValue)) return
                                        handleRangeChange(index, "initialProbability", newValue)
                                      }}
                                      className="bg-zinc-700 border-zinc-600 text-white"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                            <div className="flex items-center">
                              <Info className="h-5 w-5 text-yellow-500 mr-2" />
                              <p className="text-sm text-zinc-400">
                                Range markets divide a numeric outcome into brackets. For the first range, leave the min
                                blank for "Below X". For the last range, leave max blank for "Above Y".
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Resolution Details */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="endDate" className="text-white">
                          Market End Date
                        </Label>
                        <div className="w-56">
                          <Input
                            id="endDate"
                            name="endDate"
                            type="datetime-local"
                            step="60" // This sets the step to 60 seconds (1 minute)
                            className="bg-zinc-800 border-zinc-700 text-white w-full"
                            value={formData.endDate}
                            onChange={handleInputChange}
                          />
                        </div>
                        <p className="text-xs text-zinc-400">
                          Trading will end at this date and time (minute precision). Choose a specific moment when the
                          outcome will be known.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="resolutionSource" className="text-white">
                          Resolution Source
                        </Label>
                        <Textarea
                          id="resolutionSource"
                          name="resolutionSource"
                          placeholder="Specify exactly how this market will be resolved..."
                          className="bg-zinc-800 border-zinc-700 text-white min-h-[120px]"
                          value={formData.resolutionSource}
                          onChange={handleInputChange}
                        />
                        <p className="text-xs text-zinc-400">
                          Clearly define the exact source that will be used to determine the outcome. Include links to
                          official sources when possible.
                        </p>
                      </div>

                      <div className="rounded-lg border border-zinc-700 bg-yellow-500/10 p-4">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-white mb-1">Resolution Importance</h4>
                            <p className="text-sm text-zinc-400">
                              Clear resolution criteria are essential for market integrity. Your 1000 XLM stake will be
                              returned when the market resolves according to the specified criteria. Ambiguous or
                              manipulated markets may result in loss of stake.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Market Economics */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="liquidityPool" className="text-white">
                            Initial Liquidity Pool (XLM)
                          </Label>
                          <span className="text-sm text-zinc-400">Min: 1000 XLM</span>
                        </div>
                        <Input
                          id="liquidityPool"
                          name="liquidityPool"
                          type="number"
                          min="1000"
                          step="100"
                          className="bg-zinc-800 border-zinc-700 text-white"
                          value={formData.liquidityPool}
                          onChange={handleInputChange}
                        />
                        <p className="text-xs text-zinc-400">
                          This amount will be used to bootstrap the market's liquidity pool. Higher liquidity allows for
                          larger trades with less price impact.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="creatorFee" className="text-white">
                            Creator Fee (%)
                          </Label>
                          <span className="text-sm text-zinc-400">Max: 5%</span>
                        </div>
                        <Input
                          id="creatorFee"
                          name="creatorFee"
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          className="bg-zinc-800 border-zinc-700 text-white"
                          value={formData.creatorFee}
                          onChange={handleInputChange}
                        />
                        <p className="text-xs text-zinc-400">
                          You'll earn this percentage of all trading volume in your market. Higher fees may discourage
                          trading.
                        </p>
                      </div>

                      <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4 space-y-4">
                        <h3 className="font-medium text-white">Market Creation Costs</h3>

                        <div className="flex justify-between py-2 border-b border-zinc-700">
                          <span className="text-zinc-400">Required Stake</span>
                          <span className="text-white font-medium">1,000 XLM</span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-zinc-700">
                          <span className="text-zinc-400">Initial Liquidity</span>
                          <span className="text-white font-medium">{formData.liquidityPool.toLocaleString()} XLM</span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-zinc-700">
                          <span className="text-zinc-400">Network Fee</span>
                          <span className="text-white font-medium">~0.1 XLM</span>
                        </div>

                        <div className="flex justify-between py-2 font-medium">
                          <span className="text-yellow-500">Total Required</span>
                          <span className="text-yellow-500">
                            {(1000 + Number(formData.liquidityPool) + 0.1).toLocaleString()} XLM
                          </span>
                        </div>
                      </div>

                      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                        <div className="flex items-start">
                          <Info className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-white mb-1">Economic Incentives</h4>
                            <p className="text-sm text-zinc-400">
                              The 1000 XLM stake ensures you have skin in the game and incentivizes proper market
                              resolution. You'll earn trading fees on all volume, and your liquidity pool will earn fees
                              from price movements.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Review & Create */}
                  {step === 5 && (
                    <div className="space-y-6">
                      <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4 space-y-4">
                        <h3 className="font-medium text-white">Market Details</h3>

                        <div className="space-y-2">
                          <h4 className="text-sm text-zinc-400">Title</h4>
                          <p className="text-white">{formData.title}</p>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm text-zinc-400">Description</h4>
                          <p className="text-white">{formData.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="text-sm text-zinc-400">Category</h4>
                            <p className="text-white capitalize">{formData.category}</p>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm text-zinc-400">Market Type</h4>
                            <p className="text-white capitalize">{marketType}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm text-zinc-400">End Date</h4>
                          <p className="text-white">{new Date(formData.endDate).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4 space-y-4">
                        <h3 className="font-medium text-white">Outcome Options</h3>

                        {marketType === "binary" && (
                          <div className="space-y-2">
                            {formData.options.map((option, index) => (
                              <div
                                key={index}
                                className="flex justify-between py-2 border-b border-zinc-700 last:border-0"
                              >
                                <span className="text-white">{option.name}</span>
                                <span className="text-yellow-500">{option.initialProbability}%</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {marketType === "categorical" && (
                          <div className="space-y-2">
                            {formData.options.map((option, index) => (
                              <div
                                key={index}
                                className="flex justify-between py-2 border-b border-zinc-700 last:border-0"
                              >
                                <span className="text-white">{option.name}</span>
                                <span className="text-yellow-500">{option.initialProbability}%</span>
                              </div>
                            ))}
                            <div className="pt-2 text-sm text-zinc-400">
                              {formData.allowAdditionalOptions
                                ? "Users can add more options after creation"
                                : "No additional options can be added"}
                            </div>
                          </div>
                        )}

                        {marketType === "range" && (
                          <div className="space-y-2">
                            {formData.ranges.map((range, index) => (
                              <div
                                key={index}
                                className="flex justify-between py-2 border-b border-zinc-700 last:border-0"
                              >
                                <span className="text-white">
                                  {range.min === "" ? "Below " : ""}
                                  {range.min !== "" ? `${range.min} - ` : ""}
                                  {range.max !== "" ? range.max : "Above"}
                                  {" " + formData.unit}
                                </span>
                                <span className="text-yellow-500">{range.initialProbability}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4 space-y-4">
                        <h3 className="font-medium text-white">Economics</h3>

                        <div className="flex justify-between py-2 border-b border-zinc-700">
                          <span className="text-zinc-400">Required Stake</span>
                          <span className="text-white">1,000 XLM</span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-zinc-700">
                          <span className="text-zinc-400">Initial Liquidity</span>
                          <span className="text-white">{formData.liquidityPool.toLocaleString()} XLM</span>
                        </div>

                        <div className="flex justify-between py-2">
                          <span className="text-zinc-400">Creator Fee</span>
                          <span className="text-white">{formData.creatorFee}%</span>
                        </div>
                      </div>

                      <div className="rounded-lg border border-zinc-700 bg-yellow-500/10 p-4">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-white mb-1">Final Confirmation</h4>
                            <p className="text-sm text-zinc-400">
                              By creating this market, you're committing to properly resolve it according to the
                              specified criteria. Your stake of 1000 XLM will be locked until resolution. This action
                              cannot be undone.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t border-zinc-800 pt-4 flex justify-between">
                  <div>
                    {step > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="border-zinc-700 text-white hover:bg-zinc-800"
                      >
                        Back
                      </Button>
                    )}
                  </div>
                  <div>
                    {step < 5 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={!validateStep(step)}
                        className="bg-yellow-500 text-black hover:bg-yellow-400 disabled:opacity-50"
                      >
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        className="bg-yellow-500 text-black hover:bg-yellow-400"
                      >
                        Create Market <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
