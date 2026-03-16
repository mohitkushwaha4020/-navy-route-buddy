# Map Integration Plan - Navy Route Buddy

## Overview
Complete map integration across Student, Driver, and Admin dashboards using OpenStreetMap and Supabase Realtime.

## Technology Stack
- **react-native-maps**: Map display component
- **OpenStreetMap Nominatim**: Free geocoding (address → coordinates)
- **Supabase Realtime**: Live location tracking
- **Geolocation API**: Current location tracking

## Features by Dashboard

### 1. Student Dashboard
**Current State:**
- Shows list of buses that stop at student's pickup address
- Basic bus information display

**New Features:**
- ✅ Bus list with "Track on Map" button
- ✅ Click bus → Opens map modal
- ✅ Shows bus live location (blue marker)
- ✅ Shows student location (green marker)
- ✅ Shows route polyline
- ✅ Shows all stops as markers
- ✅ Distance and ETA to pickup point
- ✅ Real-time location updates via Supabase

**Implementation:**
1. Add map modal to StudentDashboard
2. Geocode bus stops to get coordinates
3. Subscribe to bus location from Supabase `locations` table
4. Calculate distance and ETA
5. Auto-fit map to show all markers

### 2. Driver Dashboard
**Current State:**
- Shows bus stops list
- Start/Stop tracking buttons
- Battery saver mode

**New Features:**
- ✅ Route preview before starting
- ✅ Start Journey → Opens full-screen map
- ✅ Shows all stops as numbered markers
- ✅ Shows route polyline between stops
- ✅ Current location tracking (blue dot)
- ✅ Next stop highlighted
- ✅ Distance to next stop
- ✅ Turn-by-turn guidance (optional)
- ✅ Completed stops marked green

**Implementation:**
1. Add map view to DriverDashboard
2. Geocode all stops
3. Draw route polyline
4. Track current location
5. Highlight next stop
6. Update stop status

### 3. Admin Dashboard
**Current State:**
- Shows statistics
- Manage buses/students buttons

**New Features:**
- ✅ "Active Routes" button
- ✅ Opens map showing all active buses
- ✅ Each bus as different colored marker
- ✅ Click marker → Shows bus details
- ✅ Real-time location updates
- ✅ Bus status indicators (moving/stopped)
- ✅ Filter by route

**Implementation:**
1. Add "Active Routes" button
2. Create ActiveRoutesMap screen
3. Fetch all active buses
4. Subscribe to all bus locations
5. Show multiple markers
6. Add bus info popup

## Database Schema

### Existing Tables:
```sql
-- locations table (already exists)
CREATE TABLE locations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  accuracy DOUBLE PRECISION,
  speed DOUBLE PRECISION,
  heading DOUBLE PRECISION,
  timestamp TIMESTAMPTZ,
  is_synced BOOLEAN
);

-- buses table (already exists)
CREATE TABLE buses (
  id UUID PRIMARY KEY,
  bus_number TEXT,
  route_number TEXT,
  stops TEXT[], -- Array of stop addresses
  driver_email TEXT,
  status TEXT
);
```

### New Table Needed:
```sql
-- stop_coordinates table (cache geocoded addresses)
CREATE TABLE stop_coordinates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT UNIQUE NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Implementation Steps

### Phase 1: Setup (DONE)
- [x] Install react-native-maps
- [x] Create MapView component
- [x] Create GeocodingService

### Phase 2: Student Dashboard
- [ ] Add map modal
- [ ] Geocode bus stops
- [ ] Subscribe to bus location
- [ ] Calculate distance/ETA
- [ ] Add UI controls

### Phase 3: Driver Dashboard
- [ ] Add map view
- [ ] Geocode route stops
- [ ] Draw route polyline
- [ ] Track current location
- [ ] Highlight next stop
- [ ] Add navigation controls

### Phase 4: Admin Dashboard
- [ ] Add "Active Routes" button
- [ ] Create ActiveRoutesMap screen
- [ ] Fetch all active buses
- [ ] Subscribe to multiple locations
- [ ] Add filtering

### Phase 5: Testing & Optimization
- [ ] Test on real device
- [ ] Optimize performance
- [ ] Add error handling
- [ ] Add offline support

## API Usage

### OpenStreetMap Nominatim
- **Endpoint**: https://nominatim.openstreetmap.org/search
- **Rate Limit**: 1 request/second
- **Free**: Yes, no API key needed
- **Usage**: Geocoding addresses to coordinates

### Supabase Realtime
- **Already configured**
- **Usage**: Live location updates
- **Channel**: `locations` table

## File Structure
```
mobile/src/
├── components/
│   └── MapView.tsx (NEW)
├── services/
│   ├── GeocodingService.ts (NEW)
│   └── LocationService.ts (EXISTS)
├── screens/
│   ├── StudentDashboard.tsx (UPDATE)
│   ├── DriverDashboard.tsx (UPDATE)
│   ├── AdminDashboard.tsx (UPDATE)
│   └── ActiveRoutesMap.tsx (NEW)
└── contexts/
    └── LocationContext.tsx (EXISTS)
```

## Next Steps
1. Create stop_coordinates migration
2. Update StudentDashboard with map
3. Update DriverDashboard with map
4. Create ActiveRoutesMap screen
5. Test end-to-end

## Notes
- OpenStreetMap is free but has rate limits
- Cache geocoded addresses in database
- Use Supabase Realtime for live updates
- Optimize map rendering for performance
- Add loading states and error handling
