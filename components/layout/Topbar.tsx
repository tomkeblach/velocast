import LocationSearch from "../location/LocationSearch";
import { Navigation, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TopbarProps {
  onLocationSelect?: (lat: number, lon: number, location: any) => void;
  selectedLocation?: {
    lat: number;
    lon: number;
    location: any;
  } | null;
}

export default function Topbar({
  onLocationSelect,
  selectedLocation,
}: TopbarProps) {
  const getCityName = () => {
    if (!selectedLocation) return "Select a location to get started";
    const loc = selectedLocation.location;
    return (
      loc.address?.city ||
      loc.address?.town ||
      loc.address?.village ||
      loc.display_name.split(",")[0]
    );
  };

  return (
    <header>
      <nav
        aria-label="Global"
        className="flex justify-between items-center py-6"
      >
        <div className="flex lg:flex-1">
          <a href="#" className="flex items-center -m-1.5 p-1.5">
            <Navigation className="bg-primary p-1 rounded-lg w-auto h-8 text-background" />
            <span className="ml-2 font-bold text-primary text-xl">
              VeloCast
            </span>
          </a>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="group/card bg-card shadow-xs p-4 rounded-xl ring-1 ring-foreground/10 overflow-hidden text-card-foreground text-sm">
            <MapPin className="mr-2 text-primary" />
            {getCityName()}
          </Badge>
          <LocationSearch onLocationSelect={onLocationSelect} />
        </div>
      </nav>
    </header>
  );
}
