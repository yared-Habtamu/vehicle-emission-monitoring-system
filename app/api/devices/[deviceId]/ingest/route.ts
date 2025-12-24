import { NextResponse } from "next/server"
import prisma from '@/lib/prisma'
import { randomUUID } from 'crypto'

type IngestPayload = {
  timestamp?: string
  pm25?: number
  pm10?: number
  co2?: number
  nh3?: number
  pm25_before?: number
  pm10_before?: number
  temperature?: number
  humidity?: number
}

export async function POST(req: Request, context: { params: any }) {
  try {
    let params = context.params
    // Next may provide params as a Promise in some runtimes; unwrap if so
    if (params && typeof params.then === 'function') params = await params
    const deviceId = params?.deviceId
    if (!deviceId) return NextResponse.json({ error: 'Missing deviceId in params' }, { status: 400 })
    const body: IngestPayload = await req.json()

    // basic validation
    const timestamp = body.timestamp ? new Date(body.timestamp) : new Date()
    if (Number.isNaN(timestamp.getTime())) return NextResponse.json({ error: 'Invalid timestamp' }, { status: 400 })
    // support idempotency/read-back by using a sampleId; generate one if not provided
    const sampleId = (body as any).sampleId ?? randomUUID()

    // map device -> vehicle
    const vehicle = await prisma.vehicle.findUnique({ where: { deviceId } })
    if (!vehicle) return NextResponse.json({ error: 'Unknown device', code: 'UNKNOWN_DEVICE' }, { status: 404 })

    // authenticate device via API key (x-device-key header or body.deviceKey)
    const providedKey = (req.headers.get('x-device-key')) || (body as any).deviceKey
    if (!providedKey) return NextResponse.json({ error: 'Missing device key', code: 'MISSING_KEY' }, { status: 401 })
    // lookup device key; use raw find fallback to avoid Prisma DateTime/column conversion failures
    let keyRec: any = null
    try {
      keyRec = await (prisma as any).deviceKey.findUnique({ where: { key: providedKey } })
    } catch (kErr) {
      console.warn('prisma.deviceKey.findUnique failed, attempting raw find fallback:', kErr)
      try {
        const raw: any = await prisma.$runCommandRaw({ find: 'DeviceKey', filter: { key: providedKey }, limit: 1 })
        const first = (raw as any)?.cursor?.firstBatch?.[0]
        if (first) keyRec = { id: first._id?.toString?.() ?? first._id, vehicleId: first.vehicleId, key: first.key, createdAt: first.createdAt }
      } catch (rawErr) {
        console.warn('Raw deviceKey find failed', rawErr)
      }
    }
    if (!keyRec || keyRec.vehicleId !== vehicle.id) return NextResponse.json({ error: 'Invalid device key', code: 'INVALID_KEY' }, { status: 401 })

    // idempotency: if sampleId present and emission already exists, return it
    if (sampleId) {
      try {
        const rawFind: any = await prisma.$runCommandRaw({ find: 'Emission', filter: { sampleId } })
        const existing = (rawFind as any)?.cursor?.firstBatch?.[0]
        if (existing) {
          // construct usable emission object and return 200 idempotent response
          const existingObj = {
            id: existing._id?.toString?.() ?? existing._id,
            vehicleId: existing.vehicleId,
            deviceId: existing.deviceId,
            sampleId: existing.sampleId,
            pm25: Number(existing.pm25),
            pm10: Number(existing.pm10),
            co2: Number(existing.co2),
            nh3: existing.nh3 == null ? null : Number(existing.nh3),
            timestamp: existing.timestamp instanceof Date ? existing.timestamp : new Date(existing.timestamp),
            metrics: existing.metrics,
          }
          return NextResponse.json({ success: true, emission: existingObj }, { status: 200 })
        }
          } catch (rbErr) {
            console.warn('Idempotent raw find failed', rbErr)
      }
    }

    const pm25 = body.pm25 ?? body.pm25_before ?? null
    const pm10 = body.pm10 ?? body.pm10_before ?? null
    const co2 = body.co2 ?? null
    if (pm25 == null || pm10 == null || co2 == null) return NextResponse.json({ error: 'Missing required readings (pm25, pm10, co2)' }, { status: 400 })

    let emission
    try {
      emission = await prisma.emission.create({
        data: {
          vehicleId: vehicle.id,
          deviceId,
          sampleId,
          pm25: Number(pm25),
          pm10: Number(pm10),
          co2: Number(co2),
          nh3: body.nh3 == null ? null : Number(body.nh3),
          timestamp,
          metrics: body as any,
        },
      })
    } catch (createErr: any) {
      console.warn('Prisma emission.create failed, attempting raw Mongo insert fallback:', createErr?.code || createErr)
      if (createErr?.code === 'P2031') {
        try {
          const insertRes = await prisma.$runCommandRaw({ insert: 'Emission', documents: [{ vehicleId: vehicle.id, deviceId, sampleId, pm25: Number(pm25), pm10: Number(pm10), co2: Number(co2), nh3: body.nh3 == null ? null : Number(body.nh3), timestamp, metrics: body }] })
          // try to read back by sampleId first to be deterministic
          try {
            // Prefer raw find to avoid Prisma DateTime conversion issues after a raw insert
            const rawFind: any = await prisma.$runCommandRaw({ find: 'Emission', filter: { sampleId } })
            const first = (rawFind as any)?.cursor?.firstBatch?.[0]
            if (first) {
              emission = {
                id: first._id?.toString?.() ?? first._id,
                vehicleId: first.vehicleId,
                deviceId: first.deviceId,
                sampleId: first.sampleId,
                pm25: Number(first.pm25),
                pm10: Number(first.pm10),
                co2: Number(first.co2),
                nh3: first.nh3 == null ? null : Number(first.nh3),
                timestamp: first.timestamp instanceof Date ? first.timestamp : new Date(first.timestamp),
                metrics: first.metrics,
              } as any
            }
          } catch (rbErr) {
            console.warn('Raw find by sampleId failed', rbErr)
          }
          if (!emission) {
            // fall back to a broader Prisma search if safe
            emission = await prisma.emission.findFirst({ where: { vehicleId: vehicle.id, pm25: Number(pm25) }, orderBy: { timestamp: 'desc' } }).catch(() => null)
          }
          if (!emission) {
            // fallback to a constructed object so downstream logic doesn't crash
            emission = { id: null, vehicleId: vehicle.id, deviceId, sampleId, pm25: Number(pm25), pm10: Number(pm10), co2: Number(co2), nh3: body.nh3 == null ? null : Number(body.nh3), timestamp, metrics: body } as any
            console.warn('Could not read back emission after raw insert. Continuing with constructed emission object.', insertRes)
          }
        } catch (inner) {
          console.error('Fallback emission insert failed', inner)
          throw inner
        }
      } else {
        throw createErr
      }
    }

    // Recalculate vehicle stats
    const all = await prisma.emission.findMany({ where: { vehicleId: vehicle.id } })
    const avgPm25 = all.length ? all.reduce((s, e) => s + e.pm25, 0) / all.length : 0
    const efficiency = Math.max(0, Math.min(100, Math.round((100 - avgPm25) || 0)))
    try {
      await prisma.vehicle.update({ where: { id: vehicle.id }, data: { avgEmission: avgPm25, efficiency } })
    } catch (updateErr: any) {
      console.warn('Prisma vehicle.update failed, attempting raw Mongo update fallback:', updateErr?.code || updateErr)
      if (updateErr?.code === 'P2031') {
        try {
          await prisma.$runCommandRaw({ update: 'Vehicle', updates: [{ q: { deviceId }, u: { $set: { avgEmission: avgPm25, efficiency } } }] })
        } catch (inner) {
          console.error('Fallback vehicle update failed', inner)
        }
      } else {
        throw updateErr
      }
    }

    // Generate alert/report when threshold exceeded
    if (emission.pm25 >= 150 || emission.pm10 >= 250) {
      try {
        await prisma.alert.create({ data: { vehicleId: vehicle.id, message: `High emissions detected (PM2.5: ${emission.pm25}, PM10: ${emission.pm10})`, level: 'critical' } })
      } catch (alertErr: any) {
        console.warn('Prisma alert.create failed, attempting raw insert fallback:', alertErr?.code || alertErr)
        if (alertErr?.code === 'P2031') {
          try {
            await prisma.$runCommandRaw({ insert: 'Alert', documents: [{ vehicleId: vehicle.id, message: `High emissions detected (PM2.5: ${emission.pm25}, PM10: ${emission.pm10})`, level: 'critical', createdAt: new Date() }] })
          } catch (inner) { console.error('Fallback alert insert failed', inner) }
        }
      }
      try {
        await prisma.report.create({ data: { title: 'High emissions detected', description: `Device ${deviceId} reported extreme emissions`, type: 'anomaly', metrics: { pm25: emission.pm25, pm10: emission.pm10, co2: emission.co2 } } })
      } catch (reportErr: any) {
        console.warn('Prisma report.create failed, attempting raw insert fallback:', reportErr?.code || reportErr)
        if (reportErr?.code === 'P2031') {
          try {
            await prisma.$runCommandRaw({ insert: 'Report', documents: [{ title: 'High emissions detected', description: `Device ${deviceId} reported extreme emissions`, date: new Date(), type: 'anomaly', status: 'ready', metrics: { pm25: emission.pm25, pm10: emission.pm10, co2: emission.co2 } }] })
          } catch (inner) { console.error('Fallback report insert failed', inner) }
        }
      }
    } else if (emission.pm25 >= 75 || emission.pm10 >= 150) {
      try {
        await prisma.alert.create({ data: { vehicleId: vehicle.id, message: `Elevated emissions detected (PM2.5: ${emission.pm25}, PM10: ${emission.pm10})`, level: 'warning' } })
      } catch (alertErr: any) {
        console.warn('Prisma alert.create failed, attempting raw insert fallback:', alertErr?.code || alertErr)
        if (alertErr?.code === 'P2031') {
          try { await prisma.$runCommandRaw({ insert: 'Alert', documents: [{ vehicleId: vehicle.id, message: `Elevated emissions detected (PM2.5: ${emission.pm25}, PM10: ${emission.pm10})`, level: 'warning', createdAt: new Date() }] }) } catch (inner) { console.error('Fallback alert insert failed', inner) }
        }
      }
    }

    return NextResponse.json({ success: true, emission }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error', details: err?.message || String(err) }, { status: 500 })
  }
}
