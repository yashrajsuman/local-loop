"use client";

import { useEffect } from "react";
import { useLocation } from "@/contexts/location-context";

export function AutoLocationPrompt() {
  const { locationStatus, setLocationModalOpen } = useLocation();

  useEffect(() => {
    if (locationStatus === "idle") {
      console.log("AutoLocationPrompt - Showing location modal automatically");

      const timer = setTimeout(() => {
        setLocationModalOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [locationStatus, setLocationModalOpen]);

  return null;
}
