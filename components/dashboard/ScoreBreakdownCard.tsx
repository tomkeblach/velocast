import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";

import {
  Wind,
  WindArrowDown,
  Droplets,
  Thermometer,
  Sun,
  Zap,
  CloudRain,
} from "lucide-react";
import { getRideScoreLabel } from "@/lib/score/calculateRideScore";
import { HourlyWeather } from "@/lib/weather/mapWeatherResponse";

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

// Max possible penalty per category (for bar width)
const MAX_PENALTIES: Record<string, number> = {
  wind: 35,
  gusts: 20,
  rain: 25,
  rainProb: 10,
  temp: 45,
  sun: 18,
  combo: 20,
};

function PenaltyRow({
  icon,
  label,
  penalty,
  maxPenalty,
}: {
  icon: React.ReactNode;
  label: string;
  penalty: number;
  maxPenalty: number;
}) {
  const pct = Math.min(100, (penalty / maxPenalty) * 100);
  const isGood = penalty === 0;

  return (
    <div className="flex items-center gap-3">
      <span
        className={`shrink-0 ${isGood ? "text-primary" : "text-muted-foreground"}`}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm">{label}</span>
          <span
            className={`text-xs font-bold tabular-nums ${
              isGood
                ? "text-primary"
                : penalty >= 15
                  ? "text-red-400"
                  : "text-orange-400"
            }`}
          >
            {isGood ? "✓" : `-${penalty}`}
          </span>
        </div>
        <div className="bg-muted rounded-full h-1 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isGood
                ? "bg-primary w-0"
                : penalty >= 15
                  ? "bg-red-400"
                  : "bg-orange-400"
            }`}
            style={{ width: isGood ? "0%" : `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
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
    <Card className="bg-background/80 border-/20">
      <CardHeader className="pb-3">
        <CardTitle className="font-bold text-muted-foreground text-xs uppercase tracking-widest">
          Score Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <PenaltyRow
            icon={<Wind className="size-4" />}
            label="Wind"
            penalty={breakdown.windPenalty}
            maxPenalty={MAX_PENALTIES.wind}
          />
          <PenaltyRow
            icon={<WindArrowDown className="size-4" />}
            label="Gusts"
            penalty={breakdown.gustPenalty}
            maxPenalty={MAX_PENALTIES.gusts}
          />
          <PenaltyRow
            icon={<CloudRain className="size-4" />}
            label="Rain"
            penalty={breakdown.precipitationPenalty}
            maxPenalty={MAX_PENALTIES.rain}
          />
          <PenaltyRow
            icon={<Droplets className="size-4" />}
            label="Rain prob."
            penalty={breakdown.precipitationProbabilityPenalty}
            maxPenalty={MAX_PENALTIES.rainProb}
          />
          <PenaltyRow
            icon={<Thermometer className="size-4" />}
            label="Temp"
            penalty={breakdown.temperaturePenalty}
            maxPenalty={MAX_PENALTIES.temp}
          />
          <PenaltyRow
            icon={<Sun className="size-4" />}
            label="Sun"
            penalty={breakdown.sunPenalty}
            maxPenalty={MAX_PENALTIES.sun}
          />
          <PenaltyRow
            icon={<Zap className="size-4" />}
            label="Combo"
            penalty={breakdown.combinationPenalty}
            maxPenalty={MAX_PENALTIES.combo}
          />

          <Separator className="my-1" />

          <div className="flex justify-between items-center">
            <span className="font-semibold text-muted-foreground text-sm">
              {getRecommendation(score)}
            </span>
            <span className="text-shadow-score font-black text-primary text-3xl leading-none">
              {score}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
