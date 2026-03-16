/**
 * MapPLS (MapmyIndia) Service
 * Provides geocoding, routing, and place search for Indian locations
 */

// Replace with your actual MapPLS API keys
const MAPPLS_REST_API_KEY = 'YOUR_REST_API_KEY_HERE';
const MAPPLS_CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
const MAPPLS_CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  address: string;
  placeName?: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface RouteResult {
  coordinates: Location[];
  distance: number; // meters
  duration: number; // seconds
  steps: RouteStep[];
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  location: Location;
}

class MapPLSService {
  private baseUrl = 'https://apis.mappls.com/advancedmaps/v1';
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    // Check if token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://outpost.mappls.com/api/security/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=client_credentials&client_id=${MAPPLS_CLIENT_ID}&client_secret=${MAPPLS_CLIENT_SECRET}`,
      });

      const data = await response.json();
      
      if (data.access_token) {
        this.accessToken = data.access_token;
        // Token expires in 24 hours, refresh 1 hour before
        this.tokenExpiry = Date.now() + (23 * 60 * 60 * 1000);
        return this.accessToken;
      }

      throw new Error('Failed to get access token');
    } catch (error) {
      console.error('MapPLS auth error:', error);
      throw error;
    }
  }

  /**
   * Geocode an address to coordinates
   */
  async geocodeAddress(address: string): Promise<GeocodingResult | null> {
    try {
      const token = await this.getAccessToken();
      
      const url = `${this.baseUrl}/${MAPPLS_REST_API_KEY}/geo_code?address=${encodeURIComponent(address)}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.copResults && data.copResults.length > 0) {
        const result = data.copResults[0];
        return {
          latitude: parseFloat(result.latitude || result.lat),
          longitude: parseFloat(result.longitude || result.lng),
          address: result.formatted_address || address,
          placeName: result.placeName,
          locality: result.locality,
          city: result.city,
          state: result.state,
          pincode: result.pincode,
        };
      }

      return null;
    } catch (error) {
      console.error('MapPLS geocoding error:', error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      const token = await this.getAccessToken();
      
      const url = `${this.baseUrl}/${MAPPLS_REST_API_KEY}/rev_geocode?lat=${latitude}&lng=${longitude}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }

      return null;
    } catch (error) {
      console.error('MapPLS reverse geocoding error:', error);
      return null;
    }
  }

  /**
   * Calculate route between waypoints
   */
  async getRoute(waypoints: Location[]): Promise<RouteResult | null> {
    try {
      const token = await this.getAccessToken();

      if (waypoints.length < 2) {
        throw new Error('At least 2 waypoints required');
      }

      // Format waypoints as "lat,lng;lat,lng;..."
      const waypointsStr = waypoints
        .map(wp => `${wp.latitude},${wp.longitude}`)
        .join(';');

      const url = `${this.baseUrl}/${MAPPLS_REST_API_KEY}/route_adv/driving/${waypointsStr}?geometries=polyline&overview=full&steps=true`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Decode polyline
        const coordinates = this.decodePolyline(route.geometry);

        // Extract steps
        const steps: RouteStep[] = [];
        if (route.legs && route.legs.length > 0) {
          route.legs.forEach((leg: any) => {
            if (leg.steps) {
              leg.steps.forEach((step: any) => {
                steps.push({
                  instruction: step.maneuver?.instruction || step.name || 'Continue',
                  distance: step.distance,
                  duration: step.duration,
                  location: {
                    latitude: step.maneuver?.location?.[1] || 0,
                    longitude: step.maneuver?.location?.[0] || 0,
                  },
                });
              });
            }
          });
        }

        return {
          coordinates,
          distance: route.distance,
          duration: route.duration,
          steps,
        };
      }

      return null;
    } catch (error) {
      console.error('MapPLS routing error:', error);
      return null;
    }
  }

  /**
   * Get route between two points
   */
  async getRouteBetween(start: Location, end: Location): Promise<RouteResult | null> {
    return this.getRoute([start, end]);
  }

  /**
   * Search for places
   */
  async searchPlaces(query: string, location?: Location): Promise<GeocodingResult[]> {
    try {
      const token = await this.getAccessToken();
      
      let url = `${this.baseUrl}/${MAPPLS_REST_API_KEY}/atlas/search?query=${encodeURIComponent(query)}`;
      
      if (location) {
        url += `&location=${location.latitude},${location.longitude}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.suggestedLocations && data.suggestedLocations.length > 0) {
        return data.suggestedLocations.map((loc: any) => ({
          latitude: parseFloat(loc.latitude || loc.lat),
          longitude: parseFloat(loc.longitude || loc.lng),
          address: loc.placeName || loc.placeAddress,
          placeName: loc.placeName,
          locality: loc.locality,
          city: loc.city,
          state: loc.state,
          pincode: loc.pincode,
        }));
      }

      return [];
    } catch (error) {
      console.error('MapPLS place search error:', error);
      return [];
    }
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  calculateDistance(point1: Location, point2: Location): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.latitude - point1.latitude);
    const dLon = this.toRad(point2.longitude - point1.longitude);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.latitude)) *
        Math.cos(this.toRad(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Format distance for display
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  /**
   * Format duration for display
   */
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Decode polyline string to coordinates
   */
  private decodePolyline(encoded: string): Location[] {
    const coordinates: Location[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b;
      let shift = 0;
      let result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      coordinates.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return coordinates;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}

export default new MapPLSService();
