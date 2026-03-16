import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface ETABadgeProps {
  minutes: number;
  className?: string;
  variant?: "default" | "large" | "compact";
}

export const ETABadge = ({ minutes, className, variant = "default" }: ETABadgeProps) => {
  const isArriving = minutes <= 2;
  const isSoon = minutes <= 5;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold transition-all",
        variant === "large" && "px-4 py-2 text-lg gap-2",
        variant === "default" && "px-3 py-1.5 text-sm",
        variant === "compact" && "px-2 py-1 text-xs",
        isArriving && "bg-gradient-sunset text-accent-foreground shadow-sm",
        isSoon && !isArriving && "bg-ocean text-accent-foreground",
        !isSoon && "bg-secondary text-secondary-foreground",
        className
      )}
    >
      <Clock className={cn(
        variant === "large" ? "w-5 h-5" : variant === "compact" ? "w-3 h-3" : "w-4 h-4"
      )} />
      <span>
        {isArriving ? "Arriving" : `${minutes} min`}
      </span>
    </div>
  );
};
