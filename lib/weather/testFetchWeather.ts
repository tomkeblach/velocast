import { fetchWeather } from "@/lib/weather/fetchWeather";
import { mapWeatherResponse } from "@/lib/weather/mapWeatherResponse";

async function testFetchWeather() {
  const lat = 49.3628;
  const lon = 8.2581;
  const apiResponse = await fetchWeather(lat, lon);
  const hourly = mapWeatherResponse(apiResponse);
  console.log(hourly.slice(0, 5)); // Zeige die ersten 5 Stunden als Beispiel
}

testFetchWeather();
