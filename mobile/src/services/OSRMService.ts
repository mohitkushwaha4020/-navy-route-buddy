/**
 * OSRM (Open Source Routing Machine) Service
 * Provides route calculation and turn-by-turn navigation
 */

export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export interface RouteStep {
  instruction: string;
  distance: number; // meters
  duration: number; // seconds
  location: RoutePoint;
  maneuver: {
    type: string;
    modifier?: string;
  };
}

export interface Route {
  coordinates: RoutePoint[];
  distance: number; // meters
  duration: number; // seconds
  steps: RouteStep[];
}

class OSRMService {
  // Use public OSRM server - for production, host your own
  private baseUrl = 'https://router.project-osrm.org';

  /**
   * Calculate route between multiple waypoints
   */
  async getRoute(waypoints: RoutePoint[]): Promise<Route | null> {
    try {
      if (waypoints.length < 2) {
        throw new Error('At least 2 waypoints required');
      }

      // Format coordinates as "lon,lat;lon,lat;..."
      const coordinates = waypoints
        .map(wp => `${wp.longitude},${wp.latitude}`)
        .join(';');

      const url = `${this.baseUrl}/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=true&alternatives=false`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        console.error('OSRM routing failed:', data);
        return null;
      }

      const route = data.routes[0];
      
      // Convert GeoJSON coordinates to RoutePoint format
      const coordinates_converted: RoutePoint[] = route.geometry.coordinates.map(
        (coord: number[]) => ({
          longitude: coord[0],
          latitude: coord[1],
        })
      );

      // Extract turn-by-turn steps
      const steps: RouteStep[] = [];
      if (route.legs && route.legs.length > 0) {
        route.legs.forEach((leg: any) => {
          if (leg.steps) {
            leg.steps.forEach((step: any) => {
              steps.push({
                instruction: step.maneuver.instruction || this.getManeuverInstruction(step.maneuver),
                distance: step.distance,
                duration: step.duration,
                location: {
                  latitude: step.maneuver.location[1],
                  longitude: step.maneuver.location[0],
                },
                maneuver: {
                  type: step.maneuver.type,
                  modifier: step.maneuver.modifier,
                },
              });
            });
          }
        });
      }

      return {
        coordinates: coordinates_converted,
        distance: route.distance,
        duration: route.duration,
        steps,
      };
    } catch (error) {
      console.error('OSRM getRoute error:', error);
      return null;
    }
  }

  /**
   * Get route between two points
   */
  async getRouteBetween(start: RoutePoint, end: RoutePoint): Promise<Route | null> {
    return this.getRoute([start, end]);
  }

  /**
   * Get route through multiple stops
   */
  async getRouteWithStops(stops: RoutePoint[]): Promise<Route | null> {
    return this.getRoute(stops);
  }

  /**
   * Calculate distance matrix between multiple points
   */
  async getDistanceMatrix(
    sources: RoutePoint[],
    destinations: RoutePoint[]
  ): Promise<number[][] | null> {
    try {
      const sourceCoords = sources
        .map(s => `${s.longitude},${s.latitude}`)
        .join(';');
      const destCoords = destinations
        .map(d => `${d.longitude},${d.latitude}`)
        .join(';');

      const allCoords = `${sourceCoords};${destCoords}`;
      const sourceIndices = sources.map((_, i) => i).join(';');
      const destIndices = destinations
        .map((_, i) => i + sources.length)
        .join(';');

      const url = `${this.baseUrl}/table/v1/driving/${allCoords}?sources=${sourceIndices}&destinations=${destIndices}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 'Ok' || !data.durations) {
        console.error('OSRM distance matrix failed:', data);
        return null;
      }

      return data.durations;
    } catch (error) {
      console.error('OSRM getDistanceMatrix error:', error);
      return null;
    }
  }

  /**
   * Get nearest road point for a coordinate (map matching)
   */
  async getNearestRoad(point: RoutePoint): Promise<RoutePoint | null> {
    try {
      const url = `${this.baseUrl}/nearest/v1/driving/${point.longitude},${point.latitude}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 'Ok' || !data.waypoints || data.waypoints.length === 0) {
        return null;
      }

      const nearest = data.waypoints[0];
      return {
        latitude: nearest.location[1],
        longitude: nearest.location[0],
      };
    } catch (error) {
      console.error('OSRM getNearestRoad error:', error);
      return null;
    }
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
   * Generate human-readable instruction from maneuver
   */
  private getManeuverInstruction(maneuver: any): string {
    const type = maneuver.type;
    const modifier = maneuver.modifier;

    const instructions: { [key: string]: string } = {
      'turn-sharp-left': 'Turn sharp left',
      'turn-left': 'Turn left',
      'turn-slight-left': 'Turn slight left',
      'turn-sharp-right': 'Turn sharp right',
      'turn-right': 'Turn right',
      'turn-slight-right': 'Turn slight right',
      'continue-straight': 'Continue straight',
      'continue-uturn': 'Make a U-turn',
      'depart': 'Depart',
      'arrive': 'Arrive at destination',
      'roundabout': 'Enter roundabout',
      'rotary': 'Enter rotary',
      'merge': 'Merge',
      'fork': 'Take fork',
      'ramp': 'Take ramp',
    };

    const key = modifier ? `${type}-${modifier}` : type;
    return instructions[key] || `${type} ${modifier || ''}`.trim();
  }
}

export default new OSRMService();
