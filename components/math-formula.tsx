"use client"

interface MathFormulaProps {
  formula: string
  display?: boolean
  className?: string
}

export function MathFormula({ formula, display = false, className = "" }: MathFormulaProps) {
  // Simple component that renders math formulas with styled text
  // No external libraries required
  return (
    <div className={`font-mono ${display ? "text-center my-6 block" : "inline-block"} text-yellow-500 ${className}`}>
      {formula}
    </div>
  )
}
