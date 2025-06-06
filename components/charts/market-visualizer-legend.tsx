import type React from "react"
import { forwardRef } from "react"

interface LegendItemData {
  name: string
  color: string
  dashed?: boolean
}

interface MarketVisualizerLegendProps {
  data: LegendItemData[]
  layout: "horizontal" | "stacked"
  fontSize?: string
}

export const MarketVisualizerLegend = forwardRef<HTMLUListElement, MarketVisualizerLegendProps>(
  ({ data, layout, fontSize = "11px" }, ref) => {
    const isStacked = layout === "stacked"

    const legendStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: isStacked ? "column" : "row",
      flexWrap: layout === "horizontal" ? "wrap" : "nowrap",
      justifyContent: layout === "horizontal" ? "center" : "flex-start",
      alignItems: layout === "horizontal" ? "center" : "flex-start",
      listStyle: "none",
      padding: "0 16px", // Internal padding for legend content
      margin: "8px 0 12px 0", // Margin around the legend block
    }

    const itemStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      marginRight: layout === "horizontal" ? "20px" : "0",
      marginBottom: "6px",
      minWidth: "auto",
    }

    const lineElementStyle: React.CSSProperties = {
      width: "20px",
      height: "2px",
      marginRight: "8px",
      display: "inline-block",
      verticalAlign: "middle",
      flexShrink: 0, // Prevent line from shrinking
    }

    return (
      <ul style={legendStyle} ref={ref}>
        {data.map((item, index) => (
          <li
            key={item.name}
            style={{
              ...itemStyle,
              // Remove bottom margin from the very last item to prevent double margin with container
              marginBottom: index === data.length - 1 ? "0" : "6px",
            }}
          >
            <span
              style={{
                ...lineElementStyle,
                backgroundColor: item.dashed ? "transparent" : item.color,
                borderTop: item.dashed ? `2px dashed ${item.color}` : "none",
              }}
            />
            <span style={{ fontSize: fontSize, color: "rgb(228 228 231)", whiteSpace: "nowrap" }}>{item.name}</span>
          </li>
        ))}
      </ul>
    )
  },
)

MarketVisualizerLegend.displayName = "MarketVisualizerLegend"
