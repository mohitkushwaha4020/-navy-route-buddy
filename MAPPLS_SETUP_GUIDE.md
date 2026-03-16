# MapPLS Setup Guide

## 📋 Prerequisites

You have MapPLS license files:
- `app1765963117688i1670786148.a.olf`
- `app1765963117688i1670786148.a.conf`

These are encrypted license files from MapPLS.

## 🔑 Getting API Keys

### Step 1: MapPLS Account
1. Go to https://apis.mappls.com/
2. Sign up or login
3. Go to Dashboard

### Step 2: Get API Keys
You need 3 keys:

1. **REST API Key** (for geocoding, routing)
   - Dashboard → API Keys → REST API Key
   - Example: `abc123def456ghi789jkl012mno345pq`

2. **Map SDK Key** (for map display)
   - Dashboard → API Keys → Map SDK Key  
   - Example: `xyz789abc123def456ghi789jkl012mn`

3. **Client ID & Secret** (for OAuth)
   - Dashboard → API Keys → OAuth Credentials
   - Client ID: `your-client-id`
   - Client Secret: `your-client-secret`

## 🛠️ Implementation Steps

### Step 1: Add API Keys to Environment

Create/Update `mobile/.env`:
```env
# MapPLS API Keys
MAPPLS_REST_API_KEY=your_rest_api_key_here
MAPPLS_MAP_SDK_KEY=your_map_sdk_key_here
MAPPLS_CLIENT_ID=your_client_id_here
MAPPLS_CLIENT_SECRET=your_client_secret_here
```

### Step 2: Update MapPLS Components

#### Update `mobile/src/components/MapPLSView.tsx`:
```typescript
// Line 18-19: Replace with your keys
const MAPPLS_MAP_SDK_KEY = process.env.MAPPLS_MAP_SDK_KEY || 'YOUR_KEY';
const MAPPLS_REST_API_KEY = process.env.MAPPLS_REST_API_KEY || 'YOUR_KEY';
```

#### Update `mobile/src/services/MapPLSService.ts`:
```typescript
// Line 8-10: Replace with your keys
const MAPPLS_REST_API_KEY = process.env.MAPPLS_REST_API_KEY || 'YOUR_KEY';
const MAPPLS_CLIENT_ID = process.env.MAPPLS_CLIENT_ID || 'YOUR_ID';
const MAPPLS_CLIENT_SECRET = process.env.MAPPLS_CLIENT_SECRET || 'YOUR_SECRET';
```

### Step 3: Install Dependencies (if needed)

```bash
cd mobile
npm install react-native-dotenv
```

### Step 4: Replace OSM with MapPLS

#### Option A: Quick Test (One Component)
Update `mobile/src/components/DriverRouteMap.tsx`:
```typescript
// Change import
import OSMMapView from './OSMMapView';
// To
import MapPLSView from './MapPLSView';

// Change component usage
<OSMMapView ... />
// To
<MapPLSView ... />
```

#### Option B: Full Migration (All Components)
1. Update `DriverRouteMap.tsx`
2. Update `BusTrackingMap.tsx`
3. Update any other map components

### Step 5: Test the Implementation

```bash
cd mobile/android
./gradlew assembleRelease
adb install -r app/build/outputs/apk/release/app-release.apk
```

## 📱 Testing Checklist

### Basic Functionality
- [ ] Map loads correctly
- [ ] Centered on Jabalpur
- [ ] Markers display (bus, student, stops)
- [ ] Polylines show route
- [ ] Zoom controls work
- [ ] Pan/scroll works

### Advanced Features
- [ ] Geocoding works (address → coordinates)
- [ ] Reverse geocoding works (coordinates → address)
- [ ] Routing works (waypoints → route)
- [ ] Place search works
- [ ] Distance calculation accurate
- [ ] ETA calculation accurate

## 🔧 Troubleshooting

### Issue: Map doesn't load
**Solution:**
1. Check API keys are correct
2. Check internet connection
3. Check WebView console for errors
4. Verify MapPLS account is active

### Issue: "Invalid API Key" error
**Solution:**
1. Verify keys in `.env` file
2. Restart Metro bundler
3. Rebuild app
4. Check key permissions in MapPLS dashboard

### Issue: Geocoding fails
**Solution:**
1. Check REST API key
2. Verify OAuth credentials
3. Check API usage limits
4. Test with simple address first

### Issue: Routing doesn't work
**Solution:**
1. Verify waypoints are valid
2. Check route API permissions
3. Test with 2 points first
4. Check console for errors

## 📊 API Usage Monitoring

### Free Tier Limits
- **250,000 API calls/month**
- Map loads: ~10,000/month
- Geocoding: ~5,000/month
- Routing: ~5,000/month
- **Total**: ~20,000/month ✅

### Monitor Usage
1. Go to MapPLS Dashboard
2. Check "Usage Statistics"
3. Set up alerts for 80% usage
4. Upgrade plan if needed

## 🚀 Migration Strategy

### Phase 1: Parallel Testing (Current)
- Keep OSM as default
- Add MapPLS as alternative
- Test both side-by-side
- Compare accuracy

### Phase 2: Gradual Rollout
- Use MapPLS for new features
- Migrate one screen at a time
- Monitor performance
- Collect user feedback

### Phase 3: Full Migration
- Replace all OSM components
- Remove OSM dependencies
- Update documentation
- Train users

### Phase 4: Optimization
- Implement caching
- Add offline support
- Optimize API calls
- Reduce costs

## 💰 Cost Optimization

### Tips to Reduce API Calls
1. **Cache geocoding results** - Store address → coordinates
2. **Batch requests** - Combine multiple calls
3. **Use local calculations** - Distance, bearing
4. **Implement debouncing** - Delay search requests
5. **Offline maps** - Download for common areas

### Example Caching
```typescript
// Cache geocoding results
const geocodeCache = new Map<string, GeocodingResult>();

async function geocodeWithCache(address: string) {
  if (geocodeCache.has(address)) {
    return geocodeCache.get(address);
  }
  
  const result = await MapPLSService.geocodeAddress(address);
  if (result) {
    geocodeCache.set(address, result);
  }
  return result;
}
```

## 📚 Resources

### Documentation
- MapPLS Docs: https://apis.mappls.com/
- Web SDK: https://github.com/mappls-api/mappls-web-maps
- API Reference: https://apis.mappls.com/console/

### Support
- Email: apisupport@mappls.com
- Forum: https://community.mappls.com/
- Phone: +91-11-4600-9900

### Tutorials
- Getting Started: https://apis.mappls.com/docs/
- Code Samples: https://github.com/mappls-api
- Video Tutorials: YouTube - MapPLS API

## ✅ Next Steps

1. **Get API Keys** from MapPLS Dashboard
2. **Update Environment** variables
3. **Test MapPLS** component
4. **Compare with OSM** accuracy
5. **Decide on migration** strategy
6. **Implement gradually**
7. **Monitor usage** and costs

## 🎯 Success Criteria

### Technical
- [ ] All maps load < 2 seconds
- [ ] Geocoding accuracy > 95%
- [ ] Routing accuracy > 90%
- [ ] Zero crashes
- [ ] API usage within limits

### User Experience
- [ ] Maps are accurate
- [ ] Routes are optimal
- [ ] ETA is reliable
- [ ] Performance is smooth
- [ ] Users are satisfied

## 📝 Notes

- MapPLS is specifically optimized for India
- Better accuracy than OSM for Indian locations
- Professional support available
- Free tier is sufficient for testing
- Paid plans available for production

**Ready to implement! Get your API keys and let's migrate to MapPLS! 🚀**
