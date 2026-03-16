import { cn } from "@/lib/utils";
import { BusIcon, RouteIcon } from "../icons/BusIcon";
import { ETABadge } from "./ETABadge";
import { ChevronRight, Users } from "lucide-react";

interface RouteCardProps {
  routeName: string;
  busNumber: string;
  nextStop: string;
  eta: number;
  capacity?: { current: number; max: number };
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const RouteCard = ({
  routeName,
  busNumber,
  nextStop,
  eta,
  capacity,
  isActive,
  onClick,
  className,
}: RouteCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-5 rounded-2xl transition-all duration-300 group",
        "bg-card border border-border hover:border-primary/30",
        "hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]",
        isActive && "border-ocean bg-ocean/5 shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              "flex items-center justify-center w-12 h-12 rounded-xl",
              isActive ? "bg-gradient-accent" : "bg-primary"
            )}>
              <BusIcon size={24} className="text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">{routeName}</h3>
              <p className="text-sm text-muted-foreground font-mono">Bus {busNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <RouteIcon className="w-4 h-4 text-ocean" />
            <span className="text-muted-foreground">Next:</span>
            <span className="font-medium text-foreground truncate">{nextStop}</span>
          </div>

          {capacity && (
            <div className="flex items-center gap-2 mt-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {capacity.current}/{capacity.max} passengers
              </span>
            </div>
          )}
        </div>

        {/* Right content */}
        <div className="flex flex-col items-end gap-2">
          <ETABadge minutes={eta} />
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </button>
  );
};
