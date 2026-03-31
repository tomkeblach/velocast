import { WeatherApiResponse } from "@/types/weather";

/**
 * A single hour of weather data, derived from the Open-Meteo API response.
 *
 * All fields use SI / metric units as returned by the API:
 * - `time`                     ISO 8601 local datetime string ("YYYY-MM-DDTHH:MM")
 * - `temperature_2m`           Air temperature at 2 m height in °C
 * - `apparent_temperature`     Feels-like temperature in °C
 * - `precipitation_probability`Rain probability in % (0–100)
 * - `precipitation`            Hourly precipitation total in mm
 * - `wind_speed_10m`           Average wind speed at 10 m in km/h
 * - `wind_gusts_10m`           Maximum gust speed at 10 m in km/h
 * - `wind_direction_10m`       Wind direction in degrees (0 = N, 90 = E, …)
 * - `weather_code`             WMO weather code (see WMO Table 4677)
 * - `sunshine_duration`        Seconds of sunshine during the hour (0–3600); optional
 * - `shortwave_radiation`      Mean global horizontal irradiance in W/m²; optional
 */
export interface HourlyWeather {
  time: string;
  temperature_2m: number;
  apparent_temperature: number;
  precipitation_probability: number;
  precipitation: number;
  wind_speed_10m: number;
  wind_gusts_10m: number;
  wind_direction_10m: number;
  weather_code: number;
  sunshine_duration?: number; // seconds of sunshine per hour (0–3600)
  shortwave_radiation?: number; // mean global horizontal irradiance in W/m²
}

/**
 * Flattens the columnar Open-Meteo API response into a flat array of
 * per-hour objects that are easier to iterate over in components.
 *
 * The API returns parallel arrays (one value per hour at the same index).
 * This function zips them into `HourlyWeather` objects so that all data
 * for a single hour is colocated.
 *
 * Optional fields (`sunshine_duration`, `shortwave_radiation`) are set to
 * `undefined` when the API did not return that array, making the caller
 * responsible for handling missing data gracefully.
 *
 * @param apiResponse  Raw response object returned by `fetchWeather`
 * @returns  Flat array of `HourlyWeather` objects ordered chronologically
 */
export function mapWeatherResponse(
  apiResponse: WeatherApiResponse,
): HourlyWeather[] {
  const h = apiResponse.hourly;
  return h.time.map((time, i) => ({
    time,
    temperature_2m: h.temperature_2m[i],
    apparent_temperature: h.apparent_temperature[i],
    precipitation_probability: h.precipitation_probability[i],
    precipitation: h.precipitation[i],
    wind_speed_10m: h.wind_speed_10m[i],
    wind_gusts_10m: h.wind_gusts_10m[i],
    wind_direction_10m: h.wind_direction_10m[i],
    weather_code: h.weather_code[i],
    sunshine_duration: h.sunshine_duration ? h.sunshine_duration[i] : undefined,
    shortwave_radiation: h.shortwave_radiation
      ? h.shortwave_radiation[i]
      : undefined,
  }));
}
