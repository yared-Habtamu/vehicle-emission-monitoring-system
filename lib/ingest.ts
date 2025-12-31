import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";

export type IngestPayload = {
  deviceId?: string;
  sampleId?: string;
  timestamp?: string | number;
  in?: number;
  out?: number;
  efficiency?: number;
  deviceKey?: string;
};

export async function handleIngest(
  deviceId: string,
  body: IngestPayload,
  headers: Headers
) {
  // Strict payload validation: accept only MQ135 fields.
  const allowedKeys = new Set([
    "deviceId",
    "sampleId",
    "timestamp",
    "in",
    "out",
    "efficiency",
    // allow deviceKey in body for deployments where headers are hard
    "deviceKey",
  ]);
  for (const key of Object.keys(body ?? {})) {
    if (!allowedKeys.has(key)) {
      return {
        status: 400,
        body: { error: `Unexpected field: ${key}` },
      };
    }
  }

  // basic validation
  if (!deviceId) return { status: 400, body: { error: "Missing deviceId" } };

  const timestamp =
    body.timestamp == null
      ? new Date()
      : typeof body.timestamp === "number"
      ? new Date(body.timestamp)
      : new Date(body.timestamp);
  if (Number.isNaN(timestamp.getTime()))
    return { status: 400, body: { error: "Invalid timestamp" } };

  if (!body.sampleId) {
    return { status: 400, body: { error: "Missing sampleId" } };
  }
  const sampleId = body.sampleId;

  // resolve vehicle
  const vehicle = await prisma.vehicle.findUnique({ where: { deviceId } });
  if (!vehicle)
    return {
      status: 404,
      body: { error: "Unknown device", code: "UNKNOWN_DEVICE" },
    };

  // authenticate device via header x-device-key or body.deviceKey
  const providedKey = headers.get("x-device-key") || body.deviceKey;
  if (!providedKey)
    return {
      status: 401,
      body: { error: "Missing device key", code: "MISSING_KEY" },
    };

  // find device key (with raw fallback)
  let keyRec: any = null;
  try {
    keyRec = await (prisma as any).deviceKey.findUnique({
      where: { key: providedKey },
    });
  } catch (kErr) {
    try {
      const raw: any = await prisma.$runCommandRaw({
        find: "DeviceKey",
        filter: { key: providedKey },
        limit: 1,
      });
      const first = (raw as any)?.cursor?.firstBatch?.[0];
      if (first)
        keyRec = {
          id: first._id?.toString?.() ?? first._id,
          vehicleId: first.vehicleId,
          key: first.key,
        };
    } catch (_e) {
      // ignore
    }
  }
  if (!keyRec || keyRec.vehicleId !== vehicle.id)
    return {
      status: 401,
      body: { error: "Invalid device key", code: "INVALID_KEY" },
    };

  // idempotency check
  try {
    const rawFind: any = await prisma.$runCommandRaw({
      find: "Sample",
      filter: { vehicleId: vehicle.id, sampleId },
      limit: 1,
    });
    const existing = (rawFind as any)?.cursor?.firstBatch?.[0];
    if (existing) {
      const existingObj = {
        id: existing._id?.toString?.() ?? existing._id,
        vehicleId: existing.vehicleId,
        deviceId: existing.deviceId,
        sampleId: existing.sampleId,
        in: Number(existing.in),
        out: Number(existing.out),
        efficiency: Number(existing.efficiency),
        timestamp:
          existing.timestamp instanceof Date
            ? existing.timestamp
            : new Date(existing.timestamp),
      };
      return { status: 200, body: { success: true, sample: existingObj } };
    }
  } catch (_e) {
    // ignore idempotent lookup errors
  }

  // Fallback idempotency check (Prisma) in case raw command is unavailable in this runtime.
  try {
    const existing = await (prisma as any).sample.findFirst({
      where: { vehicleId: vehicle.id, sampleId },
    });
    if (existing) {
      return { status: 200, body: { success: true, sample: existing } };
    }
  } catch (_e) {
    // ignore
  }

  const inVal = body.in;
  const outVal = body.out;
  if (inVal == null || outVal == null) {
    return {
      status: 400,
      body: { error: "Missing required fields (in, out)" },
    };
  }

  const efficiencyVal =
    body.efficiency != null
      ? Number(body.efficiency)
      : Number(inVal) !== 0
      ? ((Number(inVal) - Number(outVal)) / Number(inVal)) * 100
      : null;

  if (efficiencyVal == null || Number.isNaN(efficiencyVal)) {
    return { status: 400, body: { error: "Missing or invalid efficiency" } };
  }

  let sample: any = null;
  try {
    // Using explicit `vehicleId` avoids relation connect quirks on Mongo.
    sample = await (prisma as any).sample.create({
      data: {
        vehicleId: vehicle.id,
        deviceId,
        sampleId,
        timestamp,
        in: Number(inVal),
        out: Number(outVal),
        efficiency: Number(efficiencyVal),
      } as any,
    });
  } catch (createErr: any) {
    if (createErr?.code === "P2031") {
      // raw insert fallback
      try {
        await prisma.$runCommandRaw({
          insert: "Sample",
          documents: [
            {
              vehicleId: vehicle.id,
              deviceId,
              sampleId,
              timestamp,
              in: Number(inVal),
              out: Number(outVal),
              efficiency: Number(efficiencyVal),
            },
          ],
        });
        // read back
        try {
          const rawFind: any = await prisma.$runCommandRaw({
            find: "Sample",
            filter: { vehicleId: vehicle.id, sampleId },
            limit: 1,
          });
          const first = (rawFind as any)?.cursor?.firstBatch?.[0];
          if (first) {
            sample = {
              id: first._id?.toString?.() ?? first._id,
              vehicleId: first.vehicleId,
              deviceId: first.deviceId ?? deviceId,
              sampleId: first.sampleId,
              in: Number(first.in),
              out: Number(first.out),
              efficiency: Number(first.efficiency),
              timestamp:
                first.timestamp instanceof Date
                  ? first.timestamp
                  : new Date(first.timestamp),
            };
          }
        } catch (_rb) {}
      } catch (_inner) {
        throw createErr;
      }
    } else {
      throw createErr;
    }
  }

  // recalc vehicle stats (best effort)
  try {
    const all = await (prisma as any).sample.findMany({
      where: { vehicleId: vehicle.id },
    });
    const avgEff = all.length
      ? all.reduce((s: number, e: any) => s + Number(e.efficiency ?? 0), 0) /
        all.length
      : 0;
    try {
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { efficiency: avgEff },
      });
    } catch (updateErr: any) {
      if (updateErr?.code === "P2031") {
        try {
          await prisma.$runCommandRaw({
            update: "Vehicle",
            updates: [
              {
                q: { deviceId },
                u: { $set: { efficiency: avgEff } },
              },
            ],
          });
        } catch (_u) {}
      }
    }
  } catch (_e) {}

  // create alerts/reports for thresholds (best-effort)
  if ((sample?.efficiency ?? 0) <= 30) {
    try {
      await prisma.alert.create({
        data: {
          vehicleId: vehicle.id,
          message: `Low filter efficiency detected (efficiency: ${sample.efficiency}%)`,
          level: "critical",
        },
      });
    } catch (_e) {}
    try {
      await prisma.report.create({
        data: {
          title: "Low filter efficiency detected",
          description: `Device ${deviceId} reported low filter efficiency`,
          type: "anomaly",
          metrics: {
            in: sample.in,
            out: sample.out,
            efficiency: sample.efficiency,
          },
        },
      });
    } catch (_e) {}
  } else if ((sample?.efficiency ?? 0) <= 60) {
    try {
      await prisma.alert.create({
        data: {
          vehicleId: vehicle.id,
          message: `Reduced filter efficiency detected (efficiency: ${sample.efficiency}%)`,
          level: "warning",
        },
      });
    } catch (_e) {}
  }

  return { status: 201, body: { success: true, sample } };
}

export default handleIngest;
