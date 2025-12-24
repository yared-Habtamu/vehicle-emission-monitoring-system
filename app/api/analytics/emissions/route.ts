import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    let emissions
    try {
      emissions = await prisma.emission.findMany({ orderBy: { timestamp: 'desc' }, take: 30 })
    } catch (err: any) {
      console.warn('prisma.emission.findMany failed, attempting raw Mongo fallback:', err?.code || err)
      if (err?.code === 'P2023' || err?.code === 'P2031') {
        // raw fetch to avoid Prisma's DateTime conversion issues
        const raw: any = await prisma.$runCommandRaw({ find: 'Emission', filter: {}, sort: { timestamp: -1 }, limit: 30 })
        const batch: any[] = (raw as any)?.cursor?.firstBatch || []
        emissions = batch.map((d: any) => ({
          id: d._id?.toString?.() ?? d._id,
          vehicleId: d.vehicleId,
          timestamp: d.timestamp instanceof Date ? d.timestamp : new Date(d.timestamp),
          pm25: typeof d.pm25 === 'number' ? d.pm25 : Number(d.pm25),
          pm10: typeof d.pm10 === 'number' ? d.pm10 : Number(d.pm10),
          co2: typeof d.co2 === 'number' ? d.co2 : Number(d.co2),
          nh3: d.nh3 == null ? null : (typeof d.nh3 === 'number' ? d.nh3 : Number(d.nh3)),
        }))
      } else {
        throw err
      }
    }
    // map to simple objects and compute a status
    const rows = emissions.map((e) => {
      const pm25 = e.pm25
      let status = 'Good'
      if (pm25 >= 75) status = 'Poor'
      else if (pm25 >= 35) status = 'Moderate'
      return {
        id: e.id,
        vehicleId: e.vehicleId,
        timestamp: e.timestamp?.toISOString(),
        pm25: e.pm25,
        pm10: e.pm10,
        co2: e.co2,
        nh3: e.nh3 ?? null,
        status,
      }
    })
    return NextResponse.json(rows)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch emissions' }, { status: 500 })
  }
}
