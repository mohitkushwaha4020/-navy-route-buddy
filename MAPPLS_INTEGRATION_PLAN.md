# MapPLS (MapmyIndia) Integration Plan

## Overview
MapPLS (formerly MapmyIndia) is India's leading mapping platform with superior accuracy and features for Indian locations.

## Why MapPLS over OSM?

### Advantages
1. **Indian Focus** - Specifically designed for India
2. **Better Accuracy** - More accurate POIs, roads, and addresses
3. **Rich Features** - Traffic, navigation, geocoding
4. **Official Support** - Professional support and documentation
5. **Better Geocoding** - Accurate Indian address parsing
6. **Real-time Traffic** - Live traffic data
7. **Turn-by-turn Navigation** - Built-in navigation
8. **3D Maps** - 3D building visualization
9. **Offline Maps** - Download maps for offline use
10. **Better Performance** - Optimized for Indian networks

### Comparison with OSM
| Feature | OSM | MapPLS |
|---------|-----|--------|
| Indian Accuracy | Good | Excellent |
| POI Data | Limited | Extensive |
| Traffic Data | No | Yes |
| Navigation | External (OSRM) | Built-in |
| Geocoding | Basic | Advanced |
| Offline Maps | Complex | Easy |
| Support | Community | Professional |
| Cost | Free | Freemium |

## Integration Options

### Option 1: MapPLS React Native SDK (Recommended)
**Package:** `mappls-map-react-native` or MapPLS Web SDK via WebView

**Pros:**
- Native performance
- Full feature access
- Better integration
- Official support

**Cons:**
- Requires API key
- Setup complexity
- Paid plans for high usage

### Option 2: MapPLS Web SDK (WebView)
**Implementation:** Similar to current OSM approach

**Pros:**
- Easier to implement
- No native dependencies
- Quick migration
- Cross-platform

**Cons:**
- WebView performance
- Limited native features

### Option 3: Hybrid Approach
**Implementation:** MapPLS for maps + OSRM for routing

**Pros:**
- Best of both worlds
- Cost-effective
- Flexible

**Cons:**
- More complex
- Multiple services

## Recommended Approach: MapPLS Web SDK via WebView

Since we're already using WebView for OSM, we can easily migrate to MapPLS Web SDK.

### Implementation Steps

#### 1. Get MapPLS API Keys
- Sign up at https://apis.mappls.com/
- Get REST API Key
- Get Map SDK Key
- Free tier: 250,000 API calls/month

#### 2. Create MapPLS Component
```typescript
// mobile/src/components/MapPLSView.tsx
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface MapPLSViewProps {
  markers?: Marker[];
  center?: { latitude: number; longitude: number };
  zoom?: number;
  polyline?: { latitude: number; longitude: number }[];
}

export default function MapPLSView(props: MapPLSViewProps) {
  // Implementation with MapPLS Web SDK
}
```

#### 3. Update Environment Variables
```env
MAPPLS_REST_API_KEY=your_rest_api_key
MAPPLS_MAP_SDK_KEY=your_map_sdk_key
```

#### 4. Replace OSMMapView
- Update DriverRouteMap
- Update BusTrackingMap
- Update all map components

### HTML Template for MapPLS
```html
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://apis.mappls.com/advancedmaps/api/{MAP_SDK_KEY}/map_sdk?layer=vector&v=3.0"></script>
  <style>
    body, html { margin: 0; padding: 0; height: 100%; }
    #map { height: 100%; width: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // Initialize MapPLS map
    var map = new mappls.Map('map', {
      center: [28.61, 77.23], // Delhi
      zoom: 12
    });
    
    // Add markers, polylines, etc.
  </script>
</body>
</html>
```

## Features to Implement

### Phase 1: Basic Maps ✅
- [x] Map display
- [x] Markers (bus, student, stops)
- [x] Polylines (routes)
- [x] Center on Jabalpur
- [x] Zoom controls

### Phase 2: MapPLS Integration
- [ ] Get MapPLS API keys
- [ ] Create MapPLSView component
- [ ] Implement marker system
- [ ] Add polyline support
- [ ] Test on device

### Phase 3: Advanced Features
- [ ] MapPLS Geocoding API
- [ ] MapPLS Routing API (alternative to OSRM)
- [ ] Traffic layer
- [ ] POI search
- [ ] Place autocomplete

