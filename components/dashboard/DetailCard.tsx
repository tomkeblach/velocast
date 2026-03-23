import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

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
      <span className="text-accent">{icon}</span>
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

// Wandelt Grad in Windrichtungs-Abkürzung (z.B. N, NO, ONO, O, SO, S, SW, W, NW)
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

interface DetailCardProps {
  data: HourlyWeather;
}

export default function DetailCard({ data }: DetailCardProps) {
  if (!data) {
    return null;
  }

  const timeDisplay = data.time.split("T")[1];
  const WeatherIcon = getWeatherIcon(data.weather_code);

  return (
    <Card className="bg-background/80 shadow-xl p-0 border-accent/20">
      <div className="flex flex-row justify-between items-start md:items-center gap-8 p-6">
        {/* Wetter-Icon & Temperatur */}
        <div className="flex flex-col items-center gap-2 min-w-30">
          <WeatherIcon className="drop-shadow size-14 text-accent" />
          <div className="font-bold text-3xl">
            {Math.round(data.temperature_2m)}°C
          </div>
          <div className="text-muted-foreground text-sm">
            Feels like: {Math.round(data.apparent_temperature)}°C
          </div>
          <div className="font-semibold text-accent">
            {weatherDescription(data.weather_code)}
          </div>
        </div>
        {/* Werte & Score */}
        <div className="flex-1 gap-4 grid grid-cols-2 min-w-55">
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
