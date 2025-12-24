import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { signToken } from '@/lib/auth'
import { comparePassword } from '@/lib/hash'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    const ok = await comparePassword(password, user.password)
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    const token = signToken({ sub: user.id, email: user.email })

    return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (err: any) {
    console.error(err)
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ error: 'Server error', details: err?.message || String(err) }, { status: 500 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
