"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Settings } from "lucide-react"

export default function VehicleSettingsPage() {
  const params = useParams()
  const id = params?.id ?? ""

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
            <h1 className="text-2xl font-bold text-foreground">Vehicle Settings</h1>
          </div>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Device Settings</h2>
                <p className="text-sm text-muted-foreground">Configure device and reporting settings for this vehicle</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="deviceId">Device ID</Label>
                <Input id="deviceId" defaultValue={`ESP32-0000${id}`} />
              </div>

              <div>
                <Label htmlFor="reportInterval">Reporting Interval (minutes)</Label>
                <Input id="reportInterval" type="number" defaultValue={5} />
              </div>

              <Button className="mt-4">Save Settings</Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
