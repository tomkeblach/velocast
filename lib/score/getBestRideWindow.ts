import { HourlyScore, BestRideWindow } from "@/types/score";

function addOneHour(isoTime: string): string {
  const d = new Date(isoTime);
  d.setHours(d.getHours() + 1);
  // preserve the original "YYYY-MM-DDTHH:MM" format
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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
