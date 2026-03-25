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
import { Clock } from "lucide-react";
import { BestRideWindow } from "@/types/score";
import { getRideScoreLabel } from "@/lib/score/calculateRideScore";

interface PrimeRideCardProps {
  bestWindow: BestRideWindow | null;
  loading?: boolean;
}

function formatTime(isoTime: string): string {
  // "2026-03-17T08:00" -> "08:00"
  return isoTime.split("T")[1];
}

export default function PrimeRideCard({
  bestWindow,
  loading,
}: PrimeRideCardProps) {
  const score = bestWindow?.score ?? 0;
  const label = getRideScoreLabel(score);
  const start = bestWindow?.start ? formatTime(bestWindow.start) : "--:--";
  const end = bestWindow?.end ? formatTime(bestWindow.end) : "--:--";

  return (
    <Card className="flex md:flex-row flex-col gap-0 p-0 md:p-6">
      <div className="flex p-6">
        <div className="flex flex-col justify-center items-center gap-2">
          {loading ? (
            <div className="text-shadow-score font-black text-primary text-9xl">
              --
            </div>
          ) : (
            <div className="text-shadow-score font-black text-primary text-9xl">
              {score}
            </div>
          )}
          <Badge
            className="py-3 border- w-full font-bold text-primary text-xs uppercase"
            variant="outline"
          >
            {loading ? "Loading..." : label}
          </Badge>
        </div>
      </div>
      <div className="flex flex-col gap-6 py-6">
        <CardHeader>
          <CardTitle className="font-bold text-3xl">
            Prime Time for your Ride
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-lg">
          {loading ? (
            <p>Lade Wetterdaten...</p>
          ) : (
            <p>
              {score >= 85
                ? "Excellent conditions with low wind and optimal temperature. Perfect for tackling long rides."
                : score >= 70
                  ? "Very good conditions. Great time for a quality ride."
                  : score >= 55
                    ? "Good riding conditions. Some minor factors to consider."
                    : "Fair conditions. Check wind and weather details before heading out."}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Alert className="flex items-center bg-primary/10 border-/20">
            <Button className="hover:bg-primary mr-2 size-12">
              <Clock className="size-6 text-card" />
            </Button>
            <div className="">
              <AlertTitle className="font-bold text-primary text-sm">
                Best Ride Window
              </AlertTitle>
              <AlertDescription className="font-bold text-foreground text-xl">
                {start} — {end}
              </AlertDescription>
            </div>
          </Alert>
        </CardFooter>
      </div>
    </Card>
  );
}
