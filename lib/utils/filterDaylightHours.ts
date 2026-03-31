import { HourlyWeather } from "@/lib/weather/mapWeatherResponse";

/** Daylight metadata returned alongside the filtered hours. */
export interface DaylightInfo {
  /** ISO datetime of the sunrise used for filtering. */
  sunrise: string;
  /** ISO datetime of the sunset used for filtering. */
  sunset: string;
  /** Whether the current time is already past today’s sunset. */
  isAfterSunset: boolean;
  /** Whether tomorrow’s data was selected instead of today’s. */
  useTomorrow: boolean;
}

/**
 * Selects the best day (today or tomorrow) and returns only the hours that
 * fall within its daylight window.
 *
 * **Today → Tomorrow switching logic:**
 * 1. If it is already past today’s sunset, show tomorrow.
 * 2. If fewer than `rideDurationHours` of daylight remain today, show tomorrow
 *    so users always get a realistic full-ride window.
 * 3. Otherwise show today, but only hours in the future (>= now).
 *
 * If tomorrow’s data is needed but not provided, today’s data is used as a
 * fallback (graceful degradation).
 *
 * @param hourlyData        Full 7-day flat array of hourly weather objects
 * @param sunriseToday      ISO datetime of today’s sunrise
 * @param sunsetToday       ISO datetime of today’s sunset
 * @param sunriseTomorrow   ISO datetime of tomorrow’s sunrise (optional)
 * @param sunsetTomorrow    ISO datetime of tomorrow’s sunset (optional)
 * @param rideDurationHours Minimum hours of daylight needed to bother with today (default 3)
 * @returns  Filtered hourly array and daylight metadata
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

  // Parse sunrise and sunset into Date objects
  const sunriseTime = new Date(sunriseToday);
  const sunsetTime = new Date(sunsetToday);

  // Check whether we are already past today's sunset
  const isAfterSunset = now > sunsetTime;

  // Check whether enough daylight remains for the ride
  const effectiveStart = now > sunriseTime ? now : sunriseTime;
  const remainingDaylightHours =
    (sunsetTime.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60);
  const notEnoughTimeToday = remainingDaylightHours < rideDurationHours;

  // After sunset or too little daylight left: use tomorrow
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

  // Before sunset: use today, but only future hours
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
 * Returns the daylight hours for an explicitly chosen day index.
 *
 * Unlike `filterDaylightHours`, this function never auto-switches days —
 * it respects the user’s manual day selection from the day-picker bubbles.
 *
 * For `dayIndex === 0` (today), past hours are excluded so the list stays
 * current. For any future day (index ≥ 1) all hours between sunrise and
 * sunset are returned.
 *
 * @param hourlyData  Full 7-day flat array of hourly weather objects
 * @param sunrises    Array of sunrise ISO strings, one per forecast day
 * @param sunsets     Array of sunset ISO strings, one per forecast day
 * @param dayIndex    0-based index into the 7-day forecast (0 = today)
 * @returns  Filtered hourly array; empty array if the day index is out of range
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
