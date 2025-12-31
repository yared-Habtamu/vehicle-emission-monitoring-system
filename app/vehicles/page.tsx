"use client";

import { DashboardNav } from "@/components/dashboard-nav";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddVehicleDialog } from "@/components/add-vehicle-dialog";
import {
  Car,
  Activity,
  AlertCircle,
  Settings,
  TrendingDown,
  Calendar,
  Gauge,
  MoreVertical,
} from "lucide-react";

type Vehicle = {
  id: string;
  plate: string;
  model: string;
  year: number;
  deviceId: string;
  status: string;
  lastActive?: string;
  efficiency?: number;
  tripsToday?: number;
  avgIn?: number;
  avgOut?: number;
  color?: string;
};

const vehiclesInitial: Vehicle[] = [];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(vehiclesInitial);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch("/api/vehicles", { headers });
        if (!res.ok) throw new Error("Failed to fetch");
        const baseVehicles = await res.json();

        // Enrich vehicles with MQ135 averages from Sample collection.
        const enriched = await Promise.all(
          (baseVehicles ?? []).map(async (v: any) => {
            try {
              const r = await fetch(`/api/vehicles/${v.id}/samples?limit=50`, {
                headers,
              });
              if (!r.ok) return v;
              const s = await r.json();
              return {
                ...v,
                avgIn: s?.summary?.avgIn,
                avgOut: s?.summary?.avgOut,
                efficiency: s?.summary?.avgEfficiency ?? v.efficiency,
              };
            } catch {
              return v;
            }
          })
        );

        if (mounted) setVehicles(enriched);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Vehicle Management
              </h1>
              <p className="text-muted-foreground">
                Manage your vehicles and connected sensors
              </p>
            </div>
            <AddVehicleDialog />
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Vehicles
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {vehicles.length}
                  </p>
                </div>
                <Car className="h-8 w-8 text-primary" />
              </div>
            </Card>

            <Card className="p-4 bg-card border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Now</p>
                  <p className="text-2xl font-bold text-foreground">
                    {vehicles.filter((v) => v.status === "active").length}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-success animate-pulse-soft" />
              </div>
            </Card>

            <Card className="p-4 bg-card border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Avg Efficiency
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {vehicles.length
                      ? Math.round(
                          vehicles.reduce(
                            (acc, v) => acc + (v.efficiency ?? 0),
                            0
                          ) / vehicles.length
                        )
                      : 0}
                    %
                  </p>
                </div>
                <Gauge className="h-8 w-8 text-accent" />
              </div>
            </Card>

            <Card className="p-4 bg-card border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Trips Today</p>
                  <p className="text-2xl font-bold text-foreground">
                    {vehicles.reduce((acc, v) => acc + (v.tripsToday ?? 0), 0)}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-warning" />
              </div>
            </Card>
          </div>

          {/* Vehicle Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {vehicles.map((vehicle, index) => (
              <Card
                key={vehicle.id}
                className="p-6 bg-card border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`h-14 w-14 rounded-xl ${
                      vehicle.color ?? "bg-muted"
                    } flex items-center justify-center`}
                  >
                    <Car className="h-7 w-7" />
                  </div>
                  <div className="flex items-center gap-2">
                    {vehicle.status === "active" ? (
                      <Badge className="bg-success/10 text-success border-success/20">
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        className="bg-muted text-muted-foreground border-border"
                        variant="outline"
                      >
                        Inactive
                      </Badge>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {vehicle.plate}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.model} ({vehicle.year})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Device:</span>
                    <span className="text-foreground font-medium">
                      {vehicle.deviceId}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-border space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Filter Efficiency
                      </span>
                      <span className="font-semibold text-foreground">
                        {vehicle.efficiency ?? 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          (vehicle.efficiency ?? 0) >= 85
                            ? "bg-success"
                            : (vehicle.efficiency ?? 0) >= 70
                            ? "bg-warning"
                            : "bg-danger"
                        }`}
                        style={{ width: `${vehicle.efficiency ?? 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">
                        Avg In
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {vehicle.avgIn != null
                          ? Math.round(vehicle.avgIn)
                          : "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">raw</div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">
                        Avg Out
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {vehicle.avgOut != null
                          ? Math.round(vehicle.avgOut)
                          : "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">raw</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        vehicle.status === "active"
                          ? "bg-success animate-pulse-soft"
                          : "bg-muted"
                      }`}
                    />
                    <span className="text-xs text-muted-foreground">
                      Last active {vehicle.lastActive ?? "—"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <Link
                    href={`/vehicles/${vehicle.id}/settings`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                  </Link>
                  <Link href={`/vehicles/${vehicle.id}`} className="flex-1">
                    <Button size="sm" className="w-full">
                      <TrendingDown className="mr-2 h-4 w-4" />
                      View Data
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* Device Connection Guide */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  How to Connect a New Device
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  To add a new vehicle, you'll need the ESP32 device ID from
                  your emission sensor system. Make sure the device is powered
                  on and connected to Wi-Fi.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>
                    Ensure your ESP32 sensor system is installed on the vehicle
                    exhaust
                  </li>
                  <li>Connect the device to your Wi-Fi network</li>
                  <li>
                    Note down the Device ID displayed on the sensor screen
                  </li>
                  <li>Click "Add Vehicle" and enter your vehicle details</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
