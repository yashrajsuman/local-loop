"use client";

import { useState, useEffect, useRef } from "react";
import type { Item } from "@/lib/types";
import { Loader } from "lucide-react";
import L from "leaflet";

interface MapViewProps {
  items: Item[];
}

export default function MapView({ items }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initMap = async () => {
      try {
        setIsLoading(true);

        // Dynamically import leaflet
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

        if (!mapRef.current) return;

        // Check if a map is already initialized on this container
        // and clean it up if it exists
        if (mapInstanceRef.current) {
          console.log("Map already initialized, cleaning up first");
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          markersRef.current = [];
        }

        const map = L.map(mapRef.current);
        mapInstanceRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        const firstItem = items[0];
        const bounds = L.latLngBounds(
          firstItem
            ? [firstItem.location.lat, firstItem.location.lng]
            : [12.9716, 77.5946],
          firstItem
            ? [firstItem.location.lat, firstItem.location.lng]
            : [12.9716, 77.5946]
        );

        items.forEach((item) => {
          if (
            !item.location ||
            typeof item.location.lat !== "number" ||
            typeof item.location.lng !== "number"
          ) {
            console.error("Invalid location data for item:", item);
            return;
          }

          try {
            const marker = L.marker([
              item.location.lat,
              item.location.lng,
            ]).addTo(map);

            const popupContent = document.createElement("div");
            popupContent.innerHTML = `
              <div class="p-2">
                <h3 class="font-bold">${item.title}</h3>
                <p class="text-sm">${item.category}</p>
                <p class="text-sm mt-1">📅 ${formatDate(item.startDate)}</p>
                <p class="text-sm mt-1">📍 ${item.address}</p>
                <a href="/${item.type}s/${
              item.id
            }" class="block mt-2 px-2 py-1 text-sm text-center text-white bg-blue-500 rounded" style="color: white !important">
                  View Details
                </a>
              </div>
            `;

            marker.bindPopup(popupContent);
            markersRef.current.push(marker);

            bounds.extend([item.location.lat, item.location.lng]);
          } catch (error) {
            console.error("Error creating marker for item:", item, error);
          }
        });

        if (markersRef.current.length > 0) {
          map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 15,
          });
        } else {
          map.setView([12.9716, 77.5946], 13);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Failed to load map. Please try again later.");
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = [];
      }
    };
  }, [items]);

  if (error) {
    return (
      <div className="w-full h-[600px] bg-gray-100 flex flex-col items-center justify-center text-red-500">
        <p>{error}</p>
        <p className="text-sm mt-2">Try switching to List View</p>
      </div>
    );
  }

  if (!isLoading && (!items || items.length === 0)) {
    return (
      <div className="w-full h-[600px] bg-gray-100 flex flex-col items-center justify-center">
        <p className="text-lg font-medium">No items found on map</p>
        <p className="text-sm text-muted-foreground mt-2">
          We couldn't find any items near your location
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] relative">
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
