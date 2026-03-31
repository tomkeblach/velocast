"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Circle } from "lucide-react";
import ForecastItem from "../dashboard/ForecastItem";
import HourDetailCard from "../dashboard/HourDetailCard";
import ScoreBreakdownCard from "../dashboard/ScoreBreakdownCard";
import { fetchWeather } from "@/lib/weather/fetchWeather";
import {
  mapWeatherResponse,
  HourlyWeather,
} from "@/lib/weather/mapWeatherResponse";
import { calculateRideScore } from "@/lib/score/calculateRideScore";
import { getBestRideWindow } from "@/lib/score/getBestRideWindow";
import {
  filterDaylightHours,
  filterHoursForDayIndex,
} from "@/lib/utils/filterDaylightHours";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDelayedLoading } from "@/lib/hooks/useDelayedLoading";

/**
 * Formats the section heading based on the selected day index.
 *
 * @param dayIndex  0-based day offset from today
 * @returns  E.g. "Today's Ride Forecast", "Tomorrow's Ride Forecast",
 *           or "Wednesday's Ride Forecast" for days further out
 */
function getDayTitle(dayIndex: number): string {
  if (dayIndex === 0) return "Today's Ride Forecast";
  if (dayIndex === 1) return "Tomorrow's Ride Forecast";
  const d = new Date();
  d.setDate(d.getDate() + dayIndex);
  return `${d.toLocaleDateString("en", { weekday: "long" })}'s Ride Forecast`;
}

interface ForecastSectionProps {
  /** Location to fetch weather for. `null` shows the empty/skeleton state. */
  selectedLocation: {
    lat: number;
    lon: number;
    location: string;
  } | null;
  /** Ride duration in hours, used to compute the best ride window. */
  rideDuration: number;
  /**
   * Explicitly selected day index (0 = today – 6 = 6 days out).
   * `null` triggers auto-detection (today or tomorrow).
   */
  dayIndex: number | null;
  /** Called once after auto-detection resolves which day to use. */
  onDayDetected?: (i: number) => void;
}

/**
 * Scrollable hourly forecast strip with an expandable detail panel.
 *
 * **Key behaviours:**
 * - Shows a staggered animated list of `ForecastItem` hour slots.
 * - Clicking a slot opens an `AnimatePresence`-animated detail panel
 *   containing `HourDetailCard` and `ScoreBreakdownCard`.
 * - The `stableSelectedData` ref pattern prevents the detail panel from
 *   collapsing during re-fetches: stale data is kept visible until fresh
 *   data arrives, avoiding a jarring collapse-then-expand animation.
 * - `hourly` is rendered even while `loading === true` so the list stays
 *   visible during re-fetches (only the first load shows skeletons).
 * - `showSkeleton` uses `useDelayedLoading` with a 300 ms delay to avoid
 *   flash-of-skeleton on fast re-computations (e.g. duration slider changes).
 */
