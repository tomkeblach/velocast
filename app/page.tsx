"use client";
import { useState, useEffect } from "react";
import Topbar from "@/components/layout/Topbar";
import HeroSection from "@/components/layout/HeroSection";
import ForecastSection from "@/components/layout/ForecastSection";

// Zeitzone zu Stadt Mapping
function getCityFromTimezone(timezone: string): string {
  const timezoneMap: Record<string, string> = {
    "Europe/Berlin": "Berlin",
    "Europe/Paris": "Paris",
    "Europe/London": "London",
    "Europe/Amsterdam": "Amsterdam",
    "Europe/Rome": "Rome",
    "Europe/Madrid": "Madrid",
    "Europe/Vienna": "Vienna",
    "Europe/Brussels": "Brussels",
    "Europe/Copenhagen": "Copenhagen",
    "Europe/Stockholm": "Stockholm",
    "Europe/Oslo": "Oslo",
    "Europe/Helsinki": "Helsinki",
    "Europe/Warsaw": "Warsaw",
    "Europe/Prague": "Prague",
    "Europe/Budapest": "Budapest",
    "Europe/Zurich": "Zurich",
    "America/New_York": "New York",
    "America/Los_Angeles": "Los Angeles",
    "America/Chicago": "Chicago",
    "America/Denver": "Denver",
    "America/Toronto": "Toronto",
    "America/Vancouver": "Vancouver",
    "America/Mexico_City": "Mexico City",
    "America/Sao_Paulo": "São Paulo",
    "America/Buenos_Aires": "Buenos Aires",
    "Asia/Tokyo": "Tokyo",
    "Asia/Shanghai": "Shanghai",
    "Asia/Hong_Kong": "Hong Kong",
    "Asia/Singapore": "Singapore",
    "Asia/Seoul": "Seoul",
    "Asia/Dubai": "Dubai",
    "Asia/Bangkok": "Bangkok",
    "Asia/Kolkata": "Mumbai",
    "Australia/Sydney": "Sydney",
    "Australia/Melbourne": "Melbourne",
    "Pacific/Auckland": "Auckland",
  };

  return timezoneMap[timezone] || "Amsterdam"; // Amsterdam als Fallback
}

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lon: number;
    location: any;
  } | null>(null);
  const [isLoadingDefault, setIsLoadingDefault] = useState(true);

  useEffect(() => {
    async function setDefaultLocation() {
      try {
        // Erst Geolocation versuchen
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              const userLanguage = navigator.language || "en";

              try {
                const reverseGeoResponse = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=${userLanguage}`,
                );
                const locationData = await reverseGeoResponse.json();

                if (locationData) {
                  setSelectedLocation({
                    lat: parseFloat(locationData.lat),
                    lon: parseFloat(locationData.lon),
                    location: locationData,
                  });
                  setIsLoadingDefault(false);
                  return;
                }
              } catch (error) {
                console.error("Error with geolocation:", error);
              }

              // Fallback zur Zeitzone
              await loadTimezoneBasedLocation();
            },
            async () => {
              // Geolocation abgelehnt - Fallback zur Zeitzone
              await loadTimezoneBasedLocation();
            },
          );
        } else {
          // Keine Geolocation verfügbar - Fallback zur Zeitzone
          await loadTimezoneBasedLocation();
        }
      } catch (error) {
        console.error("Error setting default location:", error);
        await loadTimezoneBasedLocation();
      }
    }

    async function loadTimezoneBasedLocation() {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const cityName = getCityFromTimezone(timezone);
        const userLanguage = navigator.language || "en";

        const searchResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            cityName,
          )}&format=json&limit=1&addressdetails=1&accept-language=${userLanguage}`,
        );
        const searchData = await searchResponse.json();

        if (searchData.length > 0) {
          const location = searchData[0];
          setSelectedLocation({
            lat: parseFloat(location.lat),
            lon: parseFloat(location.lon),
            location: location,
          });
        }
      } catch (error) {
        console.error("Error loading timezone-based location:", error);
      } finally {
        setIsLoadingDefault(false);
      }
    }

    setDefaultLocation();
  }, []);

  const handleLocationSelect = (lat: number, lon: number, location: any) => {
    setSelectedLocation({ lat, lon, location });
  };

  return (
    <main className="bg-background min-h-screen">
      <div className="flex flex-col gap-6 mx-auto px-4 sm:px-6 xl:px-8 py-6 w-full max-w-7xl">
        <Topbar
          onLocationSelect={handleLocationSelect}
          selectedLocation={selectedLocation}
        />
        <HeroSection selectedLocation={selectedLocation} />
        <ForecastSection selectedLocation={selectedLocation} />
      </div>
    </main>
  );
}
