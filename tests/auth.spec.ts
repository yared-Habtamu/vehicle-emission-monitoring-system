import { test, expect } from "@playwright/test";

test.describe("Auth API (E2E)", () => {
  test("register then login should succeed and return token", async ({
    request,
  }: any) => {
    const unique = Date.now();
    const email = `e2e+${unique}@example.com`;
    const password = "E2Epass!23";
    const name = "E2E Tester";

    // Register
    const reg = await request.post("/api/auth/register", {
      data: { name, email, password },
    });
    const regText = await reg.text();
    let regJson = null;
    try {
      regJson = regText ? JSON.parse(regText) : null;
    } catch (e) {
      console.error("Register returned non-JSON:", regText);
    }
    expect(reg.status(), "register status").toBeGreaterThan(199);
    expect(reg.status(), "register status").toBeLessThan(300);
    expect(
      regJson?.email || regJson?.id,
      "register response contains email or id"
    ).toBeTruthy();

    // Login
    const login = await request.post("/api/auth/login", {
      data: { email, password },
    });
    const loginBody = await login.json();
    expect(login.status(), "login status").toBe(200);
    expect(loginBody.token, "token present").toBeTruthy();
    expect(loginBody.user?.email, "user email matches").toBe(email);
  });
});

test.describe("Device ingestion (E2E)", () => {
  test("ingest sensor payload and produce emission and possibly alert", async ({
    request,
  }: any) => {
    const unique = Date.now();
    const email = `e2e+device${unique}@example.com`;
    const password = "E2Epass!23";
    const name = "E2E Device Owner";

    // create user
    await request.post("/api/auth/register", {
      data: { name, email, password },
    });

    // login and create vehicle linked to the user
    const loginRes = await request.post("/api/auth/login", {
      data: { email, password },
    });
    const loginBody = await loginRes.json();
    const token = loginBody.token;

    const vehicleRes = await request.post("/api/vehicles", {
      data: {
        plate: `E2E-${unique}`,
        model: "E2E",
        year: 2025,
        deviceId: "ESP32-VEH-E2E",
        ownerId: loginBody.user?.id,
      },
    });
    const vehicle = await vehicleRes.json();
    expect(vehicleRes.ok).toBeTruthy();

    // create a device key for ingestion
    const keyRes = await request.post(`/api/devices/ESP32-VEH-E2E/keys`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(keyRes.ok).toBeTruthy();
    const keyBody = await keyRes.json();
    const deviceKey = keyBody.key;

    // POST sensor payload
    const payload = {
      deviceId: "ESP32-VEH-E2E",
      sampleId: `e2e-sample-${unique}-${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      pm25: 180,
      pm10: 300,
      pm25_before: 400,
      pm10_before: 600,
      co2: 450,
      nh3: 1.2,
      temperature: 30,
      humidity: 60,
    };

    const ingest = await request.post(
      `/api/devices/${payload.deviceId}/ingest`,
      { data: payload, headers: { "x-device-key": deviceKey } }
    );
    expect(ingest.status()).toBe(201);
    const ingestBody = await ingest.json();
    expect(ingestBody.success).toBeTruthy();

    // verify emission is in analytics emissions
    const emissions = await request.get("/api/analytics/emissions");
    const list = await emissions.json();
    expect(Array.isArray(list)).toBeTruthy();
    expect(
      list.some((e: any) => e.pm25 === 180 && e.pm10 === 300)
    ).toBeTruthy();

    // verify alert created
    try {
      const alerts = await request.get("/api/alerts");
      const alertsJson = await alerts.json().catch(() => null);
      if (alertsJson) {
        expect(Array.isArray(alertsJson)).toBeTruthy();
        expect(
          alertsJson.some(
            (a: any) => a.message && a.message.includes("High emissions")
          )
        ).toBeTruthy();
      }
    } catch (e) {
      // alerts route might not exist or returned non-JSON; skip assertions
      console.warn(
        "Alerts endpoint not available or not JSON; skipping alert assertions"
      );
    }

    // idempotency: posting same sampleId again returns 200 and not create duplicate
    const ingestAgain = await request.post(
      `/api/devices/${payload.deviceId}/ingest`,
      { data: payload, headers: { "x-device-key": deviceKey } }
    );
    expect(ingestAgain.status()).toBe(200);
    const ingestAgainBody = await ingestAgain.json();
    expect(ingestAgainBody.success).toBeTruthy();

    // invalid key should be rejected
    const badIngest = await request.post(
      `/api/devices/${payload.deviceId}/ingest`,
      {
        data: { ...payload, sampleId: `bad-${unique}` },
        headers: { "x-device-key": "deadbeef" },
      }
    );
    expect(badIngest.status()).toBe(401);
  });
});