export default function ForecastSection({
  selectedLocation,
  rideDuration,
  dayIndex,
  onDayDetected,
}: ForecastSectionProps) {
  const [hourly, setHourly] = useState<HourlyWeather[] | null>(null);
  const [displayTitle, setDisplayTitle] = useState("Today's Ride Forecast");
  const [loading, setLoading] = useState(true);
  const showSkeleton = useDelayedLoading(loading) && hourly === null;
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null); // selected hour time

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const apiResponse = await fetchWeather(
          selectedLocation ? Number(selectedLocation.lat) : 49.3628,
          selectedLocation ? Number(selectedLocation.lon) : 8.2581,
        );
        const allHourly = mapWeatherResponse(apiResponse);

        // Extract sunrise/sunset arrays for the 7-day period
        const sunrises = apiResponse.daily.sunrise;
        const sunsets = apiResponse.daily.sunset;

        // Filter to daylight hours only (sunrise – sunset), excluding past hours for today
        let filteredHours: HourlyWeather[];
        if (dayIndex === null) {
          const { hours, daylightInfo } = filterDaylightHours(
            allHourly,
            sunrises[0],
            sunsets[0],
            sunrises[1],
            sunsets[1],
            rideDuration,
          );
          filteredHours = hours;
          const resolvedIndex = daylightInfo.useTomorrow ? 1 : 0;
          onDayDetected?.(resolvedIndex);
          setDisplayTitle(getDayTitle(resolvedIndex));
        } else {
          filteredHours = filterHoursForDayIndex(
            allHourly,
            sunrises,
            sunsets,
            dayIndex,
          );
          setDisplayTitle(getDayTitle(dayIndex));
        }

        const hoursWithScores = filteredHours.map((h) => ({
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
        const bestWindow = getBestRideWindow(hoursWithScores, rideDuration);

        setHourly(filteredHours);
        setSelected(
          bestWindow ? bestWindow.start : (filteredHours[0]?.time ?? null),
        );
      } catch (e) {
        setError("Failed to load weather data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedLocation?.lat, selectedLocation?.lon, rideDuration, dayIndex]);

  const selectedData =
    hourly && selected ? hourly.find((h) => h.time === selected) : null;

  // Keep the last valid selectedData so the detail panel never collapses mid-transition
  const lastSelectedDataRef = useRef(selectedData);
  if (selectedData) lastSelectedDataRef.current = selectedData;
  const stableSelectedData = selectedData ?? lastSelectedDataRef.current;

  return (
    <section className="">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Clock className="size-5 text-primary" />
          <AnimatePresence mode="wait">
            <motion.h2
              key={displayTitle}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-foreground text-xl"
            >
              {displayTitle}
            </motion.h2>
          </AnimatePresence>
        </div>
        <div className="hidden sm:flex gap-4">
          <div className="flex items-center gap-1">
            <Circle className="fill-green-600 size-3 text-green-600" />
            <span className="text-muted-foreground text-sm">Excellent</span>
          </div>
          <div className="flex items-center gap-1">
            <Circle className="fill-green-400 size-3 text-green-400" />
            <span className="text-muted-foreground text-sm">Very good</span>
          </div>
          <div className="flex items-center gap-1">
            <Circle className="fill-yellow-400 size-3 text-yellow-400" />
            <span className="text-muted-foreground text-sm">Good</span>
          </div>
          <div className="flex items-center gap-1">
            <Circle className="fill-orange-400 size-3 text-orange-400" />
            <span className="text-muted-foreground text-sm">Fair</span>
          </div>
          <div className="flex items-center gap-1">
            <Circle className="fill-red-400 size-3 text-red-400" />
            <span className="text-muted-foreground text-sm">Poor</span>
          </div>
          <div className="flex items-center gap-1">
            <Circle className="fill-red-600 size-3 text-red-600" />
            <span className="text-muted-foreground text-sm">Bad</span>
          </div>
        </div>
        {/* Mobile legend: dots only */}
        <div className="sm:hidden flex items-center gap-1.5">
          <Circle className="fill-green-600 size-2.5 text-green-600" />
          <Circle className="fill-green-400 size-2.5 text-green-400" />
          <Circle className="fill-yellow-400 size-2.5 text-yellow-400" />
          <Circle className="fill-orange-400 size-2.5 text-orange-400" />
          <Circle className="fill-red-400 size-2.5 text-red-400" />
          <Circle className="fill-red-600 size-2.5 text-red-600" />
        </div>
      </div>
      <Card className="py-3 h-full">
        <CardContent className="flex justify-start gap-4 px-3 overflow-x-auto no-scrollbar">
          {showSkeleton &&
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center space-y-2 p-3 border-2 border-transparent rounded-lg"
              >
                <Skeleton className="rounded-md w-10 h-4" />
                <Skeleton className="rounded-full w-10 h-6" />
                <Skeleton className="rounded-md w-6 h-6" />
                <Skeleton className="rounded-md w-10 h-4" />
                <Skeleton className="rounded-md w-16 h-4" />
                <Skeleton className="rounded-md w-12 h-4" />
              </div>
            ))}
          {error && <span className="text-red-500">{error}</span>}
          {hourly &&
            hourly.map((h, i) => {
              const score = calculateRideScore({
                windSpeed: h.wind_speed_10m,
                windGusts: h.wind_gusts_10m,
                precipitation: h.precipitation,
                precipitationProbability: h.precipitation_probability,
                apparentTemperature: h.apparent_temperature,
                sunshineDuration: h.sunshine_duration,
                shortwaveRadiation: h.shortwave_radiation,
              });
              return (
                <motion.button
                  key={h.time}
                  type="button"
                  className="bg-transparent p-0 border-none outline-none"
                  onClick={() => setSelected(h.time)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                >
                  <ForecastItem
                    data={h}
                    score={score}
                    active={selected === h.time}
                  />
                </motion.button>
              );
            })}
        </CardContent>
      </Card>
      <AnimatePresence mode="wait">
        {stableSelectedData && (
          <motion.div
            key={stableSelectedData.time}
            className="gap-4 grid md:grid-cols-12 mt-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="md:col-span-8">
              <HourDetailCard data={stableSelectedData} />
            </div>
            <div className="md:col-span-4">
              <ScoreBreakdownCard
                data={stableSelectedData}
                score={calculateRideScore({
                  windSpeed: stableSelectedData.wind_speed_10m,
                  windGusts: stableSelectedData.wind_gusts_10m,
                  precipitation: stableSelectedData.precipitation,
                  precipitationProbability:
                    stableSelectedData.precipitation_probability,
                  apparentTemperature: stableSelectedData.apparent_temperature,
                  sunshineDuration: stableSelectedData.sunshine_duration,
                  shortwaveRadiation: stableSelectedData.shortwave_radiation,
                })}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
