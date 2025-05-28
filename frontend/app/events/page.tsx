"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterBar } from "@/components/filter-bar";
import { ListView } from "@/components/list-view";
import { api } from "@/lib/api";
import type { Item, FilterOptions } from "@/lib/types";
import { Map, List, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { useLocation } from "@/contexts/location-context";
import { Badge } from "@/components/ui/badge";

// Dynamically import MapView with no SSR
const MapViewComponent = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <div className="text-gray-600 dark:text-gray-300">Loading map...</div>
    </div>
  ),
});

export default function EventsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { userLocation, locationStatus, setLocationModalOpen } = useLocation();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    category: null,
    type: "event",
    dateRange: null,
    searchTerm: "",
    location: null,
    radius: 20, // Default to 20km radius
  });
  const [view, setView] = useState<"map" | "list">("list");

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

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
      console.log("Events page - fetchItems called with:", {
        locationStatus,
        hasUserLocation: !!userLocation,
        userLocation,
        filters,
      });

      setLoading(true);
      try {
        if (locationStatus === "granted" && userLocation) {
          console.log("Events page - Location granted, fetching with location");

          const currentFilters = {
            ...filters,
            location: userLocation,
          };

          const data = await api.items.getAll(currentFilters);
          console.log("Events page - API response:", data);
          setItems(data);
        } else if (
          locationStatus === "denied" ||
          locationStatus === "unavailable"
        ) {
          console.log(
            "Events page - Location denied or unavailable, showing empty list"
          );
          setItems([]);
        } else {
          console.log(
            "Events page - Waiting for location permission, showing empty list"
          );
          setItems([]);
        }
      } catch (error) {
        console.error("Events page - Error fetching items:", error);
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
      type: "event",
      location: filters.location,
    });
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="container py-8">
      {/* Theme Toggle Button - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-yellow-500" />
          ) : (
            <Moon className="h-4 w-4 text-blue-600" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Events</h1>
          <p className="text-muted-foreground dark:text-gray-300 mt-1">
            Discover upcoming events in your neighborhood
          </p>
          {userLocation && (
            <Badge variant="outline" className="mt-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
              Showing events within {filters.radius}km of your location
            </Badge>
          )}
        </div>
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as "map" | "list")}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger 
              value="list" 
              className="flex items-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
            >
              <List className="h-4 w-4" />
              <span>List</span>
            </TabsTrigger>
            <TabsTrigger 
              value="map" 
              className="flex items-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
            >
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