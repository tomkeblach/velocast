# VeloCast

> A weather forecasting app tailored for road cyclists — showing the best time window for your ride, not just raw weather numbers.

## Overview

VeloCast fetches 7-day hourly forecasts and translates them into a single **ride score** (0–100) per hour. It automatically identifies the best consecutive time window for your planned ride duration, accounting for wind, gusts, rain, temperature, and sunshine. The active day is auto-detected based on remaining daylight and your configured ride length.

## Features

- **Ride Score** — a 0–100 score per hour computed from seven weighted penalty factors
- **Best Ride Window** — sliding-window algorithm finds the optimal consecutive block matching your ride duration (1–8 h, adjustable in 0.5 h steps)
- **7-Day Forecast** — day picker with automatic today/tomorrow selection based on remaining daylight vs. ride duration
- **Score Breakdown** — per-hour visualisation of each penalty contribution with progress bars
- **Location Search** — Nominatim-powered geocoding with recents, favourites, and geolocation fallback
- **Smooth Animations** — Framer Motion spring transitions, animated score counter, staggered forecast items
- **Responsive** — optimised for mobile and desktop

## Tech Stack

| Layer         | Choice                                                                          |
| ------------- | ------------------------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router, `"use client"`)                                         |
| Language      | TypeScript                                                                      |
| Styling       | Tailwind CSS v4                                                                 |
| UI Components | shadcn/ui (Radix UI primitives)                                                 |
| Animations    | Framer Motion                                                                   |
| Icons         | Lucide React                                                                    |
| Weather API   | [Open-Meteo](https://open-meteo.com/) — free, no API key required               |
| Geocoding     | [Nominatim / OpenStreetMap](https://nominatim.org/) — free, no API key required |

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

No environment variables or API keys are required — both data sources are public and free.

## Project Structure

```
app/
  page.tsx               # Root page — location state, day picker, ride duration slider
  layout.tsx             # HTML shell, dark mode, OS class injection

components/
  layout/
    Topbar.tsx           # App header with location badge and search trigger
    HeroSection.tsx      # Prime Ride Card + 4 stat weather cards
    ForecastSection.tsx  # Scrollable hourly forecast + detail panel
  dashboard/
    PrimeRideCard.tsx    # Large score display + best window alert
    WeatherCards.tsx     # Avg. temperature / wind / gusts / rain cards
    ForecastItem.tsx     # Single hourly slot in the forecast strip
    HourDetailCard.tsx   # Expanded detail view for a selected hour
    ScoreBreakdownCard.tsx  # Per-category penalty breakdown with bars
  location/
    LocationSearch.tsx   # Dialog: Nominatim search, recents, favourites, geolocation
  ui/
    animated-number.tsx  # Spring-animated numeric counter (Framer Motion)
    skeleton.tsx         # Pulse placeholder for loading states
    slider.tsx           # shadcn Slider (Radix)
    … (other shadcn primitives)

lib/
  score/
    calculateRideScore.ts   # Core scoring algorithm — penalty model
    getBestRideWindow.ts    # Sliding-window best-time finder
  utils/
    filterDaylightHours.ts  # Daylight + today/tomorrow selection logic
  hooks/
    useDelayedLoading.ts    # Debounced loading flag — prevents skeleton flicker
  weather/
    fetchWeather.ts         # Open-Meteo API call
    mapWeatherResponse.ts   # Flat HourlyWeather[] mapper

types/
  score.ts    # RideScoreInput, HourlyScore, BestRideWindow, RideScoreLabel
  weather.ts  # WeatherApiResponse, WeatherHourlyData, WeatherDailyData
```

## Scoring Model

The ride score starts at **100** and deducts penalties across seven categories:

| Category             | Trigger                           | Max Penalty |
| -------------------- | --------------------------------- | ----------- |
| **Wind**             | > 12 km/h                         | 35 pts      |
| **Gusts**            | > 25 km/h                         | 20 pts      |
| **Rain**             | > 0 mm                            | 25 pts      |
| **Rain probability** | ≥ 15 %                            | 10 pts      |
| **Temperature**      | outside 15–23 °C                  | 45 pts      |
| **Sun**              | low sunshine duration / radiation | 18 pts      |
| **Combo**            | cold + wind, cold + rain, etc.    | 20 pts      |

Score labels: **Excellent** ≥ 85 · **Very good** ≥ 70 · **Good** ≥ 55 · **Fair** ≥ 40 · **Poor** ≥ 25 · **Bad** < 25

## Best Ride Window Algorithm

`getBestRideWindow` uses a **sliding window** over the daylight-filtered hourly scores:

1. `rideDuration` is ceiled to the nearest integer to get `windowSize` (number of hourly slots)
2. Every consecutive window of `windowSize` hours is evaluated; the one with the highest average score wins
3. The window's end time is `last slot start + 1 h` so a 1 h ride at 12:00 displays `12:00 — 13:00`

## Day Selection Logic

`filterDaylightHours` auto-selects **today vs. tomorrow**:

- After today's sunset → use tomorrow
- Remaining daylight today `< rideDuration` → use tomorrow (not enough time for a full ride)
- Otherwise → today, showing only future hours between sunrise and sunset

When the user manually picks a day, `filterHoursForDayIndex` is used instead — showing all daylight hours for that specific day (future-only constraint only applies to day 0).

## Loading UX

`useDelayedLoading` prevents skeleton flicker on fast re-computations: the skeleton only appears if loading exceeds **300 ms**. On day / duration changes the previous data stays visible while new data loads in the background.

---

## Run Locally

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
