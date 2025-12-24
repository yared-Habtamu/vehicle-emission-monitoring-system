import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const reports = await prisma.report.findMany({ orderBy: { date: 'desc' } })
    return NextResponse.json(reports)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, type, metrics } = await req.json()
    if (!title || !type || !metrics) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    const report = await prisma.report.create({ data: { title, description, type, metrics } })
    return NextResponse.json(report, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 })
  }
}
