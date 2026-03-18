export interface WeatherHourlyData {
  time: string[];
  temperature_2m: number[];
  apparent_temperature: number[];
  precipitation_probability: number[];
  precipitation: number[];
  wind_speed_10m: number[];
  wind_gusts_10m: number[];
  wind_direction_10m: number[];
  weather_code: number[];
}

export interface WeatherDailyData {
  time: string[];
  sunrise: string[];
  sunset: string[];
}

export interface WeatherApiResponse {
  hourly: WeatherHourlyData;
  daily: WeatherDailyData;
}
