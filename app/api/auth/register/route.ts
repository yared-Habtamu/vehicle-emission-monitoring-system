import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { hashPassword } from '@/lib/hash'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const hash = await hashPassword(password, 10)
    let user
    try {
      user = await prisma.user.create({ data: { name, email, password: hash } })
    } catch (createErr: any) {
      // Prisma on MongoDB may require replica set for transactions (P2031).
      // Fall back to a raw Mongo insert to avoid the replica-set requirement in dev.
      console.warn('Prisma create failed, attempting raw Mongo insert fallback:', createErr?.code || createErr)
      if (createErr?.code === 'P2031') {
        // Use runCommandRaw to insert directly into the collection, then read back via Prisma.
        await prisma.$runCommandRaw({ insert: 'User', documents: [{ name, email, password: hash, role: 'user' }] })
        user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true } })
      } else {
        throw createErr
      }
    }

    return NextResponse.json({ id: user.id, name: user.name, email: user.email })
  } catch (err: any) {
    console.error(err)
    // In development return error details to help debugging. Never expose in production.
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ error: 'Server error', details: err?.message || String(err) }, { status: 500 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
