"use client"

import { DashboardNav } from "@/components/dashboard-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AddVehicleDialog } from "@/components/add-vehicle-dialog"
import { Car, Activity, AlertCircle, Settings, TrendingDown, Calendar, Gauge, MoreVertical } from "lucide-react"

const vehicles = [
  {
    id: 1,
    plate: "ABC-1234",
    model: "Toyota Camry",
    year: 2023,
    deviceId: "ESP32-00001",
    status: "active",
    lastActive: "2 minutes ago",
    efficiency: 87,
    tripsToday: 5,
    avgEmission: 12.4,
    color: "bg-primary/10 text-primary",
  },
  {
    id: 2,
    plate: "XYZ-5678",
    model: "Honda Civic",
    year: 2022,
    deviceId: "ESP32-00002",
    status: "active",
    lastActive: "5 minutes ago",
    efficiency: 82,
    tripsToday: 3,
    avgEmission: 15.2,
    color: "bg-accent/10 text-accent",
  },
  {
    id: 3,
    plate: "DEF-9012",
    model: "Ford Focus",
    year: 2021,
    deviceId: "ESP32-00003",
    status: "inactive",
    lastActive: "2 hours ago",
    efficiency: 75,
    tripsToday: 0,
    avgEmission: 18.6,
    color: "bg-warning/10 text-warning",
  },
]

export default function VehiclesPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Vehicle Management</h1>
              <p className="text-muted-foreground">Manage your vehicles and connected sensors</p>
            </div>
            <AddVehicleDialog />
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Vehicles</p>
                  <p className="text-2xl font-bold text-foreground">{vehicles.length}</p>
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
                  <p className="text-sm text-muted-foreground">Avg Efficiency</p>
                  <p className="text-2xl font-bold text-foreground">
                    {Math.round(vehicles.reduce((acc, v) => acc + v.efficiency, 0) / vehicles.length)}%
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
                    {vehicles.reduce((acc, v) => acc + v.tripsToday, 0)}
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
                  <div className={`h-14 w-14 rounded-xl ${vehicle.color} flex items-center justify-center`}>
                    <Car className="h-7 w-7" />
                  </div>
                  <div className="flex items-center gap-2">
                    {vehicle.status === "active" ? (
                      <Badge className="bg-success/10 text-success border-success/20">Active</Badge>
                    ) : (
                      <Badge className="bg-muted text-muted-foreground border-border" variant="outline">
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
                    <h3 className="text-xl font-bold text-foreground">{vehicle.plate}</h3>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.model} ({vehicle.year})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Device:</span>
                    <span className="text-foreground font-medium">{vehicle.deviceId}</span>
                  </div>

                  <div className="pt-3 border-t border-border space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Filter Efficiency</span>
                      <span className="font-semibold text-foreground">{vehicle.efficiency}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${vehicle.efficiency >= 85 ? "bg-success" : vehicle.efficiency >= 70 ? "bg-warning" : "bg-danger"}`}
                        style={{ width: `${vehicle.efficiency}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Avg PM2.5</div>
                      <div className="text-lg font-bold text-foreground">{vehicle.avgEmission}</div>
                      <div className="text-xs text-muted-foreground">μg/m³</div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Trips Today</div>
                      <div className="text-lg font-bold text-foreground">{vehicle.tripsToday}</div>
                      <div className="text-xs text-muted-foreground">completed</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <div
                      className={`h-2 w-2 rounded-full ${vehicle.status === "active" ? "bg-success animate-pulse-soft" : "bg-muted"}`}
                    />
                    <span className="text-xs text-muted-foreground">Last active {vehicle.lastActive}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                  <Button size="sm" className="flex-1">
                    <TrendingDown className="mr-2 h-4 w-4" />
                    View Data
                  </Button>
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
                <h3 className="font-semibold text-foreground mb-2">How to Connect a New Device</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  To add a new vehicle, you'll need the ESP32 device ID from your emission sensor system. Make sure the
                  device is powered on and connected to Wi-Fi.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Ensure your ESP32 sensor system is installed on the vehicle exhaust</li>
                  <li>Connect the device to your Wi-Fi network</li>
                  <li>Note down the Device ID displayed on the sensor screen</li>
                  <li>Click "Add Vehicle" and enter your vehicle details</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
