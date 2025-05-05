"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

type LocationStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable";

interface LocationContextType {
  userLocation: { lat: number; lng: number } | null;
  locationStatus: LocationStatus;
  requestLocationPermission: () => Promise<boolean>;
  ensureLocation: () => Promise<boolean>;
  locationModalOpen: boolean;
  setLocationModalOpen: (open: boolean) => void;
}

const LocationContext = createContext<LocationContextType>({
  userLocation: null,
  locationStatus: "idle",
  requestLocationPermission: async () => false,
  ensureLocation: async () => false,
  locationModalOpen: false,
  setLocationModalOpen: () => {},
});

export const useLocation = () => useContext(LocationContext);

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const hasLocationChangedSignificantly = (
    oldLocation: { lat: number; lng: number } | null,
    newLocation: { lat: number; lng: number }
  ): boolean => {
    if (!oldLocation) return true;

    try {
      const distance = calculate_distance(
        oldLocation.lat,
        oldLocation.lng,
        newLocation.lat,
        newLocation.lng
      );

      return distance > 0.1;
    } catch (error) {
      console.error("Error calculating location change:", error);
      return true;
    }
  };

  // Helper function to calculate distance (copied from backend)
  const calculate_distance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371.0;

    const lat1_rad = (lat1 * Math.PI) / 180;
    const lon1_rad = (lon1 * Math.PI) / 180;
    const lat2_rad = (lat2 * Math.PI) / 180;
    const lon2_rad = (lon2 * Math.PI) / 180;

    const dlon = lon2_rad - lon1_rad;
    const dlat = lat2_rad - lat1_rad;

    const a =
      Math.sin(dlat / 2) ** 2 +
      Math.cos(lat1_rad) * Math.cos(lat2_rad) * Math.sin(dlon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  };

  const updateLocation = (position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    const newLocation = { lat: latitude, lng: longitude };

    const storedLocationStr = localStorage.getItem("userLocation");
    let storedLocation = null;

    if (storedLocationStr) {
      try {
        storedLocation = JSON.parse(storedLocationStr);
      } catch (e) {
        console.error("Error parsing stored location:", e);
      }
    }

    if (hasLocationChangedSignificantly(storedLocation, newLocation)) {
      console.log(
        "LocationProvider - Location changed significantly, updating:",
        latitude,
        longitude
      );
      setUserLocation(newLocation);
      localStorage.setItem("userLocation", JSON.stringify(newLocation));
    } else if (!userLocation) {
      console.log("LocationProvider - Using stored location:", storedLocation);
      setUserLocation(storedLocation);
    } else {
      console.log(
        "LocationProvider - Location hasn't changed significantly, keeping current"
      );
    }
  };

  useEffect(() => {
    console.log("LocationProvider - Initializing");

    if (!navigator.geolocation) {
      console.log("LocationProvider - Geolocation not available");
      setLocationStatus("unavailable");
      return;
    }

    const storedStatus = localStorage.getItem("locationPermission");
    console.log("LocationProvider - Stored permission status:", storedStatus);

    const storedLocationStr = localStorage.getItem("userLocation");
    if (storedLocationStr) {
      try {
        const storedLocation = JSON.parse(storedLocationStr);
        console.log(
          "LocationProvider - Found stored coordinates:",
          storedLocation
        );
        setUserLocation(storedLocation);
      } catch (e) {
        console.error("Error parsing stored location:", e);
      }
    }

    if (storedStatus === "granted") {
      setLocationStatus("granted");

      console.log("LocationProvider - Permission granted, getting location");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log(
            "LocationProvider - Got location:",
            position.coords.latitude,
            position.coords.longitude
          );
          updateLocation(position);
        },
        (error) => {
          console.error(
            "LocationProvider - Error getting location despite granted permission:",
            error
          );

          if (error.code === 1) {
            setLocationStatus("denied");
            localStorage.setItem("locationPermission", "denied");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    } else if (storedStatus === "denied") {
      console.log("LocationProvider - Permission previously denied");
      setLocationStatus("denied");
    } else {
      console.log(
        "LocationProvider - No stored permission, showing modal on first access to location-dependent page"
      );
    }
  }, []);

  // Function to check if location is available and request if needed
  const ensureLocation = async (): Promise<boolean> => {
    console.log(
      "LocationProvider - ensureLocation called, current status:",
      locationStatus
    );

    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      return false;
    }

    if (userLocation) {
      console.log("LocationProvider - Already have location");
      return true;
    }

    if (locationStatus === "granted") {
      console.log(
        "LocationProvider - Have permission but no location, requesting it"
      );
      return await requestLocationPermission();
    }

    if (locationStatus === "idle" || locationStatus === "denied") {
      console.log("LocationProvider - No permission, showing modal");
      setLocationModalOpen(true);
      return false;
    }

    return false;
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    console.log("LocationProvider - requestLocationPermission called");

    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      return false;
    }

    try {
      setLocationStatus("requesting");

      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve(position),
            (error) => reject(error),
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000,
            }
          );
        }
      );

      console.log(
        "LocationProvider - Permission granted, got location:",
        position.coords.latitude,
        position.coords.longitude
      );
      updateLocation(position);
      setLocationStatus("granted");
      localStorage.setItem("locationPermission", "granted");
      return true;
    } catch (error) {
      console.error("LocationProvider - Error getting location:", error);
      setLocationStatus("denied");
      localStorage.setItem("locationPermission", "denied");
      return false;
    }
  };

  const value = {
    userLocation,
    locationStatus,
    requestLocationPermission,
    ensureLocation,
    locationModalOpen,
    setLocationModalOpen,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}
