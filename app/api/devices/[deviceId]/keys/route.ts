import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { getUserFromToken } from '@/lib/auth'

export async function POST(req: Request, context: { params: any }) {
  try {
    let params = context.params
    if (params && typeof params.then === 'function') params = await params
    const deviceId = params?.deviceId
    if (!deviceId) return NextResponse.json({ error: 'Missing deviceId' }, { status: 400 })

    // locate vehicle
    const vehicle = await prisma.vehicle.findUnique({ where: { deviceId } })
    if (!vehicle) return NextResponse.json({ error: 'Unknown device' }, { status: 404 })

    // require authenticated owner or admin to provision device keys
    const auth = req.headers.get('authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth
    const user = await getUserFromToken(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (vehicle.ownerId && String(vehicle.ownerId) !== String(user.id) && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const key = randomBytes(24).toString('hex')
    try {
      const created = await (prisma as any).deviceKey.create({ data: { vehicleId: vehicle.id, key } })
      return NextResponse.json({ key: created.key, createdAt: created.createdAt })
    } catch (createErr: any) {
      console.warn('Prisma deviceKey.create failed, attempting raw insert fallback:', createErr?.code || createErr)
      if (createErr?.code === 'P2031') {
        try {
          await prisma.$runCommandRaw({ insert: 'DeviceKey', documents: [{ vehicleId: vehicle.id, key, createdAt: new Date() }] })
          return NextResponse.json({ key, createdAt: new Date() })
        } catch (inner) {
          console.error('Fallback device key insert failed', inner)
          return NextResponse.json({ error: 'Failed to create device key' }, { status: 500 })
        }
      }
      throw createErr
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create device key' }, { status: 500 })
  }
}
