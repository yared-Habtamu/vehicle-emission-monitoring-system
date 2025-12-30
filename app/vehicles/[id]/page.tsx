"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Car, ArrowLeft } from "lucide-react"

export default function VehicleDetailPage() {
  const params = useParams()
  const id = params?.id ?? ""

  // Placeholder data — in a real app you'd fetch by id
  const vehicle = {
    id,
    plate: `PLATE-${id}`,
    model: "Toyota Camry",
    year: 2023,
    deviceId: `ESP32-0000${id}`,
    status: "active",
    lastActive: "5 minutes ago",
    efficiency: 87,
    tripsToday: 5,
    avgEmission: 12.4,
  }

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
            <h1 className="text-2xl font-bold text-foreground">Vehicle Details</h1>
          </div>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
                <Car className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{vehicle.plate}</h2>
                <p className="text-sm text-muted-foreground">{vehicle.model} ({vehicle.year})</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Device ID</div>
                <div className="font-medium text-foreground">{vehicle.deviceId}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Filter Efficiency</div>
                <div className="font-medium text-foreground">{vehicle.efficiency}%</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Avg PM2.5</div>
                <div className="font-medium text-foreground">{vehicle.avgEmission} μg/m³</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Trips Today</div>
                <div className="font-medium text-foreground">{vehicle.tripsToday}</div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm text-muted-foreground mb-2">Recent Activity</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  <span>Trip completed — 5 km — Good efficiency</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  <span>Filter check — within threshold</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
