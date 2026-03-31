import { Card } from "@/components/ui/card";

import {
  Wind,
  WindArrowDown,
  Navigation,
  Droplets,
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudLightning,
  Snowflake,
} from "lucide-react";

import { HourlyWeather } from "@/lib/weather/mapWeatherResponse";

/**
 * Maps a WMO weather interpretation code to the most appropriate Lucide icon component.
 *
 * Codes follow WMO Table 4677. Only the ranges used by Open-Meteo are mapped;
 * anything outside falls back to `Cloud`.
 *
 * @param code  WMO weather code
 * @returns  Lucide icon component
 */
function getWeatherIcon(code: number) {
  if (code === 0) return Sun;
  if (code <= 2) return CloudSun;
  if (code === 3) return Cloud;
  if (code === 45 || code === 48) return CloudFog;
  if (code >= 51 && code <= 57) return CloudDrizzle;
  if (code >= 61 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 77) return CloudSnow;
  if (code >= 80 && code <= 82) return CloudRainWind;
  if (code >= 85 && code <= 86) return Snowflake;
  if (code >= 95) return CloudLightning;
  return Cloud;
}

/** Maps a WMO weather code to a short human-readable description. */
function weatherDescription(code: number) {
  // Open-Meteo Codes (simplified version)
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mostly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Cloudy";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 85 && code <= 86) return "Snow showers";
  if (code >= 95) return "Thunderstorm";
  return "Unknown";
}

function InfoBox({
  icon,
  label,
  value,
  tooltip,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tooltip?: string;
}) {
  return (
    <div
      className="flex items-center gap-2 bg-muted/10 px-3 py-2 rounded-lg min-w-27.5"
      title={tooltip || label}
    >
      <span className="text-primary">{icon}</span>
      <div className="flex flex-col">
        <span className="text-muted-foreground text-xs">{label}</span>
        <span className="font-bold text-base">{value}</span>
      </div>
    </div>
  );
}

function getRecommendation(score: number) {
  if (score >= 85) return "Perfect conditions!";
  if (score >= 70) return "Very good, only minor limitations.";
  if (score >= 55) return "Good, but watch the weather.";
  if (score >= 40) return "Average, dress accordingly.";
  if (score >= 25) return "Rather poor, caution!";
  return "Not recommended.";
}

/**
 * Converts a wind direction in degrees to a 16-point compass abbreviation
 * (e.g. 315° → "NW"). Uses rounding to the nearest 22.5° sector.
 */
function getWindDirectionAbbr(degree: number): string {
  const dirs = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const ix = Math.round((degree % 360) / 22.5) % 16;
  return dirs[ix];
}

interface HourDetailCardProps {
  /** Full weather data for the hour the user has selected in the forecast strip. */
  data: HourlyWeather;
}

/**
 * Detailed weather panel for a single selected hour.
 *
 * Displays the weather icon, air temperature (large), apparent temperature,
 * wind speed + direction, gusts, precipitation, and precipitation probability
 * as labelled info-boxes. Adapts to a stacked layout on mobile.
 */
export default function HourDetailCard({ data }: HourDetailCardProps) {
  if (!data) {
    return null;
  }

  const timeDisplay = data.time.split("T")[1];
  const WeatherIcon = getWeatherIcon(data.weather_code);

  return (
    <Card className="bg-background/80 shadow-xl p-0 border-/20">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4 sm:gap-8 p-5 sm:p-6">
        {/* Weather icon & temperature */}
        <div className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-2 sm:min-w-30">
          <WeatherIcon className="drop-shadow size-12 sm:size-14 text-primary shrink-0" />
          <div>
            <div className="font-bold text-3xl">
              {Math.round(data.temperature_2m)}°C
            </div>
            <div className="text-muted-foreground text-sm">
              Feels like: {Math.round(data.apparent_temperature)}°C
            </div>
            <div className="font-semibold text-primary sm:text-center">
              {weatherDescription(data.weather_code)}
            </div>
          </div>
        </div>
        {/* Werte & Score */}
        <div className="flex-1 gap-3 grid grid-cols-2 sm:min-w-55">
          <InfoBox
            icon={<Wind className="size-5" />}
            label="Wind"
            value={`${Math.round(data.wind_speed_10m)} km/h`}
          />
          <InfoBox
            icon={<WindArrowDown className="size-5" />}
            label="Gusts"
            value={`${Math.round(data.wind_gusts_10m)} km/h`}
          />
          <InfoBox
            icon={<Navigation className="size-5" />}
            label="Direction"
            value={`${getWindDirectionAbbr(data.wind_direction_10m)}`}
            tooltip={`${data.wind_direction_10m}°`}
          />
          <InfoBox
            icon={<Droplets className="size-5" />}
            label="Rain"
            value={`${Math.round(data.precipitation_probability)}% / ${data.precipitation} mm`}
          />
        </div>
      </div>
    </Card>
  );
}
