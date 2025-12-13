"use client"

import { DashboardNav } from "@/components/dashboard-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LiveEmissionChart } from "@/components/live-emission-chart"
import { FilterEfficiencyGauge } from "@/components/filter-efficiency-gauge"
import { Activity, TrendingDown, AlertCircle, Wind, Droplets, Gauge, Download, RefreshCw, Calendar } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Real-Time Monitoring</h1>
              <p className="text-muted-foreground">Live emission data from your vehicle sensors</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-card border-border hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Device Status</p>
                  <p className="text-2xl font-bold text-foreground">Active</p>
                  <p className="text-xs text-success mt-1">Last updated: 2s ago</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-success animate-pulse-soft" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Today's Trips</p>
                  <p className="text-2xl font-bold text-foreground">8</p>
                  <p className="text-xs text-success mt-1">+2 from yesterday</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Emissions Reduced</p>
                  <p className="text-2xl font-bold text-foreground">68%</p>
                  <p className="text-xs text-success mt-1">↓ 12% this week</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-success" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Alerts</p>
                  <p className="text-2xl font-bold text-foreground">2</p>
                  <p className="text-xs text-warning mt-1">1 needs attention</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-warning" />
                </div>
              </div>
            </Card>
          </div>

          {/* Live Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LiveEmissionChart title="PM2.5 Particles" unit="μg/m³" color="hsl(var(--primary))" threshold={35} />
            <LiveEmissionChart title="PM10 Particles" unit="μg/m³" color="hsl(var(--accent))" threshold={50} />
            <LiveEmissionChart title="CO₂ Concentration" unit="ppm" color="hsl(var(--warning))" threshold={400} />
            <LiveEmissionChart title="NH₃ Levels" unit="ppm" color="hsl(var(--chart-5))" threshold={25} />
          </div>

          {/* Filter Performance & Current Readings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <FilterEfficiencyGauge />
            </div>

            <div className="lg:col-span-2">
              <Card className="p-6 bg-card border-border h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Current Readings</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-success rounded-full animate-pulse-soft" />
                    <span className="text-sm text-muted-foreground">Live</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-foreground">PM2.5</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">12.4 μg/m³</div>
                    <div className="inline-flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded">
                      <TrendingDown className="h-3 w-3" />
                      <span>Within safe limits</span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="h-5 w-5 text-accent" />
                      <span className="text-sm font-medium text-foreground">PM10</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">24.8 μg/m³</div>
                    <div className="inline-flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded">
                      <TrendingDown className="h-3 w-3" />
                      <span>Good quality</span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="h-5 w-5 text-warning" />
                      <span className="text-sm font-medium text-foreground">CO₂</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">425 ppm</div>
                    <div className="inline-flex items-center gap-1 text-xs text-warning bg-warning/10 px-2 py-1 rounded">
                      <Activity className="h-3 w-3" />
                      <span>Moderate</span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="h-5 w-5 text-chart-5" />
                      <span className="text-sm font-medium text-foreground">NH₃</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">18.2 ppm</div>
                    <div className="inline-flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded">
                      <TrendingDown className="h-3 w-3" />
                      <span>Normal range</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Activity className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">System Operating Normally</h4>
                      <p className="text-sm text-muted-foreground">
                        All sensors are functioning properly. Filter efficiency is at 87%. Next maintenance recommended
                        in 12 days.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { time: "2 minutes ago", event: "PM2.5 level decreased to 12.4 μg/m³", status: "success" },
                { time: "15 minutes ago", event: "Trip completed: 45 km driven", status: "info" },
                { time: "1 hour ago", event: "Filter efficiency improved to 87%", status: "success" },
                { time: "2 hours ago", event: "Alert: CO₂ levels exceeded threshold", status: "warning" },
                { time: "3 hours ago", event: "New trip started", status: "info" },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
                  <div
                    className={`h-2 w-2 rounded-full mt-2 ${
                      activity.status === "success"
                        ? "bg-success"
                        : activity.status === "warning"
                          ? "bg-warning"
                          : "bg-primary"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{activity.event}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
