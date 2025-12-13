"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Car, Plus } from "lucide-react"

export function AddVehicleDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    plate: "",
    model: "",
    year: "",
    deviceId: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Adding vehicle:", formData)
    setOpen(false)
    setFormData({ plate: "", model: "", year: "", deviceId: "" })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Vehicle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="plate" className="text-foreground">
              License Plate
            </Label>
            <Input
              id="plate"
              placeholder="ABC-1234"
              value={formData.plate}
              onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model" className="text-foreground">
              Vehicle Model
            </Label>
            <Input
              id="model"
              placeholder="Toyota Camry"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year" className="text-foreground">
              Year
            </Label>
            <Input
              id="year"
              type="number"
              placeholder="2023"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deviceId" className="text-foreground">
              Device ID (ESP32)
            </Label>
            <Input
              id="deviceId"
              placeholder="ESP32-00001"
              value={formData.deviceId}
              onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <Car className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
