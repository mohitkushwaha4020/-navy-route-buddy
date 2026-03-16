/**
 * Digipin Geocoding Service
 * Uses Digipin API for Indian addresses (better than OSM for India)
 * Falls back to OSM Nominatim if Digipin fails
 */

interface Coordinates {
  latitude: number;
  longitude: number;
}

class DigipinGeocodingService {
  private readonly DIGIPIN_API_URL = 'https://api.digipin.in/v1';
  private readonly OSM_NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
  private cache: Map<string, Coordinates> = new Map();

  /**
   * Geocode address using Digipin (primary) or OSM (fallback)
   */
  async geocodeAddress(address: string): Promise<Coordinates | null> {
    // Check cache first
    if (this.cache.has(address)) {
      return this.cache.get(address)!;
    }

    try {
      // Try Digipin first (better for Indian addresses)
      const digipinResult = await this.geocodeWithDigipin(address);
      if (digipinResult) {
        this.cache.set(address, digipinResult);
        return digipinResult;
      }

      // Fallback to OSM Nominatim
      const osmResult = await this.geocodeWithOSM(address);
      if (osmResult) {
        this.cache.set(address, osmResult);
        return osmResult;
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * Geocode using Digipin API
   */
  private async geocodeWithDigipin(address: string): Promise<Coordinates | null> {
    try {
      const response = await fetch(
        `${this.DIGIPIN_API_URL}/geocode?address=${encodeURIComponent(address)}&country=IN`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Digipin API error');
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        };
      }

      return null;
    } catch (error) {
      console.warn('Digipin geocoding failed, falling back to OSM:', error);
      return null;
    }
  }

  /**
   * Geocode using OSM Nominatim (fallback)
   */
  private async geocodeWithOSM(address: string): Promise<Coordinates | null> {
    try {
      const response = await fetch(
        `${this.OSM_NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(address)}&countrycodes=in&limit=1`,
        {
          headers: {
            'User-Agent': 'RouteBuddy/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error('OSM Nominatim error');
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      }

      return null;
    } catch (error) {
      console.error('OSM geocoding failed:', error);
      return null;
    }
  }

  /**
   * Reverse geocode (coordinates to address)
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      // Try Digipin first
      const digipinAddress = await this.reverseGeocodeWithDigipin(latitude, longitude);
      if (digipinAddress) return digipinAddress;

      // Fallback to OSM
      return await this.reverseGeocodeWithOSM(latitude, longitude);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  private async reverseGeocodeWithDigipin(lat: number, lon: number): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.DIGIPIN_API_URL}/reverse?lat=${lat}&lon=${lon}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Digipin reverse geocode error');

      const data = await response.json();
      return data.results?.[0]?.formatted_address || null;
    } catch (error) {
      console.warn('Digipin reverse geocoding failed:', error);
      return null;
    }
  }

  private async reverseGeocodeWithOSM(lat: number, lon: number): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.OSM_NOMINATIM_URL}/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: {
            'User-Agent': 'RouteBuddy/1.0',
          },
        }
      );

      if (!response.ok) throw new Error('OSM reverse geocode error');

      const data = await response.json();
      return data.display_name || null;
    } catch (error) {
      console.error('OSM reverse geocoding failed:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
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

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export default new DigipinGeocodingService();