### Phase 4: Premium Features
- [ ] Turn-by-turn navigation
- [ ] Offline maps
- [ ] 3D buildings
- [ ] Real-time traffic
- [ ] ETA with traffic

## API Usage Estimates

### Free Tier (250,000 calls/month)
- Map loads: ~10,000/month
- Geocoding: ~5,000/month
- Routing: ~5,000/month
- **Total**: ~20,000/month (well within limit)

### Paid Plans (if needed)
- Starter: ₹5,000/month (1M calls)
- Professional: ₹15,000/month (5M calls)
- Enterprise: Custom pricing

## Migration Path

### Current: OSM + OSRM + Digipin
```
OSM (Free) → Map tiles
OSRM (Free) → Routing
Digipin (Free) → Geocoding
```

### Proposed: MapPLS
```
MapPLS (Freemium) → Maps + Routing + Geocoding
```

### Benefits of Migration
1. **Single Service** - One API for everything
2. **Better Accuracy** - Superior Indian data
3. **Professional Support** - Official support
4. **More Features** - Traffic, navigation, etc.
5. **Better Performance** - Optimized for India

## Code Changes Required

### Files to Update
1. `mobile/src/components/OSMMapView.tsx` → `MapPLSView.tsx`
2. `mobile/src/components/DriverRouteMap.tsx` - Use MapPLS
3. `mobile/src/components/BusTrackingMap.tsx` - Use MapPLS
4. `mobile/src/services/DigipinGeocodingService.ts` → `MapPLSGeocodingService.ts`
5. `mobile/src/services/OSRMService.ts` → `MapPLSRoutingService.ts` (optional)

### Environment Setup
```typescript
// mobile/.env
MAPPLS_REST_API_KEY=your_rest_api_key
MAPPLS_MAP_SDK_KEY=your_map_sdk_key
MAPPLS_CLIENT_ID=your_client_id
MAPPLS_CLIENT_SECRET=your_client_secret
```

## Testing Plan

### Phase 1: Development
- [ ] Test map rendering
- [ ] Test markers
- [ ] Test polylines
- [ ] Test geocoding
- [ ] Test routing

### Phase 2: Integration
- [ ] Test with real data
- [ ] Test on device
- [ ] Performance testing
- [ ] API usage monitoring

### Phase 3: Production
- [ ] Load testing
- [ ] Error handling
- [ ] Fallback mechanisms
- [ ] Cost monitoring

## Fallback Strategy

### If MapPLS Fails
1. **Fallback to OSM** - Keep OSM as backup
2. **Hybrid Mode** - Use both based on availability
3. **Offline Mode** - Cached maps

### Error Handling
```typescript
try {
  // Try MapPLS
  await loadMapPLSMap();
} catch (error) {
  // Fallback to OSM
  await loadOSMMap();
}
```

## Cost Analysis

### Current Setup (Free)
- OSM: ₹0
- OSRM: ₹0
- Digipin: ₹0
- **Total**: ₹0/month

### MapPLS Setup
- Free Tier: ₹0 (250K calls)
- Starter: ₹5,000 (1M calls)
- **Estimated**: ₹0-5,000/month

### ROI
- Better accuracy → Better UX
- Professional support → Less dev time
- More features → Better product
- **Worth it**: Yes, for production app

## Next Steps

### Immediate
1. ✅ Create integration plan
2. ⏳ Sign up for MapPLS account
3. ⏳ Get API keys
4. ⏳ Test MapPLS Web SDK

### Short-term
1. Create MapPLSView component
2. Implement basic features
3. Test on device
4. Compare with OSM

### Long-term
1. Full migration to MapPLS
2. Implement advanced features
3. Optimize performance
4. Monitor costs

## Resources

### Documentation
- MapPLS Docs: https://apis.mappls.com/
- Web SDK: https://github.com/mappls-api/mappls-web-maps
- React Native: https://github.com/mappls-api/mappls-react-native-sdk
- API Reference: https://apis.mappls.com/console/

### Support
- Email: apisupport@mappls.com
- Forum: https://community.mappls.com/
- GitHub: https://github.com/mappls-api

## Conclusion

MapPLS is the better choice for an Indian bus tracking app:
- ✅ Better accuracy for Indian locations
- ✅ Professional support
- ✅ More features (traffic, navigation)
- ✅ Single API for all needs
- ✅ Cost-effective for our usage

**Recommendation**: Migrate to MapPLS Web SDK via WebView for quick implementation with minimal code changes.
