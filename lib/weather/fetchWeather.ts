import { WeatherApiResponse } from "@/types/weather";

/**
 * Fetches a 7-day hourly weather forecast from the Open-Meteo API.
 *
 * Open-Meteo is a free, open-source weather API — no API key is required.
 * `timezone: "auto"` lets the API derive the correct local timezone from the
 * coordinates, ensuring that daily `sunrise`/`sunset` times and hourly
 * timestamps are in the location’s local time.
 *
 * Fetched hourly fields:
 * - `temperature_2m`            Air temperature at 2 m height (°C)
 * - `apparent_temperature`      Feels-like temperature (°C, includes wind-chill & humidity)
 * - `precipitation_probability` Chance of precipitation in % (0–100)
 * - `precipitation`             Actual hourly precipitation in mm
 * - `wind_speed_10m`            Average wind speed at 10 m height (km/h)
 * - `wind_gusts_10m`            Maximum gust speed at 10 m height (km/h)
 * - `wind_direction_10m`        Wind direction in degrees (0–360, 0 = N)
 * - `weather_code`              WMO weather interpretation code
 * - `sunshine_duration`         Seconds of sunshine in the hour (0–3600)
 * - `shortwave_radiation`       Mean solar irradiance in W/m²
 *
 * Fetched daily fields (one per day): `sunrise`, `sunset`
 *
 * @param latitude   WGS-84 latitude of the target location
 * @param longitude  WGS-84 longitude of the target location
 * @returns  Raw API response object; call `mapWeatherResponse` to flatten it
 * @throws   Error if the HTTP response is not OK
 */
export async function fetchWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherApiResponse> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    hourly: [
      "temperature_2m",
      "apparent_temperature",
      "precipitation_probability",
      "precipitation",
      "wind_speed_10m",
      "wind_gusts_10m",
      "wind_direction_10m",
      "weather_code",
      "sunshine_duration",
      "shortwave_radiation",
    ].join(","),
    daily: ["sunrise", "sunset"].join(","),
    timezone: "auto",
    forecast_days: "7",
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch weather data");
  }
  return res.json();
}
