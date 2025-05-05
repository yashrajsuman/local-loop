"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterBar } from "@/components/filter-bar";
import { ListView } from "@/components/list-view";
import { api } from "@/lib/api";
import type { Item, FilterOptions } from "@/lib/types";
import { Map, List } from "lucide-react";
import dynamic from "next/dynamic";
import { useLocation } from "@/contexts/location-context";
import { Badge } from "@/components/ui/badge";

// Dynamically import MapView with no SSR
const MapViewComponent = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-100 flex items-center justify-center">
      Loading map...
    </div>
  ),
});

export default function DealsPage() {
  const { userLocation, locationStatus, setLocationModalOpen } = useLocation();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    category: null,
    type: "deal",
    dateRange: null,
    searchTerm: "",
    location: null,
    radius: 20, // Default to 20km radius
  });
  const [view, setView] = useState<"map" | "list">("list");

  useEffect(() => {
    if (userLocation && locationStatus === "granted") {
      setFilters((prev) => ({
        ...prev,
        location: userLocation,
      }));
    }
  }, [userLocation, locationStatus]);

  useEffect(() => {
    const fetchItems = async () => {
      console.log("Deals page - fetchItems called with:", {
        locationStatus,
        hasUserLocation: !!userLocation,
        userLocation,
        filters,
      });

      setLoading(true);
      try {
        if (locationStatus === "granted" && userLocation) {
          console.log("Deals page - Location granted, fetching with location");

          const currentFilters = {
            ...filters,
            location: userLocation,
          };

          const data = await api.items.getAll(currentFilters);
          console.log("Deals page - API response:", data);
          setItems(data);
        } else if (
          locationStatus === "denied" ||
          locationStatus === "unavailable"
        ) {
          console.log(
            "Deals page - Location denied or unavailable, showing empty list"
          );
          setItems([]);
        } else {
          console.log(
            "Deals page - Waiting for location permission, showing empty list"
          );
          setItems([]);
        }
      } catch (error) {
        console.error("Deals page - Error fetching items:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [filters, locationStatus, userLocation]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters({
      ...newFilters,
      type: "deal",
      location: filters.location,
    });
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
          <p className="text-muted-foreground mt-1">
            Discover special offers and deals in your neighborhood
          </p>
          {userLocation && (
            <Badge variant="outline" className="mt-2">
              Showing deals within {filters.radius}km of your location
            </Badge>
          )}
        </div>
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as "map" | "list")}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-1">
              <List className="h-4 w-4" />
              <span>List</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-1">
              <Map className="h-4 w-4" />
              <span>Map</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        hideTypeFilter
      />

      <div className="mt-6">
        {view === "list" ? (
          <ListView items={items} loading={loading} />
        ) : (
          <MapViewComponent items={items} />
        )}
      </div>
    </div>
  );
}
