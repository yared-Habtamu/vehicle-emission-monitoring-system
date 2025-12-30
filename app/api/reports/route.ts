import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const reports = await prisma.report.findMany({ orderBy: { date: "desc" } });
    return NextResponse.json(reports);
  } catch (err) {
    console.error(err);
    // Handle single-node Mongo / Prisma DateTime conversion issue (P2023)
    try {
      if (
        (err as any)?.code === "P2023" ||
        String(err).includes("Failed to convert")
      ) {
        const raw = await prisma.$runCommandRaw({
          find: "Report",
          filter: {},
          sort: { date: -1 },
          limit: 200,
        });
        const docs = (raw as any)?.cursor?.firstBatch ?? (raw as any) ?? [];
        const normalized = (docs || []).map((d: any) => ({
          id: d._id?.toString ? d._id.toString() : d.id,
          title: d.title,
          description: d.description ?? null,
          date: d.date
            ? typeof d.date === "string"
              ? d.date
              : d.date?.toISOString?.()
            : null,
          type: d.type,
          status: d.status ?? "ready",
          metrics: d.metrics ?? {},
        }));
        return NextResponse.json(normalized);
      }
    } catch (e) {
      console.error("reports raw fallback failed", e);
    }

    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, type, metrics } = await req.json();
    if (!title || !type || !metrics)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const report = await prisma.report.create({
      data: { title, description, type, metrics },
    });
    return NextResponse.json(report, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}