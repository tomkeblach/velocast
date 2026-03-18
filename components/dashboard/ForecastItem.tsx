import {
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
  Wind,
  Droplets,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HourlyWeather } from "@/lib/weather/mapWeatherResponse";

interface ForecastItemProps {
  data: HourlyWeather;
  score?: number;
  active?: boolean;
}

function formatHour(time: string) {
  // time: '2026-03-17T12:00'
  return time.split("T")[1];
}

// Hilfsfunktion: weather_code überschreiben basierend auf Regenwahrscheinlichkeit und Niederschlag
function getAdjustedWeatherCode(data: HourlyWeather): number {
  const rainCodes = [
    51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99,
  ];

  // 1. Erst Regenwahrscheinlichkeit prüfen
  if (data.precipitation_probability < 30) {
    // Keine Regenwahrscheinlichkeit → kein Regen
    // Falls original weather_code Regen anzeigt, überschreiben auf bewölkt
    if (rainCodes.includes(data.weather_code)) {
      return 3; // bewölkt
    }
    return data.weather_code; // Original beibehalten
  }

  // 2. Regenwahrscheinlichkeit >= 30% → Jetzt auf Niederschlagsmenge schauen
  // Nieselregen: < 0.5 mm
  if (data.precipitation < 0.5) {
    return 51; // Nieselregen (leicht)
  }
  // Leichter Regen: 0.5-2.5 mm
  if (data.precipitation < 2.5) {
    return 61; // Regen (leicht)
  }
  // Mäßiger Regen: 2.5-7.5 mm
  if (data.precipitation < 7.5) {
    return 63; // Regen (mäßig)
  }
  // Starker Regen: > 7.5 mm
  return 65; // Regen (stark)
}

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

function getScoreBadgeColor(score: number): string {
  if (score >= 85) return "bg-green-500";
  if (score >= 70) return "bg-green-400";
  if (score >= 55) return "bg-yellow-400";
  if (score >= 40) return "bg-orange-400";
  if (score >= 25) return "bg-red-400";
  return "bg-red-500";
}

export default function ForecastItem({
  data,
  score,
  active,
}: ForecastItemProps) {
  const adjustedCode = getAdjustedWeatherCode(data);
  const WeatherIcon = getWeatherIcon(adjustedCode);
  const badgeColor =
    score !== undefined ? getScoreBadgeColor(score) : "bg-amber-400";

  return (
    <div
      className={`flex flex-col items-center space-y-2 rounded-lg transition border-2 cursor-pointer p-3 select-none
        ${
          active
            ? "border-accent bg-accent/10 shadow-lg"
            : "border-transparent hover:border-accent/60 hover:bg-accent/5 hover:shadow"
        }
      `}
    >
      <span className="font-semibold text-muted-foreground">
        {formatHour(data.time)}
      </span>
      <Badge className={`${badgeColor} text-card text-sm`}>
        {score !== undefined ? score : adjustedCode}
      </Badge>
      <WeatherIcon className="size-6" />
      <span className="font-bold text-sm">
        {Math.round(data.temperature_2m)} °C
      </span>
      <div className="flex items-center gap-1">
        <Wind className="size-3 text-accent" />
        <div className="font-medium text-muted-foreground text-sm">
          {Math.round(data.wind_speed_10m)} km/h
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Droplets className="size-3" />
        <div className="font-medium text-sm">
          {Math.round(data.precipitation_probability)} %
        </div>
      </div>
    </div>
  );
}
