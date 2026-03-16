import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { MapPlaceholder } from "@/components/shared/MapPlaceholder";
import { ETABadge } from "@/components/shared/ETABadge";
import { StopCard } from "@/components/shared/StopCard";
import { BusIcon, RouteIcon } from "@/components/icons/BusIcon";
import { Button } from "@/components/ui/button";
import { RefreshCw, Bell, ChevronDown, Navigation, MapPin, X, Camera, Upload, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const StudentDashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAllStops, setShowAllStops] = useState(false);
  const [alertModal, setAlertModal] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [photoMenuOpen, setPhotoMenuOpen] = useState(false);
  const [alertMinutes, setAlertMinutes] = useState(5);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [buses, setBuses] = useState<any[]>([]);
  const [routeBuses, setRouteBuses] = useState<any[]>([]);
  const [activeJourneys, setActiveJourneys] = useState<any[]>([]);
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Load student info and buses
  useEffect(() => {
    const currentStudent = localStorage.getItem("currentStudent");
    if (currentStudent) {
      const student = JSON.parse(currentStudent);
      setStudentInfo(student);
      
      loadBusesAndJourneys(student);
    }

    // Load notifications
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }
  }, []);

  // Refresh active journeys every 5 seconds
  useEffect(() => {
    if (!studentInfo) return;
    
    const interval = setInterval(() => {
      loadBusesAndJourneys(studentInfo);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [studentInfo]);

  const loadBusesAndJourneys = (student: any) => {
    // Load all buses
    const storedBuses = localStorage.getItem("buses");
    if (storedBuses) {
      const allBuses = JSON.parse(storedBuses);
      setBuses(allBuses);
      
      // Filter buses by student's pickup point
      if (student.pickupPoint) {
        const filtered = allBuses.filter((bus: any) => 
          bus.stops && Array.isArray(bus.stops) && bus.stops.includes(student.pickupPoint)
        );
        
        // Sort: assigned bus first, then others
        const sorted = filtered.sort((a: any, b: any) => {
          if (student.assignedBusId) {
            if (a.id === student.assignedBusId) return -1;
            if (b.id === student.assignedBusId) return 1;
          }
          return 0;
        });
        
        setRouteBuses(sorted);
      }
    }
    
    // Load active journeys
    const storedJourneys = localStorage.getItem("activeJourneys");
    if (storedJourneys) {
      const journeys = JSON.parse(storedJourneys);
      // Filter journeys for buses at student's pickup point
      const relevantJourneys = journeys.filter((j: any) => {
        const bus = buses.find((b: any) => b.id === j.busId);
        return bus && bus.stops && bus.stops.includes(student.pickupPoint);
      });
      setActiveJourneys(relevantJourneys);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleSetAlert = () => {
    toast.success(`Alert set! You'll be notified ${alertMinutes} minutes before arrival.`);
    setAlertModal(false);
  };

  const handleNavigate = () => {
    toast.info("Opening navigation to your stop...");
    // In a real app, this would open Google Maps or similar
    if (studentInfo?.pickupPoint) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(studentInfo.pickupPoint)}`, "_blank");
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoData = reader.result as string;
        
        // Update student info
        const updatedStudent = { ...studentInfo, photo: photoData };
        setStudentInfo(updatedStudent);
        localStorage.setItem("currentStudent", JSON.stringify(updatedStudent));
        
        // Update in students array
        const storedStudents = localStorage.getItem("students");
        if (storedStudents) {
          const students = JSON.parse(storedStudents);
          const updatedStudents = students.map((s: any) => 
            s.email === studentInfo.email ? updatedStudent : s
          );
          localStorage.setItem("students", JSON.stringify(updatedStudents));
        }
        
        toast.success("Profile photo updated successfully!");
        setPhotoMenuOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTakePhoto = () => {
    // Trigger file input with camera
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e: any) => handlePhotoUpload(e);
    input.click();
    setPhotoMenuOpen(false);
  };

  const handleUploadFromGallery = () => {
    // Trigger file input
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => handlePhotoUpload(e);
    input.click();
    setPhotoMenuOpen(false);
  };

  const handleMarkAsRead = (notificationId: number) => {
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
  };

  const handleDeleteNotification = (notificationId: number) => {
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    setNotifications(updatedNotifications);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    toast.success("Notification deleted");
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Get assigned bus details for route display
  const assignedBus = routeBuses.find(bus => bus.id === studentInfo?.assignedBusId) || routeBuses[0];
  const hasAssignedBus = !!assignedBus;

  // If a bus is selected, show map view
  if (selectedBus) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          userName={studentInfo?.name || "Student"} 
          userRole="student"
          userPhoto={studentInfo?.photo}
          unreadCount={unreadCount}
          onProfileClick={() => setProfileModal(true)}
          onNotificationClick={() => setShowNotifications(true)}
        />

        <main className="container px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => setSelectedBus(null)}
            className="mb-2"
          >
            <ChevronDown className="w-4 h-4 mr-2 rotate-90" />
            Back to Dashboard
          </Button>

          {/* Map Section */}
          <section className="animate-fade-in">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg">
              <MapPlaceholder className="h-[240px] sm:h-[280px] md:h-[350px]" />
              
              {/* ETA Overlay */}
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
                  <div className="flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-hero">
                        <BusIcon size={20} className="text-primary-foreground sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <h2 className="font-bold text-sm sm:text-lg">{selectedBus.route || "Your Bus"}</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                          Bus {selectedBus.busNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <ETABadge minutes={15} variant="large" />
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">to your stop</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Refresh button */}
              <Button
                variant="secondary"
                size="icon"
                onClick={handleRefresh}
                className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-card/90 backdrop-blur-sm shadow-md w-8 h-8 sm:w-10 sm:h-10"
              >
                <RefreshCw className={cn("w-3 h-3 sm:w-4 sm:h-4", isRefreshing && "animate-spin")} />
              </Button>
            </div>
          </section>

          {/* Route Progress */}
          {selectedBus.stops && selectedBus.stops.length > 0 && (
            <section className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <RouteIcon className="w-4 h-4 sm:w-5 sm:h-5 text-ocean" />
                    <h3 className="font-semibold text-sm sm:text-base">Route Progress</h3>
                  </div>
                  <span className="px-2 sm:px-3 py-1 rounded-full bg-ocean/10 text-ocean text-xs sm:text-sm font-medium">
                    On Route
                  </span>
                </div>

                {/* Stops list */}
                <div className="space-y-2">
                  {selectedBus.stops.slice(0, showAllStops ? selectedBus.stops.length : 3).map((stop: string, index: number) => (
                    <StopCard
                      key={index}
                      name={stop}
                      isUserStop={stop === studentInfo?.pickupPoint}
                      isPassed={false}
                    />
                  ))}
                </div>

                {selectedBus.stops.length > 3 && (
                  <Button
                    variant="ghost"
                    onClick={() => setShowAllStops(!showAllStops)}
                    className="w-full mt-3 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronDown className={cn(
                      "w-4 h-4 mr-2 transition-transform",
                      showAllStops && "rotate-180"
                    )} />
                    {showAllStops ? "Show less" : `Show all ${selectedBus.stops.length} stops`}
                  </Button>
                )}
              </div>
            </section>
          )}
        </main>

        {/* Profile Modal */}
        {profileModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              <div className="bg-gradient-hero text-white p-6 rounded-t-2xl flex items-center justify-between">
                <h2 className="text-2xl font-bold">👤 Student Profile</h2>
                <button onClick={() => setProfileModal(false)} className="text-white hover:bg-white/20 p-2 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {/* Profile Photo */}
                <div className="flex justify-center mb-4 relative">
                  <div 
                    className="relative group cursor-pointer"
                    onClick={() => setPhotoMenuOpen(!photoMenuOpen)}
                  >
                    {studentInfo?.photo ? (
                      <img 
                        src={studentInfo.photo} 
                        alt={studentInfo.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-ocean/20 group-hover:opacity-80 transition-opacity"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-ocean text-white flex items-center justify-center text-4xl font-bold border-4 border-ocean/20 group-hover:opacity-80 transition-opacity">
                        {studentInfo?.name?.charAt(0).toUpperCase() || "S"}
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-semibold">
                        {studentInfo?.photo ? "Change Photo" : "Add Photo"}
                      </span>
                    </div>
                  </div>

                  {/* Photo upload menu */}
                  {photoMenuOpen && (
                    <div className="absolute top-32 bg-white rounded-xl shadow-2xl border-2 border-ocean/20 overflow-hidden z-10 min-w-[200px]">
                      <button
                        onClick={handleUploadFromGallery}
                        className="w-full px-4 py-3 text-left hover:bg-ocean/10 transition-colors flex items-center gap-2 text-gray-700"
                      >
                        <span className="text-lg">🖼️</span>
                        <span className="font-medium">Upload from Gallery</span>
                      </button>
                      <button
                        onClick={handleTakePhoto}
                        className="w-full px-4 py-3 text-left hover:bg-ocean/10 transition-colors flex items-center gap-2 text-gray-700 border-t border-gray-200"
                      >
                        <span className="text-lg">📸</span>
                        <span className="font-medium">Take a Photo</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Student Info */}
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Name</p>
                    <p className="font-semibold text-gray-800">{studentInfo?.name || "N/A"}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="font-semibold text-gray-800">{studentInfo?.email || "N/A"}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Roll Number</p>
                    <p className="font-semibold text-gray-800">{studentInfo?.rollNo || "N/A"}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <p className="font-semibold text-gray-800">{studentInfo?.phone || "N/A"}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Pickup Point</p>
                    <p className="font-semibold text-gray-800">{studentInfo?.pickupPoint || "Not Assigned"}</p>
                  </div>

                  {studentInfo?.assignedBusId && (
                    <div className="bg-ocean/10 rounded-xl p-4 border-2 border-ocean/30">
                      <p className="text-xs text-ocean mb-1">Assigned Bus</p>
                      <p className="font-semibold text-ocean">
                        {routeBuses.find(b => b.id === studentInfo.assignedBusId)?.busNumber || "N/A"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 pt-0">
                <button
                  onClick={() => setProfileModal(false)}
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
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userName={studentInfo?.name || "Student"} 
        userRole="student"
        userPhoto={studentInfo?.photo}
        unreadCount={unreadCount}
        onProfileClick={() => setProfileModal(true)}
        onNotificationClick={() => setShowNotifications(true)}
      />

      <main className="container px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        {/* Quick Actions */}
        <section className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Button
              variant="outline"
              className="h-auto py-3 sm:py-4 flex-col gap-1.5 sm:gap-2"
              onClick={() => setAlertModal(true)}
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-ocean" />
              <span className="text-xs sm:text-sm">Set Alert</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 sm:py-4 flex-col gap-1.5 sm:gap-2"
              onClick={handleNavigate}
            >
              <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-ocean" />
              <span className="text-xs sm:text-sm">Navigate</span>
            </Button>
          </div>
        </section>

        {/* Your Stop Card */}
        <section className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-hero p-5 sm:p-6 text-primary-foreground">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">Your Pickup Point</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-1">{studentInfo?.pickupPoint || "No Pickup Point Assigned"}</h3>
              <p className="opacity-80 text-sm sm:text-base">{routeBuses.length} bus(es) pass through this stop</p>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-20 sm:w-24 h-20 sm:h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
        </section>

        {/* Available Buses */}
        {routeBuses.length > 0 && (
          <section className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">🚌 Buses at Your Stop</h3>
              <div className="space-y-3">
                {routeBuses.map((bus, index) => {
                  const activeJourney = activeJourneys.find((j: any) => j.busId === bus.id);
                  const isActive = !!activeJourney;
                  
                  return (
                    <div
                      key={bus.id}
                      onClick={() => setSelectedBus(bus)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all cursor-pointer",
                        studentInfo?.assignedBusId === bus.id
                          ? "bg-ocean/10 border-ocean shadow-md hover:shadow-lg"
                          : "bg-card border-border hover:border-ocean/50 hover:shadow-md"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {bus.photo ? (
                            <img src={bus.photo} alt={bus.busNumber} className="w-12 h-12 rounded-lg object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-ocean/20 flex items-center justify-center text-2xl">
                              🚌
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-[#1e3a8a]">{bus.busNumber}</h4>
                            <p className="text-sm text-gray-600">👤 {bus.driver}</p>
                            {bus.route && <p className="text-xs text-gray-500">🗺️ {bus.route}</p>}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          {studentInfo?.assignedBusId === bus.id && (
                            <span className="px-3 py-1 rounded-full bg-ocean text-white text-xs font-semibold">
                              Your Bus
                            </span>
                          )}
                          {isActive && (
                            <span className="px-3 py-1 rounded-full bg-green-500 text-white text-xs font-semibold animate-pulse">
                              🟢 Live
                            </span>
                          )}
                        </div>
                      </div>
                      {bus.driverPhone && (
                        <p className="text-sm text-gray-600">📞 {bus.driverPhone}</p>
                      )}
                      {isActive && activeJourney && (
                        <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-800 font-semibold">
                            🚌 Bus is on the way!
                          </p>
                          <p className="text-xs text-green-600">
                            Started: {new Date(activeJourney.startTime).toLocaleTimeString()}
                          </p>
                        </div>
                      )}
                      {bus.stops && bus.stops.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Route stops:</p>
                          <div className="flex flex-wrap gap-1">
                            {bus.stops.map((stop: string, idx: number) => (
                              <span
                                key={idx}
                                className={cn(
                                  "text-xs px-2 py-1 rounded-full",
                                  stop === studentInfo?.pickupPoint
                                    ? "bg-ocean text-white font-semibold"
                                    : "bg-gray-100 text-gray-600"
                                )}
                              >
                                {stop}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {!studentInfo?.pickupPoint && (
          <section className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
              <div className="text-5xl mb-3">⚠️</div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">No Pickup Point Assigned</h3>
              <p className="text-gray-600">Please contact admin to assign you a pickup point</p>
            </div>
          </section>
        )}
      </main>

      {/* Alert Modal */}
      {alertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-hero text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">🔔 Set Arrival Alert</h2>
              <button onClick={() => setAlertModal(false)} className="text-white hover:bg-white/20 p-2 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600">Get notified when the bus is approaching your stop.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert me when bus is within:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[3, 5, 10].map((minutes) => (
                    <button
                      key={minutes}
                      onClick={() => setAlertMinutes(minutes)}
                      className={`py-3 rounded-xl font-medium transition-colors ${
                        alertMinutes === minutes
                          ? "bg-ocean text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                      }`}
                    >
                      {minutes} min
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  📱 You'll receive a notification {alertMinutes} minutes before the bus arrives at {studentInfo?.pickupPoint || "your stop"}.
                </p>
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setAlertModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSetAlert}
                className="flex-1 bg-ocean hover:bg-ocean/90 text-white py-3 rounded-xl font-medium"
              >
                Set Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {profileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-hero text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">👤 Student Profile</h2>
              <button onClick={() => setProfileModal(false)} className="text-white hover:bg-white/20 p-2 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Profile Photo */}
              <div className="flex justify-center mb-4 relative">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => setPhotoMenuOpen(!photoMenuOpen)}
                >
                  {studentInfo?.photo ? (
                    <img 
                      src={studentInfo.photo} 
                      alt={studentInfo.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-ocean/20 group-hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-ocean text-white flex items-center justify-center text-4xl font-bold border-4 border-ocean/20 group-hover:opacity-80 transition-opacity">
                      {studentInfo?.name?.charAt(0).toUpperCase() || "S"}
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-semibold">
                      {studentInfo?.photo ? "Change Photo" : "Add Photo"}
                    </span>
                  </div>
                </div>

                {/* Photo upload menu */}
                {photoMenuOpen && (
                  <div className="absolute top-32 bg-white rounded-xl shadow-2xl border-2 border-ocean/20 overflow-hidden z-10 min-w-[200px]">
                    <button
                      onClick={handleUploadFromGallery}
                      className="w-full px-4 py-3 text-left hover:bg-ocean/10 transition-colors flex items-center gap-2 text-gray-700"
                    >
                      <span className="text-lg">🖼️</span>
                      <span className="font-medium">Upload from Gallery</span>
                    </button>
                    <button
                      onClick={handleTakePhoto}
                      className="w-full px-4 py-3 text-left hover:bg-ocean/10 transition-colors flex items-center gap-2 text-gray-700 border-t border-gray-200"
                    >
                      <span className="text-lg">📸</span>
                      <span className="font-medium">Take a Photo</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Student Info */}
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Name</p>
                  <p className="font-semibold text-gray-800">{studentInfo?.name || "N/A"}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="font-semibold text-gray-800">{studentInfo?.email || "N/A"}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Roll Number</p>
                  <p className="font-semibold text-gray-800">{studentInfo?.rollNo || "N/A"}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <p className="font-semibold text-gray-800">{studentInfo?.phone || "N/A"}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Pickup Point</p>
                  <p className="font-semibold text-gray-800">{studentInfo?.pickupPoint || "Not Assigned"}</p>
                </div>

                {studentInfo?.assignedBusId && (
                  <div className="bg-ocean/10 rounded-xl p-4 border-2 border-ocean/30">
                    <p className="text-xs text-ocean mb-1">Assigned Bus</p>
                    <p className="font-semibold text-ocean">
                      {routeBuses.find(b => b.id === studentInfo.assignedBusId)?.busNumber || "N/A"}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 pt-0">
              <button
                onClick={() => setProfileModal(false)}
                className="w-full bg-ocean hover:bg-ocean/90 text-white py-3 rounded-xl font-medium"
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

export default StudentDashboard;
