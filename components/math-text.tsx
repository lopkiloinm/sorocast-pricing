"use client"

import { useEffect, useRef } from "react"

interface MathTextProps {
  children: string
  display?: boolean
  className?: string
}

export function MathText({ children, display = false, className = "" }: MathTextProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (ref.current && window.MathJax) {
      window.MathJax.typesetClear([ref.current])
      window.MathJax.typesetPromise([ref.current]).catch((e: any) => console.error("MathJax error:", e))
    }
  }, [children])

  if (display) {
    return (
      <div ref={ref} className={`text-center my-4 ${className}`}>
        {`\\[${children}\\]`}
      </div>
    )
  }

  return (
    <span ref={ref} className={`${className}`}>
      {`\$$${children}\$$`}
    </span>
  )
}
