import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    let hash: string;
    try {
      hash = await hashPassword(password, 10);
    } catch (e) {
      console.error("Error hashing password:", e);
      throw new Error("Password hashing failed");
    }
    const user = await prisma.user.create({
      data: { name, email, password: hash },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err: any) {
    // Log full error and stack for easier debugging in dev
    console.error(err);
    if (err?.stack) console.error(err.stack);

    // In development return the underlying error message to the client to help debugging.
    // In production keep the generic message to avoid leaking internals.
    const message =
      process.env.NODE_ENV !== "production"
        ? err?.message || String(err)
        : "Server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
