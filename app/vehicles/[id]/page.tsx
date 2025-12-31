"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Activity, Car, ArrowLeft } from "lucide-react";

function toIsoStringOrNull(value: any): string | null {
  if (!value) return null;

  // Mongo Extended JSON from `findRaw` often looks like { "$date": "..." }
  const maybeDate = (value as any)?.$date;
  if (maybeDate != null) {
    if (typeof maybeDate === "string" || typeof maybeDate === "number") {
      const d = new Date(maybeDate);
      return Number.isNaN(d.getTime()) ? null : d.toISOString();
    }

    // Some serializers: { "$date": { "$numberLong": "..." } }
    const numberLong = (maybeDate as any)?.$numberLong;
    if (typeof numberLong === "string") {
      const ms = Number(numberLong);
      const d = new Date(ms);
      return Number.isNaN(d.getTime()) ? null : d.toISOString();
    }
  }

  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

type Vehicle = {
  id: string;
  plate: string;
  model: string;
  year: number;
  deviceId: string;
  status: string;
  efficiency?: number;
};

type Sample = {
  id?: string;
  _id?: { $oid?: string };
  timestamp: string;
  receivedAt?: string;
  in: number;
  out: number;
  efficiency: number;
  sampleId: string;
};

export default function VehicleDetailPage() {
  const params = useParams();
  const id = params?.id ?? "";

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const headers: any = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch(`/api/vehicles/${id}`, { headers });
        if (res.ok) {
          const v = await res.json();
          if (mounted) setVehicle(v);
        }

        const sRes = await fetch(`/api/vehicles/${id}/samples?limit=50`, {
          headers,
        });
        if (sRes.ok) {
          const sJson = await sRes.json();
          if (mounted) {
            setSamples(
              (sJson?.samples ?? []).map((s: any) => ({
                ...s,
                timestamp:
                  toIsoStringOrNull(s.timestamp) ?? new Date().toISOString(),
                receivedAt: toIsoStringOrNull(s.receivedAt) ?? undefined,
              }))
            );
            setSummary(sJson?.summary);
          }
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!isLive) return;
    if (!vehicle?.deviceId) return;

    let lastReceivedAt: number | null = null;
    let cancelled = false;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: any = token ? { Authorization: `Bearer ${token}` } : {};

    const tick = async () => {
      try {
        const since = lastReceivedAt
          ? `?limit=20&since=${encodeURIComponent(
              new Date(lastReceivedAt).toISOString()
            )}`
          : `?limit=20`;

        const r = await fetch(
          `/api/devices/${vehicle.deviceId}/samples${since}`,
          { headers }
        );
        if (!r.ok) return;
        const json = await r.json();
        const incoming: Sample[] = (json?.samples ?? []).map((s: any) => ({
          ...s,
          timestamp: toIsoStringOrNull(s.timestamp) ?? new Date().toISOString(),
          receivedAt: toIsoStringOrNull(s.receivedAt) ?? undefined,
        }));

        if (incoming.length) {
          const newest = Math.max(
            ...incoming.map((s) =>
              new Date(s.receivedAt ?? s.timestamp).getTime()
            )
          );
          lastReceivedAt = newest;
        }

        if (!cancelled && incoming.length) {
          setSamples((prev) => {
            const merged = [...incoming, ...prev];
            const seen = new Set<string>();
            const deduped = merged.filter((s) => {
              if (seen.has(s.id)) return false;
              seen.add(s.id);
              return true;
            });
            return deduped.sort(
              (a, b) =>
                new Date(b.receivedAt ?? b.timestamp).getTime() -
                new Date(a.receivedAt ?? a.timestamp).getTime()
            );
          });
        }
      } catch {
        // ignore polling errors
      }
    };

    const interval = setInterval(tick, 2000);
    tick();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isLive, vehicle?.deviceId]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
          <div className="flex items-center gap-4">
            <Link href="/vehicles">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              Vehicle Details
            </h1>
          </div>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
                <Car className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {vehicle?.plate ?? "—"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {vehicle ? `${vehicle.model} (${vehicle.year})` : ""}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Device ID</div>
                <div className="font-medium text-foreground">
                  {vehicle?.deviceId ?? "—"}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">
                  Filter Efficiency
                </div>
                <div className="font-medium text-foreground">
                  {Math.round(
                    summary?.avgEfficiency ?? vehicle?.efficiency ?? 0
                  )}
                  %
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">
                  Avg In / Out
                </div>
                <div className="font-medium text-foreground">
                  {summary?.avgIn != null ? Math.round(summary.avgIn) : "—"} /{" "}
                  {summary?.avgOut != null ? Math.round(summary.avgOut) : "—"}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Trips Today</div>
                <div className="font-medium text-foreground">—</div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Button
                variant={isLive ? "default" : "outline"}
                onClick={() => setIsLive((v) => !v)}
              >
                Live updates {isLive ? "On" : "Off"}
              </Button>
            </div>

            <div className="mt-6">
              <h3 className="text-sm text-muted-foreground mb-2">
                Recent Activity
              </h3>
              <div className="space-y-2">
                {samples.slice(0, 5).map((s) => (
                  <div
                    key={s.id ?? s._id?.$oid ?? s.sampleId}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Activity className="h-4 w-4" />
                    <span>
                      {new Date(s.timestamp).toLocaleString()} — in {s.in}, out{" "}
                      {s.out}, eff {Math.round(s.efficiency)}%
                    </span>
                  </div>
                ))}
                {samples.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No samples yet.
                  </div>
                ) : null}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
