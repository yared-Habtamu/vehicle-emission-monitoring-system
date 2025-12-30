import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";

export type IngestPayload = {
  deviceId?: string;
  sampleId?: string;
  timestamp?: string;
  pm25?: number;
  pm10?: number;
  co2?: number;
  nh3?: number;
  pm25_before?: number;
  pm10_before?: number;
  temperature?: number;
  humidity?: number;
  battery?: number;
  firmware?: string;
  [key: string]: any;
};

export async function handleIngest(
  deviceId: string,
  body: IngestPayload,
  headers: Headers
) {
  // basic validation
  if (!deviceId) return { status: 400, body: { error: "Missing deviceId" } };

  const timestamp = body.timestamp ? new Date(body.timestamp) : new Date();
  if (Number.isNaN(timestamp.getTime()))
    return { status: 400, body: { error: "Invalid timestamp" } };

  const sampleId = body.sampleId ?? randomUUID();

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
      find: "Emission",
      filter: { sampleId },
      limit: 1,
    });
    const existing = (rawFind as any)?.cursor?.firstBatch?.[0];
    if (existing) {
      const existingObj = {
        id: existing._id?.toString?.() ?? existing._id,
        vehicleId: existing.vehicleId,
        deviceId: existing.deviceId,
        sampleId: existing.sampleId,
        pm25: Number(existing.pm25),
        pm10: Number(existing.pm10),
        co2: Number(existing.co2),
        nh3: existing.nh3 == null ? null : Number(existing.nh3),
        timestamp:
          existing.timestamp instanceof Date
            ? existing.timestamp
            : new Date(existing.timestamp),
        metrics: existing.metrics,
      };
      return { status: 200, body: { success: true, emission: existingObj } };
    }
  } catch (_e) {
    // ignore idempotent lookup errors
  }

  const pm25 = body.pm25 ?? body.pm25_before ?? null;
  const pm10 = body.pm10 ?? body.pm10_before ?? null;
  const co2 = body.co2 ?? null;
  if (pm25 == null || pm10 == null || co2 == null)
    return {
      status: 400,
      body: { error: "Missing required readings (pm25, pm10, co2)" },
    };

  let emission: any = null;
  try {
    // Create core fields with Prisma (only model fields). We'll attach sampleId/deviceId/metrics via raw update
    emission = await prisma.emission.create({
      data: {
        vehicle: { connect: { id: vehicle.id } },
        pm25: Number(pm25),
        pm10: Number(pm10),
        co2: Number(co2),
        nh3: body.nh3 == null ? null : Number(body.nh3),
        timestamp,
      } as any,
    });
    // annotate returned object with device/sample/metrics for response
    (emission as any).deviceId = deviceId;
    (emission as any).sampleId = sampleId;
    (emission as any).metrics = body;
    // attempt to persist sampleId/deviceId/metrics to the underlying document so future raw finds can locate it
    try {
      await prisma.$runCommandRaw({
        update: "Emission",
        updates: [
          {
            q: {
              vehicleId: vehicle.id,
              pm25: Number(pm25),
              pm10: Number(pm10),
              timestamp,
            },
            u: { $set: { sampleId, deviceId, metrics: body } },
            multi: false,
          },
        ],
      });
    } catch (_u) {
      // ignore raw persistence failures
    }
  } catch (createErr: any) {
    if (createErr?.code === "P2031") {
      // raw insert fallback
      try {
        await prisma.$runCommandRaw({
          insert: "Emission",
          documents: [
            {
              vehicleId: vehicle.id,
              deviceId,
              sampleId,
              pm25: Number(pm25),
              pm10: Number(pm10),
              co2: Number(co2),
              nh3: body.nh3 == null ? null : Number(body.nh3),
              timestamp,
              metrics: body,
            },
          ],
        });
        // read back
        try {
          const rawFind: any = await prisma.$runCommandRaw({
            find: "Emission",
            filter: { sampleId },
            limit: 1,
          });
          const first = (rawFind as any)?.cursor?.firstBatch?.[0];
          if (first) {
            emission = {
              id: first._id?.toString?.() ?? first._id,
              vehicleId: first.vehicleId,
              deviceId: first.deviceId ?? deviceId,
              sampleId: first.sampleId,
              pm25: Number(first.pm25),
              pm10: Number(first.pm10),
              co2: Number(first.co2),
              nh3: first.nh3 == null ? null : Number(first.nh3),
              timestamp:
                first.timestamp instanceof Date
                  ? first.timestamp
                  : new Date(first.timestamp),
              metrics: first.metrics,
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
    const all = await prisma.emission.findMany({
      where: { vehicleId: vehicle.id },
    });
    const avgPm25 = all.length
      ? all.reduce((s, e) => s + e.pm25, 0) / all.length
      : 0;
    const efficiency = Math.max(
      0,
      Math.min(100, Math.round(100 - avgPm25 || 0))
    );
    try {
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { avgEmission: avgPm25, efficiency },
      });
    } catch (updateErr: any) {
      if (updateErr?.code === "P2031") {
        try {
          await prisma.$runCommandRaw({
            update: "Vehicle",
            updates: [
              {
                q: { deviceId },
                u: { $set: { avgEmission: avgPm25, efficiency } },
              },
            ],
          });
        } catch (_u) {}
      }
    }
  } catch (_e) {}

  // create alerts/reports for thresholds (best-effort)
  if ((emission?.pm25 ?? 0) >= 150 || (emission?.pm10 ?? 0) >= 250) {
    try {
      await prisma.alert.create({
        data: {
          vehicleId: vehicle.id,
          message: `High emissions detected (PM2.5: ${emission.pm25}, PM10: ${emission.pm10})`,
          level: "critical",
        },
      });
    } catch (_e) {}
    try {
      await prisma.report.create({
        data: {
          title: "High emissions detected",
          description: `Device ${deviceId} reported extreme emissions`,
          type: "anomaly",
          metrics: {
            pm25: emission.pm25,
            pm10: emission.pm10,
            co2: emission.co2,
          },
        },
      });
    } catch (_e) {}
  } else if ((emission?.pm25 ?? 0) >= 75 || (emission?.pm10 ?? 0) >= 150) {
    try {
      await prisma.alert.create({
        data: {
          vehicleId: vehicle.id,
          message: `Elevated emissions detected (PM2.5: ${emission.pm25}, PM10: ${emission.pm10})`,
          level: "warning",
        },
      });
    } catch (_e) {}
  }

  return { status: 201, body: { success: true, emission } };
}

export default handleIngest;
