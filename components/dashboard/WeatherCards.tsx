import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Thermometer, Wind, WindArrowDown, Droplets } from "lucide-react";

interface WeatherCardProps {
  /** Numeric metric value to display, animated with a spring counter. */
  value: number;
  /** When `true`, renders a skeleton placeholder instead of the value. */
  loading?: boolean;
}

/**
 * Displays the average apparent temperature over the best ride window.
 * Uses `AnimatedNumber` for a spring count-up on value change.
 */
export function TemperatureCard({ value, loading }: WeatherCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center font-bold text-muted-foreground text-xs uppercase">
          Avg. Temperature
          <Thermometer className="size-4 text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="rounded-md w-16 h-7" />
        ) : (
          <>
            <AnimatedNumber value={value} className="font-bold text-2xl" />
            <span className="text-muted-foreground text-sm"> °C</span>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/** Displays the average wind speed (km/h) over the best ride window. */
export function WindCard({ value, loading }: WeatherCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center font-bold text-muted-foreground text-xs uppercase">
          Avg. Wind
          <Wind className="size-4 text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="rounded-md w-16 h-7" />
        ) : (
          <>
            <AnimatedNumber value={value} className="font-bold text-2xl" />
            <span className="text-muted-foreground text-sm"> km/h</span>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/** Displays the maximum wind gust speed (km/h) recorded in the best ride window. */
export function GustCard({ value, loading }: WeatherCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center font-bold text-muted-foreground text-xs uppercase">
          Max Gusts
          <WindArrowDown className="size-4 text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="rounded-md w-16 h-7" />
        ) : (
          <>
            <AnimatedNumber value={value} className="font-bold text-2xl" />
            <span className="text-muted-foreground text-sm"> km/h</span>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/** Displays the maximum precipitation probability (%) across the best ride window. */
export function RainCard({ value, loading }: WeatherCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center font-bold text-muted-foreground text-xs uppercase">
          Max Rain Risk
          <Droplets className="size-4 text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="rounded-md w-16 h-7" />
        ) : (
          <>
            <AnimatedNumber value={value} className="font-bold text-2xl" />
            <span className="text-muted-foreground text-sm"> %</span>
          </>
        )}
      </CardContent>
    </Card>
  );
}
