import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'en' | 'hi';
type Theme = 'light' | 'dark';

interface SettingsContextType {
  language: Language;
  theme: Theme;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  t: (key: string) => string;
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    primary: string;
    border: string;
    error: string;
    success: string;
  };
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Translation strings
const translations = {
  en: {
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    success: 'Success',
    error: 'Error',
    logout: 'Logout',
    settings: 'Settings',
    close: 'Close',
    confirm: 'Confirm',
    loading: 'Loading...',
    refresh: 'Refresh',
    search: 'Search',
    filter: 'Filter',
    
    // Dashboard
    dashboard: 'Dashboard',
    manageBuses: 'Manage Buses',
    manageStudents: 'Manage Students',
    profile: 'Profile Settings',
    activeRoutes: 'Active Routes',
    notifications: 'Notifications',
    
    // Settings
    language: 'Language',
    theme: 'Theme',
    selectLanguage: 'Select Language',
    selectTheme: 'Select Theme',
    english: 'English',
    hindi: 'हिंदी',
    lightTheme: 'Light',
    darkTheme: 'Dark',
    
    // Bus Management
    busNumber: 'Bus Number',
    routeNumber: 'Route Number',
    driverName: 'Driver Full Name',
    driverMobile: 'Driver Mobile Number',
    driverEmail: 'Driver Email',
    driverPassword: 'Driver Password',
    driverPhoto: 'Driver Photo',
    busStops: 'Bus Stops (Pickup Points)',
    addBus: 'Add Bus',
    editBus: 'Edit Bus',
    noBuses: 'No buses added yet',
    busDetails: 'Bus Details',
    totalStops: 'Total Stops',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    addNewBus: 'Add New Bus',
    tapAddBus: 'Tap "Add Bus" to get started',
    optional: 'Optional',
    minimum6Chars: 'Minimum 6 characters',
    changePhoto: 'Change Photo',
    addDriverPhoto: 'Add Driver Photo',
    uploading: 'Uploading...',
    pickFromMap: 'Pick from Map',
    addStop: 'Add Stop',
    stopName: 'Stop name',
    latitude: 'Latitude',
    longitude: 'Longitude',
    selectStopLocation: 'Select Stop Location',
    tapToSelectStop: 'Blue dot is your current location. Tap anywhere to select stop location.',
    choosePhotoSource: 'Choose Photo Source',
    takePhoto: 'Take Photo',
    chooseFromGallery: 'Choose from Gallery',
    confirmDelete: 'Confirm Delete',
    areYouSureDeleteBus: 'Are you sure you want to delete this bus?',
    locationSelected: 'Location Selected',
    photoUploaded: 'Photo uploaded successfully',
    busAdded: 'Bus added successfully',
    busUpdated: 'Bus updated successfully',
    fillBusRoute: 'Please fill bus number and route number',
    addAtLeastOneStop: 'Please add at least one stop with coordinates',
    enterDriverPassword: 'Please enter driver password',
    enterDriverEmail: 'Please enter driver email',
    validEmail: 'Please enter a valid email address',
    passwordMin6: 'Password must be at least 6 characters',
    enterStopName: 'Please enter stop name',
    validLatLng: 'Please enter valid latitude and longitude',
    latBetween: 'Latitude must be between -90 and 90',
    lngBetween: 'Longitude must be between -180 and 180',
    stops: 'Stops',
    more: 'more',
    contact: 'Contact',
    
    // Student Management
    studentName: 'Student Name',
    studentEmail: 'Student Email',
    studentPhone: 'Student Phone',
    pickupLocation: 'Pickup Location',
    assignedBus: 'Assigned Bus',
    approveStudent: 'Approve Student',
    rejectStudent: 'Reject Student',
    noStudents: 'No students found',
    pendingApproval: 'Pending Approval',
    approved: 'Approved',
    rejected: 'Rejected',
    addStudent: 'Add Student',
    editStudent: 'Edit Student',
    addNewStudent: 'Add New Student',
    tapAddStudent: 'Tap "Add Student" to get started',
    searchByName: 'Search by name, ID, email or phone...',
    onlyStudentsCanLogin: 'Only students added here can login with student role',
    noStudentsFound: 'No students found',
    tryDifferentSearch: 'Try a different search term',
    found: 'Found',
    suspend: 'Suspend',
    approve: 'Approve',
    suspended: 'Suspended',
    selectPickupAddress: 'Select Pickup Address',
    typeToSearch: 'Type to search and select from available pickup points',
    typePickupAddress: 'Type pickup address...',
    noMatchingPickup: 'No matching pickup points found',
    selectedPickupPoint: 'Selected Pickup Point:',
    areYouSureRemove: 'Are you sure you want to remove this student?',
    studentRemoved: 'Student removed successfully',
    studentSuspended: 'Student suspended',
    studentApproved: 'Student approved',
    
    // Driver Dashboard
    yourBus: 'Your Bus',
    route: 'Route',
    totalStudents: 'Total Students',
    startJourney: 'Start Journey',
    stopJourney: 'Stop Journey',
    journeyActive: 'Journey Active',
    journeyPaused: 'Journey Paused',
    readyToStart: 'Ready to Start',
    batterySaver: 'Battery Saver Mode',
    batterySaverDesc: 'Reduces location update frequency',
    noBusAssigned: 'No bus assigned',
    contactAdminBus: 'Contact admin to assign a bus',
    driverProfile: 'Driver Profile',
    notSet: 'Not set',
    mobile: 'Mobile',
    queued: 'Queued',
    locationQueued: 'location(s) queued for sync',
    
    // Student Dashboard
    myBus: 'My Bus',
    busLocation: 'Bus Location',
    trackBus: 'Track Bus',
    busArriving: 'Bus Arriving Soon',
    estimatedTime: 'Estimated Time',
    minutes: 'minutes',
    availableBuses: 'Available Buses',
    busesStoppingAt: 'Buses stopping at your pickup point',
    noBusesAvailable: 'No buses available',
    contactAdmin: 'Contact admin to assign a bus route',
    yourStop: 'Your Stop',
    moreStops: 'more stops',
    trackOnMap: 'Track on Map',
    studentInformation: 'Student Information',
    studentId: 'Student ID',
    accountStatus: 'Account Status',
    
    // Admin Dashboard
    adminDashboard: 'Admin Dashboard',
    totalUsers: 'Total Users',
    totalDrivers: 'Total Drivers',
    activeBuses: 'Active Buses',
    recentUsers: 'Recent Users',
    sendNotification: 'Send Notification',
    notificationTitle: 'Notification Title',
    notificationMessage: 'Message',
    sendTo: 'Send To',
    students: 'Students',
    drivers: 'Drivers',
    both: 'Both',
    sendNow: 'Send Now',
    myProfile: 'My Profile',
    userId: 'User ID',
    welcomeBack: 'Welcome',
    noName: 'No name',
    noRole: 'No role',
    notAssigned: 'Not assigned',
    
    // Login
    login: 'Login',
    selectRole: 'Select Role',
    student: 'Student',
    driver: 'Driver',
    admin: 'Admin',
    email: 'Email',
    password: 'Password',
    enterEmail: 'Enter your email',
    enterPassword: 'Enter your password',
    welcomeBackLogin: 'Welcome Back!',
    selectRoleLogin: 'Select your role to continue',
    useCredentials: 'Use credentials provided by admin',
    loggingIn: 'Logging in...',
    secureReliable: 'Secure • Real-time • Reliable',
    trackBusRealtime: 'Track your bus in real-time',
    
    // Profile
    profileSettings: 'Profile Settings',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    updateProfile: 'Update Profile',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    
    // Notifications
    noNotifications: 'No notifications yet',
    markAsRead: 'Mark as Read',
    clearAll: 'Clear All',
    busApproaching: 'Bus Approaching',
    routeUpdate: 'Route Update',
    delay: 'Delay',
    emergencyAlert: 'Emergency Alert',
    
    // Messages
    loginSuccess: 'Logged in successfully',
    logoutSuccess: 'Logged out successfully',
    saveSuccess: 'Saved successfully',
    deleteSuccess: 'Deleted successfully',
    updateSuccess: 'Updated successfully',
    errorOccurred: 'An error occurred',
    fillAllFields: 'Please fill all fields',
    invalidEmail: 'Invalid email address',
    passwordMismatch: 'Passwords do not match',
  },
  hi: {
    // Common
    save: 'सेव करें',
    cancel: 'रद्द करें',
    delete: 'डिलीट करें',
    edit: 'एडिट करें',
    add: 'जोड़ें',
    success: 'सफल',
    error: 'त्रुटि',
    logout: 'लॉगआउट',
    settings: 'सेटिंग्स',
    close: 'बंद करें',
    confirm: 'पुष्टि करें',
    loading: 'लोड हो रहा है...',
    refresh: 'रिफ्रेश करें',
    search: 'खोजें',
    filter: 'फ़िल्टर',
    
    // Dashboard
    dashboard: 'डैशबोर्ड',
    manageBuses: 'बस प्रबंधन',
    manageStudents: 'छात्र प्रबंधन',
    profile: 'प्रोफाइल सेटिंग्स',
    activeRoutes: 'सक्रिय रूट',
    notifications: 'सूचनाएं',
    
    // Settings
    language: 'भाषा',
    theme: 'थीम',
    selectLanguage: 'भाषा चुनें',
    selectTheme: 'थीम चुनें',
    english: 'English',
    hindi: 'हिंदी',
    lightTheme: 'लाइट',
    darkTheme: 'डार्क',
    
    // Bus Management
    busNumber: 'बस नंबर',
    routeNumber: 'रूट नंबर',
    driverName: 'ड्राइवर का पूरा नाम',
    driverMobile: 'ड्राइवर मोबाइल नंबर',
    driverEmail: 'ड्राइवर ईमेल',
    driverPassword: 'ड्राइवर पासवर्ड',
    driverPhoto: 'ड्राइवर फोटो',
    busStops: 'बस स्टॉप (पिकअप पॉइंट)',
    addBus: 'बस जोड़ें',
    editBus: 'बस एडिट करें',
    noBuses: 'अभी तक कोई बस नहीं जोड़ी गई',
    busDetails: 'बस विवरण',
    totalStops: 'कुल स्टॉप',
    status: 'स्थिति',
    active: 'सक्रिय',
    inactive: 'निष्क्रिय',
    addNewBus: 'नई बस जोड़ें',
    tapAddBus: 'शुरू करने के लिए "बस जोड़ें" पर टैप करें',
    optional: 'वैकल्पिक',
    minimum6Chars: 'कम से कम 6 अक्षर',
    changePhoto: 'फोटो बदलें',
    addDriverPhoto: 'ड्राइवर फोटो जोड़ें',
    uploading: 'अपलोड हो रहा है...',
    pickFromMap: 'मैप से चुनें',
    addStop: 'स्टॉप जोड़ें',
    stopName: 'स्टॉप का नाम',
    latitude: 'अक्षांश',
    longitude: 'देशांतर',
    selectStopLocation: 'स्टॉप लोकेशन चुनें',
    tapToSelectStop: 'नीला बिंदु आपकी वर्तमान लोकेशन है। स्टॉप लोकेशन चुनने के लिए कहीं भी टैप करें।',
    choosePhotoSource: 'फोटो स्रोत चुनें',
    takePhoto: 'फोटो लें',
    chooseFromGallery: 'गैलरी से चुनें',
    confirmDelete: 'डिलीट की पुष्टि करें',
    areYouSureDeleteBus: 'क्या आप वाकई इस बस को डिलीट करना चाहते हैं?',
    locationSelected: 'लोकेशन चुनी गई',
    photoUploaded: 'फोटो सफलतापूर्वक अपलोड हो गई',
    busAdded: 'बस सफलतापूर्वक जोड़ी गई',
    busUpdated: 'बस सफलतापूर्वक अपडेट हो गई',
    fillBusRoute: 'कृपया बस नंबर और रूट नंबर भरें',
    addAtLeastOneStop: 'कृपया निर्देशांक के साथ कम से कम एक स्टॉप जोड़ें',
    enterDriverPassword: 'कृपया ड्राइवर पासवर्ड दर्ज करें',
    enterDriverEmail: 'कृपया ड्राइवर ईमेल दर्ज करें',
    validEmail: 'कृपया एक मान्य ईमेल पता दर्ज करें',
    passwordMin6: 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए',
    enterStopName: 'कृपया स्टॉप का नाम दर्ज करें',
    validLatLng: 'कृपया मान्य अक्षांश और देशांतर दर्ज करें',
    latBetween: 'अक्षांश -90 और 90 के बीच होना चाहिए',
    lngBetween: 'देशांतर -180 और 180 के बीच होना चाहिए',
    stops: 'स्टॉप',
    more: 'और',
    contact: 'संपर्क',
    
    // Student Management
    studentName: 'छात्र का नाम',
    studentEmail: 'छात्र ईमेल',
    studentPhone: 'छात्र फोन',
    pickupLocation: 'पिकअप स्थान',
    assignedBus: 'आवंटित बस',
    approveStudent: 'छात्र स्वीकृत करें',
    rejectStudent: 'छात्र अस्वीकार करें',
    noStudents: 'कोई छात्र नहीं मिला',
    pendingApproval: 'स्वीकृति लंबित',
    approved: 'स्वीकृत',
    rejected: 'अस्वीकृत',
    addStudent: 'छात्र जोड़ें',
    editStudent: 'छात्र एडिट करें',
    addNewStudent: 'नया छात्र जोड़ें',
    tapAddStudent: 'शुरू करने के लिए "छात्र जोड़ें" पर टैप करें',
    searchByName: 'नाम, आईडी, ईमेल या फोन से खोजें...',
    onlyStudentsCanLogin: 'केवल यहां जोड़े गए छात्र ही छात्र भूमिका के साथ लॉगिन कर सकते हैं',
    noStudentsFound: 'कोई छात्र नहीं मिला',
    tryDifferentSearch: 'एक अलग खोज शब्द आज़माएं',
    found: 'मिला',
    suspend: 'निलंबित करें',
    approve: 'स्वीकृत करें',
    suspended: 'निलंबित',
    selectPickupAddress: 'पिकअप पता चुनें',
    typeToSearch: 'उपलब्ध पिकअप पॉइंट्स से खोजें और चुनें',
    typePickupAddress: 'पिकअप पता टाइप करें...',
    noMatchingPickup: 'कोई मेल खाता पिकअप पॉइंट नहीं मिला',
    selectedPickupPoint: 'चयनित पिकअप पॉइंट:',
    areYouSureRemove: 'क्या आप वाकई इस छात्र को हटाना चाहते हैं?',
    studentRemoved: 'छात्र सफलतापूर्वक हटाया गया',
    studentSuspended: 'छात्र निलंबित',
    studentApproved: 'छात्र स्वीकृत',
    
    // Driver Dashboard
    yourBus: 'आपकी बस',
    route: 'रूट',
    totalStudents: 'कुल छात्र',
    startJourney: 'यात्रा शुरू करें',
    stopJourney: 'यात्रा रोकें',
    journeyActive: 'यात्रा सक्रिय',
    journeyPaused: 'यात्रा रुकी हुई',
    readyToStart: 'शुरू करने के लिए तैयार',
    batterySaver: 'बैटरी सेवर मोड',
    batterySaverDesc: 'लोकेशन अपडेट की आवृत्ति कम करता है',
    noBusAssigned: 'कोई बस असाइन नहीं की गई',
    contactAdminBus: 'बस असाइन करने के लिए एडमिन से संपर्क करें',
    driverProfile: 'ड्राइवर प्रोफाइल',
    notSet: 'सेट नहीं किया गया',
    mobile: 'मोबाइल',
    queued: 'कतारबद्ध',
    locationQueued: 'लोकेशन सिंक के लिए कतारबद्ध',
    
    // Student Dashboard
    myBus: 'मेरी बस',
    busLocation: 'बस की लोकेशन',
    trackBus: 'बस ट्रैक करें',
    busArriving: 'बस जल्द आ रही है',
    estimatedTime: 'अनुमानित समय',
    minutes: 'मिनट',
    availableBuses: 'उपलब्ध बसें',
    busesStoppingAt: 'आपके पिकअप पॉइंट पर रुकने वाली बसें',
    noBusesAvailable: 'कोई बस उपलब्ध नहीं',
    contactAdmin: 'बस रूट असाइन करने के लिए एडमिन से संपर्क करें',
    yourStop: 'आपका स्टॉप',
    moreStops: 'और स्टॉप',
    trackOnMap: 'मैप पर ट्रैक करें',
    studentInformation: 'छात्र जानकारी',
    studentId: 'छात्र आईडी',
    accountStatus: 'खाता स्थिति',
    
    // Admin Dashboard
    adminDashboard: 'एडमिन डैशबोर्ड',
    totalUsers: 'कुल उपयोगकर्ता',
    totalDrivers: 'कुल ड्राइवर',
    activeBuses: 'सक्रिय बसें',
    recentUsers: 'हाल के उपयोगकर्ता',
    sendNotification: 'सूचना भेजें',
    notificationTitle: 'सूचना शीर्षक',
    notificationMessage: 'संदेश',
    sendTo: 'भेजें',
    students: 'छात्र',
    drivers: 'ड्राइवर',
    both: 'दोनों',
    sendNow: 'अभी भेजें',
    myProfile: 'मेरी प्रोफाइल',
    userId: 'उपयोगकर्ता आईडी',
    welcomeBack: 'स्वागत है',
    noName: 'नाम नहीं',
    noRole: 'भूमिका नहीं',
    notAssigned: 'असाइन नहीं किया गया',
    
    // Login
    login: 'लॉगिन',
    selectRole: 'भूमिका चुनें',
    student: 'छात्र',
    driver: 'ड्राइवर',
    admin: 'एडमिन',
    email: 'ईमेल',
    password: 'पासवर्ड',
    enterEmail: 'अपना ईमेल दर्ज करें',
    enterPassword: 'अपना पासवर्ड दर्ज करें',
    welcomeBackLogin: 'वापसी पर स्वागत है!',
    selectRoleLogin: 'जारी रखने के लिए अपनी भूमिका चुनें',
    useCredentials: 'एडमिन द्वारा प्रदान किए गए क्रेडेंशियल्स का उपयोग करें',
    loggingIn: 'लॉगिन हो रहा है...',
    secureReliable: 'सुरक्षित • रीयल-टाइम • विश्वसनीय',
    trackBusRealtime: 'अपनी बस को रीयल-टाइम में ट्रैक करें',
    
    // Profile
    profileSettings: 'प्रोफाइल सेटिंग्स',
    fullName: 'पूरा नाम',
    phoneNumber: 'फोन नंबर',
    updateProfile: 'प्रोफाइल अपडेट करें',
    changePassword: 'पासवर्ड बदलें',
    currentPassword: 'वर्तमान पासवर्ड',
    newPassword: 'नया पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    
    // Notifications
    noNotifications: 'अभी तक कोई सूचना नहीं',
    markAsRead: 'पढ़ा हुआ चिह्नित करें',
    clearAll: 'सभी साफ़ करें',
    busApproaching: 'बस आ रही है',
    routeUpdate: 'रूट अपडेट',
    delay: 'देरी',
    emergencyAlert: 'आपातकालीन अलर्ट',
    
    // Messages
    loginSuccess: 'सफलतापूर्वक लॉगिन हो गया',
    logoutSuccess: 'सफलतापूर्वक लॉगआउट हो गया',
    saveSuccess: 'सफलतापूर्वक सेव हो गया',
    deleteSuccess: 'सफलतापूर्वक डिलीट हो गया',
    updateSuccess: 'सफलतापूर्वक अपडेट हो गया',
    errorOccurred: 'एक त्रुटि हुई',
    fillAllFields: 'कृपया सभी फ़ील्ड भरें',
    invalidEmail: 'अमान्य ईमेल पता',
    passwordMismatch: 'पासवर्ड मेल नहीं खाते',
  },
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      const savedTheme = await AsyncStorage.getItem('app_theme');
      
      if (savedLanguage) setLanguageState(savedLanguage as Language);
      if (savedTheme) setThemeState(savedTheme as Theme);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('app_language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem('app_theme', newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  const colors = theme === 'dark' ? {
    background: '#1a1a1a',
    card: '#2d2d2d',
    text: '#ffffff',
    textSecondary: '#cccccc',
    primary: '#3b82f6',
    border: '#444444',
    error: '#ef4444',
    success: '#10b981',
  } : {
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    primary: '#1e3a8a',
    border: '#dddddd',
    error: '#dc2626',
    success: '#16a34a',
  };

  return (
    <SettingsContext.Provider value={{ language, theme, setLanguage, setTheme, t, colors }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
