"use client";
import { useState, useEffect, useRef } from "react";
import Topbar from "@/components/layout/Topbar";
import HeroSection from "@/components/layout/HeroSection";
import ForecastSection from "@/components/layout/ForecastSection";
import { Slider } from "@/components/ui/slider";
import { Timer } from "lucide-react";
import { motion } from "framer-motion";

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
  const [rideDuration, setRideDuration] = useState(3);
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
  const prevLocationRef = useRef(selectedLocation);

  // Reset day auto-detection only when location changes (not on rideDuration change)
  useEffect(() => {
    if (prevLocationRef.current !== selectedLocation) {
      prevLocationRef.current = selectedLocation;
      setActiveDayIndex(null);
    }
  }, [selectedLocation, rideDuration]);

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
              // Geolocation denied — fall back to timezone-based location
              await loadTimezoneBasedLocation();
            },
          );
        } else {
          // Geolocation not available — fall back to timezone-based location
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

  const handleDayDetected = (i: number) => {
    setActiveDayIndex((prev) => (prev === null ? i : prev));
  };

  return (
    <main className="bg-background min-h-screen">
      <div className="flex flex-col gap-6 mx-auto px-4 sm:px-6 xl:px-8 py-6 w-full max-w-7xl">
        <Topbar
          onLocationSelect={handleLocationSelect}
          selectedLocation={selectedLocation}
        />
        <div className="flex md:flex-row flex-col flex-wrap sm:justify-between gap-3">
          <div className="flex gap-1.5 pb-0.5 overflow-x-auto no-scrollbar">
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() + i);
              const label =
                i === 0
                  ? "Today"
                  : i === 1
                    ? "Tomorrow"
                    : d.toLocaleDateString("en", { weekday: "short" });
              const isActive = activeDayIndex === i;
              return (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => setActiveDayIndex(i)}
                  className={`relative flex flex-col items-center px-3 py-2 rounded-xl text-sm transition-colors ${
                    isActive
                      ? "text-background font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  whileTap={{ scale: 0.93 }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="day-bubble"
                      className="absolute inset-0 bg-primary rounded-xl"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative text-xs">{label}</span>
                  <span className="relative font-bold text-base leading-tight">
                    {d.getDate()}
                  </span>
                </motion.button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 px-1">
            <Timer className="size-4 text-primary shrink-0" />
            <span className="text-muted-foreground text-sm whitespace-nowrap">
              Ride Duration
            </span>
            <Slider
              value={[rideDuration]}
              onValueChange={([v]) => setRideDuration(v)}
              min={1}
              max={8}
              step={0.5}
              className="flex-1 md:flex-none md:w-40"
            />
            <span className="w-8 font-bold text-primary text-sm text-right whitespace-nowrap">
              {rideDuration}h
            </span>
          </div>
        </div>

        <HeroSection
          selectedLocation={selectedLocation}
          rideDuration={rideDuration}
          dayIndex={activeDayIndex}
          onDayDetected={handleDayDetected}
        />
        <ForecastSection
          selectedLocation={selectedLocation}
          rideDuration={rideDuration}
          dayIndex={activeDayIndex}
          onDayDetected={handleDayDetected}
        />
      </div>
    </main>
  );
}
