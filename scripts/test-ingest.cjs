/*
  Test script for /api/ingest
  - Upserts a test Vehicle (deviceId: ESP32-TEST-001)
  - Upserts a DeviceKey for that vehicle (collection DeviceKey)
  - Posts a sample payload to /api/ingest with x-device-key header

  Usage:
    node scripts/test-ingest.cjs

  Make sure your dev server is running (pnpm dev -> http://localhost:3000)
*/

const { PrismaClient } = require("@prisma/client");
const https = require("https");
const http = require("http");
const { URL } = require("url");

const prisma = new PrismaClient();

async function upsertVehicle(deviceId) {
  const existing = await prisma.vehicle.findUnique({ where: { deviceId } });
  if (existing) return existing;
  return prisma.vehicle.create({
    data: {
      plate: `TEST-${Date.now()}`,
      model: "ESP32 Test",
      year: 2025,
      deviceId,
    },
  });
}

async function upsertDeviceKey(vehicleId, key) {
  // Try to find the existing DeviceKey via raw find
  try {
    const raw = await prisma.$runCommandRaw({
      find: "DeviceKey",
      filter: { key },
      limit: 1,
    });
    const first = raw?.cursor?.firstBatch?.[0];
    if (first)
      return { id: first._id, key: first.key, vehicleId: first.vehicleId };
  } catch (e) {
    // ignore
  }
  // insert
  try {
    const insert = await prisma.$runCommandRaw({
      insert: "DeviceKey",
      documents: [{ vehicleId, key, createdAt: new Date() }],
    });
    return { vehicleId, key };
  } catch (e) {
    console.error("DeviceKey upsert failed", e);
    throw e;
  }
}

function postJson(url, payload, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === "https:" ? https : http;
    const opts = {
      hostname: u.hostname,
      port: u.port || (u.protocol === "https:" ? 443 : 80),
      path: u.pathname + u.search,
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/json" }, headers),
    };
    const req = lib.request(opts, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

async function main() {
  const API_URL = process.env.API_URL || "http://localhost:3000/api/ingest";
  const deviceId = process.env.DEVICE_ID || "ESP32-TEST-001";
  const deviceKey = process.env.DEVICE_KEY || `test-key-${Date.now()}`;

  console.log("Ensuring test vehicle exists...");
  const vehicle = await upsertVehicle(deviceId);
  console.log("Vehicle:", vehicle.deviceId, vehicle.id);

  console.log("Ensuring device key exists...");
  await upsertDeviceKey(vehicle.id, deviceKey);
  console.log("DeviceKey:", deviceKey);

  const payload = {
    deviceId,
    sampleId: `test-${Date.now()}`,
    timestamp: new Date().toISOString(),
    pm25_before: 400,
    pm25: 180,
    pm10: 300,
    co2: 450,
    battery: 90,
    firmware: "v1.0.0",
  };

  console.log("Posting sample to", API_URL);
  const r = await postJson(API_URL, payload, { "x-device-key": deviceKey });
  console.log("Status:", r.status);
  try {
    console.log("Body:", JSON.parse(r.body));
  } catch (e) {
    console.log("Body:", r.body);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
