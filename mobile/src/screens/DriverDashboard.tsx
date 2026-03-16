import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { supabase } from '../lib/supabase';
import LocationService from '../services/LocationService';
import DriverRouteMap from '../components/DriverRouteMap';

export default function DriverDashboard({ navigation }: any) {
  const { user } = useAuth();
  const { t, colors } = useSettings();
  const [busInfo, setBusInfo] = useState<any>(null);
  const [tracking, setTracking] = useState(false);
  const [batterySaver, setBatterySaver] = useState(false);
  const [offlineQueueSize, setOfflineQueueSize] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  useEffect(() => {
    fetchBusInfo();

    const queueInterval = setInterval(() => {
      setOfflineQueueSize(LocationService.getOfflineQueueSize());
    }, 5000);

    return () => {
      LocationService.stopTracking();
      clearInterval(queueInterval);
    };
  }, []);

  useEffect(() => {
    if (tracking) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
  }, [tracking, batterySaver]);

  const fetchBusInfo = async () => {
    try {
      setLoading(true);
      const { data: bus, error } = await supabase
        .from('buses')
        .select('*')
        .eq('driver_email', user?.email)
        .single();

      if (error) throw error;
      setBusInfo(bus);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load bus information');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = async () => {
    if (!user?.id) return;

    await LocationService.startTracking(
      user.id,
      batterySaver,
      (locationData) => {
        setOfflineQueueSize(LocationService.getOfflineQueueSize());
      }
    );
  };

  const stopLocationTracking = () => {
    LocationService.stopTracking();
  };

  const requestLocationPermission = async () => {
    try {
      const { PermissionsAndroid, Platform, Linking } = require('react-native');
      
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission Required',
            message: 'This app needs access to your location to track the bus route.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            'Location Permission Required',
            'Please enable location permission from Settings to start journey.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
          return false;
        } else {
          Alert.alert('Permission Denied', 'Location permission is required to track the bus.');
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  };

  const toggleTracking = async () => {
    if (!busInfo) {
      Alert.alert('Error', 'Bus information not loaded');
      return;
    }

    const newTrackingState = !tracking;

    // If starting journey, check location permission first
    if (newTrackingState) {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        return; // Don't start tracking if permission denied
      }
    }

    setTracking(newTrackingState);

    // Update bus status
    try {
      await supabase
        .from('buses')
        .update({ status: newTrackingState ? 'active' : 'available' })
        .eq('id', busInfo.id);
    } catch (error) {
      console.error('Error updating bus status:', error);
    }

    Alert.alert(
      newTrackingState ? 'Journey Started' : 'Journey Stopped',
      newTrackingState
        ? 'Students can now track your location'
        : 'Location sharing disabled'
    );
  };

  const handleStopReached = (stopIndex: number) => {
    Alert.alert(
      'Stop Reached',
      `You've reached stop ${stopIndex + 1}: ${busInfo.stops[stopIndex]}`,
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  if (!busInfo) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('dashboard')}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{t('noBusAssigned')}</Text>
          <Text style={styles.errorSubtext}>
            {t('contactAdminBus')}
          </Text>
        </View>
      </View>
    );
  }

  // If tracking, show tracking view with map
  if (tracking) {
    return (
      <View style={styles.container}>
        {/* Header with Stop Button */}
        <View style={styles.trackingHeader}>
          <View>
            <Text style={styles.trackingTitle}>🚌 {busInfo.bus_number}</Text>
            <Text style={styles.trackingSubtitle}>
              {t('route')}: {busInfo.route_number}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.stopButton}
            onPress={toggleTracking}
          >
            <Text style={styles.stopButtonText}>⏹ {t('stopJourney')}</Text>
          </TouchableOpacity>
        </View>

        {/* Map View */}
        <View style={styles.mapContainer}>
          <DriverRouteMap
            bus={busInfo}
            isTracking={tracking}
          />
        </View>

        {/* Info Bar */}
        <View style={styles.infoBar}>
          <View style={styles.infoBarItem}>
            <Text style={styles.infoBarLabel}>{t('status')}</Text>
            <Text style={styles.infoBarValue}>🚌 {t('active')}</Text>
          </View>
          <View style={styles.infoBarDivider} />
          <View style={styles.infoBarItem}>
            <Text style={styles.infoBarLabel}>{t('busStops')}</Text>
            <Text style={styles.infoBarValue}>{busInfo.stops?.length || 0}</Text>
          </View>
          {offlineQueueSize > 0 && (
            <>
              <View style={styles.infoBarDivider} />
              <View style={styles.infoBarItem}>
                <Text style={styles.infoBarLabel}>{t('queued')}</Text>
                <Text style={styles.infoBarValue}>📡 {offlineQueueSize}</Text>
              </View>
            </>
          )}
        </View>
      </View>
    );
  }

  // Default view - Route preview
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('dashboard')}</Text>
          <Text style={styles.headerSubtitle}>
            {busInfo.driver_full_name || t('driver')}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => setProfileModalVisible(true)}
        >
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Bus Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('yourBus')}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('busNumber')}:</Text>
            <Text style={styles.infoValue}>🚌 {busInfo.bus_number}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('route')}:</Text>
            <Text style={styles.infoValue}>{busInfo.route_number}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('totalStops')}:</Text>
            <Text style={styles.infoValue}>{busInfo.stops?.length || 0}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('status')}:</Text>
            <Text style={[styles.infoValue, styles.statusText]}>
              {busInfo.status === 'active' ? `🟢 ${t('active')}` : `🔴 ${t('inactive')}`}
            </Text>
          </View>
        </View>

        {/* Battery Saver */}
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>{t('batterySaver')}</Text>
              <Text style={styles.switchSubtext}>
                {t('batterySaverDesc')}
              </Text>
            </View>
            <Switch
              value={batterySaver}
              onValueChange={setBatterySaver}
              trackColor={{ false: '#cbd5e1', true: '#10b981' }}
              thumbColor={batterySaver ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Offline Queue */}
        {offlineQueueSize > 0 && (
          <View style={styles.offlineCard}>
            <Text style={styles.offlineText}>
              📡 {offlineQueueSize} {t('locationQueued')}
            </Text>
          </View>
        )}

        {/* Start Journey Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={toggleTracking}
          disabled={!busInfo.stops || busInfo.stops.length === 0}
        >
          <Text style={styles.startButtonText}>
            🚀 {t('startJourney')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        visible={profileModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('driverProfile')}</Text>

            {busInfo.driver_photo_url && (
              <View style={styles.photoContainer}>
                <Text style={styles.photoPlaceholder}>👤</Text>
              </View>
            )}

            <View style={styles.profileInfo}>
              <Text style={styles.profileLabel}>{t('fullName')}:</Text>
              <Text style={styles.profileValue}>
                {busInfo.driver_full_name || t('notSet')}
              </Text>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileLabel}>{t('email')}:</Text>
              <Text style={styles.profileValue}>
                {busInfo.driver_email || user?.email}
              </Text>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileLabel}>{t('mobile')}:</Text>
              <Text style={styles.profileValue}>
                {busInfo.driver_mobile || t('notSet')}
              </Text>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileLabel}>{t('userId')}:</Text>
              <Text style={styles.profileValue}>{user?.id}</Text>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileLabel}>{t('selectRole')}:</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{t('driver')}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setProfileModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#dbeafe',
    marginTop: 4,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 24,
  },
  trackingHeader: {
    backgroundColor: '#1e3a8a',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  trackingSubtitle: {
    fontSize: 14,
    color: '#dbeafe',
    marginTop: 2,
  },
  stopButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  stopButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  statusText: {
    fontWeight: 'bold',
  },
  stopsList: {
    marginTop: 10,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  stopNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stopNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stopText: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  switchSubtext: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  offlineCard: {
    backgroundColor: '#fef3c7',
    margin: 15,
    marginTop: 0,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  offlineText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#10b981',
    margin: 15,
    marginBottom: 30,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '85%',
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 20,
    textAlign: 'center',
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#1e3a8a',
  },
  photoPlaceholder: {
    fontSize: 60,
  },
  profileInfo: {
    marginBottom: 15,
  },
  profileLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '600',
  },
  profileValue: {
    fontSize: 16,
    color: '#1e293b',
  },
  roleBadge: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  closeModalButton: {
    backgroundColor: '#e5e7eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeModalButtonText: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  trackingCard: {
    backgroundColor: 'white',
    width: '100%',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  trackingIcon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 15,
  },
  trackingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 8,
  },
  trackingSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  trackingStops: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  trackingStopsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  trackingStopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  trackingStopNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  trackingStopNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  trackingStopText: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
  trackingOffline: {
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  trackingOfflineText: {
    fontSize: 13,
    color: '#92400e',
    fontWeight: '600',
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  infoBar: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    padding: 15,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  infoBarItem: {
    alignItems: 'center',
  },
  infoBarLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  infoBarValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  infoBarDivider: {
    width: 1,
    backgroundColor: '#cbd5e1',
  },
});
