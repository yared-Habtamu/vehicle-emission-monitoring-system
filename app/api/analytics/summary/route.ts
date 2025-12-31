import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const samples = await (prisma as any).sample.findMany({
      orderBy: { timestamp: "desc" },
      take: 90,
    });

    const byDay: Record<
      string,
      { inSum: number; outSum: number; effSum: number; count: number }
    > = {};

    for (const s of samples) {
      const ts =
        s.timestamp instanceof Date ? s.timestamp : new Date(s.timestamp);
      const day = ts.toISOString().slice(0, 10);
      if (!byDay[day])
        byDay[day] = { inSum: 0, outSum: 0, effSum: 0, count: 0 };
      byDay[day].inSum += Number(s.in);
      byDay[day].outSum += Number(s.out);
      byDay[day].effSum += Number(s.efficiency);
      byDay[day].count += 1;
    }

    const trend = Object.entries(byDay)
      .map(([date, vals]) => ({
        date,
        in: vals.inSum / vals.count,
        out: vals.outSum / vals.count,
        efficiency: vals.effSum / vals.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const count = samples.length || 1;
    const totals = samples.reduce(
      (acc: any, s: any) => ({
        inSum: acc.inSum + Number(s.in),
        outSum: acc.outSum + Number(s.out),
        effSum: acc.effSum + Number(s.efficiency),
      }),
      { inSum: 0, outSum: 0, effSum: 0 }
    );

    const summary = {
      in: totals.inSum / count,
      out: totals.outSum / count,
      efficiency: totals.effSum / count,
    };

    return NextResponse.json({ trend, summary });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
