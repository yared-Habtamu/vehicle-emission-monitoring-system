import { NextResponse } from "next/server";
import handleIngest from "@/lib/ingest";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const deviceId = body?.deviceId;
    const res = await handleIngest(deviceId, body, req.headers);
    return NextResponse.json(res.body, { status: res.status });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error", details: (err as any)?.message || String(err) },
      { status: 500 }
    );
  }
}
