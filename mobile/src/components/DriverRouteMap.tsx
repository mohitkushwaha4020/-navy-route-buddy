import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import OSMMapView from './OSMMapView';
import Geolocation from '@react-native-community/geolocation';
import OSRMService from '../services/OSRMService';

interface DriverRouteMapProps {
  bus: any;
  isTracking: boolean;
}

export default function DriverRouteMap({ bus, isTracking }: DriverRouteMapProps) {
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [stopCoordinates, setStopCoordinates] = useState<any[]>([]);
  const [routePolyline, setRoutePolyline] = useState<any[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  useEffect(() => {
    loadStopCoordinates();
    if (isTracking) {
      startLocationTracking();
    }
  }, [bus.stops]);

  useEffect(() => {
    if (stopCoordinates.length >= 2) {
      calculateOSRMRoute();
    }
  }, [stopCoordinates]);

  const loadStopCoordinates = async () => {
    setIsLoadingRoute(true);
    try {
      let coords = [];
      
      if (bus.stop_coordinates && bus.stop_coordinates.length > 0) {
        // Use pre-saved coordinates (faster and more accurate)
        coords = bus.stop_coordinates.map((stop: any) => ({
          latitude: stop.latitude,
          longitude: stop.longitude,
          address: stop.name,
        }));
      } else if (bus.stops && bus.stops.length > 0) {
        // Fallback: Geocode addresses (legacy support)
        const DigipinGeocodingService = require('../services/DigipinGeocodingService').default;
        
        for (let i = 0; i < bus.stops.length; i++) {
          const stop = bus.stops[i];
          try {
            const coord = await Promise.race([
              DigipinGeocodingService.geocodeAddress(stop),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 10000)
              )
            ]);
            
            if (coord) {
              coords.push({ ...coord, address: stop });
            }
          } catch (error) {
            console.warn(`Error geocoding ${stop}:`, error);
          }
          
          // Delay between requests
          if (i < bus.stops.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
      
      setStopCoordinates(coords);
      console.log('Loaded stop coordinates:', coords.length);
    } catch (error) {
      console.error('Error loading stop coordinates:', error);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const startLocationTracking = () => {
    console.log('🛰️ Starting GPS location tracking...');
    
    // FORCE GPS - No cached location, high accuracy only
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log('✅ GPS Location acquired:', { latitude, longitude, accuracy });
        
        setCurrentLocation({ latitude, longitude });
        
        Alert.alert(
          '📍 GPS Location Found', 
          `Lat: ${latitude.toFixed(6)}\nLng: ${longitude.toFixed(6)}\nAccuracy: ${accuracy?.toFixed(0)}m`,
          [{ text: 'OK' }]
        );
      },
      (error) => {
        console.error('❌ GPS Error:', error.code, error.message);
        
        let errorMsg = 'GPS signal not available.\n\n';
        if (error.code === 1) {
          errorMsg += '❌ Location permission denied\n\nPlease enable location permission in Settings.';
        } else if (error.code === 2) {
          errorMsg += '📡 GPS signal weak\n\n1. Go outdoors\n2. Wait 30-60 seconds for GPS lock\n3. Enable "High Accuracy" mode in Location Settings';
        } else if (error.code === 3) {
          errorMsg += '⏱️ GPS timeout\n\n1. Go to open area (outdoors)\n2. Enable "High Accuracy" GPS mode\n3. Wait for GPS to acquire satellites';
        }
        
        Alert.alert('GPS Error', errorMsg, [{ text: 'OK' }]);
        
        // Set default location as fallback
        setCurrentLocation({ latitude: 23.1815, longitude: 79.9864 });
      },
      { 
        enableHighAccuracy: true,  // FORCE GPS (not network)
        timeout: 60000,            // 60 seconds for GPS lock
        maximumAge: 0,             // NO cached location - fresh GPS only
      }
    );

    // Watch position with HIGH ACCURACY GPS
    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, speed } = position.coords;
        console.log('🔄 GPS Update:', { latitude, longitude, accuracy, speed });
        
        setCurrentLocation({ latitude, longitude });
      },
      (error) => {
        console.error('⚠️ GPS Watch Error:', error.code, error.message);
      },
      { 
        enableHighAccuracy: true,  // FORCE GPS tracking
        distanceFilter: 5,         // Update every 5 meters (more accurate)
        interval: 5000,            // Update every 5 seconds
        maximumAge: 0,             // NO cached location
        fastestInterval: 3000,     // Fastest update: 3 seconds
      }
    );

    // Cleanup function
    return () => {
      console.log('🛑 Stopping GPS tracking...');
      Geolocation.clearWatch(watchId);
    };
  };

  const calculateOSRMRoute = async () => {
    setIsLoadingRoute(true);
    try {
      // Calculate route through all stops using OSRM
      const route = await OSRMService.getRouteWithStops(stopCoordinates);
      
      if (route) {
        setRoutePolyline(route.coordinates);
        setRouteInfo({
          distance: OSRMService.formatDistance(route.distance),
          duration: OSRMService.formatDuration(route.duration),
        });
      }
    } catch (error) {
      console.error('OSRM route calculation error:', error);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Show message if no stops */}
      {stopCoordinates.length === 0 && !isLoadingRoute ? (
        <View style={styles.noStopsContainer}>
          <Text style={styles.noStopsIcon}>📍</Text>
          <Text style={styles.noStopsText}>No stops configured</Text>
          <Text style={styles.noStopsSubtext}>
            Add stops from Admin Dashboard to see route
          </Text>
        </View>
      ) : (
        <>
          {/* Map */}
          <OSMMapView
            markers={[
              ...(currentLocation
                ? [
                    {
                      id: 'driver',
                      latitude: currentLocation.latitude,
                      longitude: currentLocation.longitude,
                      title: `🚌 ${bus.bus_number}\nYour Location`,
                      icon: 'bus',
                    },
                  ]
                : []),
              ...stopCoordinates.map((stop, index) => ({
                id: `stop-${index}`,
                latitude: stop.latitude,
                longitude: stop.longitude,
                title: `🛑 Stop ${index + 1}\n${stop.address}`,
                icon: 'stop',
              })),
            ]}
            polyline={routePolyline.length > 0 ? routePolyline : stopCoordinates}
            center={currentLocation || stopCoordinates[0] || { latitude: 23.1815, longitude: 79.9864 }}
            zoom={16}
          />

          {/* Route Info Overlay */}
          <View style={styles.infoOverlay}>
            {isLoadingRoute ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#1e3a8a" />
                <Text style={styles.loadingText}>Calculating route...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.routeInfo}>
                  📍 Route: {bus.route_number} | Stops: {stopCoordinates.length}
                </Text>
                {routeInfo && (
                  <Text style={styles.routeDetails}>
                    🚗 {routeInfo.distance} • ⏱️ {routeInfo.duration}
                  </Text>
                )}
              </>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noStopsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 40,
  },
  noStopsIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  noStopsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  noStopsSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoOverlay: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  routeInfo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 2,
  },
  routeDetails: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748b',
  },
});
