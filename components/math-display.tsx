"use client"

import { useEffect, useRef } from "react"

interface MathProps {
  math: string
  display?: boolean
  className?: string
}

export function MathDisplay({ math, display = false, className = "" }: MathProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    // Clear any existing content
    ref.current.innerHTML = ""

    // Create the element to render math
    const mathElement = document.createElement(display ? "div" : "span")
    mathElement.textContent = math

    // Add appropriate class for styling
    if (display) {
      mathElement.className = "math-display"
    } else {
      mathElement.className = "math-inline"
    }

    // Append to the container
    ref.current.appendChild(mathElement)

    // Render with MathJax if available
    if (window.MathJax) {
      window.MathJax.typesetPromise([ref.current]).catch((err: any) => console.error("MathJax error:", err))
    }
  }, [math, display])

  return <div ref={ref} className={`${display ? "my-4 text-center" : "inline-block align-middle"} ${className}`} />
}
