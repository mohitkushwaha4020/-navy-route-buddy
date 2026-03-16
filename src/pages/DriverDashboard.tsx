import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { MapPlaceholder } from "@/components/shared/MapPlaceholder";
import { StopCard } from "@/components/shared/StopCard";
import { BusIcon, RouteIcon, StopIcon } from "@/components/icons/BusIcon";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  ChevronRight,
  Navigation,
  Clock,
  Users,
  AlertCircle,
  User,
  X,
  Trash2,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Mock data
const mockRoute = {
  name: "Campus Express",
  busNumber: "CB-101",
  totalStops: 8,
  currentStop: 3,
  stops: [
    { id: 1, name: "City Center Station", isPassed: true },
    { id: 2, name: "North Avenue", isPassed: true },
    { id: 3, name: "Tech Park", isNext: true },
    { id: 4, name: "Green Valley" },
    { id: 5, name: "University Gate" },
    { id: 6, name: "Main Campus" },
  ],
};

type JourneyStatus = "idle" | "preview" | "active" | "paused";

const DriverDashboard = () => {
  const [journeyStatus, setJourneyStatus] = useState<JourneyStatus>("idle");
  const [currentStopIndex, setCurrentStopIndex] = useState(2);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [driverInfo, setDriverInfo] = useState<any>(null);
  const [studentsPerStop, setStudentsPerStop] = useState<Record<string, any[]>>({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Load driver info from localStorage
  useEffect(() => {
    const currentDriver = localStorage.getItem("currentDriver");
    if (currentDriver) {
      setDriverInfo(JSON.parse(currentDriver));
      // Keep in idle mode on login
      setJourneyStatus("idle");
    }

    // Load driver notifications
    const storedNotifications = localStorage.getItem("driverNotifications");
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }
  }, []);

  // Load students data and calculate students per stop
  useEffect(() => {
    if (!driverInfo?.stops) return;

    const storedStudents = localStorage.getItem("students");
    if (storedStudents) {
      const students = JSON.parse(storedStudents);
      
      // Group students by pickup point
      const stopMap: Record<string, any[]> = {};
      driverInfo.stops.forEach((stop: string) => {
        stopMap[stop] = students.filter((s: any) => s.pickupPoint === stop);
      });
      
      setStudentsPerStop(stopMap);
    }
  }, [driverInfo]);

  const handleStartJourney = () => {
    setJourneyStatus("active");
    
    // Save journey status to localStorage so students can see it
    if (driverInfo) {
      const journeyData = {
        busId: driverInfo.id,
        busNumber: driverInfo.busNumber,
        driver: driverInfo.driver,
        route: driverInfo.route,
        status: "active",
        currentStop: 0,
        stops: driverInfo.stops || [],
        startTime: new Date().toISOString(),
        // Simulated location (in real app, this would be GPS)
        location: {
          lat: 28.6139,
          lng: 77.2090,
          timestamp: new Date().toISOString()
        }
      };
      
      // Save to localStorage
      localStorage.setItem(`journey_${driverInfo.id}`, JSON.stringify(journeyData));
      
      // Update active journeys list
      const activeJourneys = JSON.parse(localStorage.getItem("activeJourneys") || "[]");
      const updated = activeJourneys.filter((j: any) => j.busId !== driverInfo.id);
      updated.push(journeyData);
      localStorage.setItem("activeJourneys", JSON.stringify(updated));
    }
    
    toast.success("Journey started! Location tracking is now active.");
  };

  const handlePauseJourney = () => {
    setJourneyStatus("paused");
    toast.info("Journey paused. Location tracking temporarily stopped.");
  };

  const handleResumeJourney = () => {
    setJourneyStatus("active");
    toast.success("Journey resumed. Location tracking active.");
  };

  const handleEndJourney = () => {
    setJourneyStatus("idle");
    
    // Remove journey from localStorage
    if (driverInfo) {
      localStorage.removeItem(`journey_${driverInfo.id}`);
      
      // Update active journeys list
      const activeJourneys = JSON.parse(localStorage.getItem("activeJourneys") || "[]");
      const updated = activeJourneys.filter((j: any) => j.busId !== driverInfo.id);
      localStorage.setItem("activeJourneys", JSON.stringify(updated));
    }
    
    toast.success("Journey completed! Great job.");
  };

  const handleMarkStopComplete = () => {
    if (currentStopIndex < mockRoute.stops.length - 1) {
      setCurrentStopIndex(currentStopIndex + 1);
      toast.success(`Completed stop: ${mockRoute.stops[currentStopIndex].name}`);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoUrl = reader.result as string;
        
        // Update driver info with new photo
        const updatedDriver = { ...driverInfo, photo: photoUrl };
        setDriverInfo(updatedDriver);
        
        // Update in localStorage
        localStorage.setItem("currentDriver", JSON.stringify(updatedDriver));
        
        // Update in buses array
        const storedBuses = localStorage.getItem("buses");
        if (storedBuses) {
          const buses = JSON.parse(storedBuses);
          const updatedBuses = buses.map((bus: any) => 
            bus.id === driverInfo.id ? { ...bus, photo: photoUrl } : bus
          );
          localStorage.setItem("buses", JSON.stringify(updatedBuses));
        }
        
        setShowPhotoUpload(false);
        toast.success("Profile photo updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTakePhoto = () => {
    toast.info("Camera feature requires mobile device or webcam access");
    setShowPhotoUpload(false);
  };

  const handleMarkAsRead = (notificationId: number) => {
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    localStorage.setItem("driverNotifications", JSON.stringify(updatedNotifications));
  };

  const handleDeleteNotification = (notificationId: number) => {
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    setNotifications(updatedNotifications);
    localStorage.setItem("driverNotifications", JSON.stringify(updatedNotifications));
    toast.success("Notification deleted");
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userName={driverInfo?.driver || "Driver"} 
        userRole="driver"
        userPhoto={driverInfo?.photo}
        unreadCount={unreadCount}
        onProfileClick={() => setShowProfileModal(true)}
        onNotificationClick={() => setShowNotifications(true)}
      />

      <main className="container px-4 py-6 space-y-6 max-w-4xl mx-auto">
        {/* Status Banner */}
        <section className="animate-fade-in">
          <div className={cn(
            "rounded-2xl p-4 flex items-center justify-between",
            journeyStatus === "active" && "bg-ocean/10 border-2 border-ocean",
            journeyStatus === "paused" && "bg-sunset-light border-2 border-sunset",
            (journeyStatus === "idle" || journeyStatus === "preview") && "bg-card border border-border"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-3 h-3 rounded-full",
                journeyStatus === "active" && "bg-ocean animate-pulse",
                journeyStatus === "paused" && "bg-sunset",
                (journeyStatus === "idle" || journeyStatus === "preview") && "bg-muted-foreground"
              )} />
              <div>
                <span className="font-semibold">
                  {journeyStatus === "active" && "Journey Active"}
                  {journeyStatus === "paused" && "Journey Paused"}
                  {journeyStatus === "preview" && "Route Preview"}
                  {journeyStatus === "idle" && "Ready to Start"}
                </span>
                {journeyStatus === "active" && (
                  <p className="text-sm text-muted-foreground">Location streaming to passengers</p>
                )}
              </div>
            </div>
            {journeyStatus === "active" && (
              <div className="flex items-center gap-2 text-sm text-ocean">
                <Clock className="w-4 h-4" />
                <span className="font-mono">12:34</span>
              </div>
            )}
          </div>
        </section>

        {/* Map Section - Shown during active/paused journey */}
        {(journeyStatus === "active" || journeyStatus === "paused") && (
          <section className="animate-fade-in">
            <div className="relative rounded-3xl overflow-hidden shadow-lg">
              {/* Back Arrow Button */}
              <button
                onClick={() => setJourneyStatus("preview")}
                className="absolute top-4 left-4 z-10 bg-white/90 hover:bg-white backdrop-blur-sm text-[#1e3a8a] p-2.5 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
                title="Back to Route Preview"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <MapPlaceholder 
                className="h-[300px] sm:h-[400px]" 
                busPosition={{ x: 40, y: 35 }}
                userStopPosition={{ x: 70, y: 70 }}
              />
              
              {/* Navigation overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="glass rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Next Stop</p>
                      <h3 className="font-bold text-lg">{mockRoute.stops[currentStopIndex].name}</h3>
                    </div>
                    <Button
                      variant="accent"
                      onClick={handleMarkStopComplete}
                      className="gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Arrived
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Route Preview - Shown in idle or preview mode */}
        {(journeyStatus === "idle" || journeyStatus === "preview") && driverInfo && (
          <section className="animate-slide-up">
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              {/* Route Header */}
              <div className="p-5 bg-gradient-hero text-primary-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm">
                    <BusIcon size={28} className="text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{driverInfo.route || "Your Route"}</h2>
                    <p className="opacity-80 font-mono">Bus {driverInfo.busNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <StopIcon className="w-4 h-4" />
                    <span>{driverInfo.stops?.length || 0} stops</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Ready to start</span>
                  </div>
                </div>
              </div>

              {/* Stops Preview */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <RouteIcon className="w-5 h-5 text-ocean" />
                    <h3 className="font-semibold">Route Stops</h3>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-ocean/10 rounded-full">
                    <Users className="w-4 h-4 text-ocean" />
                    <span className="text-sm font-semibold text-ocean">
                      {Object.values(studentsPerStop).flat().length} Students
                    </span>
                  </div>
                </div>
                {driverInfo.stops && driverInfo.stops.length > 0 ? (
                  <div className="space-y-2">
                    {driverInfo.stops.map((stop: string, index: number) => {
                      const studentsAtStop = studentsPerStop[stop] || [];
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-ocean text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{stop}</p>
                            {studentsAtStop.length > 0 && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {studentsAtStop.length} student{studentsAtStop.length !== 1 ? 's' : ''} • {studentsAtStop.map((s: any) => s.name).join(', ')}
                              </p>
                            )}
                          </div>
                          {studentsAtStop.length > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-ocean/20 rounded-full">
                              <Users className="w-3 h-3 text-ocean" />
                              <span className="text-xs font-bold text-ocean">{studentsAtStop.length}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No stops defined for this route</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Control Buttons */}
        <section className="animate-slide-up fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-background/80 backdrop-blur-lg border-t border-border safe-area-bottom">
          <div className="container max-w-4xl mx-auto">
            {journeyStatus === "idle" && (
              <Button
                variant="hero"
                size="lg"
                onClick={handleStartJourney}
                className="gap-2 h-12 sm:h-auto text-sm sm:text-base w-full"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                Start Journey
              </Button>
            )}

            {journeyStatus === "preview" && (
              <Button
                variant="hero"
                size="xl"
                onClick={handleStartJourney}
                className="w-full gap-2 h-12 sm:h-auto text-sm sm:text-base"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                Start Journey
              </Button>
            )}

            {journeyStatus === "active" && (
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePauseJourney}
                  className="gap-2 h-12 sm:h-auto text-sm sm:text-base"
                >
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                  Pause
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleEndJourney}
                  className="gap-2 h-12 sm:h-auto text-sm sm:text-base"
                >
                  <Square className="w-4 h-4 sm:w-5 sm:h-5" />
                  End Journey
                </Button>
              </div>
            )}

            {journeyStatus === "paused" && (
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={handleResumeJourney}
                  className="gap-2 h-12 sm:h-auto text-sm sm:text-base"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  Resume
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleEndJourney}
                  className="gap-2 h-12 sm:h-auto text-sm sm:text-base"
                >
                  <Square className="w-4 h-4 sm:w-5 sm:h-5" />
                  End Journey
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Spacer for fixed bottom bar */}
        <div className="h-20 sm:h-24" />
      </main>

      {/* Profile Modal */}
      {showProfileModal && driverInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            {/* Modal Header */}
            <div className="bg-[#1e3a8a] text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">👤 Driver Profile</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Profile Photo */}
              <div className="text-center mb-6 relative">
                <div className="relative inline-block">
                  {driverInfo.photo ? (
                    <button
                      onClick={() => setShowPhotoUpload(!showPhotoUpload)}
                      className="relative group"
                    >
                      <img
                        src={driverInfo.photo}
                        alt={driverInfo.driver}
                        className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-[#1e3a8a] shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm font-medium">Change Photo</span>
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowPhotoUpload(!showPhotoUpload)}
                      className="relative group"
                    >
                      <div className="w-32 h-32 rounded-full bg-[#1e3a8a] flex items-center justify-center mx-auto text-white text-5xl font-bold shadow-lg">
                        {driverInfo.driver?.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm font-medium">Add Photo</span>
                      </div>
                    </button>
                  )}
                  
                  {/* Photo Upload Options */}
                  {showPhotoUpload && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-10 w-48">
                      <label className="block w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <span className="flex items-center gap-2">
                          <span>🖼️</span>
                          <span>Upload from Gallery</span>
                        </span>
                      </label>
                      <button
                        onClick={handleTakePhoto}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span>📸</span>
                          <span>Take a Photo</span>
                        </span>
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">Click to {driverInfo.photo ? 'change' : 'add'} photo</p>
              </div>

              {/* Driver Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center gap-2">
                    <span>👤</span>
                    <span>Name</span>
                  </span>
                  <span className="font-semibold text-[#1e3a8a]">{driverInfo.driver}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center gap-2">
                    <span>📧</span>
                    <span>Email</span>
                  </span>
                  <span className="font-semibold text-[#1e3a8a] text-sm">{driverInfo.driverEmail}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center gap-2">
                    <span>📞</span>
                    <span>Phone</span>
                  </span>
                  <span className="font-semibold text-[#1e3a8a]">{driverInfo.driverPhone}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center gap-2">
                    <span>🚌</span>
                    <span>Bus Number</span>
                  </span>
                  <span className="font-semibold text-[#1e3a8a]">{driverInfo.busNumber}</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600 flex items-center gap-2">
                    <span>🗺️</span>
                    <span>Route</span>
                  </span>
                  <span className="font-semibold text-[#1e3a8a]">{driverInfo.route || "Not assigned"}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-0">
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white py-3 rounded-xl font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[80vh] flex flex-col">
            <div className="bg-gradient-hero text-white p-6 rounded-t-2xl flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">🔔 Notifications</h2>
                {unreadCount > 0 && (
                  <p className="text-sm opacity-90 mt-1">{unreadCount} unread</p>
                )}
              </div>
              <button onClick={() => setShowNotifications(false)} className="text-white hover:bg-white/20 p-2 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔕</div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">No Notifications</h3>
                  <p className="text-gray-600">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        notification.read
                          ? "bg-gray-50 border-gray-200"
                          : "bg-ocean/5 border-ocean/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 mb-1">{notification.title}</h4>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                        </div>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-ocean rounded-full mt-2"></span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleString()}
                        </span>
                        <div className="flex gap-2">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs px-3 py-1 bg-ocean text-white rounded-lg hover:bg-ocean/90 transition-colors flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Mark Read
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowNotifications(false)}
                className="w-full bg-ocean hover:bg-ocean/90 text-white py-3 rounded-xl font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
