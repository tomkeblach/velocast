import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
          <Thermometer className="size-4 text-accent" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <span className="font-bold text-2xl">{loading ? "--" : value}</span>
        <span className="text-muted-foreground text-sm"> °C</span>
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
          <Wind className="size-4 text-accent" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <span className="font-bold text-2xl">{loading ? "--" : value}</span>
        <span className="text-muted-foreground text-sm"> km/h</span>
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
          <WindArrowDown className="size-4 text-accent" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <span className="font-bold text-2xl">{loading ? "--" : value}</span>
        <span className="text-muted-foreground text-sm"> km/h</span>
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
          <Droplets className="size-4 text-accent" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <span className="font-bold text-2xl">{loading ? "--" : value}</span>
        <span className="text-muted-foreground text-sm"> %</span>
      </CardContent>
    </Card>
  );
}
