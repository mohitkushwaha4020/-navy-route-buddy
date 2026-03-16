# 🌐 Bilingual Support Guide (Hindi + English)

## Overview
The app now supports complete bilingual functionality with Hindi and English languages. Users can switch between languages from the Settings screen, and the entire app interface will update accordingly.

## Features Implemented

### 1. **Language Support**
- ✅ English (Default)
- ✅ Hindi (हिंदी)

### 2. **Translation Coverage**
All major sections are translated:
- Common UI elements (Save, Cancel, Delete, Edit, etc.)
- Dashboard screens (Admin, Driver, Student)
- Settings and Profile
- Bus Management
- Student Management
- Notifications
- Login/Authentication
- Error messages and success messages

### 3. **How to Use**

#### For Users:
1. Open the app
2. Navigate to **Settings** (⚙️ icon in menu)
3. Under **Language** section, choose:
   - **English** for English interface
   - **हिंदी** for Hindi interface
4. The entire app will immediately switch to the selected language

#### For Developers:
Use the `t()` function from `useSettings` hook:

```typescript
import { useSettings } from '../contexts/SettingsContext';

function MyComponent() {
  const { t } = useSettings();
  
  return (
    <Text>{t('save')}</Text>  // Shows "Save" or "सेव करें"
  );
}
```

## Translation Keys

### Common Keys
```typescript
t('save')           // Save / सेव करें
t('cancel')         // Cancel / रद्द करें
t('delete')         // Delete / डिलीट करें
t('edit')           // Edit / एडिट करें
t('add')            // Add / जोड़ें
t('logout')         // Logout / लॉगआउट
t('settings')       // Settings / सेटिंग्स
t('loading')        // Loading... / लोड हो रहा है...
```

### Dashboard Keys
```typescript
t('dashboard')      // Dashboard / डैशबोर्ड
t('manageBuses')    // Manage Buses / बस प्रबंधन
t('manageStudents') // Manage Students / छात्र प्रबंधन
t('profile')        // Profile Settings / प्रोफाइल सेटिंग्स
t('notifications')  // Notifications / सूचनाएं
```

### Bus Management Keys
```typescript
t('busNumber')      // Bus Number / बस नंबर
t('routeNumber')    // Route Number / रूट नंबर
t('driverName')     // Driver Full Name / ड्राइवर का पूरा नाम
t('addBus')         // Add Bus / बस जोड़ें
t('editBus')        // Edit Bus / बस एडिट करें
t('status')         // Status / स्थिति
t('active')         // Active / सक्रिय
t('inactive')       // Inactive / निष्क्रिय
```

### Student Management Keys
```typescript
t('studentName')    // Student Name / छात्र का नाम
t('studentEmail')   // Student Email / छात्र ईमेल
t('pickupLocation') // Pickup Location / पिकअप स्थान
t('approveStudent') // Approve Student / छात्र स्वीकृत करें
t('approved')       // Approved / स्वीकृत
t('pendingApproval')// Pending Approval / स्वीकृति लंबित
```

### Driver Dashboard Keys
```typescript
t('yourBus')        // Your Bus / आपकी बस
t('startJourney')   // Start Journey / यात्रा शुरू करें
t('stopJourney')    // Stop Journey / यात्रा रोकें
t('journeyActive')  // Journey Active / यात्रा सक्रिय
t('batterySaver')   // Battery Saver Mode / बैटरी सेवर मोड
```

### Student Dashboard Keys
```typescript
t('myBus')          // My Bus / मेरी बस
t('trackBus')       // Track Bus / बस ट्रैक करें
t('busArriving')    // Bus Arriving Soon / बस जल्द आ रही है
t('estimatedTime')  // Estimated Time / अनुमानित समय
```

### Admin Dashboard Keys
```typescript
t('adminDashboard')     // Admin Dashboard / एडमिन डैशबोर्ड
t('totalUsers')         // Total Users / कुल उपयोगकर्ता
t('totalDrivers')       // Drivers / ड्राइवर
t('totalStudents')      // Students / छात्र
t('activeBuses')        // Active Buses / सक्रिय बसें
t('sendNotification')   // Send Notification / सूचना भेजें
```

### Messages Keys
```typescript
t('loginSuccess')       // Logged in successfully / सफलतापूर्वक लॉगिन हो गया
t('saveSuccess')        // Saved successfully / सफलतापूर्वक सेव हो गया
t('errorOccurred')      // An error occurred / एक त्रुटि हुई
t('fillAllFields')      // Please fill all fields / कृपया सभी फ़ील्ड भरें
```

## Adding New Translations

To add new translations, edit `mobile/src/contexts/SettingsContext.tsx`:

```typescript
const translations = {
  en: {
    // Add your English text
    myNewKey: 'My New Text',
  },
  hi: {
    // Add your Hindi text
    myNewKey: 'मेरा नया टेक्स्ट',
  },
};
```

Then use it in your component:
```typescript
<Text>{t('myNewKey')}</Text>
```

## Best Practices

1. **Always use translation keys** instead of hardcoded text
2. **Keep keys descriptive** (e.g., `busNumber` not `bn`)
3. **Test both languages** after adding new features
4. **Use consistent terminology** across the app
5. **Consider text length** - Hindi text is often longer than English

## Language Persistence

- Language preference is saved in AsyncStorage
- Persists across app restarts
- Default language: English
- Changes take effect immediately

## Theme Support

The app also supports Light and Dark themes:
- Light Theme (Default)
- Dark Theme

Both themes work seamlessly with both languages.

## Testing

### Test Language Switch:
1. Open Settings
2. Switch to Hindi
3. Navigate through all screens
4. Verify all text is in Hindi
5. Switch back to English
6. Verify all text is in English

### Test Persistence:
1. Change language to Hindi
2. Close the app completely
3. Reopen the app
4. Verify language is still Hindi

## Troubleshooting

### Translation not showing:
- Check if the key exists in `translations` object
- Verify you're using `t('keyName')` correctly
- Make sure `useSettings` hook is imported

### Language not persisting:
- Check AsyncStorage permissions
- Verify `@react-native-async-storage/async-storage` is installed
- Check console for errors

### Mixed languages appearing:
- Ensure all text uses `t()` function
- Check for hardcoded strings
- Verify translation keys are consistent

## Future Enhancements

Potential additions:
1. More regional languages (Marathi, Tamil, etc.)
2. RTL support for languages like Urdu
3. Voice announcements in selected language
4. Language-specific date/time formats
5. Automatic language detection based on device settings

## Support

For adding new languages or translations:
1. Create translation object in SettingsContext
2. Add language option in SettingsScreen
3. Update Language type definition
4. Test thoroughly

---

**Status**: ✅ Fully Implemented
**Languages**: English, Hindi
**Last Updated**: March 15, 2026
