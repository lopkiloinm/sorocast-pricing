import type { Config } from "tailwindcss"

const sorocastColorNames = ["yellow", "purple", "pink", "green", "red", "blue", "orange", "gray"]
const utilityPrefixes = ["bg", "text", "border", "ring", "from", "to", "via"] // Gradient stops
const shades = ["100", "200", "300", "400", "500", "600", "700", "800", "900", "DEFAULT"]
const opacities = ["10", "20", "25", "30", "40", "50", "60", "70", "75", "80", "90"] // Common opacities

const safelistPatterns = []

// Generate patterns for sorocast colors
utilityPrefixes.forEach((utility) => {
  sorocastColorNames.forEach((color) => {
    // For specific shades like text-sorocast-yellow-500
    shades.forEach((shade) => {
      if (shade === "DEFAULT") {
        // Pattern for default shades (without explicit shade number): text-sorocast-yellow
        safelistPatterns.push({
          pattern: new RegExp(`^${utility}-sorocast-${color}$`),
        })
        // Pattern for default shades with opacity: text-sorocast-yellow/70
        opacities.forEach((opacity) => {
          safelistPatterns.push({
            pattern: new RegExp(`^${utility}-sorocast-${color}/${opacity}$`), // Corrected: No "-DEFAULT" here
          })
        })
      } else {
        // Pattern for numbered shades: text-sorocast-yellow-500
        safelistPatterns.push({
          pattern: new RegExp(`^${utility}-sorocast-${color}-${shade}$`),
        })
        // Pattern for numbered shades with opacity: text-sorocast-yellow-500/70
        opacities.forEach((opacity) => {
          safelistPatterns.push({
            pattern: new RegExp(`^${utility}-sorocast-${color}-${shade}/${opacity}$`),
          })
        })
      }
    })
  })
})

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  safelist: safelistPatterns, // Use the correctly structured safelist
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sorocast: {
          yellow: {
            DEFAULT: "#F59E0B",
            "100": "#FFFBEB",
            "200": "#FEF3C7",
            "300": "#FDE68A",
            "400": "#FCD34D",
            "500": "#F59E0B",
            "600": "#D97706",
            "700": "#B45309",
            "800": "#92400E",
            "900": "#78350F",
          },
          purple: {
            DEFAULT: "#8B5CF6",
            "100": "#F5F3FF",
            "200": "#EDE9FE",
            "300": "#DDD6FE",
            "400": "#C4B5FD",
            "500": "#8B5CF6",
            "600": "#7C3AED",
            "700": "#6D28D9",
            "800": "#5B21B6",
            "900": "#4C1D95",
          },
          pink: {
            DEFAULT: "#EC4899",
            "100": "#FFF1F2",
            "200": "#FFE4E6",
            "300": "#FECDD3",
            "400": "#FDA4AF",
            "500": "#EC4899",
            "600": "#DB2777",
            "700": "#BE185D",
            "800": "#9D174D",
            "900": "#831843",
          },
          green: {
            DEFAULT: "#22C55E",
            "100": "#F0FDF4",
            "200": "#DCFCE7",
            "300": "#BBF7D0",
            "400": "#86EFAC",
            "500": "#22C55E",
            "600": "#16A34A",
            "700": "#15803D",
            "800": "#166534",
            "900": "#14532D",
          },
          red: {
            DEFAULT: "#EF4444",
            "100": "#FEF2F2",
            "200": "#FEE2E2",
            "300": "#FECACA",
            "400": "#F87171",
            "500": "#EF4444",
            "600": "#DC2626",
            "700": "#B91C1C",
            "800": "#991B1B",
            "900": "#7F1D1D",
          },
          blue: {
            DEFAULT: "#3B82F6",
            "100": "#EFF6FF",
            "200": "#DBEAFE",
            "300": "#BFDBFE",
            "400": "#93C5FD",
            "500": "#3B82F6",
            "600": "#2563EB",
            "700": "#1D4ED8",
            "800": "#1E40AF",
            "900": "#1E3A8A",
          },
          orange: {
            DEFAULT: "#F97316",
            "100": "#FFF7ED",
            "200": "#FFEDD5",
            "300": "#FED7AA",
            "400": "#FDBA74",
            "500": "#F97316",
            "600": "#EA580C",
            "700": "#C2410C",
            "800": "#9A3412",
            "900": "#7C2D12",
          },
          gray: {
            DEFAULT: "#6B7280",
            "100": "#F3F4F6",
            "200": "#E5E7EB",
            "300": "#D1D5DB",
            "400": "#9CA3AF",
            "500": "#6B7280",
            "600": "#4B5563",
            "700": "#374151",
            "800": "#1F2937",
            "900": "#111827",
          },
        },
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "pulse-slow-1": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
        "pulse-slow-2": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.03)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-slow-1": "pulse-slow-1 10s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-slow-2": "pulse-slow-2 12s cubic-bezier(0.4, 0, 0.6, 1) infinite 2s",
      },
      backgroundImage: { "radial-gradient": "radial-gradient(circle, var(--tw-gradient-stops))" },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
