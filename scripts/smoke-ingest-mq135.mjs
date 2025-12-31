import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Ensure a vehicle exists for deviceId
  const deviceId = "ESP32-DEVKIT-V1";
  const vehicle = await prisma.vehicle.upsert({
    where: { deviceId },
    update: {},
    create: {
      plate: "TEST-0000",
      model: "ESP32 Test Rig",
      year: 2025,
      deviceId,
      status: "active",
    },
  });

  // Ensure a device key exists
  const key = "dev-test-key";
  await prisma.deviceKey.upsert({
    where: { key },
    update: { vehicleId: vehicle.id },
    create: { key, vehicleId: vehicle.id },
  });

  const now = Date.now();
  const payloads = [
    // normal
    {
      deviceId,
      sampleId: String(now),
      timestamp: new Date(now).toISOString(),
      in: 2600,
      out: 1500,
      efficiency: 42.3,
    },
    // clock skew: very old timestamp (server should still order via receivedAt)
    {
      deviceId,
      sampleId: String(now + 1),
      timestamp: new Date(now - 1000 * 60 * 60 * 24 * 365).toISOString(),
      in: 2700,
      out: 1600,
      efficiency: 40.7,
    },
    // clock skew: future timestamp
    {
      deviceId,
      sampleId: String(now + 2),
      timestamp: new Date(now + 1000 * 60 * 60 * 24 * 365).toISOString(),
      in: 2550,
      out: 1400,
      efficiency: 45.1,
    },
  ];

  // Use the same ingest path ESP32 uses
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  for (const p of payloads) {
    const r = await fetch(`${baseUrl}/api/ingest`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-device-key": key,
      },
      body: JSON.stringify(p),
    });

    const text = await r.text();
    if (!r.ok) {
      throw new Error(`Ingest failed (${r.status}): ${text}`);
    }
    console.log("ingest ok:", text);
  }

  // Verify vehicle samples endpoint
  const vRes = await fetch(
    `${baseUrl}/api/vehicles/${vehicle.id}/samples?limit=10`,
    { headers: { accept: "application/json" } }
  );
  const vJson = await vRes.json();
  console.log("vehicle samples:", {
    status: vRes.status,
    count: vJson?.samples?.length ?? 0,
    latestSampleId: vJson?.samples?.[0]?.sampleId ?? null,
  });

  // Verify device samples feed endpoint used by live polling
  const dRes = await fetch(
    `${baseUrl}/api/devices/${deviceId}/samples?limit=10`,
    { headers: { accept: "application/json" } }
  );
  const dJson = await dRes.json();
  console.log("device samples:", {
    status: dRes.status,
    count: dJson?.samples?.length ?? 0,
    newestReceivedAt: dJson?.samples?.[0]?.receivedAt ?? null,
    newestTimestamp: dJson?.samples?.[0]?.timestamp ?? null,
  });

  console.log({
    vehicleId: vehicle.id,
    deviceId,
    deviceKey: key,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
