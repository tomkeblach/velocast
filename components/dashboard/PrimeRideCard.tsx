import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { motion, AnimatePresence } from "framer-motion";
import { Clock } from "lucide-react";
import { BestRideWindow } from "@/types/score";
import { getRideScoreLabel } from "@/lib/score/calculateRideScore";

interface PrimeRideCardProps {
  /** The best consecutive ride window for the selected day. `null` when no data is available. */
  bestWindow: BestRideWindow | null;
  /** When `true`, renders skeleton placeholders instead of live data. */
  loading?: boolean;
}

/**
 * Extracts the HH:MM portion from an Open-Meteo ISO datetime string.
 *
 * @param isoTime  Datetime string in "YYYY-MM-DDTHH:MM" format
 * @returns  Time string "HH:MM"
 */
function formatTime(isoTime: string): string {
  // "2026-03-17T08:00" -> "08:00"
  return isoTime.split("T")[1];
}

/**
 * Hero card showing the overall ride score, quality label, and best time window.
 *
 * The score is animated via `AnimatedNumber` with a spring count-up on load.
 * The quality label and time window use `AnimatePresence mode="wait"` so that
 * text transitions smoothly when the data changes (e.g. different day or duration).
 *
 * When no `bestWindow` is available (null), placeholder dashes are shown
 * and the score defaults to 0.
 */
export default function PrimeRideCard({
  bestWindow,
  loading,
}: PrimeRideCardProps) {
  const score = bestWindow?.score ?? 0;
  const label = getRideScoreLabel(score);
  const start = bestWindow?.start ? formatTime(bestWindow.start) : "--:--";
  const end = bestWindow?.end ? formatTime(bestWindow.end) : "--:--";

  return (
    <Card className="flex md:flex-row flex-col gap-0 p-0 md:p-6 overflow-hidden">
      {/* Score block */}
      <div className="flex md:flex-col items-center gap-4 md:gap-2 bg-primary/5 md:bg-transparent p-5 md:p-6">
        <div className="flex flex-col items-center gap-2">
          {loading ? (
            <Skeleton className="rounded-xl w-28 md:w-36 h-24 md:h-32" />
          ) : (
            <AnimatedNumber
              value={score}
              className="text-shadow-score font-black text-primary text-8xl md:text-9xl leading-none"
            />
          )}
        </div>
        {loading ? (
          <Skeleton className="rounded-md w-28 h-9" />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <Badge
                className="py-3 border- w-full font-bold text-primary text-xs uppercase"
                variant="outline"
              >
                {label}
              </Badge>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      <div className="flex flex-col flex-1 justify-center gap-4 px-5 py-5 md:py-6">
        <CardHeader className="p-0">
          <CardTitle className="font-bold text-2xl md:text-3xl">
            Prime Time for your Ride
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 text-muted-foreground">
          {loading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="rounded-md w-full h-5" />
              <Skeleton className="rounded-md w-4/5 h-5" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.p
                key={score}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {score >= 85
                  ? "Excellent conditions with low wind and optimal temperature. Perfect for tackling long rides."
                  : score >= 70
                    ? "Very good conditions. Great time for a quality ride."
                    : score >= 55
                      ? "Good riding conditions. Some minor factors to consider."
                      : "Fair conditions. Check wind and weather details before heading out."}
              </motion.p>
            </AnimatePresence>
          )}
        </CardContent>
        <CardFooter className="p-0">
          <Alert className="flex items-center bg-primary/10 border-/20">
            <Button className="hover:bg-primary mr-2 size-12">
              <Clock className="size-6 text-card" />
            </Button>
            <div className="flex-1">
              <AlertTitle className="font-bold text-primary text-sm">
                Best Ride Window
              </AlertTitle>
              <AlertDescription className="font-bold text-foreground text-xl">
                {loading ? (
                  <Skeleton className="mt-1 rounded-md w-36 h-6" />
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`${start}-${end}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                    >
                      {start} — {end}
                    </motion.span>
                  </AnimatePresence>
                )}
              </AlertDescription>
            </div>
          </Alert>
        </CardFooter>
      </div>
    </Card>
  );
}
