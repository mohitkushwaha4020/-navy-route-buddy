import { cn } from "@/lib/utils";
import { BusIcon } from "../icons/BusIcon";
import { Bell, Menu } from "lucide-react";
import { Button } from "../ui/button";

interface HeaderProps {
  userName?: string;
  userRole?: "student" | "driver" | "admin";
  userPhoto?: string;
  unreadCount?: number;
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  className?: string;
}

export const Header = ({
  userName = "User",
  userRole = "student",
  userPhoto,
  unreadCount = 0,
  onMenuClick,
  onNotificationClick,
  onProfileClick,
  className,
}: HeaderProps) => {
  const roleLabels = {
    student: "Student",
    driver: "Driver",
    admin: "Admin",
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "glass border-b border-border/50",
        className
      )}
    >
      <div className="container flex items-center justify-between h-16 px-4">
        {/* Left: Menu & Logo */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-hero">
              <BusIcon size={20} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:block">Bus Bay</span>
          </div>
        </div>

        {/* Center: Role badge (desktop) */}
        <div className="hidden md:flex items-center">
          <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
            {roleLabels[userRole]}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNotificationClick}
            className="relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-sunset rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <button
              onClick={onProfileClick}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors cursor-pointer overflow-hidden"
              title="View Profile"
            >
              {userPhoto ? (
                <img 
                  src={userPhoto} 
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </button>
            <span className="text-sm font-medium hidden lg:block">{userName}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
