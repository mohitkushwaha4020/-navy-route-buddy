import { cn } from "@/lib/utils";

interface BusIconProps {
  className?: string;
  size?: number;
}

export const BusIcon = ({ className, size = 24 }: BusIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("", className)}
  >
    <rect x="3" y="4" width="18" height="14" rx="2" fill="currentColor" opacity="0.2" />
    <path
      d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V16C20 17.1046 19.1046 18 18 18H6C4.89543 18 4 17.1046 4 16V6Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M4 10H20" stroke="currentColor" strokeWidth="2" />
    <path d="M8 14H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 14H16.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M7 18V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M17 18V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const BusMarkerIcon = ({ className, size = 32 }: BusIconProps) => (
  <div className={cn("relative", className)}>
    <div className="absolute inset-0 rounded-full bg-ocean/30 animate-ping" />
    <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-accent shadow-glow">
      <BusIcon size={size * 0.6} className="text-accent-foreground" />
    </div>
  </div>
);

export const RouteIcon = ({ className, size = 24 }: BusIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("", className)}
  >
    <circle cx="5" cy="5" r="2" fill="currentColor" />
    <circle cx="19" cy="19" r="2" fill="currentColor" />
    <path
      d="M5 7V12C5 14.2091 6.79086 16 9 16H15C17.2091 16 19 14.2091 19 12V12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="4 2"
    />
    <path d="M19 17V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const StopIcon = ({ className, size = 24 }: BusIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("", className)}
  >
    <path
      d="M12 2L12 22"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <rect
      x="8"
      y="6"
      width="8"
      height="6"
      rx="1"
      fill="currentColor"
      opacity="0.3"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);
