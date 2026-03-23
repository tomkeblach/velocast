"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, Circle } from "lucide-react";
import ForecastItem from "../dashboard/ForecastItem";
import DetailCard from "../dashboard/DetailCard";
import ScoreBreakdownCard from "../dashboard/ScoreBreakdownCard";
import { fetchWeather } from "@/lib/weather/fetchWeather";
import {
  mapWeatherResponse,
  HourlyWeather,
} from "@/lib/weather/mapWeatherResponse";
import { calculateRideScore } from "@/lib/score/calculateRideScore";
import { filterDaylightHours } from "@/lib/utils/filterDaylightHours";
import { useEffect, useState } from "react";

export default function ForecastSection() {
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
        const apiResponse = await fetchWeather(49.3628, 8.2581);
        const allHourly = mapWeatherResponse(apiResponse);

        // Sonnenauf- und untergang holen
        const sunriseToday = apiResponse.daily.sunrise[0];
        const sunsetToday = apiResponse.daily.sunset[0];
        const sunriseTomorrow = apiResponse.daily.sunrise[1];
        const sunsetTomorrow = apiResponse.daily.sunset[1];

        // Nur Tagesstunden (Sonnenaufgang bis Sonnenuntergang) und zukünftige Stunden
        const { hours: filteredHours, daylightInfo } = filterDaylightHours(
          allHourly,
          sunriseToday,
          sunsetToday,
          sunriseTomorrow,
          sunsetTomorrow,
        );

        setHourly(filteredHours);
        setDisplayTitle(
          daylightInfo.useTomorrow
            ? "Tomorrow's Ride Forecast"
            : "Today's Ride Forecast",
        );
      } catch (e) {
        setError("Fehler beim Laden der Wetterdaten");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selectedData =
    hourly && selected ? hourly.find((h) => h.time === selected) : null;

  return (
    <section className="">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Clock className="size-5 text-accent" />
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
        <CardContent className="flex justify-start gap-4 px-3">
          {loading && <span>Lade Wetterdaten…</span>}
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
              <DetailCard data={selectedData} />
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
