import { WeatherApiResponse } from "@/types/weather";

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
    ].join(","),
    daily: ["sunrise", "sunset"].join(","),
    timezone: "auto",
    forecast_days: "2",
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch weather data");
  }
  return res.json();
}
