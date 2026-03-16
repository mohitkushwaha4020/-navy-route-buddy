# MapPLS Integration Checklist ✅

## Pre-Integration
- [ ] MapPLS account hai
- [ ] Dashboard access hai (https://apis.mappls.com/)
- [ ] `.olf` aur `.conf` files hai (optional)

---

## Step 1: API Keys Collect Karo 🔑
- [ ] Dashboard me login kiya
- [ ] API Keys section khola
- [ ] **REST API Key** copy kiya (32 characters)
- [ ] **Map SDK Key** copy kiya (32 characters)
- [ ] **Client ID** copy kiya
- [ ] **Client Secret** copy kiya
- [ ] Sab keys notepad me save kiye

---

## Step 2: Code Update Karo 💻

### File 1: MapPLSView.tsx
- [ ] File kholi: `mobile/src/components/MapPLSView.tsx`
- [ ] Line 18-19 pe keys paste kiye
- [ ] `MAPPLS_MAP_SDK_KEY` update kiya
- [ ] `MAPPLS_REST_API_KEY` update kiya
- [ ] File save kiya (Ctrl+S)

### File 2: MapPLSService.ts
- [ ] File kholi: `mobile/src/services/MapPLSService.ts`
- [ ] Line 8-10 pe keys paste kiye
- [ ] `MAPPLS_REST_API_KEY` update kiya
- [ ] `MAPPLS_CLIENT_ID` update kiya
- [ ] `MAPPLS_CLIENT_SECRET` update kiya
- [ ] File save kiya (Ctrl+S)

---

## Step 3: Components Replace Karo 🔄

### DriverRouteMap.tsx
- [ ] File kholi: `mobile/src/components/DriverRouteMap.tsx`
- [ ] Import statement change kiya: `OSMMapView` → `MapPLSView`
- [ ] Component usage change kiya: `<OSMMapView>` → `<MapPLSView>`
- [ ] File save kiya

### BusTrackingMap.tsx
- [ ] File kholi: `mobile/src/components/BusTrackingMap.tsx`
- [ ] Import statement change kiya: `OSMMapView` → `MapPLSView`
- [ ] Component usage change kiya: `<OSMMapView>` → `<MapPLSView>`
- [ ] File save kiya

---

## Step 4: Build Karo 🏗️
- [ ] Terminal khola
- [ ] `cd mobile/android` command run kiya
- [ ] `.\gradlew assembleRelease` command run kiya
- [ ] Build successful hua (1-2 minutes wait)
- [ ] "BUILD SUCCESSFUL" message dikha

---

## Step 5: Install Karo 📱
- [ ] Device connected hai check kiya (`adb devices`)
- [ ] Device ID dikha: `ZXCIR44TOVOZZXHU`
- [ ] `cd ..` command run kiya
- [ ] Install command run kiya:
  ```
  adb install -r android\app\build\outputs\apk\release\app-release.apk
  ```
- [ ] "Success" message dikha

---

## Step 6: Test Karo ✅

### Basic Tests
- [ ] App open kiya
- [ ] Login kiya (Driver/Student)
- [ ] Map screen khola

### Driver Side Tests
- [ ] "Start Journey" button dabaya
- [ ] Map load hua
- [ ] MapPLS logo dikha (bottom right)
- [ ] Jabalpur area dikha
- [ ] Bus marker dikha
- [ ] Stop markers dikhe
- [ ] Route line dikhi

### Student Side Tests
- [ ] Bus card me "Track on Map" dabaya
- [ ] Map modal open hua
- [ ] MapPLS logo dikha
- [ ] Bus location dikha
- [ ] Student location dikha
- [ ] Distance/ETA dikha

### Interaction Tests
- [ ] Zoom in/out kaam kiya
- [ ] Pan/scroll kaam kiya
- [ ] Markers clickable hain
- [ ] Map smooth hai

---

## Step 7: Verify Features 🎯

### Map Display
- [ ] Map tiles load ho rahe hain
- [ ] Indian locations accurate hain
- [ ] Place names dikh rahe hain
- [ ] Roads clearly visible hain

### Markers
- [ ] Bus marker (🚌) dikh raha hai
- [ ] Student marker (📍) dikh raha hai
- [ ] Stop markers (numbers) dikh rahe hain
- [ ] Marker colors correct hain

### Routes
- [ ] Route polyline dikh rahi hai
- [ ] Route color correct hai (blue)
- [ ] Route follows roads
- [ ] Multiple stops connected hain

### Performance
- [ ] Map load time < 3 seconds
- [ ] Smooth scrolling
- [ ] No lag
- [ ] No crashes

---

## Step 8: Monitor Usage 📊
- [ ] Dashboard me login kiya
- [ ] Usage statistics dekhe
- [ ] API calls count dekha
- [ ] Free tier limit check kiya (250K/month)
- [ ] Alert set kiya (80% usage)

---

## Troubleshooting Checklist 🐛

### If Map Not Loading
- [ ] Internet connection check kiya
- [ ] API keys verify kiye
- [ ] Keys me extra spaces nahi hain
- [ ] Quotes properly closed hain
- [ ] File save kiya tha
- [ ] App rebuild kiya

### If Invalid API Key Error
- [ ] Keys dashboard se re-copy kiye
- [ ] Keys exactly paste kiye (no spaces)
- [ ] File save kiya
- [ ] Clean build kiya (`.\gradlew clean`)
- [ ] Rebuild kiya

### If Blank Map
- [ ] 10 seconds wait kiya (loading time)
- [ ] Internet speed check kiya
- [ ] Console errors dekhe
- [ ] MapPLS dashboard me usage check kiya
- [ ] API key active hai check kiya

### If Markers Missing
- [ ] Zoom level check kiya (15-17)
- [ ] Center coordinates check kiye
- [ ] Markers array empty nahi hai
- [ ] Marker data valid hai

---

## Success Criteria ✨

### Must Have
- [x] Map loads successfully
- [x] MapPLS logo visible
- [x] Markers display correctly
- [x] Routes show properly
- [x] Zoom/pan works
- [x] No crashes

### Nice to Have
- [ ] Fast loading (< 2 seconds)
- [ ] Smooth animations
- [ ] Accurate geocoding
- [ ] Traffic data
- [ ] Offline support

---

## Post-Integration Tasks 📝

### Documentation
- [ ] API keys documented
- [ ] Setup guide updated
- [ ] Team informed
- [ ] User guide created

### Optimization
- [ ] Caching implemented
- [ ] API calls optimized
- [ ] Performance tuned
- [ ] Error handling added

### Monitoring
- [ ] Usage tracking setup
- [ ] Error logging enabled
- [ ] Analytics integrated
- [ ] Alerts configured

---

## Final Verification ✅

- [ ] All maps using MapPLS
- [ ] OSM completely replaced
- [ ] No console errors
- [ ] Performance good
- [ ] Users satisfied
- [ ] Documentation complete

---

## Sign Off 📋

**Integration Completed By:** _________________

**Date:** _________________

**Tested By:** _________________

**Approved By:** _________________

**Notes:**
_________________________________________________
_________________________________________________
_________________________________________________

---

**Status: Ready for Production! 🚀**
