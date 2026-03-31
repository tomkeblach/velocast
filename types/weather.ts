/**
 * Columnar (parallel-array) hourly data as returned by the Open-Meteo API.
 * Every array has the same length: one entry per forecast hour.
 */
export interface WeatherHourlyData {
  /** ISO 8601 local datetime strings (“YYYY-MM-DDTHH:MM”). */
  time: string[];
  /** Air temperature at 2 m height in °C. */
  temperature_2m: number[];
  /** Feels-like temperature in °C (accounts for wind-chill & humidity). */
  apparent_temperature: number[];
  /** Probability of precipitation in % (0–100). */
  precipitation_probability: number[];
  /** Hourly precipitation total in mm. */
  precipitation: number[];
  /** Average wind speed at 10 m height in km/h. */
  wind_speed_10m: number[];
  /** Maximum wind gust speed at 10 m height in km/h. */
  wind_gusts_10m: number[];
  /** Wind direction in degrees (0–360, 0 = N, 90 = E). */
  wind_direction_10m: number[];
  /** WMO weather interpretation code (see WMO Table 4677). */
  weather_code: number[];
  /** Seconds of sunshine per hour (0–3600). Optional — may not be present in all API responses. */
  sunshine_duration?: number[];
  /** Mean global horizontal irradiance in W/m². Optional. */
  shortwave_radiation?: number[];
}

/**
 * Daily astronomical data as returned by the Open-Meteo API.
 * One entry per forecast day.
 */
export interface WeatherDailyData {
  /** ISO date strings (“YYYY-MM-DD”). */
  time: string[];
  /** ISO 8601 local datetime strings of daily sunrise. */
  sunrise: string[];
  /** ISO 8601 local datetime strings of daily sunset. */
  sunset: string[];
}

/** Top-level shape of the Open-Meteo `/v1/forecast` JSON response. */
export interface WeatherApiResponse {
  /** Parallel-array hourly data for the full forecast period. */
  hourly: WeatherHourlyData;
  /** Daily sunrise/sunset times for each forecast day. */
  daily: WeatherDailyData;
}
