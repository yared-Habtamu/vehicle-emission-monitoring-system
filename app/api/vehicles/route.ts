import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
    const user = await getUserFromToken(token);

    // If no user, return empty array to avoid exposing vehicles to unauthenticated visitors
    if (!user) return NextResponse.json([]);

    console.log("GET /api/vehicles user:", user?.id, user?.role);

    if (user.role === "admin") {
      const vehicles = await prisma.vehicle.findMany({
        include: { owner: true },
      });
      console.log("GET /api/vehicles admin count:", vehicles.length);
      // extra debug: if zero but DB has docs, print a quick raw dump
      if (vehicles.length === 0) {
        try {
          const raw = await prisma.$runCommandRaw({
            find: "Vehicle",
            filter: {},
            limit: 10,
          });
          console.log("RAW VEHICLES (admin):", JSON.stringify(raw));
        } catch (e) {
          console.warn("raw dump failed", e);
        }
      }
      return NextResponse.json(vehicles);
    }

    // regular user: only return vehicles owned by this user
    const vehicles = await prisma.vehicle.findMany({
      where: { ownerId: user.id },
      include: { owner: true },
    });
    console.log("GET /api/vehicles user vehicles:", vehicles.length);
    if (vehicles.length === 0) {
      try {
        const raw = await prisma.$runCommandRaw({
          find: "Vehicle",
          filter: { ownerId: { $exists: true } },
          limit: 20,
        });
        console.log("RAW VEHICLES (user):", JSON.stringify(raw));
      } catch (e) {
        console.warn("raw dump failed", e);
      }
    }
    return NextResponse.json(vehicles);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { plate, model, year, deviceId, ownerId } = await req.json();
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
    const user = await getUserFromToken(token);
    if (!plate || !model || !year || !deviceId)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // Prefer using relation connect to ensure ownerId is stored in the expected format
    const data: any = { plate, model, year: Number(year), deviceId };
    // If an authenticated user made the request and ownerId wasn't provided,
    // attach the user as the owner automatically.
    if (ownerId) data.owner = { connect: { id: String(ownerId) } };
    else if (user) data.owner = { connect: { id: String(user.id) } };

    // If a vehicle with this deviceId already exists, return it (idempotent).
    const existing = await prisma.vehicle.findUnique({ where: { deviceId } });
    if (existing) {
      // If owner is provided and existing vehicle has no owner, attach it
      if (data.owner && !existing.ownerId) {
        try {
          await prisma.vehicle.update({
            where: { id: existing.id },
            data: { owner: data.owner },
          });
          // refresh existing
          const refreshed = await prisma.vehicle.findUnique({ where: { id: existing.id }, include: { owner: true } });
          return NextResponse.json(refreshed || existing, { status: 200 });
        } catch (e) {
          console.warn("Could not attach owner to existing vehicle", e);
        }
      }
      return NextResponse.json(existing, { status: 200 });
    }

    const vehicle = await prisma.vehicle.create({ data });
    return NextResponse.json(vehicle, { status: 201 });
  } catch (err: any) {
    console.error(err);
    // Handle duplicate deviceId explicitly
    if (err?.code === "P2002" && err?.meta?.target?.includes("deviceId")) {
      return NextResponse.json(
        { error: "Device ID already exists" },
        { status: 409 }
      );
    }

    // In dev return underlying message to help debugging
    const message =
      process.env.NODE_ENV !== "production"
        ? err?.message || String(err)
        : "Failed to create vehicle";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
