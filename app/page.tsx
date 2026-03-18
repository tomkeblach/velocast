import Image from "next/image";
import Topbar from "@/components/layout/Topbar";
import HeroSection from "@/components/layout/HeroSection";
import ForecastSection from "@/components/layout/ForecastSection";

export default function Home() {
  return (
    <main className="bg-background min-h-screen dark">
      <Topbar />

      <div className="flex flex-col gap-6 mx-auto px-4 sm:px-6 xl:px-8 py-6 w-full max-w-7xl">
        <HeroSection />
        <ForecastSection />
      </div>
    </main>
  );
}
