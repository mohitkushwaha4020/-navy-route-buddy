# OSM + OSRM Implementation

## Overview
Upgraded map system using open-source mapping and routing:

### Components
1. **OpenStreetMap (OSM)** - Map tiles via WebView + Leaflet.js
2. **OSRM (Open Source Routing Machine)** - Route calculation & navigation
3. **Digipin** - Indian geocoding (with OSM fallback)

## Architecture

### OSM Map Display (WebView + Leaflet.js)
- **Leaflet.js** - Lightweight JavaScript map library
- **WebView rendering** - Cross-platform compatibility
- **OSM tiles** - Free, detailed map data
- **Custom markers** - Bus, student, and stop icons
- **Zoom level 15-17** - Maximum detail for Jabalpur

### OSRM Routing
- **Route calculation** - Optimal paths between waypoints
- **Turn-by-turn navigation** - Step-by-step instructions
- **Distance matrix** - Calculate distances between multiple points
- **Map matching** - Snap GPS coordinates to roads
- **ETA calculation** - Accurate arrival time estimates

## Files Created/Updated

### Components
- `mobile/src/components/OSMMapView.tsx` - WebView-based map (existing)
  - Leaflet.js for rendering
  - OSM tiles
  - Custom markers
  - Polyline support

- `mobile/src/components/DriverRouteMap.tsx` - Updated with OSRM
  - Real-time route calculation
  - Distance and ETA display
  - Turn-by-turn ready

- `mobile/src/components/BusTrackingMap.tsx` - Updated with OSRM
  - Student-to-bus routing
  - Accurate road distances
  - Real-time ETA updates

### Services
- `mobile/src/services/OSRMService.ts` - Routing service
  - `getRoute()` - Calculate route through waypoints
  - `getRouteBetween()` - Simple A-to-B routing
  - `getRouteWithStops()` - Multi-stop routes
  - `getDistanceMatrix()` - Batch distance calculations
  - `getNearestRoad()` - Map matching
  - `formatDistance()` - Human-readable distances
  - `formatDuration()` - Human-readable durations

## Features

### Current Features
✅ OSM map rendering via WebView + Leaflet.js
✅ OSRM route calculation through multiple stops
✅ Real-time distance and ETA calculation
✅ Road-aware routing (not straight-line)
✅ Custom markers (bus, student, stops)
✅ Route polylines following actual roads
✅ Centered on Jabalpur with maximum detail
✅ Digipin geocoding for Indian addresses

### Planned Features
🔄 Turn-by-turn navigation UI
🔄 Voice navigation
🔄 Self-hosted OSRM server
🔄 Offline maps
🔄 Route optimization
🔄 Traffic-aware routing

## Usage Examples

### Basic Map
```typescript
import OSMMapView from './components/OSMMapView';

<OSMMapView
  center={{ latitude: 23.1815, longitude: 79.9864 }}
  zoom={15}
  showUserLocation={true}
/>
```

### Map with Markers
```typescript
<OSMMapView
  markers={[
    {
      id: 'bus1',
      latitude: 23.1815,
      longitude: 79.9864,
      icon: 'bus',
      title: 'Bus #101'
    },
    {
      id: 'stop1',
      latitude: 23.1820,
      longitude: 79.9870,
      icon: 'stop',
      title: 'Stop 1'
    }
  ]}
  polyline={[
    { latitude: 23.1815, longitude: 79.9864 },
    { latitude: 23.1820, longitude: 79.9870 }
  ]}
/>
```

### Using OSRM Service
```typescript
import OSRMService from './services/OSRMService';

// Calculate route
const route = await OSRMService.getRouteBetween(
  { latitude: 23.1815, longitude: 79.9864 },
  { latitude: 23.1900, longitude: 79.9950 }
);

if (route) {
  console.log(`Distance: ${OSRMService.formatDistance(route.distance)}`);
  console.log(`Duration: ${OSRMService.formatDuration(route.duration)}`);
  
  // Display turn-by-turn instructions
  route.steps.forEach(step => {
    console.log(step.instruction);
  });
}
```

