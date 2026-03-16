import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation strings for web
const translations = {
  en: {
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    close: 'Close',
    confirm: 'Confirm',
    loading: 'Loading...',
    refresh: 'Refresh',
    refreshing: 'Refreshing...',
    
    // Navigation
    menu: 'Menu',
    logout: 'Logout',
    settings: 'Settings',
    
    // Dashboard
    adminDashboard: 'Admin Dashboard',
    welcomeAdmin: 'Welcome, Admin',
    totalUsers: 'Total Users',
    drivers: 'Drivers',
    students: 'Students',
    activeBuses: 'Active Buses',
    
    // Bus Management
    manageBuses: 'Manage Buses',
    addFirstBus: 'Add First Bus',
    noBusesYet: 'No Buses Added Yet',
    startByAdding: 'Start by adding your first bus to the system',
    busNumber: 'Bus Number',
    route: 'Route',
    driver: 'Driver',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    currentLocation: 'Current Location',
    viewDetails: 'View Details',
    trackOnMap: 'Track on Map',
    busDetails: 'Bus Details',
    
    // Student Management
    manageStudents: 'Manage Students',
    viewApprove: 'View and approve student registrations',
    
    // Routes
    activeRoutes: 'Active Routes',
    viewRoutes: 'View Routes',
    monitorRoutes: 'Monitor all active routes on map',
    activeRoutesMap: 'Active Routes Map coming soon!',
    
    // Notifications
    sendNotification: 'Send Notification',
    notificationTitle: 'Notification Title',
    message: 'Message',
    sendTo: 'Send To',
    both: 'Both',
    sendNow: 'Send Now',
    broadcastMessage: 'Broadcast to all students',
    enterTitle: 'e.g., Important Update',
    enterMessage: 'Enter your message here...',
    willBeSent: 'This notification will be sent to',
    allStudents: 'all students',
    allDrivers: 'all drivers',
    and: 'and',
    immediately: 'immediately',
    
    // Messages
    dataRefreshed: 'Data refreshed successfully!',
    failedToRefresh: 'Failed to refresh data',
    loggedOut: 'Logged out successfully',
    notificationSent: 'Notification sent to',
    fillAllFields: 'Please fill all fields!',
    
    // Quick Actions
    quickActions: 'Quick Actions',
    addEditRemove: 'Add, edit, or remove buses',
  },
  hi: {
    // Common
    save: 'सेव करें',
    cancel: 'रद्द करें',
    delete: 'डिलीट करें',
    edit: 'एडिट करें',
    add: 'जोड़ें',
    close: 'बंद करें',
    confirm: 'पुष्टि करें',
    loading: 'लोड हो रहा है...',
    refresh: 'रिफ्रेश करें',
    refreshing: 'रिफ्रेश हो रहा है...',
    
    // Navigation
    menu: 'मेनू',
    logout: 'लॉगआउट',
    settings: 'सेटिंग्स',
    
    // Dashboard
    adminDashboard: 'एडमिन डैशबोर्ड',
    welcomeAdmin: 'स्वागत है, एडमिन',
    totalUsers: 'कुल उपयोगकर्ता',
    drivers: 'ड्राइवर',
    students: 'छात्र',
    activeBuses: 'सक्रिय बसें',
    
    // Bus Management
    manageBuses: 'बस प्रबंधन',
    addFirstBus: 'पहली बस जोड़ें',
    noBusesYet: 'अभी तक कोई बस नहीं जोड़ी गई',
    startByAdding: 'सिस्टम में अपनी पहली बस जोड़कर शुरू करें',
    busNumber: 'बस नंबर',
    route: 'रूट',
    driver: 'ड्राइवर',
    status: 'स्थिति',
    active: 'सक्रिय',
    inactive: 'निष्क्रिय',
    currentLocation: 'वर्तमान स्थान',
    viewDetails: 'विवरण देखें',
    trackOnMap: 'मैप पर ट्रैक करें',
    busDetails: 'बस विवरण',
    
    // Student Management
    manageStudents: 'छात्र प्रबंधन',
    viewApprove: 'छात्र पंजीकरण देखें और स्वीकृत करें',
    
    // Routes
    activeRoutes: 'सक्रिय रूट',
    viewRoutes: 'रूट देखें',
    monitorRoutes: 'मैप पर सभी सक्रिय रूट की निगरानी करें',
    activeRoutesMap: 'सक्रिय रूट मैप जल्द आ रहा है!',
    
    // Notifications
    sendNotification: 'सूचना भेजें',
    notificationTitle: 'सूचना शीर्षक',
    message: 'संदेश',
    sendTo: 'भेजें',
    both: 'दोनों',
    sendNow: 'अभी भेजें',
    broadcastMessage: 'सभी छात्रों को प्रसारित करें',
    enterTitle: 'उदा., महत्वपूर्ण अपडेट',
    enterMessage: 'अपना संदेश यहां दर्ज करें...',
    willBeSent: 'यह सूचना भेजी जाएगी',
    allStudents: 'सभी छात्रों को',
    allDrivers: 'सभी ड्राइवरों को',
    and: 'और',
    immediately: 'तुरंत',
    
    // Messages
    dataRefreshed: 'डेटा सफलतापूर्वक रिफ्रेश हो गया!',
    failedToRefresh: 'डेटा रिफ्रेश करने में विफल',
    loggedOut: 'सफलतापूर्वक लॉगआउट हो गया',
    notificationSent: 'सूचना भेजी गई',
    fillAllFields: 'कृपया सभी फ़ील्ड भरें!',
    
    // Quick Actions
    quickActions: 'त्वरित कार्य',
    addEditRemove: 'बस जोड़ें, एडिट करें या हटाएं',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('app_language');
    if (savedLanguage === 'hi' || savedLanguage === 'en') {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('app_language', lang);
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
