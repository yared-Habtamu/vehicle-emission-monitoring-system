"use client"

import { useState } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle,
  Filter,
  Info,
  X,
  Wind,
  Droplets,
  Gauge,
  Settings,
} from "lucide-react"

const alerts = [
  {
    id: 1,
    type: "warning",
    title: "High CO₂ Levels Detected",
    message: "CO₂ concentration reached 520 ppm, exceeding the safe threshold of 450 ppm",
    vehicle: "ABC-1234",
    timestamp: "5 minutes ago",
    read: false,
    icon: Droplets,
  },
  {
    id: 2,
    type: "info",
    title: "Filter Maintenance Reminder",
    message: "Your vehicle filter efficiency has dropped to 84%. Schedule maintenance within 2 weeks",
    vehicle: "ABC-1234",
    timestamp: "2 hours ago",
    read: false,
    icon: Gauge,
  },
  {
    id: 3,
    type: "success",
    title: "Emission Target Achieved",
    message: "Congratulations! You've reduced PM2.5 emissions by 30% this month",
    vehicle: "All Vehicles",
    timestamp: "1 day ago",
    read: true,
    icon: CheckCircle,
  },
  {
    id: 4,
    type: "warning",
    title: "PM10 Levels Elevated",
    message: "PM10 concentration at 65 μg/m³. Consider reducing trip frequency during peak hours",
    vehicle: "XYZ-5678",
    timestamp: "2 days ago",
    read: true,
    icon: Wind,
  },
  {
    id: 5,
    type: "error",
    title: "Sensor Connection Lost",
    message: "Vehicle DEF-9012 sensor has not transmitted data for 3 hours. Check device connection",
    vehicle: "DEF-9012",
    timestamp: "2 days ago",
    read: true,
    icon: AlertCircle,
  },
]

export default function AlertsPage() {
  const [filter, setFilter] = useState<"all" | "unread" | "warning">("all")

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "all") return true
    if (filter === "unread") return !alert.read
    if (filter === "warning") return alert.type === "warning" || alert.type === "error"
    return true
  })

  const getAlertStyles = (type: string) => {
    switch (type) {
      case "error":
        return "bg-danger/5 border-danger/20"
      case "warning":
        return "bg-warning/5 border-warning/20"
      case "success":
        return "bg-success/5 border-success/20"
      default:
        return "bg-primary/5 border-primary/20"
    }
  }

  const getIconStyles = (type: string) => {
    switch (type) {
      case "error":
        return "bg-danger/10 text-danger"
      case "warning":
        return "bg-warning/10 text-warning"
      case "success":
        return "bg-success/10 text-success"
      default:
        return "bg-primary/10 text-primary"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Alerts & Notifications</h1>
              <p className="text-muted-foreground">Manage your emission alerts and system notifications</p>
            </div>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Alert Settings
            </Button>
          </div>

          {/* Alert Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 bg-card border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Alerts</p>
                  <p className="text-3xl font-bold text-foreground">{alerts.length}</p>
                </div>
                <Bell className="h-8 w-8 text-primary" />
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Unread</p>
                  <p className="text-3xl font-bold text-foreground">{alerts.filter((a) => !a.read).length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-warning animate-pulse-soft" />
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Critical</p>
                  <p className="text-3xl font-bold text-foreground">
                    {alerts.filter((a) => a.type === "error").length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-danger" />
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Resolved</p>
                  <p className="text-3xl font-bold text-foreground">
                    {alerts.filter((a) => a.type === "success").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filter:</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className={filter !== "all" ? "bg-transparent" : ""}
              >
                All ({alerts.length})
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
                className={filter !== "unread" ? "bg-transparent" : ""}
              >
                Unread ({alerts.filter((a) => !a.read).length})
              </Button>
              <Button
                variant={filter === "warning" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("warning")}
                className={filter !== "warning" ? "bg-transparent" : ""}
              >
                Critical ({alerts.filter((a) => a.type === "warning" || a.type === "error").length})
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="ml-auto">
              Mark All as Read
            </Button>
          </div>

          {/* Alert List */}
          <div className="space-y-4">
            {filteredAlerts.map((alert, index) => (
              <Card
                key={alert.id}
                className={`p-6 ${getAlertStyles(alert.type)} hover:shadow-lg transition-all duration-300 animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`h-12 w-12 rounded-lg ${getIconStyles(alert.type)} flex items-center justify-center flex-shrink-0`}
                  >
                    <alert.icon className="h-6 w-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground">{alert.title}</h3>
                        {!alert.read && <Badge className="bg-primary text-primary-foreground flex-shrink-0">New</Badge>}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">{alert.message}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Info className="h-3 w-3" />
                        <span>Vehicle: {alert.vehicle}</span>
                      </div>
                      <span>•</span>
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Alert Preferences */}
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-6">Alert Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">High Emission Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified when emissions exceed safe limits</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Filter Maintenance</p>
                  <p className="text-sm text-muted-foreground">Reminders for filter replacement and maintenance</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Device Connection</p>
                  <p className="text-sm text-muted-foreground">Alert when sensors lose connection</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Achievement Milestones</p>
                  <p className="text-sm text-muted-foreground">Celebrate emission reduction achievements</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Daily Summary</p>
                  <p className="text-sm text-muted-foreground">Receive daily emission summary notifications</p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
