# Ingest API (device ingestion)

This document describes how devices (ESP32 or similar) can send sensor readings to the backend ingestion endpoint.

Endpoints

- POST /api/ingest — generic ingest endpoint that accepts JSON with a `deviceId` in the body and requires the device key via `x-device-key` header (or `deviceKey` in the body).
- POST /api/devices/:deviceId/ingest — device-scoped endpoint that accepts the same payload but with `deviceId` in the URL path (also requires device key).

Required headers

- `Content-Type: application/json`
- `x-device-key: <device-secret>`

Example payload (ESP32):

{
"deviceId": "ESP32-FILTER-001",
"sampleId": "e2e-sample-12345",
"timestamp": "2025-12-29T12:34:56Z",
"pm25_before": 400,
"pm25": 180,
"pm10": 300,
"co2": 450,
"battery": 90,
"firmware": "v1.0.0"
}

Behavior

- The server validates the timestamp and required readings (pm25, pm10, co2).
- Idempotency is supported by `sampleId` — re-sending the same sampleId returns 200 with the existing emission.
- The complete payload is stored as `metrics` on the Emission for analysis.
- The server will create alerts/reports for thresholds (best-effort) and update vehicle aggregation values (avgEmission, efficiency).

Testing locally

1. Start the dev server: `pnpm dev` (default: http://localhost:3000)
2. Create a test device and device key, then POST a sample using the supplied script:
   - `node scripts/test-ingest.cjs` (the script will upsert a test vehicle and device key if needed and post a sample to `/api/ingest`).

Security

- Device keys are shared secrets and should be provisioned securely; the examples and seed scripts in this repo are for development only.
