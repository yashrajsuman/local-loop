"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLocation } from "@/contexts/location-context"
import { MapPin, Shield } from "lucide-react"

export function LocationPermissionModal() {
  const { locationModalOpen, setLocationModalOpen, requestLocationPermission, locationStatus } = useLocation()

  const handleAllowLocation = async () => {
    const granted = await requestLocationPermission()
    if (granted) {
      setLocationModalOpen(false)
    }
  }

  const handleDenyLocation = () => {
    localStorage.setItem("locationPermission", "denied")
    setLocationModalOpen(false)
  }

  return (
    <Dialog open={locationModalOpen} onOpenChange={setLocationModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            Enable Location Services
          </DialogTitle>
          <DialogDescription>
            To show you nearby events and deals, we need access to your location. 
            We respect your privacy and never store your location without consent.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          <div className="flex items-start space-x-3 rounded-md border p-4">
            <Shield className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Your privacy matters</p>
              <p className="text-sm text-muted-foreground">
                Your location is only used to show relevant neighborhood events and deals.
                We don't track or store your location data on our servers.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={handleDenyLocation}
            disabled={locationStatus === "requesting"}
          >
            Not Now
          </Button>
          <Button 
            onClick={handleAllowLocation}
            disabled={locationStatus === "requesting"}
          >
            {locationStatus === "requesting" ? "Getting Location..." : "Allow Location Access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
