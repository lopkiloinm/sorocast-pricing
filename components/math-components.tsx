"use client"

import { useEffect, useRef, useState } from "react"

// Define the KaTeX global type
declare global {
  interface Window {
    katex: any
  }
}

// Props for math components
interface MathProps {
  math: string | number
  className?: string
}

// Function to load KaTeX CSS and JS
const loadKatexScript = () => {
  return new Promise<void>((resolve, reject) => {
    // Check if KaTeX is already loaded
    if (window.katex) {
      resolve()
      return
    }

    // Load KaTeX CSS
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
    link.integrity = "sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn"
    link.crossOrigin = "anonymous"
    document.head.appendChild(link)

    // Load KaTeX JS
    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"
    script.integrity = "sha384-cpW21h6RZv/phavutF+AuVYrr+dA8xD9zs6FwLpaCct6O9ctzYFfFr4dgmgccOTx"
    script.crossOrigin = "anonymous"
    script.async = true

    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load KaTeX"))

    document.head.appendChild(script)
  })
}

// Inline Math Component
export function InlineMath({ math, className = "" }: MathProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const renderMath = async () => {
      try {
        await loadKatexScript()

        if (!isMounted || !containerRef.current) return

        window.katex.render(String(math), containerRef.current, {
          throwOnError: false,
          displayMode: false,
          errorColor: "#ff6b6b",
        })
      } catch (err) {
        if (isMounted) {
          console.error("KaTeX rendering error:", err)
          setError("Failed to render math")
        }
      }
    }

    renderMath()

    return () => {
      isMounted = false
    }
  }, [math])

  return (
    <span ref={containerRef} className={`inline-math ${className}`} aria-label={`Math formula: ${math}`}>
      {error ? String(math) : ""}
    </span>
  )
}

// Block Math Component
export function BlockMath({ math, className = "" }: MathProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const renderMath = async () => {
      try {
        await loadKatexScript()

        if (!isMounted || !containerRef.current) return

        window.katex.render(String(math), containerRef.current, {
          throwOnError: false,
          displayMode: true,
          errorColor: "#ff6b6b",
        })
      } catch (err) {
        if (isMounted) {
          console.error("KaTeX rendering error:", err)
          setError("Failed to render math")
        }
      }
    }

    renderMath()

    return () => {
      isMounted = false
    }
  }, [math])

  return (
    <div
      ref={containerRef}
      className={`block-math w-full text-center ${className}`}
      aria-label={`Math formula: ${math}`}
      style={{ display: "block", width: "100%" }}
    >
      {error ? String(math) : ""}
    </div>
  )
}
