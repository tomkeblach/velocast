export interface RideScoreInput {
  windSpeed: number;
  windGusts: number;
  precipitation: number;
  precipitationProbability: number;
  apparentTemperature: number;
  sunshineDuration?: number;
  shortwaveRadiation?: number;
}

export interface HourlyScore {
  time: string;
  score: number;
}

export interface BestRideWindow {
  start: string;
  end: string;
  score: number;
}

export type RideScoreLabel =
  | "Excellent"
  | "Very good"
  | "Good"
  | "Fair"
  | "Poor"
  | "Bad";
