import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: any }) {
  try {
    const vehicleId = params.id;
    const { pm25, pm10, co2, nh3 } = await req.json();

    if (pm25 == null || pm10 == null || co2 == null)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const emission = await prisma.emission.create({
      data: {
        vehicleId,
        pm25: Number(pm25),
        pm10: Number(pm10),
        co2: Number(co2),
        nh3: nh3 == null ? null : Number(nh3),
      },
    });

    // Recalculate avgEmission and efficiency for vehicle (Mongo-friendly logic)
    const all = await prisma.emission.findMany({ where: { vehicleId } });
    const avgPm25 = all.length
      ? all.reduce((s, e) => s + e.pm25, 0) / all.length
      : 0;
    const efficiency = Math.max(
      0,
      Math.min(100, Math.round(100 - avgPm25 || 0))
    );

    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { avgEmission: avgPm25, efficiency },
    });

    return NextResponse.json(emission, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
