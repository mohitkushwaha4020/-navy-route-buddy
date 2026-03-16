import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Callout } from 'react-native-maps';
import { supabase } from '../lib/supabase';

interface BusLocation {
  busId: string;
  busNumber: string;
  routeNumber: string;
  driverName: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: string;
  color: string;
}

export default function ActiveRoutesMap({ navigation }: any) {
  const [busLocations, setBusLocations] = useState<BusLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState<BusLocation | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const mapRef = useRef<MapView>(null);
  const channelsRef = useRef<any[]>([]);

  const busColors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // orange
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange-red
  ];

  useEffect(() => {
    fetchActiveBuses();

    return () => {
      // Cleanup all subscriptions
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, []);

  const fetchActiveBuses = async () => {
    try {
      setLoading(true);

      // Get all active buses
      const { data: buses, error: busesError } = await supabase
        .from('buses')
        .select('*')
        .eq('status', 'active');

      if (busesError) throw busesError;

      if (!buses || buses.length === 0) {
        setLoading(false);
        return;
      }

      // Get latest location for each bus
      const locations: BusLocation[] = [];

      for (let i = 0; i < buses.length; i++) {
        const bus = buses[i];
        if (!bus.driver_email) continue;

        // Get driver's user ID from auth
        const { data: authUsers } = await supabase
          .from('auth.users')
          .select('id')
          .eq('email', bus.driver_email)
          .single();

        if (!authUsers) continue;

        // Get latest location
        const { data: locationData } = await supabase
          .from('locations')
          .select('*')
          .eq('user_id', authUsers.id)
          .order('timestamp', { ascending: false })
          .limit(1);

        if (locationData && locationData.length > 0) {
          const loc = locationData[0];
          locations.push({
            busId: bus.id,
            busNumber: bus.bus_number,
            routeNumber: bus.route_number,
            driverName: bus.driver_full_name || 'Unknown',
            latitude: loc.latitude,
            longitude: loc.longitude,
            speed: loc.speed || 0,
            timestamp: loc.timestamp,
            color: busColors[i % busColors.length],
          });

          // Subscribe to real-time updates
          subscribeToLocation(authUsers.id, bus, busColors[i % busColors.length]);
        }
      }

      setBusLocations(locations);

      // Fit map to show all buses
      if (locations.length > 0 && mapRef.current) {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(
            locations.map(loc => ({
              latitude: loc.latitude,
              longitude: loc.longitude,
            })),
            {
              edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
              animated: true,
            }
          );
        }, 500);
      }
    } catch (error: any) {
      console.error('Error fetching active buses:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToLocation = (userId: string, bus: any, color: string) => {
    const channel = supabase
      .channel(`bus-location-${bus.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'locations',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setBusLocations(prev => {
            const updated = prev.filter(loc => loc.busId !== bus.id);
            return [
              ...updated,
              {
                busId: bus.id,
                busNumber: bus.bus_number,
                routeNumber: bus.route_number,
                driverName: bus.driver_full_name || 'Unknown',
                latitude: payload.new.latitude,
                longitude: payload.new.longitude,
                speed: payload.new.speed || 0,
                timestamp: payload.new.timestamp,
                color,
              },
            ];
          });
        }
      )
      .subscribe();

    channelsRef.current.push(channel);
  };

  const handleMarkerPress = (bus: BusLocation) => {
    setSelectedBus(bus);
    setDetailsModalVisible(true);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={styles.loadingText}>Loading active routes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Active Routes</Text>
          <Text style={styles.headerSubtitle}>
            {busLocations.length} bus{busLocations.length !== 1 ? 'es' : ''} active
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {busLocations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🚌</Text>
          <Text style={styles.emptyText}>No active buses</Text>
          <Text style={styles.emptySubtext}>
            Buses will appear here when drivers start their journey
          </Text>
        </View>
      ) : (
        <>
          {/* Map */}
          <MapView
            ref={mapRef}
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            showsUserLocation={false}
            showsCompass={true}
          >
            {busLocations.map((bus) => (
              <Marker
                key={bus.busId}
                coordinate={{
                  latitude: bus.latitude,
                  longitude: bus.longitude,
                }}
                onPress={() => handleMarkerPress(bus)}
              >
                <View style={[styles.busMarker, { backgroundColor: bus.color }]}>
                  <Text style={styles.busMarkerText}>🚌</Text>
                </View>
                <Callout>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{bus.busNumber}</Text>
                    <Text style={styles.calloutText}>Route: {bus.routeNumber}</Text>
                    <Text style={styles.calloutText}>
                      {bus.speed > 5 ? '🚌 Moving' : '🛑 Stopped'}
                    </Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>

          {/* Legend */}
          <View style={styles.legend}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {busLocations.map((bus) => (
                <TouchableOpacity
                  key={bus.busId}
                  style={styles.legendItem}
                  onPress={() => handleMarkerPress(bus)}
                >
                  <View
                    style={[styles.legendDot, { backgroundColor: bus.color }]}
                  />
                  <Text style={styles.legendText}>{bus.busNumber}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </>
      )}

      {/* Bus Details Modal */}
      {selectedBus && (
        <Modal
          visible={detailsModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setDetailsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View
                  style={[
                    styles.modalColorBar,
                    { backgroundColor: selectedBus.color },
                  ]}
                />
                <Text style={styles.modalTitle}>Bus Details</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Bus Number:</Text>
                <Text style={styles.detailValue}>{selectedBus.busNumber}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Route:</Text>
                <Text style={styles.detailValue}>{selectedBus.routeNumber}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Driver:</Text>
                <Text style={styles.detailValue}>{selectedBus.driverName}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={styles.detailValue}>
                  {selectedBus.speed > 5 ? '🚌 Moving' : '🛑 Stopped'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Speed:</Text>
                <Text style={styles.detailValue}>
                  {selectedBus.speed.toFixed(1)} km/h
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Update:</Text>
                <Text style={styles.detailValue}>
                  {formatTime(selectedBus.timestamp)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDetailsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    backgroundColor: '#1e3a8a',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
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
  placeholder: {
    width: 40,
  },
  map: {
    flex: 1,
  },
  busMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  busMarkerText: {
    fontSize: 24,
  },
  callout: {
    padding: 10,
    minWidth: 150,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 5,
  },
  calloutText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  legend: {
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalColorBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#1e3a8a',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
