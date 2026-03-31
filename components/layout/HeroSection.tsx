"use client";

import PrimeRideCard from "@/components/dashboard/PrimeRideCard";
import {
  TemperatureCard,
  GustCard,
  WindCard,
  RainCard,
} from "@/components/dashboard/WeatherCards";
import { fetchWeather } from "@/lib/weather/fetchWeather";
import {
  mapWeatherResponse,
  HourlyWeather,
} from "@/lib/weather/mapWeatherResponse";
import {
  calculateRideScore,
  getRideScoreLabel,
} from "@/lib/score/calculateRideScore";
import { getBestRideWindow } from "@/lib/score/getBestRideWindow";
import {
  filterDaylightHours,
  filterHoursForDayIndex,
} from "@/lib/utils/filterDaylightHours";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BestRideWindow } from "@/types/score";
import { useDelayedLoading } from "@/lib/hooks/useDelayedLoading";

interface HeroSectionProps {
  /** Geocoded location to fetch weather for. `null` renders the empty/skeleton state. */
  selectedLocation: {
    lat: number;
    lon: number;
    location: string;
  } | null;
  /** User-selected ride duration in hours (may be fractional, e.g. 2.5). */
  rideDuration: number;
  /**
   * Explicitly selected day index (0 = today, 1 = tomorrow, … 6).
   * When `null`, the component auto-detects the best day and calls `onDayDetected`.
   */
  dayIndex: number | null;
  /**
   * Called once after the auto-detection logic determines which day to display.
   * Allows the parent to sync the day-picker bubble selection.
   */
  onDayDetected?: (i: number) => void;
}

/**
 * Top-level summary section showing the best ride window and current conditions.
 *
 * **Data flow:**
 * 1. Fetches a 7-day forecast when `selectedLocation` changes.
 * 2. If `dayIndex` is `null`, runs `filterDaylightHours` to auto-select today
 *    or tomorrow based on remaining daylight vs `rideDuration`, then notifies the
 *    parent via `onDayDetected`.
 * 3. If `dayIndex` is provided, uses `filterHoursForDayIndex` for the explicit day.
 * 4. Computes per-hour ride scores, finds the best window, averages the
 *    weather stats for the window, and renders `PrimeRideCard` + 4 `WeatherCards`.
 *
 * Skeletons are shown only after 300 ms of loading (via `useDelayedLoading`) to
 * prevent flicker on fast re-fetches when the user changes the duration slider.
 */
export default function HeroSection({
  selectedLocation,
  rideDuration,
  dayIndex,
  onDayDetected,
}: HeroSectionProps) {
  const [bestWindow, setBestWindow] = useState<BestRideWindow | null>(null);
  const [stats, setStats] = useState({
    avgTemp: 0,
    avgWind: 0,
    maxGust: 0,
    maxPrecipProb: 0,
  });
  const [loading, setLoading] = useState(true);
  const showSkeleton = useDelayedLoading(loading);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const apiResponse = await fetchWeather(
          selectedLocation ? selectedLocation.lat : 49.3628,
          selectedLocation ? selectedLocation.lon : 8.2581,
        );
        const hourly = mapWeatherResponse(apiResponse);

        // Extract sunrise/sunset arrays for the 7-day period
        const sunrises = apiResponse.daily.sunrise;
        const sunsets = apiResponse.daily.sunset;

        // Filter to daylight hours only; auto-detect today vs tomorrow if no day is selected
        let dayHours: HourlyWeather[];
        if (dayIndex === null) {
          const { hours, daylightInfo } = filterDaylightHours(
            hourly,
            sunrises[0],
            sunsets[0],
            sunrises[1],
            sunsets[1],
            rideDuration,
          );
          dayHours = hours;
          onDayDetected?.(daylightInfo.useTomorrow ? 1 : 0);
        } else {
          dayHours = filterHoursForDayIndex(
            hourly,
            sunrises,
            sunsets,
            dayIndex,
          );
        }

        // Scores berechnen
        const hoursWithScores = dayHours.map((h) => ({
          time: h.time,
          score: calculateRideScore({
            windSpeed: h.wind_speed_10m,
            windGusts: h.wind_gusts_10m,
            precipitation: h.precipitation,
            precipitationProbability: h.precipitation_probability,
            apparentTemperature: h.apparent_temperature,
            sunshineDuration: h.sunshine_duration,
            shortwaveRadiation: h.shortwave_radiation,
          }),
        }));

        // Find the best consecutive ride window
        const window = getBestRideWindow(hoursWithScores, rideDuration);
        setBestWindow(window);

        // Compute weather stats only for the hours inside the best window
        if (window) {
          // Fetch the original hourly data for the window hours
          const windowHours = dayHours.filter(
            (h) => h.time >= window.start && h.time < window.end,
          );

          const avgTemp =
            windowHours.reduce((sum, h) => sum + h.apparent_temperature, 0) /
            windowHours.length;
          const avgWind =
            windowHours.reduce((sum, h) => sum + h.wind_speed_10m, 0) /
            windowHours.length;
          const maxGust = Math.max(...windowHours.map((h) => h.wind_gusts_10m));
          const maxPrecipProb = Math.max(
            ...windowHours.map((h) => h.precipitation_probability),
          );

          setStats({
            avgTemp: Math.round(avgTemp),
            avgWind: Math.round(avgWind),
            maxGust: Math.round(maxGust),
            maxPrecipProb: Math.round(maxPrecipProb),
          });
        }
      } catch (e) {
        console.error("Failed to load weather data", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedLocation, rideDuration, dayIndex]);

  return (
    <motion.section
      className="gap-4 grid xl:grid-cols-12"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="xl:col-span-8">
        <PrimeRideCard bestWindow={bestWindow} loading={showSkeleton} />
      </div>

      <div className="xl:col-span-4">
        <div className="gap-4 grid grid-cols-2 h-full">
          <TemperatureCard value={stats.avgTemp} loading={showSkeleton} />
          <WindCard value={stats.avgWind} loading={showSkeleton} />
          <GustCard value={stats.maxGust} loading={showSkeleton} />
          <RainCard value={stats.maxPrecipProb} loading={showSkeleton} />
        </div>
      </div>
    </motion.section>
  );
}
