import { WeatherApiResponse } from "@/types/weather";

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
}

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
  }));
}
