import { RideScoreInput, RideScoreLabel } from "@/types/score";

function getWindPenalty(windSpeed: number): number {
  // Wind ist ein sehr wichtiger Faktor beim Rennradfahren
  if (windSpeed <= 12) return 0;
  if (windSpeed <= 18) return 5;
  if (windSpeed <= 25) return 12;
  if (windSpeed <= 32) return 22;
  if (windSpeed <= 40) return 30;
  return 35;
}

function getGustPenalty(gusts: number): number {
  // Böen machen die Fahrt gefährlich und anstrengend
  if (gusts <= 25) return 0;
  if (gusts <= 35) return 5;
  if (gusts <= 45) return 12;
  if (gusts <= 55) return 18;
  return 20;
}

function getPrecipitationPenalty(precipitation: number): number {
  // Regen ist beim Rennradfahren sehr unangenehm
  if (precipitation === 0) return 0;
  if (precipitation <= 0.3) return 6; // Leichter Niesel
  if (precipitation <= 1.0) return 14; // Regen
  if (precipitation <= 2.5) return 22; // Starker Regen
  return 25; // Sehr starker Regen
}

function getPrecipitationProbabilityPenalty(probability: number): number {
  // Risiko von Regen
  if (probability < 15) return 0;
  if (probability < 35) return 3;
  if (probability < 60) return 6;
  return 10;
}

function getTemperaturePenalty(temp: number): number {
  // Temperatur ist extrem wichtig - Rennradfahren bei 2°C ist sehr unangenehm
  // Idealbereich: 15-23°C
  if (temp >= 15 && temp <= 23) return 0;

  // Leicht kühl oder warm
  if ((temp >= 10 && temp < 15) || (temp > 23 && temp <= 27)) return 7;

  // Merkbar unangenehm
  if ((temp >= 5 && temp < 10) || (temp > 27 && temp <= 32)) return 18;

  // Deutlich unangenehm (hier liegt 2°C!)
  if ((temp >= 0 && temp < 5) || (temp > 32 && temp <= 35)) return 35;

  // Extrem unangenehm
  if (temp < 0 || temp > 35) return 45;

  return 20;
}

function getCombinationPenalty(input: RideScoreInput): number {
  let penalty = 0;

  // Windchill-Effekt: Kalt + Wind ist besonders unangenehm
  if (input.apparentTemperature < 8 && input.windSpeed > 20) {
    penalty += 12; // Deutlich höherer Windchill-Penalty
  }

  // Kalt + Regen: besonders gefährlich und unangenehm
  if (input.apparentTemperature < 10 && input.precipitation > 0.2) {
    penalty += 10;
  }

  // Starker Wind + hohe Böen: sehr anstrengend und gefährlich
  if (input.windSpeed > 25 && input.windGusts > 40) {
    penalty += 5;
  }

  // Hitze + hohe Regenwahrscheinlichkeit: schwül und unangenehm
  if (input.apparentTemperature > 28 && input.precipitationProbability > 50) {
    penalty += 3;
  }

  return Math.min(penalty, 20); // Maximal 20 Punkte für Kombinationen
}

export function calculateRideScore(input: RideScoreInput): number {
  const windPenalty = getWindPenalty(input.windSpeed);
  const gustPenalty = getGustPenalty(input.windGusts);
  const precipitationPenalty = getPrecipitationPenalty(input.precipitation);
  const precipitationProbabilityPenalty = getPrecipitationProbabilityPenalty(
    input.precipitationProbability,
  );
  const temperaturePenalty = getTemperaturePenalty(input.apparentTemperature);
  const combinationPenalty = getCombinationPenalty(input);

  // Sun penalty: kombiniere sunshineDuration und shortwaveRadiation
  let sunPenalty = 0;
  const sunshine = input.sunshineDuration ?? 0;
  const radiation = input.shortwaveRadiation ?? 0;
  if (sunshine >= 45 && radiation >= 400) sunPenalty = 0;
  else if (sunshine >= 30 && radiation >= 250) sunPenalty = 4;
  else if (sunshine >= 15 && radiation >= 120) sunPenalty = 10;
  else sunPenalty = 18;

  const rawScore =
    100 -
    windPenalty -
    gustPenalty -
    precipitationPenalty -
    precipitationProbabilityPenalty -
    temperaturePenalty -
    sunPenalty -
    combinationPenalty;

  return Math.max(0, Math.min(100, Math.round(rawScore)));
}

export function getRideScoreLabel(score: number): RideScoreLabel {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Very good";
  if (score >= 55) return "Good";
  if (score >= 40) return "Fair";
  if (score >= 25) return "Poor";
  return "Bad";
}

export function calculateDayScore(hourlyScores: number[]): number {
  if (hourlyScores.length === 0) return 0;
  const average =
    hourlyScores.reduce((sum, score) => sum + score, 0) / hourlyScores.length;
  return Math.round(average);
}
