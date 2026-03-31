/**
 * All weather inputs required to compute a ride quality score for one hour.
 * Values use the same units as the Open-Meteo API / `HourlyWeather`.
 */
export interface RideScoreInput {
  /** Average wind speed at 10 m height in km/h. */
  windSpeed: number;
  /** Maximum wind gust speed at 10 m height in km/h. */
  windGusts: number;
  /** Actual precipitation in mm for this hour. */
  precipitation: number;
  /** Probability of precipitation in % (0–100). */
  precipitationProbability: number;
  /** Feels-like (apparent) temperature in °C, incorporating wind-chill & humidity. */
  apparentTemperature: number;
  /**
   * Seconds of sunshine during the hour (0–3600).
   * When omitted the worst-case sun penalty is applied.
   */
  sunshineDuration?: number;
  /**
   * Mean global horizontal irradiance in W/m².
   * When omitted the worst-case sun penalty is applied.
   */
  shortwaveRadiation?: number;
}

/** A ride score associated with a specific hour in the forecast. */
export interface HourlyScore {
  /** ISO 8601 local datetime string ("YYYY-MM-DDTHH:MM"). */
  time: string;
  /** Ride quality score in [0, 100]. */
  score: number;
}

/**
 * The optimal consecutive block of hours to ride on a given day.
 * Produced by `getBestRideWindow`.
 */
export interface BestRideWindow {
  /** ISO datetime of the first hour in the window. */
  start: string;
  /** ISO datetime one hour past the last hour in the window (exclusive end). */
  end: string;
  /** Rounded average ride score across the window (0–100). */
  score: number;
}

/** Human-readable quality label mapped from a numeric ride score. */
export type RideScoreLabel =
  | "Excellent"
  | "Very good"
  | "Good"
  | "Fair"
  | "Poor"
  | "Bad";
