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
import { useEffect, useState } from "react";

function getDayTitle(dayIndex: number): string {
  if (dayIndex === 0) return "Today's Ride Forecast";
  if (dayIndex === 1) return "Tomorrow's Ride Forecast";
  const d = new Date();
  d.setDate(d.getDate() + dayIndex);
  return `${d.toLocaleDateString("en", { weekday: "long" })}'s Ride Forecast`;
}

interface ForecastSectionProps {
  selectedLocation: {
    lat: number;
    lon: number;
    location: string;
  } | null;
  rideDuration: number;
  dayIndex: number | null;
  onDayDetected?: (i: number) => void;
}

export default function ForecastSection({
  selectedLocation,
  rideDuration,
  dayIndex,
  onDayDetected,
}: ForecastSectionProps) {
  const [hourly, setHourly] = useState<HourlyWeather[] | null>(null);
  const [displayTitle, setDisplayTitle] = useState("Today's Ride Forecast");
  const [loading, setLoading] = useState(true);
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

        // Sonnenauf- und untergang holen
        const sunrises = apiResponse.daily.sunrise;
        const sunsets = apiResponse.daily.sunset;

        // Nur Tagesstunden (Sonnenaufgang bis Sonnenuntergang) und zukünftige Stunden
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
          }),
        }));
        const bestWindow = getBestRideWindow(hoursWithScores, rideDuration);

        setHourly(filteredHours);
        setSelected(
          bestWindow ? bestWindow.start : (filteredHours[0]?.time ?? null),
        );
      } catch (e) {
        setError("Fehler beim Laden der Wetterdaten");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedLocation?.lat, selectedLocation?.lon, rideDuration, dayIndex]);

  const selectedData =
    hourly && selected ? hourly.find((h) => h.time === selected) : null;

  return (
    <section className="">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Clock className="size-5 text-primary" />
          <h2 className="font-bold text-foreground text-xl">{displayTitle}</h2>
        </div>
        <div className="flex gap-4">
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
      </div>
      <Card className="py-3 h-full">
        <CardContent className="flex justify-start gap-4 px-3 overflow-x-auto no-scrollbar">
          {loading &&
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 px-2 py-1 min-w-16"
              >
                <Skeleton className="rounded-md w-10 h-4" />
                <Skeleton className="rounded-full w-10 h-6" />
                <Skeleton className="rounded-md w-7 h-7" />
                <Skeleton className="rounded-md w-10 h-4" />
                <Skeleton className="rounded-md w-8 h-4" />
                <Skeleton className="rounded-md w-8 h-4" />
              </div>
            ))}
          {error && <span className="text-red-500">{error}</span>}
          {hourly &&
            hourly.map((h) => {
              const score = calculateRideScore({
                windSpeed: h.wind_speed_10m,
                windGusts: h.wind_gusts_10m,
                precipitation: h.precipitation,
                precipitationProbability: h.precipitation_probability,
                apparentTemperature: h.apparent_temperature,
              });
              return (
                <button
                  key={h.time}
                  type="button"
                  className="bg-transparent p-0 border-none outline-none"
                  onClick={() => setSelected(h.time)}
                >
                  <ForecastItem
                    data={h}
                    score={score}
                    active={selected === h.time}
                  />
                </button>
              );
            })}
        </CardContent>
      </Card>
      <div className="gap-4 grid md:grid-cols-12 mt-6">
        {selectedData && (
          <>
            <div className="md:col-span-8">
              <HourDetailCard data={selectedData} />
            </div>
            <div className="md:col-span-4">
              <ScoreBreakdownCard
                data={selectedData}
                score={calculateRideScore({
                  windSpeed: selectedData.wind_speed_10m,
                  windGusts: selectedData.wind_gusts_10m,
                  precipitation: selectedData.precipitation,
                  precipitationProbability:
                    selectedData.precipitation_probability,
                  apparentTemperature: selectedData.apparent_temperature,
                })}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
