import { NextResponse } from "next/server";
import handleIngest from "@/lib/ingest";

export async function POST(req: Request, context: { params: any }) {
  try {
    let params = context.params;
    if (params && typeof params.then === "function") params = await params;
    const deviceId = params?.deviceId;
    const body = await req.json();
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
