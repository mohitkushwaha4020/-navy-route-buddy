import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Menu, X, Bell, Send } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    totalStudents: 0,
    activeBuses: 0,
  });
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewDetailsModal, setViewDetailsModal] = useState<any>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState<string | null>(null);
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    recipient: "students" as "students" | "drivers" | "both",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    
    try {
      // Get buses from localStorage
      const storedBuses = localStorage.getItem("buses");
      const busesData = storedBuses ? JSON.parse(storedBuses) : [];
      
      // Get students from localStorage
      const storedStudents = localStorage.getItem("students");
      const studentsData = storedStudents ? JSON.parse(storedStudents) : [];
      
      // Calculate stats from real data
      const activeBusesCount = busesData.filter((b: any) => b.status === "active").length;
      const totalDrivers = new Set(busesData.map((b: any) => b.driver)).size;
      const approvedStudents = studentsData.filter((s: any) => s.status === "approved").length;
      const totalUsers = totalDrivers + studentsData.length;
      
      setStats({
        totalUsers: totalUsers,
        totalDrivers: totalDrivers,
        totalStudents: studentsData.length,
        activeBuses: activeBusesCount,
      });

      setBuses(busesData);
      toast.success("Data refreshed successfully!");
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    toast.success(t('loggedOut'));
    navigate("/login");
  };

  const handleSendNotification = () => {
    if (!notificationForm.title || !notificationForm.message) {
      toast.error(t('fillAllFields'));
      return;
    }

    // Create new notification
    const newNotification = {
      id: Date.now(),
      title: notificationForm.title,
      message: notificationForm.message,
      timestamp: new Date().toISOString(),
      read: false,
      recipient: notificationForm.recipient,
    };

    // Save to appropriate localStorage based on recipient
    if (notificationForm.recipient === "students" || notificationForm.recipient === "both") {
      const storedNotifications = localStorage.getItem("notifications");
      const notifications = storedNotifications ? JSON.parse(storedNotifications) : [];
      notifications.unshift(newNotification);
      localStorage.setItem("notifications", JSON.stringify(notifications));
    }

    if (notificationForm.recipient === "drivers" || notificationForm.recipient === "both") {
      const storedDriverNotifications = localStorage.getItem("driverNotifications");
      const driverNotifications = storedDriverNotifications ? JSON.parse(storedDriverNotifications) : [];
      driverNotifications.unshift(newNotification);
      localStorage.setItem("driverNotifications", JSON.stringify(driverNotifications));
    }

    // Reset form and close modal
    setNotificationForm({ title: "", message: "", recipient: "students" });
    setShowNotificationModal(false);
    
    const recipientText = 
      notificationForm.recipient === "students" ? t('allStudents') :
      notificationForm.recipient === "drivers" ? t('allDrivers') :
      `${t('allStudents')} ${t('and')} ${t('allDrivers')}`;
    
    toast.success(`${t('notificationSent')} ${recipientText}!`);
  };

  return (
    <div className="min-h-screen bg-[#f0f9ff]">
      {/* Side Drawer Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Side Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-[75%] max-w-sm bg-white z-50 shadow-2xl transform transition-transform duration-300 ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="bg-[#1e3a8a] p-6 pt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">{t('menu')}</h2>
            <button
              onClick={() => setDrawerOpen(false)}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-[#93c5fd]">ADMIN</p>
        </div>

        {/* Drawer Menu Items */}
        <div className="flex-1 py-4">
          <button
            onClick={() => {
              navigate("/manage-buses");
              setDrawerOpen(false);
            }}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-100 transition-colors border-b border-gray-200"
          >
            <span className="text-2xl">🚌</span>
            <span className="text-base font-medium text-gray-800">{t('manageBuses')}</span>
          </button>

          <button
            onClick={() => {
              toast.info(t('activeRoutesMap'));
              setDrawerOpen(false);
            }}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-100 transition-colors border-b border-gray-200"
          >
            <span className="text-2xl">🗺️</span>
            <span className="text-base font-medium text-gray-800">{t('activeRoutes')}</span>
          </button>

          <button
            onClick={() => {
              navigate("/manage-students");
              setDrawerOpen(false);
            }}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-100 transition-colors border-b border-gray-200"
          >
            <span className="text-2xl">🎓</span>
            <span className="text-base font-medium text-gray-800">{t('manageStudents')}</span>
          </button>

          <button
            onClick={() => {
              navigate("/settings");
              setDrawerOpen(false);
            }}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-100 transition-colors border-b border-gray-200"
          >
            <span className="text-2xl">⚙️</span>
            <span className="text-base font-medium text-gray-800">{t('settings')}</span>
          </button>

          <button
            onClick={() => {
              handleLogout();
              setDrawerOpen(false);
            }}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-100 transition-colors border-b border-gray-200"
          >
            <span className="text-2xl">🚪</span>
            <span className="text-base font-medium text-gray-800">{t('logout')}</span>
          </button>
        </div>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">admin@busbay.com</p>
        </div>
      </div>

      {/* Header - Navy Blue with Curved Bottom */}
      <header className="bg-[#1e3a8a] pt-8 sm:pt-12 pb-6 sm:pb-8 px-4 sm:px-6 rounded-b-[25px] shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="text-white hover:bg-white/20 p-1.5 sm:p-2 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-white mb-0.5 sm:mb-1">{t('adminDashboard')}</h1>
              <p className="text-xs sm:text-sm text-[#dbeafe]">{t('welcomeAdmin')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowNotificationModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-xs sm:text-base"
            >
              <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Send Notification</span>
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-xs sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{loading ? "Refreshing..." : "Refresh"}</span>
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-xs sm:text-base"
            >
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">🚪</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Stats Grid - Responsive & Clickable */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          <button
            onClick={() => setShowStatsModal('users')}
            className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl shadow-md border-l-4 border-l-[#1e3a8a] hover:shadow-lg transition-all hover:scale-105 cursor-pointer text-left"
          >
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1e3a8a] mb-1">{stats.totalUsers}</div>
            <div className="text-[10px] sm:text-xs lg:text-sm text-gray-600">{t('totalUsers')}</div>
          </button>

          <button
            onClick={() => setShowStatsModal('drivers')}
            className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl shadow-md border-l-4 border-l-[#3b82f6] hover:shadow-lg transition-all hover:scale-105 cursor-pointer text-left"
          >
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1e3a8a] mb-1">{stats.totalDrivers}</div>
            <div className="text-[10px] sm:text-xs lg:text-sm text-gray-600">{t('drivers')}</div>
          </button>

          <button
            onClick={() => setShowStatsModal('students')}
            className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl shadow-md border-l-4 border-l-[#f59e0b] hover:shadow-lg transition-all hover:scale-105 cursor-pointer text-left"
          >
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1e3a8a] mb-1">{stats.totalStudents}</div>
            <div className="text-[10px] sm:text-xs lg:text-sm text-gray-600">{t('students')}</div>
          </button>

          <button
            onClick={() => setShowStatsModal('activeBuses')}
            className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl shadow-md border-l-4 border-l-[#10b981] hover:shadow-lg transition-all hover:scale-105 cursor-pointer text-left"
          >
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1e3a8a] mb-1">{stats.activeBuses}</div>
            <div className="text-[10px] sm:text-xs lg:text-sm text-gray-600">{t('activeBuses')}</div>
          </button>
        </div>

        {/* Buses List - Responsive Grid */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 lg:p-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1e293b] mb-3 sm:mb-4 lg:mb-6">{t('activeBuses')}</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : buses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-6xl mb-4">🚌</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('noBusesYet')}</h3>
              <p className="text-gray-600 mb-6">{t('startByAdding')}</p>
              <button
                onClick={() => navigate("/manage-buses")}
                className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                {t('addFirstBus')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {buses.map((bus) => (
                <div
                  key={bus.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-[#1e3a8a]">🚌 {bus.busNumber}</h3>
                      <p className="text-sm text-[#3b82f6]">{bus.route}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        bus.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {bus.status === "active" ? "🟢 Active" : "⭕ Inactive"}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div>👤 Driver: {bus.driver}</div>
                    <div>👥 Students: {bus.students}</div>
                    <div>📍 Location: {bus.currentLocation}</div>
                  </div>

                  <button 
                    onClick={() => setViewDetailsModal(bus)}
                    className="mt-3 w-full bg-[#f8fafc] hover:bg-gray-100 text-[#1e3a8a] py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <div 
            onClick={() => navigate("/manage-buses")}
            className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h3 className="text-lg font-bold text-[#1e293b] mb-2">🚌 {t('manageBuses')}</h3>
            <p className="text-sm text-gray-600">{t('addEditRemove')}</p>
          </div>

          <div 
            onClick={() => navigate("/manage-students")}
            className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h3 className="text-lg font-bold text-[#1e293b] mb-2">🎓 {t('manageStudents')}</h3>
            <p className="text-sm text-gray-600">{t('viewApprove')}</p>
          </div>

          <div 
            onClick={() => toast.info(t('activeRoutesMap'))}
            className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h3 className="text-lg font-bold text-[#1e293b] mb-2">🗺️ {t('viewRoutes')}</h3>
            <p className="text-sm text-gray-600">{t('monitorRoutes')}</p>
          </div>
        </div>
      </main>

      {/* View Details Modal */}
      {viewDetailsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            {/* Modal Header */}
            <div className="bg-[#1e3a8a] text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">🚌 {t('busDetails')}</h2>
              <p className="text-sm text-[#93c5fd] mt-1">{viewDetailsModal.busNumber}</p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">{t('busNumber')}</span>
                <span className="font-semibold text-[#1e3a8a]">{viewDetailsModal.busNumber}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">{t('route')}</span>
                <span className="font-semibold text-[#1e3a8a]">{viewDetailsModal.route}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">{t('driver')}</span>
                <span className="font-semibold text-[#1e3a8a]">{viewDetailsModal.driver}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">{t('status')}</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    viewDetailsModal.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {viewDetailsModal.status === "active" ? `🟢 ${t('active')}` : `⭕ ${t('inactive')}`}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">{t('students')}</span>
                <span className="font-semibold text-[#1e3a8a]">{viewDetailsModal.students}</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-gray-600">{t('currentLocation')}</span>
                <span className="font-semibold text-[#1e3a8a]">{viewDetailsModal.currentLocation}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setViewDetailsModal(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-medium transition-colors"
              >
                {t('close')}
              </button>
              <button
                onClick={() => {
                  toast.info(t('trackOnMap'));
                  setViewDetailsModal(null);
                }}
                className="flex-1 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white py-3 rounded-xl font-medium transition-colors"
              >
                {t('trackOnMap')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Details Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-[#1e3a8a] text-white p-6 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-bold">
                  {showStatsModal === 'users' && '👥 All Users'}
                  {showStatsModal === 'drivers' && '🚌 All Drivers'}
                  {showStatsModal === 'students' && '🎓 All Students'}
                  {showStatsModal === 'activeBuses' && '🚌 Active Buses'}
                </h2>
                <p className="text-sm text-[#93c5fd] mt-1">
                  {showStatsModal === 'users' && `Total: ${stats.totalUsers} users`}
                  {showStatsModal === 'drivers' && `Total: ${stats.totalDrivers} drivers`}
                  {showStatsModal === 'students' && `Total: ${stats.totalStudents} students`}
                  {showStatsModal === 'activeBuses' && `Total: ${stats.activeBuses} active buses`}
                </p>
              </div>
              <button
                onClick={() => setShowStatsModal(null)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {showStatsModal === 'users' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="font-bold text-lg text-[#1e3a8a] mb-3">User Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-blue-200">
                        <span className="text-gray-700">🚌 Drivers</span>
                        <span className="font-bold text-[#1e3a8a]">{stats.totalDrivers}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-700">🎓 Students</span>
                        <span className="font-bold text-[#1e3a8a]">{stats.totalStudents}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600">
                      Total registered users in the system including drivers and students.
                    </p>
                  </div>
                </div>
              )}

              {showStatsModal === 'drivers' && (
                <div className="space-y-4">
                  {(() => {
                    const storedBuses = localStorage.getItem("buses");
                    const busesData = storedBuses ? JSON.parse(storedBuses) : [];
                    const drivers = Array.from(new Set(busesData.map((b: any) => b.driver)));
                    
                    return drivers.length > 0 ? (
                      <div className="space-y-3">
                        {drivers.map((driver: any, index: number) => {
                          const driverBuses = busesData.filter((b: any) => b.driver === driver);
                          return (
                            <div key={index} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-[#1e3a8a]">👤 {driver}</h3>
                                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                                  {driverBuses.length} {driverBuses.length === 1 ? 'Bus' : 'Buses'}
                                </span>
                              </div>
                              <div className="space-y-1">
                                {driverBuses.map((bus: any, idx: number) => (
                                  <div key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                                    <span>🚌</span>
                                    <span>{bus.busNumber} - {bus.route}</span>
                                    <span className={`ml-auto text-xs ${bus.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                                      {bus.status === 'active' ? '🟢 Active' : '⭕ Inactive'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-6xl mb-4">🚌</div>
                        <p className="text-gray-600">No drivers found</p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {showStatsModal === 'students' && (
                <div className="space-y-4">
                  {(() => {
                    const storedStudents = localStorage.getItem("students");
                    const studentsData = storedStudents ? JSON.parse(storedStudents) : [];
                    
                    return studentsData.length > 0 ? (
                      <div className="space-y-3">
                        {studentsData.map((student: any, index: number) => (
                          <div key={index} className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-bold text-[#1e3a8a]">🎓 {student.name}</h3>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                student.status === 'approved' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {student.status === 'approved' ? '✅ Approved' : '⏳ Pending'}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-700">
                              <div>📧 {student.email}</div>
                              <div>🚌 Bus: {student.bus || 'Not assigned'}</div>
                              <div>📍 Pickup: {student.pickupLocation || 'Not set'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-6xl mb-4">🎓</div>
                        <p className="text-gray-600">No students found</p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {showStatsModal === 'activeBuses' && (
                <div className="space-y-4">
                  {(() => {
                    const activeBuses = buses.filter((b: any) => b.status === 'active');
                    
                    return activeBuses.length > 0 ? (
                      <div className="space-y-3">
                        {activeBuses.map((bus: any, index: number) => (
                          <div key={index} className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-bold text-[#1e3a8a]">🚌 {bus.busNumber}</h3>
                              <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                                🟢 Active
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-700">
                              <div>📍 Route: {bus.route}</div>
                              <div>👤 Driver: {bus.driver}</div>
                              <div>👥 Students: {bus.students}</div>
                              <div>📌 Location: {bus.currentLocation}</div>
                            </div>
                            <button
                              onClick={() => {
                                setShowStatsModal(null);
                                setViewDetailsModal(bus);
                              }}
                              className="mt-3 w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              View Full Details
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-6xl mb-4">🚌</div>
                        <p className="text-gray-600 mb-4">No active buses at the moment</p>
                        <button
                          onClick={() => {
                            setShowStatsModal(null);
                            navigate("/manage-buses");
                          }}
                          className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white px-6 py-2 rounded-xl font-medium transition-colors"
                        >
                          Manage Buses
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-0 border-t border-gray-200">
              <button
                onClick={() => setShowStatsModal(null)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            {/* Modal Header */}
            <div className="bg-[#1e3a8a] text-white p-6 rounded-t-2xl flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">🔔 Send Notification</h2>
                <p className="text-sm text-[#93c5fd] mt-1">Broadcast to all students</p>
              </div>
              <button
                onClick={() => {
                  setShowNotificationModal(false);
                  setNotificationForm({ title: "", message: "", recipient: "students" });
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send To *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setNotificationForm({ ...notificationForm, recipient: "students" })}
                    className={`py-3 rounded-xl font-medium transition-colors ${
                      notificationForm.recipient === "students"
                        ? "bg-[#1e3a8a] text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                    }`}
                  >
                    🎓 Students
                  </button>
                  <button
                    onClick={() => setNotificationForm({ ...notificationForm, recipient: "drivers" })}
                    className={`py-3 rounded-xl font-medium transition-colors ${
                      notificationForm.recipient === "drivers"
                        ? "bg-[#1e3a8a] text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                    }`}
                  >
                    🚌 Drivers
                  </button>
                  <button
                    onClick={() => setNotificationForm({ ...notificationForm, recipient: "both" })}
                    className={`py-3 rounded-xl font-medium transition-colors ${
                      notificationForm.recipient === "both"
                        ? "bg-[#1e3a8a] text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                    }`}
                  >
                    👥 Both
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Title *
                </label>
                <input
                  type="text"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                  placeholder="e.g., Important Update"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                  placeholder="Enter your message here..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  📢 This notification will be sent to{" "}
                  {notificationForm.recipient === "students" && `all ${stats.totalStudents} students`}
                  {notificationForm.recipient === "drivers" && `all ${stats.totalDrivers} drivers`}
                  {notificationForm.recipient === "both" && `all ${stats.totalStudents} students and ${stats.totalDrivers} drivers`}
                  {" "}immediately.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => {
                  setShowNotificationModal(false);
                  setNotificationForm({ title: "", message: "", recipient: "students" });
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendNotification}
                className="flex-1 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
