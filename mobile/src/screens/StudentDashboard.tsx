import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Image,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { supabase } from '../lib/supabase';
import BusTrackingMap from '../components/BusTrackingMap';
import Geolocation from '@react-native-community/geolocation';

export default function StudentDashboard({ navigation }: any) {
  const { user } = useAuth();
  const { t, colors } = useSettings();
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [availableBuses, setAvailableBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [studentLocation, setStudentLocation] = useState<any>(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  useEffect(() => {
    fetchStudentDetails();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setStudentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.log('Location error:', error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);

      // Get student details
      const { data: student, error: studentError } = await supabase
        .from('approved_students')
        .select('*')
        .eq('email', user?.email)
        .single();

      if (studentError) throw studentError;

      setStudentDetails(student);

      // Get buses that stop at student's pickup address
      if (student?.pickup_address) {
        const { data: buses, error: busesError } = await supabase
          .from('buses')
          .select('*')
          .contains('stops', [student.pickup_address]);

        if (busesError) throw busesError;

        setAvailableBuses(buses || []);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStudentDetails();
    getCurrentLocation();
    setRefreshing(false);
  };

  const handleTrackBus = (bus: any) => {
    setSelectedBus(bus);
    setMapVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('dashboard')}</Text>
          <Text style={styles.headerSubtitle}>
            {t('welcomeBack')}, {studentDetails?.full_name}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => setProfileModalVisible(true)}
        >
          {studentDetails?.profile_photo_url ? (
            <Image
              source={{ uri: studentDetails.profile_photo_url }}
              style={styles.profileButtonImage}
            />
          ) : (
            <Text style={styles.profileIcon}>👤</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Available Buses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('availableBuses')} ({availableBuses.length})
          </Text>
          <Text style={styles.sectionSubtitle}>
            {t('busesStoppingAt')}
          </Text>

          {availableBuses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🚌</Text>
              <Text style={styles.emptyText}>{t('noBusesAvailable')}</Text>
              <Text style={styles.emptySubtext}>
                {t('contactAdmin')}
              </Text>
            </View>
          ) : (
            availableBuses.map((bus) => (
              <View key={bus.id} style={styles.busCard}>
                <View style={styles.busHeader}>
                  <View>
                    <Text style={styles.busNumber}>🚌 {bus.bus_number}</Text>
                    <Text style={styles.busRoute}>{t('route')}: {bus.route_number}</Text>
                  </View>
                  <View style={styles.busStatus}>
                    <Text style={styles.busStatusText}>
                      {bus.status === 'active' ? `🟢 ${t('active')}` : `🔴 ${t('inactive')}`}
                    </Text>
                  </View>
                </View>

                {bus.driver_full_name && (
                  <View style={styles.busInfo}>
                    <Text style={styles.busInfoText}>
                      👤 {t('driver')}: {bus.driver_full_name}
                    </Text>
                  </View>
                )}

                {bus.driver_mobile && (
                  <View style={styles.busInfo}>
                    <Text style={styles.busInfoText}>
                      📱 {t('phoneNumber')}: {bus.driver_mobile}
                    </Text>
                  </View>
                )}

                <View style={styles.busInfo}>
                  <Text style={styles.busInfoText}>
                    🛑 {t('totalStops')}: {bus.stops?.length || 0}
                  </Text>
                </View>

                {/* Stops Preview */}
                {bus.stops && bus.stops.length > 0 && (
                  <View style={styles.stopsPreview}>
                    <Text style={styles.stopsTitle}>{t('route')} {t('busStops')}:</Text>
                    {bus.stops.slice(0, 3).map((stop: string, idx: number) => (
                      <Text key={idx} style={styles.stopText}>
                        {idx + 1}. {stop}
                        {stop === studentDetails?.pickup_address && (
                          <Text style={styles.yourStop}> ({t('yourStop')})</Text>
                        )}
                      </Text>
                    ))}
                    {bus.stops.length > 3 && (
                      <Text style={styles.moreStops}>
                        ... +{bus.stops.length - 3} {t('moreStops')}
                      </Text>
                    )}
                  </View>
                )}

                {/* Track Button */}
                <TouchableOpacity
                  style={styles.trackButton}
                  onPress={() => handleTrackBus(bus)}
                >
                  <Text style={styles.trackButtonText}>
                    📍 {t('trackOnMap')}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bus Tracking Map Modal */}
      {selectedBus && (
        <BusTrackingMap
          visible={mapVisible}
          onClose={() => setMapVisible(false)}
          bus={selectedBus}
          studentLocation={studentLocation}
        />
      )}

      {/* Student Profile Modal */}
      <Modal
        visible={profileModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Profile Photo */}
              {studentDetails?.profile_photo_url && (
                <View style={styles.modalPhotoContainer}>
                  <Image
                    source={{ uri: studentDetails.profile_photo_url }}
                    style={styles.modalProfilePhoto}
                  />
                </View>
              )}

              {/* Student Information Card */}
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>📋 {t('studentInformation')}</Text>
                
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>{t('studentId')}:</Text>
                  <Text style={styles.modalDetailValue}>{studentDetails?.student_id}</Text>
                </View>
                
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>{t('fullName')}:</Text>
                  <Text style={styles.modalDetailValue}>{studentDetails?.full_name}</Text>
                </View>
                
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>{t('email')}:</Text>
                  <Text style={styles.modalDetailValue}>{studentDetails?.email}</Text>
                </View>
                
                {studentDetails?.phone && (
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>{t('phoneNumber')}:</Text>
                    <Text style={styles.modalDetailValue}>📱 {studentDetails.phone}</Text>
                  </View>
                )}
                
                {studentDetails?.pickup_address && (
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>{t('pickupLocation')}:</Text>
                    <Text style={styles.modalDetailValue}>
                      📍 {studentDetails.pickup_address}
                    </Text>
                  </View>
                )}
                
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>{t('accountStatus')}:</Text>
                  <Text style={[styles.modalDetailValue, styles.approvedText]}>
                    {studentDetails?.is_approved ? `✅ ${t('approved')}` : `⏳ ${t('pendingApproval')}`}
                  </Text>
                </View>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setProfileModalVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>{t('close')}</Text>
              </TouchableOpacity>
            </ScrollView>
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
    overflow: 'hidden',
  },
  profileButtonImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  profileIcon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 15,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 15,
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 10,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  busCard: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  busHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  busNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  busRoute: {
    fontSize: 14,
    color: '#3b82f6',
    marginTop: 2,
  },
  busStatus: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#f0f9ff',
  },
  busStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  busInfo: {
    marginBottom: 8,
  },
  busInfoText: {
    fontSize: 14,
    color: '#64748b',
  },
  stopsPreview: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  stopsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  stopText: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  yourStop: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  moreStops: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 4,
  },
  trackButton: {
    backgroundColor: '#10b981',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  trackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    maxHeight: '80%',
    borderRadius: 15,
    padding: 20,
  },
  modalPhotoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalProfilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#1e3a8a',
  },
  modalCard: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 15,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalDetailLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  modalDetailValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  approvedText: {
    color: '#16a34a',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: '#1e3a8a',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
