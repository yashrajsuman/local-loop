"use client";

import { useState, useEffect, useRef } from "react";
import { Loader } from "lucide-react";
import L from "leaflet";

interface DetailMapProps {
  location: {
    lat: number;
    lng: number;
  };
  address: string;
}

export default function DetailMap({ location, address }: DetailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initMap = async () => {
      try {
        setIsLoading(true);
        console.log("DetailMap: Initializing map with location:", location);

        await import("leaflet/dist/leaflet.css");

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
          iconUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        });

        if (!mapRef.current) {
          console.log("DetailMap: Map container ref is null");
          return;
        }

        if (mapInstanceRef.current) {
          console.log("DetailMap: Map already initialized, cleaning up first");
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log("DetailMap: Creating new map instance");

        try {
          const map = L.map(mapRef.current, {
            fadeAnimation: false,
            zoomAnimation: false,
          }).setView([location.lat, location.lng], 15);

          mapInstanceRef.current = map;

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map);

          const marker = L.marker([location.lat, location.lng]).addTo(map);
          marker.bindPopup(address).openPopup();

          setTimeout(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          }, 200);

          console.log("DetailMap: Map initialized successfully");
        } catch (mapError) {
          console.error("DetailMap: Error creating map instance:", mapError);
          setError("Failed to initialize map. Please try again later.");
        }

        setIsLoading(false);
      } catch (err) {
        console.error("DetailMap: Error initializing map:", err);
        setError("Failed to load map. Please try again later.");
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      initMap();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        console.log("DetailMap: Cleaning up map instance");
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [location, address]);

  if (error) {
    return (
      <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-70 flex items-center justify-center z-10">
          <div className="flex items-center">
            <Loader className="animate-spin h-6 w-6 mr-2" />
            <span>Loading map...</span>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
