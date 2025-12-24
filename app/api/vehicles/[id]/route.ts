import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const vehicle = await prisma.vehicle.findUnique({ where: { id }, include: { emissions: true, alerts: true } })
    if (!vehicle) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(vehicle)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await req.json()
    const vehicle = await prisma.vehicle.update({ where: { id }, data })
    return NextResponse.json(vehicle)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Unable to update" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    await prisma.vehicle.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Unable to delete" }, { status: 500 })
  }
}
