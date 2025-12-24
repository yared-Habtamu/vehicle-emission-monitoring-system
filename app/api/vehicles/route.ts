import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({ include: { owner: true } })
    return NextResponse.json(vehicles)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch((e) => {
    console.error('Invalid JSON body', e)
    return null
  })
  const { plate, model, year, deviceId, ownerId } = body || {}
  if (!plate || !model || !year || !deviceId) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  try {
    const vehicle = await prisma.vehicle.create({ data: { plate, model, year: Number(year), deviceId, ownerId } })
    return NextResponse.json(vehicle, { status: 201 })
  } catch (err: any) {
    console.error(err)
    // If Mongo throws P2031 (replica set needed), fallback to raw insert for dev.
    if (err?.code === 'P2031') {
      try {
        await prisma.$runCommandRaw({ insert: 'Vehicle', documents: [{ plate, model, year: Number(year), deviceId, ownerId }] })
        const vehicle = await prisma.vehicle.findUnique({ where: { deviceId }, select: { id: true, plate: true, model: true, deviceId: true, year: true } })
        if (vehicle) return NextResponse.json(vehicle, { status: 201 })
      } catch (innerErr) {
        console.error('Fallback insert failed', innerErr)
      }
    }
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ error: 'Failed to create vehicle', details: err?.message || String(err) }, { status: 500 })
    }
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 })
  }
}
