import { HourlyScore, BestRideWindow } from "@/types/score";

export function getBestRideWindow(
  hours: HourlyScore[],
  windowSize: number = 3,
): BestRideWindow | null {
  if (hours.length < windowSize) return null;

  let bestWindow: HourlyScore[] | null = null;
  let bestAverage = -1;

  for (let i = 0; i <= hours.length - windowSize; i++) {
    const window = hours.slice(i, i + windowSize);
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
    end: bestWindow[windowSize - 1].time,
    score: Math.round(bestAverage),
  };
}
