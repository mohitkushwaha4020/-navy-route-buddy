import { cn } from "@/lib/utils";
import { BusMarkerIcon } from "../icons/BusIcon";
import { MapPin, Navigation } from "lucide-react";

interface MapPlaceholderProps {
  className?: string;
  showBusMarker?: boolean;
  busPosition?: { x: number; y: number };
  userStopPosition?: { x: number; y: number };
}

export const MapPlaceholder = ({
  className,
  showBusMarker = true,
  busPosition = { x: 35, y: 40 },
  userStopPosition = { x: 60, y: 65 },
}: MapPlaceholderProps) => {
  return (
    <div
      className={cn(
        "relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden",
        "bg-gradient-to-br from-sky-light via-background to-secondary",
        className
      )}
    >
      {/* Simulated map grid */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Simulated roads */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d="M 10 30 Q 30 30 40 50 T 70 60 T 90 70"
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="0.8"
          strokeDasharray="4 2"
          opacity="0.3"
        />
        <path
          d="M 20 80 Q 40 60 60 65 T 80 40"
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="0.5"
          opacity="0.2"
        />
      </svg>

      {/* Route line */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d={`M ${busPosition.x} ${busPosition.y} Q ${(busPosition.x + userStopPosition.x) / 2} ${busPosition.y + 10} ${userStopPosition.x} ${userStopPosition.y}`}
          fill="none"
          stroke="hsl(var(--ocean))"
          strokeWidth="1"
          strokeDasharray="3 2"
          className="opacity-60"
        />
      </svg>

      {/* User stop marker */}
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${userStopPosition.x}%`, top: `${userStopPosition.y}%` }}
      >
        <div className="relative">
          <div className="absolute -inset-2 bg-sunset/20 rounded-full animate-pulse" />
          <div className="relative flex items-center justify-center w-8 h-8 bg-sunset rounded-full shadow-md">
            <MapPin className="w-4 h-4 text-accent-foreground" />
          </div>
        </div>
      </div>

      {/* Bus marker */}
      {showBusMarker && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-float"
          style={{ left: `${busPosition.x}%`, top: `${busPosition.y}%` }}
        >
          <BusMarkerIcon size={40} />
        </div>
      )}

      {/* Compass */}
      <div className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 bg-card/80 backdrop-blur-sm rounded-full shadow-md border border-border">
        <Navigation className="w-5 h-5 text-primary" />
      </div>

      {/* Map attribution placeholder */}
      <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground/50">
        Map preview
      </div>
    </div>
  );
};
