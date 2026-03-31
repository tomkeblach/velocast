import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Thermometer, Wind, WindArrowDown, Droplets } from "lucide-react";

interface WeatherCardProps {
  value: number;
  loading?: boolean;
}

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
