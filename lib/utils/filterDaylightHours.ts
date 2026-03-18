import { HourlyWeather } from "@/lib/weather/mapWeatherResponse";

export interface DaylightInfo {
  sunrise: string;
  sunset: string;
  isAfterSunset: boolean;
  useTomorrow: boolean;
}

/**
 * Filtert Stunden zwischen Sonnenaufgang und Sonnenuntergang
 * und zeigt nur zukünftige Stunden an.
 * Nach Sonnenuntergang wird der nächste Tag verwendet.
 */
export function filterDaylightHours(
  hourlyData: HourlyWeather[],
  sunriseToday: string,
  sunsetToday: string,
  sunriseTomorrow?: string,
  sunsetTomorrow?: string,
): { hours: HourlyWeather[]; daylightInfo: DaylightInfo } {
  const now = new Date();

  // Sonnenauf- und untergang in Date-Objekte umwandeln
  const sunriseTime = new Date(sunriseToday);
  const sunsetTime = new Date(sunsetToday);

  // Prüfen, ob es bereits nach Sonnenuntergang ist
  const isAfterSunset = now > sunsetTime;

  // Nach Sonnenuntergang: morgigen Tag verwenden
  if (isAfterSunset && sunriseTomorrow && sunsetTomorrow) {
    const tomorrowSunrise = new Date(sunriseTomorrow);
    const tomorrowSunset = new Date(sunsetTomorrow);

    const filteredHours = hourlyData.filter((h) => {
      const hourTime = new Date(h.time);
      return hourTime >= tomorrowSunrise && hourTime <= tomorrowSunset;
    });

    return {
      hours: filteredHours,
      daylightInfo: {
        sunrise: sunriseTomorrow,
        sunset: sunsetTomorrow,
        isAfterSunset: true,
        useTomorrow: true,
      },
    };
  }

  // Vor Sonnenuntergang: heutigen Tag verwenden, nur zukünftige Stunden
  const filteredHours = hourlyData.filter((h) => {
    const hourTime = new Date(h.time);
    return hourTime >= now && hourTime >= sunriseTime && hourTime <= sunsetTime;
  });

  return {
    hours: filteredHours,
    daylightInfo: {
      sunrise: sunriseToday,
      sunset: sunsetToday,
      isAfterSunset: false,
      useTomorrow: false,
    },
  };
}
