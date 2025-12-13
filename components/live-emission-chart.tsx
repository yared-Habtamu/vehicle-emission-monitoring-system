"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface EmissionData {
  time: string
  value: number
}

interface LiveEmissionChartProps {
  title: string
  unit: string
  color: string
  threshold?: number
}

export function LiveEmissionChart({ title, unit, color, threshold }: LiveEmissionChartProps) {
  const [data, setData] = useState<EmissionData[]>([])

  useEffect(() => {
    // Initialize with some data
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (19 - i) * 2000).toLocaleTimeString(),
      value: Math.random() * 50 + 20,
    }))
    setData(initialData)

    // Simulate real-time updates
    const interval = setInterval(() => {
      setData((prev) => {
        const newData = [
          ...prev.slice(1),
          {
            time: new Date().toLocaleTimeString(),
            value: Math.random() * 50 + 20,
          },
        ]
        return newData
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const latestValue = data[data.length - 1]?.value || 0
  const status = threshold && latestValue > threshold ? "warning" : "good"

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-foreground">{latestValue.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            status === "good" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
          }`}
        >
          {status === "good" ? "Good" : "Moderate"}
        </div>
      </div>
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="time" hide />
            <YAxis hide domain={[0, 100]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
                      <p className="text-xs text-muted-foreground">{payload[0].payload.time}</p>
                      <p className="text-sm font-bold text-foreground">
                        {Number(payload[0].value).toFixed(1)} {unit}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