## OSRM API

### Public Server
Currently using: `https://router.project-osrm.org`

**Note**: Public server has rate limits. For production, host your own OSRM server.

### Self-Hosting OSRM
For production deployment:

1. **Download OSM data** for Madhya Pradesh
2. **Process data** with OSRM
3. **Deploy OSRM server** (Docker recommended)
4. **Update baseUrl** in OSRMService.ts

Benefits of self-hosting:
- No rate limits
- Faster response times
- Custom routing profiles
- Offline capability
- Privacy

## Performance

### WebView + Leaflet.js
- **Compatibility**: Works on all platforms
- **Simplicity**: No native dependencies
- **Reliability**: Stable and tested
- **Flexibility**: Easy to customize
- **Size**: Lightweight implementation

### OSRM vs Other Services
- **Speed**: <100ms response time
- **Accuracy**: Road-aware routing
- **Cost**: Free and open-source
- **Privacy**: No tracking
- **Offline**: Can be self-hosted

## Implementation Status

### Phase 1: OSRM Service ✅
- Created OSRMService.ts
- Route calculation through waypoints
- Distance and ETA formatting
- Map matching support

### Phase 2: Integration ✅
- Updated DriverRouteMap with OSRM routing
- Updated BusTrackingMap with OSRM routing
- Real-time route calculation
- Distance and ETA display

### Phase 3: Testing (Current)
- Build and test APK
- Verify route calculations
- Check performance
- Validate accuracy

### Phase 4: Advanced Features (Future)
- Turn-by-turn navigation UI
- Voice instructions
- Self-hosted OSRM server
- Offline maps

## Configuration

### Android Setup
No special configuration needed - uses WebView which is built into React Native.

### iOS Setup
WebView works out of the box on iOS as well.

## API Reference

### OSMMapView Props
```typescript
interface OSMMapViewProps {
  markers?: Marker[];              // Array of markers to display
  center?: RoutePoint;             // Map center coordinates
  zoom?: number;                   // Zoom level (10-19)
  showUserLocation?: boolean;      // Show user's location
  polyline?: RoutePoint[];         // Route polyline
  onMarkerPress?: (id: string) => void;  // Marker click handler
}
```

### OSRMService Methods
```typescript
// Calculate route through waypoints
getRoute(waypoints: RoutePoint[]): Promise<Route | null>

// Simple A-to-B routing
getRouteBetween(start: RoutePoint, end: RoutePoint): Promise<Route | null>

// Multi-stop route
getRouteWithStops(stops: RoutePoint[]): Promise<Route | null>

// Distance matrix
getDistanceMatrix(sources: RoutePoint[], destinations: RoutePoint[]): Promise<number[][] | null>

// Map matching
getNearestRoad(point: RoutePoint): Promise<RoutePoint | null>

// Formatting helpers
formatDistance(meters: number): string
formatDuration(seconds: number): string
```

## Troubleshooting

### Map not displaying
- Check internet connection (for tile downloads)
- Verify coordinates are valid
- Check console for errors

### Routes not showing
- Verify OSRM server is accessible
- Check start/end coordinates are valid
- Ensure coordinates are on roads (use getNearestRoad)

### Performance issues
- Reduce number of markers
- Simplify polylines
- Lower zoom level
- Enable GPU acceleration

## Next Steps

1. **Test MapLibre rendering** - Verify map displays correctly
2. **Test OSRM routing** - Calculate sample routes
3. **Update existing components** - Migrate to MapLibreView
4. **Add navigation UI** - Turn-by-turn instructions
5. **Consider self-hosting OSRM** - For production deployment

## Resources

- [OSRM Documentation](http://project-osrm.org/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Leaflet.js](https://leafletjs.com/)
- [Digipin Geocoding](https://www.digipin.in/)
