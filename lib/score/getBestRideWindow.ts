import { HourlyScore, BestRideWindow } from "@/types/score";

/**
 * Adds exactly one hour to an ISO-like datetime string ("YYYY-MM-DDTHH:MM").
 *
 * Using `Date` arithmetic instead of string manipulation handles day/month/year
 * rollovers (e.g. 23:00 + 1 h = 00:00 next day) correctly.
 * The output is formatted to the same "YYYY-MM-DDTHH:MM" shape so it can be
 * used directly as the `end` time of a ride window.
 *
 * @param isoTime  Datetime string in "YYYY-MM-DDTHH:MM" format
 * @returns  Datetime string exactly one hour later in the same format
 */
function addOneHour(isoTime: string): string {
  const d = new Date(isoTime);
  d.setHours(d.getHours() + 1);
  // preserve the original "YYYY-MM-DDTHH:MM" format
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Finds the best consecutive block of hours to ride using a sliding-window approach.
 *
 * The algorithm iterates over all possible windows of `windowSize` consecutive hours,
 * averages their ride scores, and returns the block with the highest average.
 *
 * `windowSize` may be a non-integer (e.g. 2.5 h from the slider — meaning the user
 * wants a 2.5-hour ride). `Math.ceil` is applied so that 2.5 → 3 full hourly slots
 * are used. This ensures we never access an undefined index when building the window.
 *
 * Time complexity: O(n) for n hours.
 *
 * @param hours       Array of `HourlyScore` objects covering the forecast period
 * @param windowSize  Desired ride duration in hours (may be fractional, default 3)
 * @returns  The best window with start time, end time, and rounded average score,
 *           or `null` if the array is too short to build a window
 */
export function getBestRideWindow(
  hours: HourlyScore[],
  windowSize: number = 3,
): BestRideWindow | null {
  const size = Math.max(1, Math.ceil(windowSize));
  if (hours.length < size) return null;

  let bestWindow: HourlyScore[] | null = null;
  let bestAverage = -1;

  for (let i = 0; i <= hours.length - size; i++) {
    const window = hours.slice(i, i + size);
    const avg =
      window.reduce((sum, hour) => sum + hour.score, 0) / window.length;

    if (avg > bestAverage) {
      bestAverage = avg;
      bestWindow = window;
    }
  }

  if (!bestWindow) return null;

  return {
    start: bestWindow[0].time,
    end: addOneHour(bestWindow[size - 1].time),
    score: Math.round(bestAverage),
  };
}
