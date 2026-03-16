import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import RNFS from 'react-native-fs';
import { decode } from 'base64-arraybuffer';
import OSMMapView from '../components/OSMMapView';

interface Stop {
  name: string;
  latitude: number;
  longitude: number;
}

interface Stop {
  name: string;
  latitude: number;
  longitude: number;
}

interface Bus {
  id: string;
  bus_number: string;
  route_number: string;
  stops: string[]; // Legacy support
  stop_coordinates?: Stop[]; // New lat/lng based stops
  driver_id?: string;
  driver_full_name?: string;
  driver_mobile?: string;
  driver_email?: string;
  driver_password?: string;
  driver_photo_url?: string;
  status: string;
  created_at: string;
}

export default function ManageBuses({ navigation }: any) {
  const { user } = useAuth();
  const { t, colors } = useSettings();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [busNumber, setBusNumber] = useState('');
  const [routeNumber, setRouteNumber] = useState('');
  const [driverFullName, setDriverFullName] = useState('');
  const [driverMobile, setDriverMobile] = useState('');
  const [driverEmail, setDriverEmail] = useState('');
  const [driverPassword, setDriverPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [driverPhotoUrl, setDriverPhotoUrl] = useState('');
  const [stops, setStops] = useState<Stop[]>([]);
  const [currentStopName, setCurrentStopName] = useState('');
  const [currentStopLat, setCurrentStopLat] = useState('');
  const [currentStopLng, setCurrentStopLng] = useState('');
  const [uploading, setUploading] = useState(false);
  const [photoOptionsVisible, setPhotoOptionsVisible] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const { data, error } = await supabase
        .from('buses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setBuses(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const openAddModal = () => {
    setEditingBus(null);
    setBusNumber('');
    setRouteNumber('');
    setDriverFullName('');
    setDriverMobile('');
    setDriverEmail('');
    setDriverPassword('');
    setShowPassword(false);
    setDriverPhotoUrl('');
    setStops([]);
    setCurrentStopName('');
    setCurrentStopLat('');
    setCurrentStopLng('');
    setModalVisible(true);
  };

  const openEditModal = (bus: Bus) => {
    setEditingBus(bus);
    setBusNumber(bus.bus_number);
    setRouteNumber(bus.route_number);
    setDriverFullName(bus.driver_full_name || '');
    setDriverMobile(bus.driver_mobile || '');
    setDriverEmail(bus.driver_email || '');
    setDriverPassword(bus.driver_password || '');
    setShowPassword(false);
    setDriverPhotoUrl(bus.driver_photo_url || '');
    setStops(bus.stop_coordinates || []);
    setCurrentStopName('');
    setCurrentStopLat('');
    setCurrentStopLng('');
    setModalVisible(true);
  };

  const addStop = () => {
    const lat = parseFloat(currentStopLat);
    const lng = parseFloat(currentStopLng);
    
    if (!currentStopName.trim()) {
      Alert.alert(t('error'), t('enterStopName'));
      return;
    }
    
    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert(t('error'), t('validLatLng'));
      return;
    }
    
    if (lat < -90 || lat > 90) {
      Alert.alert(t('error'), t('latBetween'));
      return;
    }
    
    if (lng < -180 || lng > 180) {
      Alert.alert(t('error'), t('lngBetween'));
      return;
    }
    
    setStops([...stops, {
      name: currentStopName.trim(),
      latitude: lat,
      longitude: lng,
    }]);
    setCurrentStopName('');
    setCurrentStopLat('');
    setCurrentStopLng('');
  };

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const openMapPicker = () => {
    setMapModalVisible(true);
  };

  const handleMapLocationSelect = (latitude: number, longitude: number, address: string) => {
    setCurrentStopLat(latitude.toFixed(6));
    setCurrentStopLng(longitude.toFixed(6));
    if (!currentStopName.trim()) {
      // Extract first part of address as stop name
      const firstPart = address.split(',')[0].trim();
      setCurrentStopName(firstPart);
    }
    setMapModalVisible(false);
    Alert.alert(t('locationSelected'), `${t('latitude')}: ${latitude.toFixed(6)}, ${t('longitude')}: ${longitude.toFixed(6)}`);
  };

  const pickImage = () => {
    setPhotoOptionsVisible(true);
  };

  const handleCamera = async () => {
    setPhotoOptionsVisible(false);
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: false,
    });

    if (result.assets && result.assets[0]) {
      uploadPhoto(result.assets[0].uri!);
    }
  };

  const handleGallery = async () => {
    setPhotoOptionsVisible(false);
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets[0]) {
      uploadPhoto(result.assets[0].uri!);
    }
  };

  const uploadPhoto = async (uri: string) => {
    try {
      setUploading(true);

      // Read file as base64
      const base64 = await RNFS.readFile(uri, 'base64');

      const fileName = `driver-${Date.now()}.jpg`;
      const filePath = `driver-photos/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, decode(base64), {
          contentType: 'image/jpeg',
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      setDriverPhotoUrl(urlData.publicUrl);
      Alert.alert(t('success'), t('photoUploaded'));
    } catch (error: any) {
      Alert.alert(t('error'), error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!busNumber.trim() || !routeNumber.trim()) {
      Alert.alert(t('error'), t('fillBusRoute'));
      return;
    }

    if (stops.length === 0) {
      Alert.alert(t('error'), t('addAtLeastOneStop'));
      return;
    }

    // Validate email and password if provided
    if (driverEmail.trim() && !driverPassword.trim()) {
      Alert.alert(t('error'), t('enterDriverPassword'));
      return;
    }

    if (driverPassword.trim() && !driverEmail.trim()) {
      Alert.alert(t('error'), t('enterDriverEmail'));
      return;
    }

    if (driverEmail.trim() && !driverEmail.includes('@')) {
      Alert.alert(t('error'), t('validEmail'));
      return;
    }

    if (driverPassword.trim() && driverPassword.length < 6) {
      Alert.alert(t('error'), t('passwordMin6'));
      return;
    }

    try {
      // Create legacy stops array for backward compatibility
      const legacyStops = stops.map(stop => stop.name);
      
      if (editingBus) {
        // Update existing bus
        const { error } = await supabase
          .from('buses')
          .update({
            bus_number: busNumber,
            route_number: routeNumber,
            driver_full_name: driverFullName.trim() || null,
            driver_mobile: driverMobile.trim() || null,
            driver_email: driverEmail.trim() || null,
            driver_password: driverPassword.trim() || null,
            driver_photo_url: driverPhotoUrl || null,
            stops: legacyStops,
            stop_coordinates: stops,
          })
          .eq('id', editingBus.id);

        if (error) throw error;
        Alert.alert(t('success'), t('busUpdated'));
      } else {
        // Add new bus
        const { error } = await supabase.from('buses').insert({
          bus_number: busNumber,
          route_number: routeNumber,
          driver_full_name: driverFullName.trim() || null,
          driver_mobile: driverMobile.trim() || null,
          driver_email: driverEmail.trim() || null,
          driver_password: driverPassword.trim() || null,
          driver_photo_url: driverPhotoUrl || null,
          stops: legacyStops,
          stop_coordinates: stops,
          status: 'available',
        });

        if (error) throw error;
        Alert.alert(t('success'), t('busAdded'));
      }

      setModalVisible(false);
      fetchBuses();
    } catch (error: any) {
      Alert.alert(t('error'), error.message);
    }
  };

  const handleDelete = async (busId: string) => {
    Alert.alert(
      t('confirmDelete'),
      t('areYouSureDeleteBus'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('buses')
                .delete()
                .eq('id', busId);

              if (error) throw error;
              Alert.alert(t('success'), t('deleteSuccess'));
              fetchBuses();
            } catch (error: any) {
              Alert.alert(t('error'), error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('manageBuses')}</Text>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+ {t('addBus')}</Text>
          </TouchableOpacity>
        </View>

        {buses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('noBuses')}</Text>
            <Text style={styles.emptySubtext}>{t('tapAddBus')}</Text>
          </View>
        ) : (
          buses.map((bus) => (
            <View key={bus.id} style={styles.busCard}>
              <View style={styles.busHeader}>
                {bus.driver_photo_url && (
                  <Image
                    source={{ uri: bus.driver_photo_url }}
                    style={styles.driverPhoto}
                  />
                )}
                <View style={styles.busInfo}>
                  <Text style={styles.busNumber}>🚌 {bus.bus_number}</Text>
                  <Text style={styles.routeNumber}>{t('route')}: {bus.route_number}</Text>
                  {bus.driver_full_name && (
                    <Text style={styles.driverInfo}>👤 {bus.driver_full_name}</Text>
                  )}
                  {bus.driver_mobile && (
                    <Text style={styles.driverInfo}>📱 {bus.driver_mobile}</Text>
                  )}
                  <Text style={styles.stopsLabel}>{t('stops')}: {bus.stops?.length || 0}</Text>
                  {bus.stops && bus.stops.length > 0 && (
                    <View style={styles.stopsPreview}>
                      {bus.stops.slice(0, 2).map((stop, idx) => (
                        <Text key={idx} style={styles.stopText}>• {stop}</Text>
                      ))}
                      {bus.stops.length > 2 && (
                        <Text style={styles.stopText}>... +{bus.stops.length - 2} {t('more')}</Text>
                      )}
                    </View>
                  )}
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{bus.status === 'active' ? t('active') : t('inactive')}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditModal(bus)}
                >
                  <Text style={styles.editButtonText}>{t('edit')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(bus.id)}
                >
                  <Text style={styles.deleteButtonText}>{t('delete')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Map Picker Modal */}
      <Modal
        visible={mapModalVisible}
        animationType="slide"
        onRequestClose={() => setMapModalVisible(false)}
      >
        <View style={styles.mapPickerContainer}>
          <View style={styles.mapPickerHeader}>
            <Text style={styles.mapPickerTitle}>📍 {t('selectStopLocation')}</Text>
            <TouchableOpacity
              style={styles.mapCloseButton}
              onPress={() => setMapModalVisible(false)}
            >
              <Text style={styles.mapCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.mapPickerInstructions}>
            🔵 {t('tapToSelectStop')}
          </Text>
          <OSMMapView
            zoom={15}
            trackUserLocation={true}
            onMapClick={handleMapLocationSelect}
            onUserLocationUpdate={(lat, lng) => {
              console.log('User location:', lat, lng);
            }}
          />
        </View>
      </Modal>

      {/* Photo Options Modal */}
      <Modal
        visible={photoOptionsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoOptionsVisible(false)}
      >
        <View style={styles.photoModalOverlay}>
          <View style={styles.photoModalContent}>
            <Text style={styles.photoModalTitle}>{t('choosePhotoSource')}</Text>
            <TouchableOpacity
              style={styles.photoOptionButton}
              onPress={handleCamera}
            >
              <Text style={styles.photoOptionIcon}>📷</Text>
              <Text style={styles.photoOptionText}>{t('takePhoto')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.photoOptionButton}
              onPress={handleGallery}
            >
              <Text style={styles.photoOptionIcon}>🖼️</Text>
              <Text style={styles.photoOptionText}>{t('chooseFromGallery')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.photoCancelButton}
              onPress={() => setPhotoOptionsVisible(false)}
            >
              <Text style={styles.photoCancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingBus ? t('editBus') : t('addNewBus')}
              </Text>

              <Text style={styles.label}>{t('driverName')} ({t('optional')})</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., John Doe"
              value={driverFullName}
              onChangeText={setDriverFullName}
            />

            <Text style={styles.label}>{t('driverPhoto')} ({t('optional')})</Text>
            <View style={styles.photoSection}>
              {driverPhotoUrl ? (
                <View style={styles.photoPreview}>
                  <Image
                    source={{ uri: driverPhotoUrl }}
                    style={styles.photoImage}
                  />
                  <TouchableOpacity
                    style={styles.changePhotoButton}
                    onPress={pickImage}
                    disabled={uploading}
                  >
                    <Text style={styles.changePhotoText}>
                      {uploading ? t('uploading') : t('changePhoto')}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadPhotoButton}
                  onPress={pickImage}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color="#1e3a8a" />
                  ) : (
                    <>
                      <Text style={styles.uploadPhotoIcon}>📷</Text>
                      <Text style={styles.uploadPhotoText}>{t('addDriverPhoto')}</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.label}>{t('driverEmail')} ({t('optional')})</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., driver@example.com"
              value={driverEmail}
              onChangeText={setDriverEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>{t('driverPassword')} ({t('optional')})</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder={t('minimum6Chars')}
                value={driverPassword}
                onChangeText={setDriverPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>{t('driverMobile')} ({t('optional')})</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., +91 9876543210"
              value={driverMobile}
              onChangeText={setDriverMobile}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>{t('busNumber')}</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., BUS-001"
              value={busNumber}
              onChangeText={setBusNumber}
            />

            <Text style={styles.label}>{t('routeNumber')}</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Route-A or R-101"
              value={routeNumber}
              onChangeText={setRouteNumber}
            />

            <Text style={styles.label}>{t('busStops')}</Text>
            <Text style={styles.helperText}>
              📍 {t('enterStopName')}
            </Text>
            
            <View style={styles.stopInputContainer}>
              <TextInput
                style={[styles.stopInput, { flex: 2 }]}
                placeholder={t('stopName')}
                value={currentStopName}
                onChangeText={setCurrentStopName}
              />
            </View>
            
            <View style={styles.coordInputContainer}>
              <TextInput
                style={styles.coordInput}
                placeholder={t('latitude')}
                value={currentStopLat}
                onChangeText={setCurrentStopLat}
                keyboardType="decimal-pad"
              />
              <TextInput
                style={styles.coordInput}
                placeholder={t('longitude')}
                value={currentStopLng}
                onChangeText={setCurrentStopLng}
                keyboardType="decimal-pad"
              />
            </View>
            
            <View style={styles.stopButtonsContainer}>
              <TouchableOpacity 
                style={styles.mapPickerButton} 
                onPress={openMapPicker}
              >
                <Text style={styles.mapPickerText}>🗺️ {t('pickFromMap')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addStopButton} 
                onPress={addStop}
              >
                <Text style={styles.addStopText}>+ {t('addStop')}</Text>
              </TouchableOpacity>
            </View>

            {stops.length > 0 && (
              <View style={styles.stopsList}>
                {stops.map((stop, index) => (
                  <View key={index} style={styles.stopItem}>
                    <View style={styles.stopItemContent}>
                      <Text style={styles.stopItemText}>
                        {index + 1}. {stop.name}
                      </Text>
                      <Text style={styles.stopItemCoords}>
                        📍 {stop.latitude.toFixed(6)}, {stop.longitude.toFixed(6)}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => removeStop(index)}>
                      <Text style={styles.removeStopText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>{t('save')}</Text>
                </TouchableOpacity>
              </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1e3a8a',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  busCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  busHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  driverPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#1e3a8a',
  },
  busInfo: {
    flex: 1,
  },
  busNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  routeNumber: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 5,
  },
  driverInfo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  stopsLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 5,
  },
  stopsPreview: {
    marginBottom: 8,
    paddingLeft: 10,
  },
  stopText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  statusBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#dc2626',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
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
    width: '85%',
    maxHeight: '90%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeButton: {
    padding: 12,
  },
  eyeIcon: {
    fontSize: 20,
  },
  stopInputContainer: {
    marginBottom: 10,
  },
  coordInputContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  coordInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  stopButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  mapPickerButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  mapPickerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  stopItemContent: {
    flex: 1,
  },
  stopItemCoords: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  mapPickerContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  mapPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1e3a8a',
  },
  mapPickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  mapCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapCloseText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  mapPickerInstructions: {
    padding: 15,
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    fontSize: 14,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#dbeafe',
  },
  stopInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addStopButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addStopText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stopsList: {
    marginBottom: 15,
    maxHeight: 150,
  },
  stopItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 6,
    marginBottom: 5,
  },
  stopItemText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  removeStopText: {
    color: '#dc2626',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#1e3a8a',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  photoSection: {
    marginBottom: 15,
  },
  photoPreview: {
    alignItems: 'center',
  },
  photoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#1e3a8a',
  },
  changePhotoButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changePhotoText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  uploadPhotoButton: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  uploadPhotoIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  uploadPhotoText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  photoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoModalContent: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 15,
    padding: 20,
  },
  photoModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  photoOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  photoOptionIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  photoOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  photoCancelButton: {
    backgroundColor: '#e5e7eb',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  photoCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
});
