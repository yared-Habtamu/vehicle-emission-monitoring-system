import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: any }) {
  try {
    const p = await params;
    const deviceId = p?.deviceId as string;

    const url = new URL(req.url);
    const limit = Math.min(
      Number(url.searchParams.get("limit") ?? 20) || 20,
      500
    );
    const since = url.searchParams.get("since");
    const sinceDate = since ? new Date(since) : null;

    const filter: any = { deviceId };
    if (sinceDate && !Number.isNaN(sinceDate.getTime())) {
      // since is based on server-received ordering for drift resistance
      filter.receivedAt = { $gt: sinceDate };
    }

    // Use Mongo raw query to tolerate legacy docs with `receivedAt: null`
    const fetched = await (prisma as any).sample.findRaw({
      filter,
      options: { sort: { receivedAt: -1, timestamp: -1 }, limit },
    });

    const samples = Array.isArray(fetched)
      ? fetched.map((s: any) => ({
          ...s,
          receivedAt: s.receivedAt ?? s.timestamp ?? null,
        }))
      : [];

    return NextResponse.json({ samples });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
