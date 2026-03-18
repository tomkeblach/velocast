import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
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
import { getRideScoreLabel } from "@/lib/score/calculateRideScore";
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
      className="flex items-center gap-2 bg-muted/10 px-3 py-2 rounded-lg min-w-[110px]"
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

function getScoreBreakdown(data: HourlyWeather) {
  // Diese Werte müssen mit der Formel in calculateRideScore übereinstimmen
  const wind = data.wind_speed_10m;
  const gusts = data.wind_gusts_10m;
  const precipitation = data.precipitation;
  const precipitationProbability = data.precipitation_probability;
  const temp = data.apparent_temperature;
  // Einzelne Penalties
  // Die Penalty-Funktionen sind identisch zu calculateRideScore
  let windPenalty = 0;
  if (wind > 12)
    windPenalty =
      wind <= 18 ? 5 : wind <= 25 ? 12 : wind <= 32 ? 22 : wind <= 40 ? 30 : 35;
  let gustPenalty = 0;
  if (gusts > 25)
    gustPenalty = gusts <= 35 ? 5 : gusts <= 45 ? 12 : gusts <= 55 ? 18 : 20;
  let precipitationPenalty = 0;
  if (precipitation > 0)
    precipitationPenalty =
      precipitation <= 0.3
        ? 6
        : precipitation <= 1.0
          ? 14
          : precipitation <= 2.5
            ? 22
            : 25;
  let precipitationProbabilityPenalty = 0;
  if (precipitationProbability >= 15)
    precipitationProbabilityPenalty =
      precipitationProbability < 35
        ? 3
        : precipitationProbability < 60
          ? 6
          : 10;
  let temperaturePenalty = 0;
  if (temp < 15 || temp > 23) {
    if ((temp >= 10 && temp < 15) || (temp > 23 && temp <= 27))
      temperaturePenalty = 7;
    else if ((temp >= 5 && temp < 10) || (temp > 27 && temp <= 32))
      temperaturePenalty = 18;
    else if ((temp >= 0 && temp < 5) || (temp > 32 && temp <= 35))
      temperaturePenalty = 35;
    else if (temp < 0 || temp > 35) temperaturePenalty = 45;
    else temperaturePenalty = 20;
  }
  let combinationPenalty = 0;
  if (temp < 8 && wind > 20) combinationPenalty += 12;
  if (temp < 10 && precipitation > 0.2) combinationPenalty += 10;
  if (wind > 25 && gusts > 40) combinationPenalty += 5;
  if (temp > 28 && precipitationProbability > 50) combinationPenalty += 3;
  combinationPenalty = Math.min(combinationPenalty, 20);
  return {
    windPenalty,
    gustPenalty,
    precipitationPenalty,
    precipitationProbabilityPenalty,
    temperaturePenalty,
    combinationPenalty,
  };
}

function getRecommendation(score: number) {
  if (score >= 85) return "Perfect conditions!";
  if (score >= 70) return "Very good, only minor limitations.";
  if (score >= 55) return "Good, but watch the weather.";
  if (score >= 40) return "Average, dress accordingly.";
  if (score >= 25) return "Rather poor, caution!";
  return "Not recommended.";
}

interface DetailCardProps {
  data: HourlyWeather;
  score: number;
}

export default function ScoreBreakdownCard({ data, score }: DetailCardProps) {
  if (!data) {
    return null;
  }

  const breakdown = getScoreBreakdown(data);

  return (
    <Card className="bg-background/80 shadow-xl p-0 border-accent/20">
      <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-8 p-6">
        {/* Score & Breakdown */}
        <div className="flex flex-col items-end gap-2 min-w-45">
          <span className="drop-shadow font-extrabold text-accent text-4xl">
            Score: {score}
          </span>
          <span className="text-muted-foreground text-sm">
            {getRideScoreLabel(score)}
          </span>
          <div className="bg-muted/20 mt-2 px-4 py-2 rounded-lg w-full">
            <div className="mb-1 font-semibold text-muted-foreground text-xs">
              Score Breakdown
            </div>
            <ul className="gap-x-4 gap-y-1 grid grid-cols-2 text-muted-foreground text-xs">
              <li>Wind: -{breakdown.windPenalty}</li>
              <li>Gusts: -{breakdown.gustPenalty}</li>
              <li>Rain: -{breakdown.precipitationPenalty}</li>
              <li>Rain prob.: -{breakdown.precipitationProbabilityPenalty}</li>
              <li>Temp.: -{breakdown.temperaturePenalty}</li>
              <li>Combo: -{breakdown.combinationPenalty}</li>
            </ul>
          </div>
          <div className="mt-2 font-semibold text-accent text-sm text-right">
            {getRecommendation(score)}
          </div>
        </div>
      </div>
    </Card>
  );
}
