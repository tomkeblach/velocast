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
        className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 py-4"
      >
        <div className="flex justify-between sm:justify-start items-center">
          <a href="#" className="flex items-center -m-1.5 p-1.5">
            <Navigation className="bg-primary p-1 rounded-lg w-auto h-8 text-background" />
            <span className="ml-2 font-bold text-primary text-xl">
              VeloCast
            </span>
          </a>
          <div className="sm:hidden">
            <LocationSearch onLocationSelect={onLocationSelect} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="group/card bg-card shadow-xs px-3 py-2 rounded-xl ring-1 ring-foreground/10 max-w-50 sm:max-w-none overflow-hidden text-card-foreground text-sm truncate">
            <MapPin className="mr-2 text-primary shrink-0" />
            <span className="truncate">{getCityName()}</span>
          </Badge>
          <div className="hidden sm:block">
            <LocationSearch onLocationSelect={onLocationSelect} />
          </div>
        </div>
      </nav>
    </header>
  );
}
