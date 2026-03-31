import { RideScoreInput, RideScoreLabel } from "@/types/score";

/**
 * Returns a wind-speed penalty for the ride score.
 *
 * Road cyclists are significantly affected by headwinds.
 * Threshold at 12 km/h (Beaufort 3) — below that, wind is negligible.
 *
 * @param windSpeed  Average wind speed in km/h
 * @returns  Penalty points (0–35)
 */
function getWindPenalty(windSpeed: number): number {
  // Wind ist ein sehr wichtiger Faktor beim Rennradfahren
  if (windSpeed <= 12) return 0;
  if (windSpeed <= 18) return 5;
  if (windSpeed <= 25) return 12;
  if (windSpeed <= 32) return 22;
  if (windSpeed <= 40) return 30;
  return 35;
}

/**
 * Returns a wind-gust penalty.
 *
 * Gusts are more dangerous than sustained wind because they are unpredictable.
 * Threshold at 25 km/h — below that, gusts are manageable.
 *
 * @param gusts  Maximum wind gust speed in km/h
 * @returns  Penalty points (0–20)
 */
function getGustPenalty(gusts: number): number {
  // Gusts increase danger and effort significantly
  if (gusts <= 25) return 0;
  if (gusts <= 35) return 5;
  if (gusts <= 45) return 12;
  if (gusts <= 55) return 18;
  return 20;
}

/**
 * Returns a precipitation (actual rainfall) penalty.
 *
 * Even light drizzle reduces grip and visibility noticeably.
 * A value of 0 mm means no precipitation regardless of cloud cover.
 *
 * @param precipitation  Hourly precipitation in mm
 * @returns  Penalty points (0–25)
 */
function getPrecipitationPenalty(precipitation: number): number {
  if (precipitation === 0) return 0;
  if (precipitation <= 0.3) return 6; // light drizzle
  if (precipitation <= 1.0) return 14; // rain
  if (precipitation <= 2.5) return 22; // heavy rain
  return 25; // very heavy rain
}

/**
 * Returns a penalty based on the probability of rain occurring.
 *
 * Applied independently from the actual precipitation amount so that
 * an uncertain forecast still reduces the score even if current mm = 0.
 *
 * @param probability  Rain probability in % (0–100)
 * @returns  Penalty points (0–10)
 */
function getPrecipitationProbabilityPenalty(probability: number): number {
  // Uncertainty penalty — risk of rain
  if (probability < 15) return 0;
  if (probability < 35) return 3;
  if (probability < 60) return 6;
  return 10;
}

/**
 * Returns a temperature penalty based on the apparent (feels-like) temperature.
 *
 * Ideal cycling range is 15–23 °C. Outside this range comfort and safety
 * degrade quickly. The apparent temperature (not 2 m air temp) is used
 * because it already incorporates wind-chill and humidity effects.
 *
 * @param temp  Apparent temperature in °C
 * @returns  Penalty points (0–45)
 */
function getTemperaturePenalty(temp: number): number {
  // Temperature is critical — ideal range 15–23 °C
  if (temp >= 15 && temp <= 23) return 0;

  // Slightly cool or warm
  if ((temp >= 10 && temp < 15) || (temp > 23 && temp <= 27)) return 7;

  // Noticeably uncomfortable
  if ((temp >= 5 && temp < 10) || (temp > 27 && temp <= 32)) return 18;

  // Clearly uncomfortable (includes ~2 °C)
  if ((temp >= 0 && temp < 5) || (temp > 32 && temp <= 35)) return 35;

  // Extreme
  if (temp < 0 || temp > 35) return 45;

  return 20;
}

/**
 * Returns an extra penalty for dangerous weather combinations.
 *
 * Some conditions are worse in combination than the sum of individual
 * penalties would suggest:
 * - Cold + strong wind → severe wind-chill effect
 * - Cold + rain        → hypothermia risk
 * - High wind + gusts  → control difficulty
 * - Heat + rain risk   → muggy, uncomfortable
 *
 * Capped at 20 pts total to avoid double-counting with individual penalties.
 *
 * @param input  Full ride score input object
 * @returns  Combined penalty points (0–20)
 */
function getCombinationPenalty(input: RideScoreInput): number {
  let penalty = 0;

  // Wind-chill: cold + wind is especially dangerous
  if (input.apparentTemperature < 8 && input.windSpeed > 20) {
    penalty += 12; // significant wind-chill
  }

  // Cold + rain: hypothermia risk
  if (input.apparentTemperature < 10 && input.precipitation > 0.2) {
    penalty += 10;
  }

  // Strong wind + gusts: control difficulty
  if (input.windSpeed > 25 && input.windGusts > 40) {
    penalty += 5;
  }

  // Heat + rain risk: muggy and uncomfortable
  if (input.apparentTemperature > 28 && input.precipitationProbability > 50) {
    penalty += 3;
  }

  return Math.min(penalty, 20); // combinations capped at 20 pts
}

/**
 * Computes an overall ride quality score for a single hour.
 *
 * Starts at 100 and subtracts penalties from seven independent categories.
 * The sun penalty uses both `sunshineDuration` (seconds of sunshine per hour)
 * and `shortwaveRadiation` (W/m²) — if either is omitted the worst-case
 * (overcast) penalty of 18 is applied.
 *
 * @param input  Hourly weather measurements for the hour to evaluate
 * @returns  Integer score in [0, 100]
 */
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

/**
 * Maps a numeric ride score to a human-readable label.
 *
 * @param score  Value in [0, 100]
 * @returns  RideScoreLabel string
 */
export function getRideScoreLabel(score: number): RideScoreLabel {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Very good";
  if (score >= 55) return "Good";
  if (score >= 40) return "Fair";
  if (score >= 25) return "Poor";
  return "Bad";
}

/**
 * Computes an average score for a full day from its hourly scores.
 * Used to summarise day-level quality without exposing the per-hour data.
 *
 * @param hourlyScores  Array of per-hour scores (can be empty)
 * @returns  Rounded average, or 0 if the array is empty
 */
export function calculateDayScore(hourlyScores: number[]): number {
  if (hourlyScores.length === 0) return 0;
  const average =
    hourlyScores.reduce((sum, score) => sum + score, 0) / hourlyScores.length;
  return Math.round(average);
}
