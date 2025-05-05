"use client";

import { useState, useEffect, useRef, memo } from "react";
import { Loader } from "lucide-react";

interface LocationPickerProps {
  initialLocation: { lat: number; lng: number };
  onLocationSelect: (lat: number, lng: number) => void;
}

export default memo(function LocationPicker({
  initialLocation,
  onLocationSelect,
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    let marker: any = null;

    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!window.L) {
          const L = (await import("leaflet")).default;

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

          window.L = L;
        }

        const L = window.L;

        if (!mapRef.current) {
          setError("Map container not found");
          return;
        }

        const map = L.map(mapRef.current, {
          center: [initialLocation.lat, initialLocation.lng],
          zoom: 13,
          scrollWheelZoom: true,
        });

        mapInstanceRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        marker = L.marker([initialLocation.lat, initialLocation.lng], {
          draggable: true,
        }).addTo(map);

        // Handle marker drag
        marker.on("dragend", function (e: any) {
          const position = marker.getLatLng();
          onLocationSelect(position.lat, position.lng);
        });

        // Handle map click
        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;

          if (marker) {
            marker.setLatLng([lat, lng]);
          } else {
            marker = L.marker([lat, lng]).addTo(map);
          }

          onLocationSelect(lat, lng);
        });

        setIsLoading(false);
      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Failed to load map. Please try again later.");
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      initMap();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initialLocation, onLocationSelect]);

  if (error) {
    return (
      <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-red-500 p-4 rounded-md">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Reload
        </button>
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
      <div
        ref={mapRef}
        className="w-full h-full z-0"
        style={{ minHeight: "100%" }}
      />
    </div>
  );
});

declare global {
  interface Window {
    L: any;
  }
}
