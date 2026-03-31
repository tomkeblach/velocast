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
  /** Weather data for this hour. */
  data: HourlyWeather;
  /** Pre-computed ride score (0–100). When undefined the badge uses a neutral amber color. */
  score?: number;
  /** When true, applies the active/selected ring style. */
  active?: boolean;
}

function formatHour(time: string) {
  // Open-Meteo time format: "YYYY-MM-DDTHH:MM" — extract the HH:MM part
  return time.split("T")[1];
}

/**
 * Returns an adjusted WMO weather code for display purposes.
 *
 * The Open-Meteo `weather_code` sometimes shows rain codes even when the
 * precipitation probability is low (e.g. the model averaged rain over a
 * wide area). This function overrides "rain-like" codes with a cloudy code
 * (3) when the actual probability is below 30 %, giving a more realistic
 * icon to the user.
 *
 * When probability is ≥ 30 % the actual precipitation amount is used to
 * normalise the code to one of: light drizzle (51), light rain (61),
 * moderate rain (63), or heavy rain (65).
 *
 * @param data  Hourly weather object for the hour to display
 * @returns  Adjusted WMO weather code
 */
function getAdjustedWeatherCode(data: HourlyWeather): number {
  const rainCodes = [
    51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99,
  ];

  // 1. Check precipitation probability first
  if (data.precipitation_probability < 30) {
    // Probability below threshold — if the raw code shows rain, override with cloudy
    if (rainCodes.includes(data.weather_code)) {
      return 3; // overcast
    }
    return data.weather_code; // keep original
  }

  // 2. Probability ≥ 30 % — now bucket by actual precipitation amount
  // Light drizzle: < 0.5 mm
  if (data.precipitation < 0.5) {
    return 51;
  }
  // Light rain: 0.5–2.5 mm
  if (data.precipitation < 2.5) {
    return 61;
  }
  // Moderate rain: 2.5–7.5 mm
  if (data.precipitation < 7.5) {
    return 63;
  }
  // Heavy rain: > 7.5 mm
  return 65;
}

/** Maps a WMO weather code to a Lucide icon component for this forecast slot. */
function getWeatherIcon(code: number) {
  if (code >= 51 && code <= 57) return CloudDrizzle;

  if (code >= 61 && code <= 67) return CloudRain;

  if (code >= 71 && code <= 77) return CloudSnow;

  if (code >= 80 && code <= 82) return CloudRainWind;

  if (code >= 85 && code <= 86) return Snowflake;

  if (code >= 95) return CloudLightning;

  return Cloud;
}

/** Maps a ride score to a Tailwind background color class for the score badge. */
function getScoreBadgeColor(score: number): string {
  if (score >= 85) return "bg-green-500";
  if (score >= 70) return "bg-green-400";
  if (score >= 55) return "bg-yellow-400";
  if (score >= 40) return "bg-orange-400";
  if (score >= 25) return "bg-red-400";
  return "bg-red-500";
}

/**
 * Compact hourly slot used in the horizontal forecast strip.
 *
 * Shows the hour, weather icon (adjusted for realistic rain thresholds),
 * air temperature, precipitation probability, and a colour-coded ride score
 * badge. Clicking the slot selects it in `ForecastSection`, triggering the
 * detail panel below.
 */
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
            ? "border- bg-primary/10 shadow-lg"
            : "border-transparent hover:border-/60 hover:bg-primary/5 hover:shadow"
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
        <Wind className="size-3 text-primary" />
        <div className="font-medium text-muted-foreground text-sm whitespace-nowrap">
          {Math.round(data.wind_speed_10m)} km/h
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Droplets className="size-3" />
        <div className="font-medium text-sm whitespace-nowrap">
          {Math.round(data.precipitation_probability)} %
        </div>
      </div>
    </div>
  );
}
