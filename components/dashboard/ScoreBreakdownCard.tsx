import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";

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

function getScoreBreakdown(data: HourlyWeather) {
  // Diese Werte müssen mit der Formel in calculateRideScore übereinstimmen
  const wind = data.wind_speed_10m;
  const gusts = data.wind_gusts_10m;
  const precipitation = data.precipitation;
  const precipitationProbability = data.precipitation_probability;
  const temp = data.apparent_temperature;
  const sunshine = data.sunshine_duration ?? 0;
  const radiation = data.shortwave_radiation ?? 0;
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
  let sunPenalty = 0;
  if (sunshine >= 45 && radiation >= 400) sunPenalty = 0;
  else if (sunshine >= 30 && radiation >= 250) sunPenalty = 4;
  else if (sunshine >= 15 && radiation >= 120) sunPenalty = 10;
  else sunPenalty = 18;
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
    sunPenalty,
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

interface HourDetailCardProps {
  data: HourlyWeather;
  score: number;
}

export default function ScoreBreakdownCard({
  data,
  score,
}: HourDetailCardProps) {
  if (!data) {
    return null;
  }

  const breakdown = getScoreBreakdown(data);

  return (
    <Card className="bg-background/80 border-accent/20">
      <CardHeader className="">
        <CardTitle className="font-bold text-muted-foreground uppercase">
          Score Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 w-full text-sm">
          <dl className="flex justify-between items-center">
            <dt>Wind</dt>
            <dd className="text-muted-foreground">-{breakdown.windPenalty}</dd>
          </dl>
          <Separator />
          <dl className="flex justify-between items-center">
            <dt>Gusts</dt>
            <dd className="text-muted-foreground">-{breakdown.gustPenalty}</dd>
          </dl>
          <Separator />
          <dl className="flex justify-between items-center">
            <dt>Rain</dt>
            <dd className="text-muted-foreground">
              -{breakdown.precipitationPenalty}
            </dd>
          </dl>
          <Separator />
          <dl className="flex justify-between items-center">
            <dt>Rain prob.</dt>
            <dd className="text-muted-foreground">
              -{breakdown.precipitationProbabilityPenalty}
            </dd>
          </dl>
          <Separator />
          <dl className="flex justify-between items-center">
            <dt>Temp</dt>
            <dd className="text-muted-foreground">
              -{breakdown.temperaturePenalty}
            </dd>
          </dl>
          <Separator />
          <dl className="flex justify-between items-center">
            <dt>Sun</dt>
            <dd className="text-muted-foreground">-{breakdown.sunPenalty}</dd>
          </dl>
          <Separator />
          <dl className="flex justify-between items-center">
            <dt>Combo</dt>
            <dd className="text-muted-foreground">
              -{breakdown.combinationPenalty}
            </dd>
          </dl>
          <Separator className="bg-foreground" />
          <dl className="flex justify-between items-center font-bold text-accent">
            <dt>Score</dt>
            <dd>{score}</dd>
          </dl>
        </div>
      </CardContent>
    </Card>
  );
}
