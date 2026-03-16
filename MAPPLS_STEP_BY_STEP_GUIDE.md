# MapPLS Integration - Complete Step-by-Step Guide

## 📋 Overview
Ye guide tumhe MapPLS ko Navy Route Buddy me integrate karne me help karega.

---

## 🎯 STEP 1: MapPLS Dashboard Access

### 1.1 Dashboard Open Karo
1. Browser me jao: **https://apis.mappls.com/**
2. Agar account nahi hai:
   - Click "Sign Up"
   - Email, password enter karo
   - Verify email
3. Agar account hai:
   - Click "Login"
   - Email, password enter karo

### 1.2 Dashboard Me Login Karo
- Login hone ke baad tumhe **Dashboard** dikhega
- Left side me menu hoga

---

## 🔑 STEP 2: API Keys Nikalo

### 2.1 API Keys Section Me Jao
1. Dashboard me **"API Keys"** ya **"Credentials"** section dhundo
2. Click karo

### 2.2 Teen Keys Copy Karo

#### Key 1: REST API Key
- **Kaha milegi:** API Keys → REST API Key
- **Kaise dikhegi:** `abc123def456ghi789jkl012mno345pq` (32 characters)
- **Copy karo** aur notepad me save karo
- **Label:** "REST_API_KEY"

#### Key 2: Map SDK Key  
- **Kaha milegi:** API Keys → Map SDK Key / Client Key
- **Kaise dikhegi:** `xyz789abc123def456ghi789jkl012mn` (32 characters)
- **Copy karo** aur notepad me save karo
- **Label:** "MAP_SDK_KEY"

#### Key 3: Client ID & Secret
- **Kaha milegi:** API Keys → OAuth Credentials / Client Credentials
- **Client ID:** UUID format (e.g., `33OkryzDZsJ5fHWx8UZ0RQ==`)
- **Client Secret:** Long string (e.g., `lrFxI-iSEg-dEjSh...`)
- **Dono copy karo** aur notepad me save karo
- **Label:** "CLIENT_ID" aur "CLIENT_SECRET"

### 2.3 Keys Verify Karo
Tumhare paas ab 4 values honi chahiye:
```
REST_API_KEY: abc123...
MAP_SDK_KEY: xyz789...
CLIENT_ID: 33OkryzD...
CLIENT_SECRET: lrFxI-iS...
```

---

## 💻 STEP 3: Code Me Keys Add Karo

### 3.1 File 1: MapPLSView.tsx Update Karo

**File Location:** `mobile/src/components/MapPLSView.tsx`

**Find karo (Line 18-19):**
```typescript
const MAPPLS_MAP_SDK_KEY = 'YOUR_MAP_SDK_KEY_HERE';
const MAPPLS_REST_API_KEY = 'YOUR_REST_API_KEY_HERE';
```

**Replace karo with your keys:**
```typescript
const MAPPLS_MAP_SDK_KEY = 'xyz789abc123def456ghi789jkl012mn'; // Your actual key
const MAPPLS_REST_API_KEY = 'abc123def456ghi789jkl012mno345pq'; // Your actual key
```

### 3.2 File 2: MapPLSService.ts Update Karo

**File Location:** `mobile/src/services/MapPLSService.ts`

**Find karo (Line 8-10):**
```typescript
const MAPPLS_REST_API_KEY = 'YOUR_REST_API_KEY_HERE';
const MAPPLS_CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
const MAPPLS_CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE';
```

**Replace karo with your keys:**
```typescript
const MAPPLS_REST_API_KEY = 'abc123def456ghi789jkl012mno345pq'; // Your actual key
const MAPPLS_CLIENT_ID = '33OkryzDZsJ5fHWx8UZ0RQ=='; // Your actual ID
const MAPPLS_CLIENT_SECRET = 'lrFxI-iSEg-dEjSh...'; // Your actual secret
```

### 3.3 Save Files
- Dono files save karo (Ctrl+S)

---

## 🔄 STEP 4: OSM Ko MapPLS Se Replace Karo

### 4.1 DriverRouteMap Update Karo

**File Location:** `mobile/src/components/DriverRouteMap.tsx`

**Find karo (Line 4):**
```typescript
import OSMMapView from './OSMMapView';
```

**Replace karo:**
```typescript
import MapPLSView from './MapPLSView';
```

**Find karo (around line 80-90):**
```typescript
<OSMMapView
  markers={[...]}
  polyline={...}
  center={...}
  zoom={15}
/>
```

**Replace karo:**
```typescript
<MapPLSView
  markers={[...]}
  polyline={...}
  center={...}
  zoom={15}
/>
```

### 4.2 BusTrackingMap Update Karo

**File Location:** `mobile/src/components/BusTrackingMap.tsx`

**Find karo (Line 11):**
```typescript
import OSMMapView from './OSMMapView';
```

**Replace karo:**
```typescript
import MapPLSView from './MapPLSView';
```

**Find karo (around line 180-190):**
```typescript
<OSMMapView
  markers={[...]}
  polyline={...}
  center={...}
  zoom={17}
/>
```

**Replace karo:**
```typescript
<MapPLSView
  markers={[...]}
  polyline={...}
  center={...}
  zoom={15}
/>
```

### 4.3 Save Files
- Dono files save karo

---

## 🏗️ STEP 5: App Build Karo

