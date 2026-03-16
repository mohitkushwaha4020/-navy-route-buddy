// Geocoding service to convert addresses to coordinates
// Uses OpenStreetMap Nominatim API (free, no API key required)
// Caches results in Supabase to avoid repeated API calls

import { supabase } from '../lib/supabase';

interface Coordinates {
  latitude: number;
  longitude: number;
}

class GeocodingService {
  private baseUrl = 'https://nominatim.openstreetmap.org';
  private memoryCache: Map<string, Coordinates> = new Map();

  async geocodeAddress(address: string): Promise<Coordinates | null> {
    // Check memory cache first
    if (this.memoryCache.has(address)) {
      return this.memoryCache.get(address)!;
    }

    // Check database cache
    try {
      const { data: cached } = await supabase
        .from('stop_coordinates')
        .select('latitude, longitude')
        .eq('address', address)
        .single();

      if (cached) {
        const coords: Coordinates = {
          latitude: cached.latitude,
          longitude: cached.longitude,
        };
        this.memoryCache.set(address, coords);
        return coords;
      }
    } catch (error) {
      // Not in cache, continue to geocode
    }

    // Geocode using Nominatim
    try {
      const response = await fetch(
        `${this.baseUrl}/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'NavyRouteBuddy/1.0',
          },
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const coords: Coordinates = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };

        // Cache in memory
        this.memoryCache.set(address, coords);

        // Cache in database
        await supabase.from('stop_coordinates').upsert({
          address,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });

        return coords;
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  async geocodeMultipleAddresses(addresses: string[]): Promise<Map<string, Coordinates>> {
    const results = new Map<string, Coordinates>();

    for (const address of addresses) {
      const coords = await this.geocodeAddress(address);
      if (coords) {
        results.set(address, coords);
      }
      // Add delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  // Calculate distance between two coordinates (in km)
  calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(coord2.latitude - coord1.latitude);
    const dLon = this.toRad(coord2.longitude - coord1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(coord1.latitude)) *
        Math.cos(this.toRad(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Get route between multiple points (simplified)
  async getRoute(coordinates: Coordinates[]): Promise<Coordinates[]> {
    // For now, return the coordinates as-is
    // In production, you'd use OSRM or similar routing service
    return coordinates;
  }
}

export default new GeocodingService();
