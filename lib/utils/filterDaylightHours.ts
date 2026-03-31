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
 * Wenn weniger als rideDurationHours Stunden bis Sonnenuntergang verbleiben,
 * wird ebenfalls auf den nächsten Tag gewechselt.
 */
export function filterDaylightHours(
  hourlyData: HourlyWeather[],
  sunriseToday: string,
  sunsetToday: string,
  sunriseTomorrow?: string,
  sunsetTomorrow?: string,
  rideDurationHours: number = 3,
): { hours: HourlyWeather[]; daylightInfo: DaylightInfo } {
  const now = new Date();

  // Sonnenauf- und untergang in Date-Objekte umwandeln
  const sunriseTime = new Date(sunriseToday);
  const sunsetTime = new Date(sunsetToday);

  // Prüfen, ob es bereits nach Sonnenuntergang ist
  const isAfterSunset = now > sunsetTime;

  // Prüfen, ob noch genug Tageslicht für den Ride übrig ist
  const effectiveStart = now > sunriseTime ? now : sunriseTime;
  const remainingDaylightHours =
    (sunsetTime.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60);
  const notEnoughTimeToday = remainingDaylightHours < rideDurationHours;

  // Nach Sonnenuntergang oder zu wenig Zeit heute: morgigen Tag verwenden
  if (
    (isAfterSunset || notEnoughTimeToday) &&
    sunriseTomorrow &&
    sunsetTomorrow
  ) {
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

/**
 * Filtert Stunden für einen expliziten Tag-Index (0 = heute, 1 = morgen, usw.)
 * Für Tag 0 werden vergangene Stunden ausgeschlossen.
 */
export function filterHoursForDayIndex(
  hourlyData: HourlyWeather[],
  sunrises: string[],
  sunsets: string[],
  dayIndex: number,
): HourlyWeather[] {
  const sunrise = sunrises[dayIndex];
  const sunset = sunsets[dayIndex];
  if (!sunrise || !sunset) return [];

  const sunriseTime = new Date(sunrise);
  const sunsetTime = new Date(sunset);
  const now = new Date();

  return hourlyData.filter((h) => {
    const t = new Date(h.time);
    if (dayIndex === 0) {
      return t >= now && t >= sunriseTime && t <= sunsetTime;
    }
    return t >= sunriseTime && t <= sunsetTime;
  });
}
