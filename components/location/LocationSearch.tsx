"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Star,
  X,
  Search,
  LoaderCircle,
  MapPin,
  ChevronRight,
} from "lucide-react";

interface Location {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
    state?: string;
  };
}

interface LocationSearchProps {
  onLocationSelect?: (lat: number, lon: number, location: Location) => void;
}

export default function LocationSearch({
  onLocationSelect,
}: LocationSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [recent, setRecent] = useState<Location[]>([]);
  const [favorites, setFavorites] = useState<Location[]>([]);
  const [gettingCurrentLocation, setGettingCurrentLocation] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(
      typeof navigator !== "undefined" &&
        navigator.platform.indexOf("Mac") !== -1,
    );
  }, []);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    setGettingCurrentLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const userLanguage = navigator.language || "en";

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=${userLanguage}`,
          );
          const locationData = await response.json();

          if (locationData) {
            handleSelectLocation(locationData);
          }
        } catch (error) {
          console.error("Error fetching current location:", error);
        } finally {
          setGettingCurrentLocation(false);
        }
      },
      () => {
        setGettingCurrentLocation(false);
      },
    );
  };

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      const userLanguage = navigator.language || "en";
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query,
        )}&format=json&limit=10&addressdetails=1&accept-language=${userLanguage}`,
      )
        .then((res) => res.json())
        .then((data) => {
          // Nur konkrete Orte erlauben (Städte, Dörfer, etc.)
          const filtered = data.filter((item: any) => {
            const validTypes = [
              "city",
              "town",
              "village",
              "hamlet",
              "suburb",
              "neighbourhood",
              "locality",
            ];

            // Nur Items mit gültigen Ortstypen durchlassen
            if (validTypes.includes(item.addresstype)) {
              return true;
            }

            // Administrative Grenzen und Regionen ausschließen
            if (
              item.class === "boundary" ||
              item.type === "administrative" ||
              item.addresstype === "state" ||
              item.addresstype === "region" ||
              item.addresstype === "province" ||
              item.addresstype === "county"
            ) {
              return false;
            }

            return false;
          });
          setSuggestions(filtered);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux) to toggle
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      // Escape to close
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const getCityName = (location: Location) => {
    return (
      location.address?.city ||
      location.address?.town ||
      location.address?.village ||
      location.display_name.split(",")[0]
    );
  };

  const getCountryName = (location: Location) => {
    return location.address?.country || "Unknown";
  };

  const isFavorite = (location: Location) => {
    return favorites.some((f) => f.place_id === location.place_id);
  };

  const toggleFavorite = (location: Location, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite(location)) {
      setFavorites(favorites.filter((f) => f.place_id !== location.place_id));
    } else {
      setFavorites([...favorites, location]);
    }
  };

  const removeFromRecent = (location: Location, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecent(recent.filter((r) => r.place_id !== location.place_id));
  };

  const handleSelectLocation = (location: Location) => {
    setRecent((prev) => {
      const filtered = prev.filter((r) => r.place_id !== location.place_id);
      return [location, ...filtered].slice(0, 5);
    });
    setQuery("");
    setSuggestions([]);
    setOpen(false);

    onLocationSelect?.(Number(location.lat), Number(location.lon), location);
  };

  const groupByCountry = (locations: Location[]) => {
    const grouped: Record<string, Location[]> = {};
    locations.forEach((loc) => {
      const country = getCountryName(loc);
      if (!grouped[country]) grouped[country] = [];
      grouped[country].push(loc);
    });
    return grouped;
  };

  const renderSearchItem = (location: Location) => (
    <li
      key={location.place_id}
      className="group flex justify-left items-center bg-secondary hover:bg-sidebar-primary mx-6 mt-2 first:mt-0 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      onClick={() => handleSelectLocation(location)}
    >
      <MapPin className="mr-4 p-1.5 border rounded-md size-7" />
      <div className="flex flex-col">
        <span className="mb-1 font-semibold text-xs">
          {location.address?.state || location.address?.country || ""}
        </span>
        <span>{getCityName(location)}</span>
      </div>
      <ChevronRight className="ml-auto w-4 h-4" />
    </li>
  );

  const renderRecentItem = (location: Location) => (
    <li
      key={location.place_id}
      className="group flex justify-between items-center bg-popover hover:bg-secondary mx-0 mt-0 px-6 py-4 first:border-t border-b rounded-none text-muted-foreground transition-colors cursor-pointer"
      onClick={() => handleSelectLocation(location)}
    >
      <span>{getCityName(location)}</span>
      <div className="flex items-center gap-2">
        <button onClick={(e) => toggleFavorite(location, e)}>
          <Star
            className={`w-4 h-4 hover:text-primary hover:cursor-pointer ${
              isFavorite(location)
                ? "fill-primary text-primary"
                : "text-muted-foreground"
            }`}
          />
        </button>
        <button onClick={(e) => removeFromRecent(location, e)}>
          <X className="w-4 h-4 text-muted-foreground hover:text-foreground hover:cursor-pointer" />
        </button>
      </div>
    </li>
  );

  const renderFavoriteItem = (location: Location) => (
    <li
      key={location.place_id}
      className="group flex justify-between items-center bg-secondary hover:bg-primary/50 mx-0 mt-0 px-6 py-4 first:border-t border-b rounded-none text-muted-foreground transition-colors cursor-pointer"
      onClick={() => handleSelectLocation(location)}
    >
      <span>{getCityName(location)}</span>
      <div className="flex items-center gap-2">
        <button onClick={(e) => toggleFavorite(location, e)}>
          <Star className={`w-4 h-4 fill-primary text-primary`} />
        </button>
        <button onClick={(e) => removeFromRecent(location, e)}>
          <X className="w-4 h-4 text-muted-foreground hover:text-foreground hover:cursor-pointer" />
        </button>
      </div>
    </li>
  );

  const groupedSuggestions = groupByCountry(suggestions);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setOpen(true)}>
          <Search className="mr-2 w-4 h-4" />
          Search location
          <kbd className="hidden in-[.os-ios]:block in-[.os-macos]:block font-sans text-muted-foreground text-sm/4">
            ⌘K
          </kbd>
          <kbd className="hidden in-[.os-android]:block in-[.os-other]:block in-[.os-windows]:block font-sans text-muted-foreground text-sm/4">
            Ctrl+K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="gap-0 p-0 pb-6 sm:max-w-2xl"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="sr-only">Search Location</DialogTitle>
          <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b">
            {loading && (
              <LoaderCircle className="w-5 h-5 text-primary animate-spin" />
            )}
            {!loading && <Search className="w-5 h-5 text-muted-foreground" />}
            <Input
              autoFocus
              className="bg-popover! border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
              placeholder="Search location"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1 bg-muted hover:bg-muted/80 px-1.5 border rounded h-5 font-mono font-medium text-[10px] text-muted-foreground cursor-pointer select-none"
            >
              esc
            </kbd>
          </div>
        </DialogHeader>

        <div className="h-100 overflow-auto no-scrollbar">
          {!query &&
            recent.filter(
              (r) => !favorites.some((f) => f.place_id === r.place_id),
            ).length > 0 && (
              <div>
                <div className="mx-6 mb-4 pt-10 font-semibold uppercase">
                  Recent
                </div>
                <ul>
                  {recent
                    .filter(
                      (r) => !favorites.some((f) => f.place_id === r.place_id),
                    )
                    .map((location) => renderRecentItem(location))}
                </ul>
              </div>
            )}

          {query && suggestions.length > 0 && (
            <div>
              {Object.entries(groupedSuggestions).map(
                ([country, locations]) => (
                  <div key={country}>
                    <div className="mx-6 mb-4 pt-10 font-semibold uppercase">
                      {country}
                    </div>
                    <ul>
                      {locations.map((location) => renderSearchItem(location))}
                    </ul>
                  </div>
                ),
              )}
            </div>
          )}

          {!query && favorites.length > 0 && (
            <div>
              <div className="mx-6 mb-4 pt-10 font-semibold uppercase">
                Favorite
              </div>
              <ul>
                {favorites.map((location) => renderFavoriteItem(location))}
              </ul>
            </div>
          )}

          {!query && (
            <div>
              <div className="mx-6 mb-4 pt-10 font-semibold uppercase">
                Location
              </div>
              <ul>
                <li
                  className="group flex justify-between items-center bg-popover hover:bg-secondary mx-0 mt-0 px-6 py-4 first:border-t border-b rounded-none text-muted-foreground transition-colors cursor-pointer"
                  onClick={handleCurrentLocation}
                >
                  <span className="flex items-center gap-2">
                    {gettingCurrentLocation ? (
                      <>
                        <LoaderCircle className="w-4 h-4 animate-spin" />
                        Getting location...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Current Location
                      </>
                    )}
                  </span>
                </li>
              </ul>
            </div>
          )}

          {query && !loading && suggestions.length === 0 && (
            <div className="px-4 py-8 text-muted-foreground text-sm text-center">
              No locations found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