### 5.1 Terminal Open Karo
- VS Code me Terminal kholo (Ctrl+`)
- Ya Command Prompt kholo

### 5.2 Android Folder Me Jao
```bash
cd mobile/android
```

### 5.3 Build Karo
```bash
.\gradlew assembleRelease
```

**Wait karo:** 1-2 minutes lagenge

### 5.4 Success Check Karo
Agar success hua to dikhega:
```
BUILD SUCCESSFUL in 1m 30s
```

---

## 📱 STEP 6: APK Install Karo

### 6.1 Device Connect Check Karo
```bash
adb devices
```

**Output dikhna chahiye:**
```
ZXCIR44TOVOZZXHU    device
```

### 6.2 APK Install Karo
```bash
cd ..
adb install -r android\app\build\outputs\apk\release\app-release.apk
```

**Wait karo:** 10-20 seconds

### 6.3 Success Check Karo
Dikhna chahiye:
```
Success
```

---

## ✅ STEP 7: Test Karo

### 7.1 App Open Karo
- Phone me "Navy Route Buddy" app kholo

### 7.2 Login Karo
- Driver ya Student login karo

### 7.3 Map Check Karo

**Driver Side:**
1. "Start Journey" button dabao
2. Map load hona chahiye
3. MapPLS logo dikhna chahiye (bottom right)
4. Jabalpur area dikhna chahiye

**Student Side:**
1. Bus card me "Track on Map" dabao
2. Map modal open hona chahiye
3. MapPLS logo dikhna chahiye
4. Bus location dikhna chahiye

### 7.4 Features Test Karo
- ✅ Map load ho raha hai?
- ✅ Markers dikh rahe hain (bus, stops)?
- ✅ Route line dikh rahi hai?
- ✅ Zoom in/out kaam kar raha hai?
- ✅ Pan/scroll kaam kar raha hai?

---

## 🐛 STEP 8: Troubleshooting (Agar Problem Ho)

### Problem 1: Map Load Nahi Ho Raha
**Solution:**
1. Internet connection check karo
2. API keys sahi hain check karo
3. Console me errors dekho

### Problem 2: "Invalid API Key" Error
**Solution:**
1. Keys copy karte waqt extra spaces na ho
2. Quotes ke andar paste karo
3. File save karna mat bhulo
4. App rebuild karo

### Problem 3: Map Blank Dikhta Hai
**Solution:**
1. Wait karo 5-10 seconds (loading time)
2. Internet speed check karo
3. MapPLS dashboard me usage check karo

### Problem 4: Markers Nahi Dikh Rahe
**Solution:**
1. Zoom level check karo (15-17 hona chahiye)
2. Center coordinates check karo
3. Markers array empty to nahi?

---

## 📊 STEP 9: Usage Monitor Karo

### 9.1 Dashboard Me Jao
- https://apis.mappls.com/
- Login karo

### 9.2 Usage Statistics Dekho
- "Usage" ya "Analytics" section me jao
- API calls count dekho
- Free tier: 250,000 calls/month

### 9.3 Alerts Set Karo
- 80% usage pe alert set karo
- Email notification enable karo

---

## 🎉 STEP 10: Success!

Agar sab kuch kaam kar raha hai:
- ✅ MapPLS maps load ho rahe hain
- ✅ Better accuracy than OSM
- ✅ Indian locations properly show ho rahe hain
- ✅ Routing kaam kar rahi hai

**Congratulations! MapPLS successfully integrated! 🚀**

---

## 📝 Quick Reference

### Files Modified:
1. ✅ `mobile/src/components/MapPLSView.tsx` - Keys added
2. ✅ `mobile/src/services/MapPLSService.ts` - Keys added
3. ✅ `mobile/src/components/DriverRouteMap.tsx` - OSM → MapPLS
4. ✅ `mobile/src/components/BusTrackingMap.tsx` - OSM → MapPLS

### Commands Used:
```bash
# Build
cd mobile/android
.\gradlew assembleRelease

# Install
cd ..
adb install -r android\app\build\outputs\apk\release\app-release.apk
```

### API Keys Location:
- Dashboard: https://apis.mappls.com/
- Section: API Keys / Credentials
- Keys needed: REST API, Map SDK, Client ID, Client Secret

---

## 🆘 Need Help?

### If Keys Nahi Mil Rahe:
1. Dashboard me "API Keys" section dhundo
2. "Generate New Key" button try karo
3. Support contact karo: apisupport@mappls.com

### If Build Fail Ho Raha:
1. `.\gradlew clean` run karo
2. Phir `.\gradlew assembleRelease` run karo
3. Error message share karo

### If Map Nahi Dikh Raha:
1. Keys double-check karo
2. Internet connection check karo
3. Console errors dekho
4. Screenshot share karo

---

## 🎯 Next Steps (Optional)

### Advanced Features:
1. **Geocoding** - Address search implement karo
2. **Routing** - OSRM ki jagah MapPLS routing use karo
3. **Traffic** - Real-time traffic layer add karo
4. **Places** - Nearby places search add karo

### Optimization:
1. **Caching** - Geocoding results cache karo
2. **Offline** - Offline maps implement karo
3. **Performance** - API calls reduce karo

---

**Ye guide follow karo step-by-step. Koi problem ho to batao! 🚀**
