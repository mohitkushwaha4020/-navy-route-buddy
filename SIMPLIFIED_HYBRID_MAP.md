# Simplified Hybrid Map - 3 Services (OSM + Digipin + Supabase)

## Implementation

Abhi ke liye **3 services** use kar rahe hain:

1. **OSM (OpenStreetMap)** - Map tiles display
2. **Digipin** - Indian geocoding (better for India)
3. **Supabase** - Real-time location updates + storage

**Firebase** baad mein add karenge jab Kotlin version issues resolve ho jayenge.

## Current Status

- ✅ OSMMapView with Digipin tiles
- ✅ DigipinGeocodingService for Indian addresses
- ✅ Supabase real-time subscriptions
- ✅ BusTrackingMap updated
- ⏳ Firebase integration (pending - Kotlin version conflict)

## Next Steps

1. Test current implementation
2. If working well, add Firebase later
3. Firebase will provide faster real-time updates (< 100ms)

## Build Command

```bash
cd mobile/android
./gradlew assembleRelease
```

APK will be at: `mobile/android/app/build/outputs/apk/release/app-release.apk`
