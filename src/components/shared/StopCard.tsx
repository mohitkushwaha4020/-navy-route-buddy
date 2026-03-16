import { cn } from "@/lib/utils";
import { ETABadge } from "./ETABadge";
import { MapPin } from "lucide-react";

interface StopCardProps {
  name: string;
  eta?: number;
  isNext?: boolean;
  isUserStop?: boolean;
  isPassed?: boolean;
  className?: string;
}

export const StopCard = ({
  name,
  eta,
  isNext,
  isUserStop,
  isPassed,
  className,
}: StopCardProps) => {
  return (
    <div
      className={cn(
        "relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300",
        isPassed && "opacity-50",
        isNext && "bg-ocean/10 border-2 border-ocean shadow-sm",
        isUserStop && !isNext && "bg-sunset-light border-2 border-sunset/30",
        !isPassed && !isNext && !isUserStop && "bg-card border border-border hover:border-primary/30",
        className
      )}
    >
      {/* Timeline indicator */}
      <div className="relative flex flex-col items-center">
        <div
          className={cn(
            "w-4 h-4 rounded-full border-2 transition-all",
            isPassed && "bg-muted border-muted-foreground/30",
            isNext && "bg-ocean border-ocean shadow-glow",
            isUserStop && !isNext && "bg-sunset border-sunset",
            !isPassed && !isNext && !isUserStop && "bg-background border-primary/50"
          )}
        />
      </div>

      {/* Stop info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <MapPin className={cn(
            "w-4 h-4 shrink-0",
            isNext && "text-ocean",
            isUserStop && !isNext && "text-sunset"
          )} />
          <span
            className={cn(
              "font-medium truncate",
              isNext && "text-ocean",
              isUserStop && !isNext && "text-sunset"
            )}
          >
            {name}
          </span>
        </div>
        {isUserStop && (
          <span className="text-xs text-muted-foreground mt-0.5 block">Your stop</span>
        )}
      </div>

      {/* ETA */}
      {eta !== undefined && !isPassed && (
        <ETABadge minutes={eta} variant="compact" />
      )}

      {isPassed && (
        <span className="text-xs text-muted-foreground">Passed</span>
      )}
    </div>
  );
};
