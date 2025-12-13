"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"

export function FilterEfficiencyGauge() {
  const [efficiency, setEfficiency] = useState(87)

  useEffect(() => {
    const interval = setInterval(() => {
      setEfficiency((prev) => {
        const change = (Math.random() - 0.5) * 2
        const newValue = Math.max(70, Math.min(95, prev + change))
        return Math.round(newValue)
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getColor = () => {
    if (efficiency >= 85) return "text-success"
    if (efficiency >= 70) return "text-warning"
    return "text-danger"
  }

  const getStatus = () => {
    if (efficiency >= 85) return "Excellent"
    if (efficiency >= 70) return "Good"
    return "Needs Maintenance"
  }

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-sm font-medium text-muted-foreground mb-6">Filter Efficiency</h3>
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-muted/20"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
              className={getColor()}
              strokeDasharray={`${(efficiency / 100) * 534} 534`}
              style={{ transition: "stroke-dasharray 0.5s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold ${getColor()}`}>{efficiency}%</span>
            <span className="text-sm text-muted-foreground mt-1">{getStatus()}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6 w-full">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Before Filter</div>
            <div className="text-lg font-semibold text-foreground">125 μg/m³</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">After Filter</div>
            <div className="text-lg font-semibold text-success">{Math.round(125 * (1 - efficiency / 100))} μg/m³</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
