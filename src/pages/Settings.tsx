import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

const Settings = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [profileModal, setProfileModal] = useState(false);
  const [notificationsModal, setNotificationsModal] = useState(false);
  const [languageModal, setLanguageModal] = useState(false);
  const [aboutModal, setAboutModal] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "Admin User",
    email: "admin@busbay.com",
    phone: "+1 234 567 8900",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    busArrival: true,
    routeChanges: true,
    systemUpdates: false,
  });

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully!");
    setProfileModal(false);
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved!");
    setNotificationsModal(false);
  };

  const handleSelectLanguage = (lang: 'en' | 'hi') => {
    setLanguage(lang);
    const langName = lang === 'en' ? 'English' : 'हिंदी';
    toast.success(`Language changed to ${langName}`);
    setLanguageModal(false);
  };

  return (
    <div className="min-h-screen bg-[#f0f9ff]">
      {/* Header */}
      <header className="bg-[#1e3a8a] pt-8 sm:pt-12 pb-6 sm:pb-8 px-4 sm:px-6 rounded-b-[25px] shadow-lg">
        <div className="container mx-auto flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => navigate("/admin")}
            className="text-white hover:bg-white/20 p-1.5 sm:p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-white mb-0.5 sm:mb-1">Settings</h1>
            <p className="text-xs sm:text-sm text-[#dbeafe]">Configure your preferences</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-3xl">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Settings Options */}
          <button
            onClick={() => setProfileModal(true)}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-200"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">👤</span>
              <div className="text-left">
                <div className="font-medium text-gray-800">Profile Settings</div>
                <div className="text-sm text-gray-500">Update your profile information</div>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>

          <button
            onClick={() => setNotificationsModal(true)}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-200"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">🔔</span>
              <div className="text-left">
                <div className="font-medium text-gray-800">Notifications</div>
                <div className="text-sm text-gray-500">Manage notification preferences</div>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>

          <button
            onClick={() => setLanguageModal(true)}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-200"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">🌐</span>
              <div className="text-left">
                <div className="font-medium text-gray-800">Language</div>
                <div className="text-sm text-gray-500">Change app language</div>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>

          <button
            onClick={() => setAboutModal(true)}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">ℹ️</span>
              <div className="text-left">
                <div className="font-medium text-gray-800">About</div>
                <div className="text-sm text-gray-500">App version and information</div>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>
        </div>
      </main>

      {/* Profile Modal */}
      {profileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-[#1e3a8a] text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">👤 Profile Settings</h2>
              <button onClick={() => setProfileModal(false)} className="text-white hover:bg-white/20 p-2 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                />
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setProfileModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white py-3 rounded-xl font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {notificationsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-[#1e3a8a] text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">🔔 Notifications</h2>
              <button onClick={() => setNotificationsModal(false)} className="text-white hover:bg-white/20 p-2 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <div className="font-medium text-gray-800">Bus Arrival Alerts</div>
                  <div className="text-sm text-gray-500">Get notified when bus is near</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.busArrival}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, busArrival: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e3a8a]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <div className="font-medium text-gray-800">Route Changes</div>
                  <div className="text-sm text-gray-500">Updates about route modifications</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.routeChanges}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, routeChanges: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e3a8a]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-gray-800">System Updates</div>
                  <div className="text-sm text-gray-500">App updates and announcements</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.systemUpdates}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, systemUpdates: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e3a8a]"></div>
                </label>
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setNotificationsModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotifications}
                className="flex-1 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white py-3 rounded-xl font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Language Modal */}
      {languageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-[#1e3a8a] text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">🌐 Select Language</h2>
              <button onClick={() => setLanguageModal(false)} className="text-white hover:bg-white/20 p-2 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={() => handleSelectLanguage('en')}
                className={`w-full text-left px-6 py-4 rounded-xl transition-colors font-medium ${
                  language === 'en'
                    ? "bg-[#1e3a8a] text-white shadow-lg"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg">English</div>
                    <div className={`text-sm ${language === 'en' ? 'text-blue-200' : 'text-gray-500'}`}>
                      English Language
                    </div>
                  </div>
                  {language === 'en' && <span className="text-2xl">✓</span>}
                </div>
              </button>
              
              <button
                onClick={() => handleSelectLanguage('hi')}
                className={`w-full text-left px-6 py-4 rounded-xl transition-colors font-medium ${
                  language === 'hi'
                    ? "bg-[#1e3a8a] text-white shadow-lg"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg">हिंदी (Hindi)</div>
                    <div className={`text-sm ${language === 'hi' ? 'text-blue-200' : 'text-gray-500'}`}>
                      हिंदी भाषा
                    </div>
                  </div>
                  {language === 'hi' && <span className="text-2xl">✓</span>}
                </div>
              </button>
            </div>
            <div className="p-6 pt-0">
              <button
                onClick={() => setLanguageModal(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {aboutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-[#1e3a8a] text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">ℹ️ About Bus Bay</h2>
              <button onClick={() => setAboutModal(false)} className="text-white hover:bg-white/20 p-2 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-center">
              <div className="text-6xl mb-4">🚌</div>
              <h3 className="text-2xl font-bold text-[#1e3a8a]">Bus Bay</h3>
              <p className="text-gray-600">Real-time Bus Tracking System</p>
              <div className="bg-gray-100 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Version</span>
                  <span className="font-semibold">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Build</span>
                  <span className="font-semibold">2024.03.13</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform</span>
                  <span className="font-semibold">Web</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 pt-4">
                © 2024 Bus Bay. All rights reserved.
              </p>
            </div>
            <div className="p-6 pt-0">
              <button
                onClick={() => setAboutModal(false)}
                className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white py-3 rounded-xl font-medium"
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

export default Settings;
