import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: any }) {
  try {
    const p = await params;
    const vehicleId = p?.id as string;

    const url = new URL(req.url);
    const limit = Math.min(
      Number(url.searchParams.get("limit") ?? 50) || 50,
      500
    );

    // `samples` are MQ135 readings: { in, out, efficiency }
    // Use Mongo raw query to tolerate legacy docs with `receivedAt: null`.
    const fetched = await (prisma as any).sample.findRaw({
      // findRaw uses Mongo field names, not Prisma relation names
      filter: { vehicleId: { $oid: vehicleId } },
      options: { sort: { receivedAt: -1, timestamp: -1 }, limit },
    });

    const samples = Array.isArray(fetched)
      ? fetched.map((s: any) => ({
          ...s,
          receivedAt: s.receivedAt ?? s.timestamp ?? null,
        }))
      : [];

    const latest = samples[0] ?? null;
    const count = samples.length || 1;
    const totals = samples.reduce(
      (acc: any, s: any) => ({
        in: acc.in + Number(s.in ?? 0),
        out: acc.out + Number(s.out ?? 0),
        efficiency: acc.efficiency + Number(s.efficiency ?? 0),
      }),
      { in: 0, out: 0, efficiency: 0 }
    );

    const summary = {
      avgIn: totals.in / count,
      avgOut: totals.out / count,
      avgEfficiency: totals.efficiency / count,
      latest,
    };

    return NextResponse.json({ samples, summary });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
