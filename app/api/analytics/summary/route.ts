import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const emissions = await prisma.emission.findMany({ orderBy: { timestamp: 'desc' }, take: 90 })

    // compute trend by day (simple grouping)
    const byDay: Record<string, { pm25: number; pm10: number; co2: number; count: number }> = {}
    for (const e of emissions) {
      const day = e.timestamp.toISOString().slice(0, 10)
      if (!byDay[day]) byDay[day] = { pm25: 0, pm10: 0, co2: 0, count: 0 }
      byDay[day].pm25 += e.pm25
      byDay[day].pm10 += e.pm10
      byDay[day].co2 += e.co2
      byDay[day].count += 1
    }

    const trend = Object.entries(byDay).map(([date, vals]) => ({ date, pm25: vals.pm25 / vals.count, pm10: vals.pm10 / vals.count, co2: vals.co2 / vals.count })).sort((a, b) => a.date.localeCompare(b.date))

    const avg = emissions.reduce((acc, e) => ({ pm25: acc.pm25 + e.pm25, pm10: acc.pm10 + e.pm10, co2: acc.co2 + e.co2 }), { pm25: 0, pm10: 0, co2: 0 })
    const count = emissions.length || 1

    const summary = { avgPm25: avg.pm25 / count, avgPm10: avg.pm10 / count, avgCo2: avg.co2 / count }

    return NextResponse.json({ trend, summary })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to compute analytics' }, { status: 500 })
  }
}
