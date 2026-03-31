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
import { BestRideWindow } from "@/types/score";

interface HeroSectionProps {
  selectedLocation: {
    lat: number;
    lon: number;
    location: string;
  } | null;
  rideDuration: number;
  dayIndex: number | null;
  onDayDetected?: (i: number) => void;
}

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

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const apiResponse = await fetchWeather(
          selectedLocation ? selectedLocation.lat : 49.3628,
          selectedLocation ? selectedLocation.lon : 8.2581,
        );
        const hourly = mapWeatherResponse(apiResponse);

        // Sonnenauf- und untergang holen
        const sunrises = apiResponse.daily.sunrise;
        const sunsets = apiResponse.daily.sunset;

        // Nur Tagesstunden (Sonnenaufgang bis Sonnenuntergang) und zukünftige Stunden
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
          }),
        }));

        // Bestes Ride Window finden
        const window = getBestRideWindow(hoursWithScores, rideDuration);
        setBestWindow(window);

        // Stats nur für das Best Ride Window berechnen
        if (window) {
          // Die 3 Stunden des Best Windows aus den originalen hourly-Daten holen
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
    <section className="gap-4 grid xl:grid-cols-12">
      <div className="xl:col-span-8">
        <PrimeRideCard bestWindow={bestWindow} loading={loading} />
      </div>

      <div className="xl:col-span-4">
        <div className="gap-4 grid grid-cols-2 h-full">
          <TemperatureCard value={stats.avgTemp} loading={loading} />
          <WindCard value={stats.avgWind} loading={loading} />
          <GustCard value={stats.maxGust} loading={loading} />
          <RainCard value={stats.maxPrecipProb} loading={loading} />
        </div>
      </div>
    </section>
  );
}
