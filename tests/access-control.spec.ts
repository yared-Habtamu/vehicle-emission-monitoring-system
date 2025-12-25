import { test, expect } from "@playwright/test";
import { execSync } from "child_process";

test.describe("Access control (E2E)", () => {
  test("vehicles are only visible to owners; admin sees all", async ({
    request,
  }: any) => {
    const unique = Date.now();
    // register two owners
    const emailA = `ownerA+${unique}@example.com`;
    const emailB = `ownerB+${unique}@example.com`;
    const pw = "testpass123";

    await request.post("/api/auth/register", {
      data: { name: "Owner A", email: emailA, password: pw },
    });
    await request.post("/api/auth/register", {
      data: { name: "Owner B", email: emailB, password: pw },
    });

    const loginA = await request.post("/api/auth/login", {
      data: { email: emailA, password: pw },
    });
    const loginABody = await loginA.json();
    const tokenA = loginABody.token;
    const ownerAId = loginABody.user?.id;
    const loginB = await request.post("/api/auth/login", {
      data: { email: emailB, password: pw },
    });
    const loginBBody = await loginB.json();
    const tokenB = loginBBody.token;

    // owner A creates a vehicle
    const vehicleRes = await request.post("/api/vehicles", {
      data: {
        plate: `AC-${unique}`,
        model: "E2E",
        year: 2025,
        deviceId: `DEV-${unique}`,
        ownerId: ownerAId,
      },
    });
    expect(vehicleRes.ok).toBeTruthy();
    const createdVehicle = await vehicleRes.json();
    expect(createdVehicle.plate).toBe(`AC-${unique}`);
    // debug: check DB directly via Prisma to see if vehicle exists
    try {
      const raw = execSync(
        `node -e "const {PrismaClient}=require('@@prisma/client'.replace('@@','@')); const p=new PrismaClient(); p.vehicle.findMany().then(r=>console.log(JSON.stringify(r))).finally(()=>p.$disconnect())"`,
        { encoding: "utf8" }
      );
      console.log("RAW VEHICLES:", raw);
    } catch (e) {
      console.warn("raw DB check failed", String(e));
    }

    // owner B should not see owner A's vehicle
    const listB = await request.get("/api/vehicles", {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const vehiclesB = await listB.json();
    expect(Array.isArray(vehiclesB)).toBeTruthy();
    expect(vehiclesB.some((v: any) => v.plate === `AC-${unique}`)).toBeFalsy();

    // owner A should see their vehicle
    const listA = await request.get("/api/vehicles", {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const vehiclesA = await listA.json();
    expect(vehiclesA.some((v: any) => v.plate === `AC-${unique}`)).toBeTruthy();

    // ensure admin exists by running seed script (idempotent)
    try {
      execSync("node scripts/seed-test-users.cjs", { stdio: "ignore" });
    } catch (e) {
      /* ignore */
    }

    // login as admin and ensure admin sees the vehicle
    const adminLogin = await request.post("/api/auth/login", {
      data: { email: "admin@local.test", password: "adminpass" },
    });
    const adminLoginBody = await adminLogin.json();
    expect(adminLogin.ok).toBeTruthy();
    const adminToken = adminLoginBody.token;
    const listAdmin = await request.get("/api/vehicles", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const vehiclesAdmin = await listAdmin.json();
    console.log("ADMIN VEHICLES", vehiclesAdmin);
    expect(
      vehiclesAdmin.some((v: any) => v.plate === `AC-${unique}`)
    ).toBeTruthy();
  });
});
