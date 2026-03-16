import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';
import DigipinGeocodingService from '../services/DigipinGeocodingService';
import OSRMService from '../services/OSRMService';
import OSMMapView from './OSMMapView';

interface BusTrackingMapProps {
  visible: boolean;
  onClose: () => void;
  bus: any;
  studentLocation?: { latitude: number; longitude: number };
}

export default function BusTrackingMap({
  visible,
  onClose,
  bus,
  studentLocation,
}: BusTrackingMapProps) {
  const [busLocation, setBusLocation] = useState<any>(null);
  const [stopCoordinates, setStopCoordinates] = useState<any[]>([]);
  const [routePolyline, setRoutePolyline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState<number | null>(null);
  const [eta, setEta] = useState<string>('Calculating...');
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (visible && bus) {
      loadMapData();
      subscribeToLocation();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [visible, bus]);

  useEffect(() => {
    if (busLocation && studentLocation) {
      calculateDistanceAndETA();
    }
  }, [busLocation, studentLocation]);

  useEffect(() => {
    if (stopCoordinates.length >= 2) {
      calculateOSRMRoute();
    }
  }, [stopCoordinates]);

  const loadMapData = async () => {
    setLoading(true);
    try {
      // Use stop_coordinates if available, otherwise fallback to geocoding stops
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

      // Get latest bus location
      const { data: locations } = await supabase
        .from('locations')
        .select('*')
        .eq('user_id', bus.driver_id)
        .order('timestamp', { ascending: false })
        .limit(1);

      if (locations && locations.length > 0) {
        setBusLocation({
          latitude: locations[0].latitude,
          longitude: locations[0].longitude,
          speed: locations[0].speed,
        });
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load map data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToLocation = () => {
    if (!bus.driver_id) return;

    channelRef.current = supabase
      .channel(`bus-location-${bus.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE)
          schema: 'public',
          table: 'locations',
          filter: `user_id=eq.${bus.driver_id}`,
        },
        (payload) => {
          console.log('Location update received:', payload);
          setBusLocation({
            latitude: payload.new.latitude,
            longitude: payload.new.longitude,
            speed: payload.new.speed,
            timestamp: payload.new.timestamp,
          });
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });
  };

  const calculateDistanceAndETA = async () => {
    if (!busLocation || !studentLocation) return;

    try {
      // Use OSRM to calculate actual road distance and ETA
      const route = await OSRMService.getRouteBetween(busLocation, studentLocation);
      
      if (route) {
        // Use OSRM calculated distance and duration
        const distKm = route.distance / 1000;
        setDistance(distKm);
        setEta(OSRMService.formatDuration(route.duration));
      } else {
        // Fallback to straight-line distance
        const dist = DigipinGeocodingService.calculateDistance(
          studentLocation,
          busLocation
        );
        setDistance(dist);

        const avgSpeed = busLocation.speed || 30; // km/h
        const timeInHours = dist / avgSpeed;
        const timeInMinutes = Math.round(timeInHours * 60);

        if (timeInMinutes < 1) {
          setEta('Arriving now');
        } else if (timeInMinutes === 1) {
          setEta('1 minute');
        } else {
          setEta(`${timeInMinutes} minutes`);
        }
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
    }
  };

  const calculateOSRMRoute = async () => {
    try {
      // Calculate route through all stops using OSRM
      const route = await OSRMService.getRouteWithStops(stopCoordinates);
      
      if (route) {
        setRoutePolyline(route.coordinates);
      }
    } catch (error) {
      console.error('OSRM route calculation error:', error);
    }
  };



  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>🚌 {bus.bus_number}</Text>
            <Text style={styles.headerSubtitle}>Route: {bus.route_number}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Info Bar */}
        {busLocation && distance !== null && (
          <View style={styles.infoBar}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Distance</Text>
              <Text style={styles.infoValue}>{distance.toFixed(1)} km</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>ETA</Text>
              <Text style={styles.infoValue}>{eta}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>
                {busLocation.speed > 5 ? '🚌 Moving' : '🛑 Stopped'}
              </Text>
            </View>
          </View>
        )}

        {/* Map */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1e3a8a" />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        ) : (
          <OSMMapView
            markers={[
              ...(busLocation
                ? [
                    {
                      id: 'bus',
                      latitude: busLocation.latitude,
                      longitude: busLocation.longitude,
                      title: `🚌 ${bus.bus_number}\nRoute: ${bus.route_number}`,
                      icon: 'bus',
                    },
                  ]
                : []),
              ...(studentLocation
                ? [
                    {
                      id: 'student',
                      latitude: studentLocation.latitude,
                      longitude: studentLocation.longitude,
                      title: '📍 Your Location',
                      icon: 'student',
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
            center={busLocation || studentLocation || stopCoordinates[0] || { latitude: 23.1815, longitude: 79.9864 }}
            zoom={18}
          />
        )}

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <Text style={styles.legendIcon}>🚌</Text>
            <Text style={styles.legendText}>Bus</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendIcon}>📍</Text>
            <Text style={styles.legendText}>You</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.stopMarkerSmall}>
              <Text style={styles.stopMarkerTextSmall}>1</Text>
            </View>
            <Text style={styles.legendText}>Stops</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1e3a8a',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#dbeafe',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  infoBar: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    padding: 18,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e0e7ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  infoDivider: {
    width: 1,
    backgroundColor: '#cbd5e1',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
  },
  busMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  busMarkerText: {
    fontSize: 24,
  },
  studentMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  studentMarkerText: {
    fontSize: 24,
  },
  stopMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  stopMarkerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 18,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendIcon: {
    fontSize: 20,
  },
  legendText: {
    fontSize: 14,
    color: '#64748b',
  },
  stopMarkerSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopMarkerTextSmall: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
});
