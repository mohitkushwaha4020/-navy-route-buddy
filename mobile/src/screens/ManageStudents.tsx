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
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';
import { useSettings } from '../contexts/SettingsContext';

interface Student {
  id: string;
  student_id: string;
  full_name: string;
  password: string;
  email?: string;
  phone?: string;
  is_approved: boolean;
  created_at: string;
}

export default function ManageStudents({ navigation }: any) {
  const { t } = useSettings();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentId, setStudentId] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupAddressSearch, setPickupAddressSearch] = useState('');
  const [allPickupAddresses, setAllPickupAddresses] = useState<string[]>([]);
  const [filteredPickupAddresses, setFilteredPickupAddresses] = useState<string[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchAllPickupAddresses();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('approved_students')
        .select('*')
        .order('created_at', { ascending: false});

      if (error) throw error;
      if (data) {
        setStudents(data);
        setFilteredStudents(data);
      }
    } catch (error: any) {
      Alert.alert(t('error'), error.message);
    }
  };

  const fetchAllPickupAddresses = async () => {
    try {
      // Get all unique stops from all buses
      const { data, error } = await supabase
        .from('buses')
        .select('stops');

      if (error) throw error;
      
      if (data) {
        // Flatten all stops arrays and get unique addresses
        const allStops = data.flatMap(bus => bus.stops || []);
        const uniqueStops = Array.from(new Set(allStops)).sort();
        setAllPickupAddresses(uniqueStops);
      }
    } catch (error: any) {
      console.error('Error fetching pickup addresses:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter((student) => {
        const searchLower = query.toLowerCase();
        return (
          student.full_name.toLowerCase().includes(searchLower) ||
          student.student_id.toLowerCase().includes(searchLower) ||
          (student.email && student.email.toLowerCase().includes(searchLower)) ||
          (student.phone && student.phone.includes(query))
        );
      });
      setFilteredStudents(filtered);
    }
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setStudentId('');
    setFullName('');
    setPassword('');
    setShowPassword(false);
    setEmail('');
    setPhone('');
    setPickupAddress('');
    setPickupAddressSearch('');
    setShowAddressSuggestions(false);
    setProfilePhotoUri(null);
    setProfilePhotoUrl(null);
    setModalVisible(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setStudentId(student.student_id);
    setFullName(student.full_name);
    setPassword(student.password);
    setShowPassword(false);
    setEmail(student.email || '');
    setPhone(student.phone || '');
    const address = (student as any).pickup_address || '';
    setPickupAddress(address);
    setPickupAddressSearch(address);
    setShowAddressSuggestions(false);
    setProfilePhotoUri(null);
    setProfilePhotoUrl((student as any).profile_photo_url || null);
    setModalVisible(true);
  };

  const handleSelectPhoto = () => {
    const options = [t('takePhoto'), t('chooseFromGallery'), t('cancel')];
    const cancelButtonIndex = 2;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            openCamera();
          } else if (buttonIndex === 1) {
            openGallery();
          }
        }
      );
    } else {
      // For Android, show Alert with options
      Alert.alert(
        t('addDriverPhoto'),
        t('choosePhotoSource'),
        [
          {
            text: t('takePhoto'),
            onPress: openCamera,
          },
          {
            text: t('chooseFromGallery'),
            onPress: openGallery,
          },
          {
            text: t('cancel'),
            style: 'cancel',
          },
        ]
      );
    }
  };

  const openCamera = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
        saveToPhotos: true,
      },
      (response) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Failed to take photo');
          return;
        }
        if (response.assets && response.assets[0]) {
          setProfilePhotoUri(response.assets[0].uri || null);
        }
      }
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
      },
      (response) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Failed to select image');
          return;
        }
        if (response.assets && response.assets[0]) {
          setProfilePhotoUri(response.assets[0].uri || null);
        }
      }
    );
  };

  const uploadProfilePhoto = async (studentId: string): Promise<string | null> => {
    if (!profilePhotoUri) return profilePhotoUrl;

    try {
      setUploadingPhoto(true);

      // Read file as base64
      const base64 = await RNFS.readFile(profilePhotoUri, 'base64');
      const arrayBuffer = decode(base64);

      // Generate unique filename
      const fileExt = profilePhotoUri.split('.').pop();
      const fileName = `${studentId}_${Date.now()}.${fileExt}`;
      const filePath = `student-photos/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload photo');
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!studentId.trim() || !fullName.trim() || !password.trim() || !email.trim()) {
      Alert.alert('Error', 'Please fill Student ID, Full Name, Email and Password');
      return;
    }

    if (!pickupAddress) {
      Alert.alert('Error', 'Please select a pickup address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      // Upload photo if selected
      const photoUrl = await uploadProfilePhoto(studentId);

      if (editingStudent) {
        // Update existing student
        const updateData: any = {
          student_id: studentId,
          full_name: fullName,
          password: password,
          email: email || null,
          phone: phone || null,
          pickup_address: pickupAddress,
        };

        if (photoUrl) {
          updateData.profile_photo_url = photoUrl;
        }

        const { error } = await supabase
          .from('approved_students')
          .update(updateData)
          .eq('id', editingStudent.id);

        if (error) throw error;
        Alert.alert('Success', 'Student updated successfully');
      } else {
        // Add new student - first create Supabase auth account
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
              data: {
                role: 'student',
                full_name: fullName,
              }
            }
          });

          if (authError && !authError.message.includes('already registered')) {
            throw authError;
          }
        } catch (authErr: any) {
          // If auth creation fails (except already registered), show error
          if (!authErr.message.includes('already registered')) {
            Alert.alert('Error', 'Failed to create auth account: ' + authErr.message);
            return;
          }
        }

        // Then add to approved_students table
        const insertData: any = {
          student_id: studentId,
          full_name: fullName,
          password: password,
          email: email,
          phone: phone || null,
          pickup_address: pickupAddress,
          is_approved: true,
        };

        if (photoUrl) {
          insertData.profile_photo_url = photoUrl;
        }

        const { error } = await supabase.from('approved_students').insert(insertData);

        if (error) throw error;
        Alert.alert('Success', 'Student added successfully and account created');
      }

      setModalVisible(false);
      fetchStudents();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to remove this student?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('approved_students')
                .delete()
                .eq('id', id);

              if (error) throw error;
              Alert.alert('Success', 'Student removed successfully');
              fetchStudents();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const toggleApproval = async (student: Student) => {
    try {
      const { error } = await supabase
        .from('approved_students')
        .update({ is_approved: !student.is_approved })
        .eq('id', student.id);

      if (error) throw error;
      Alert.alert('Success', `Student ${!student.is_approved ? 'approved' : 'suspended'}`);
      fetchStudents();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Students</Text>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+ Add Student</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, ID, email or phone..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => handleSearch('')}
                style={styles.clearButton}
              >
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ️ Only students added here can login with student role
          </Text>
        </View>

        {filteredStudents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No students found' : 'No students added yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : 'Tap "Add Student" to get started'}
            </Text>
          </View>
        ) : (
          <>
            {searchQuery.length > 0 && (
              <View style={styles.resultCount}>
                <Text style={styles.resultText}>
                  Found {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
            {filteredStudents.map((student) => (
            <View key={student.id} style={styles.studentCard}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>👤 {student.full_name}</Text>
                <Text style={styles.studentId}>ID: {student.student_id}</Text>
                {student.email && (
                  <Text style={styles.studentDetail}>📧 {student.email}</Text>
                )}
                {student.phone && (
                  <Text style={styles.studentDetail}>📱 {student.phone}</Text>
                )}
                {(student as any).pickup_address && (
                  <Text style={styles.studentDetail}>📍 Pickup: {(student as any).pickup_address}</Text>
                )}
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: student.is_approved ? '#10b981' : '#dc2626' }
                ]}>
                  <Text style={styles.statusText}>
                    {student.is_approved ? 'Approved' : 'Suspended'}
                  </Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={() => toggleApproval(student)}
                >
                  <Text style={styles.toggleButtonText}>
                    {student.is_approved ? 'Suspend' : 'Approve'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditModal(student)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(student.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            ))}
          </>
        )}
      </ScrollView>

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
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </Text>

              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., John Doe"
                value={fullName}
                onChangeText={setFullName}
              />

              <Text style={styles.label}>Student ID *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., STU-2024-001"
                value={studentId}
                onChangeText={setStudentId}
              />

              <Text style={styles.label}>Profile Photo (Optional)</Text>
              <View style={styles.photoSection}>
                {(profilePhotoUri || profilePhotoUrl) && (
                  <Image
                    source={{ uri: profilePhotoUri || profilePhotoUrl || '' }}
                    style={styles.photoPreview}
                  />
                )}
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={handleSelectPhoto}
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.photoButtonText}>
                      {profilePhotoUri || profilePhotoUrl ? '📷 Change Photo' : '📷 Add Photo'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., student@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Phone (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., +91 9876543210"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Select Pickup Address *</Text>
              <Text style={styles.helperText}>
                Type to search and select from available pickup points
              </Text>
              <View style={styles.addressInputContainer}>
                <TextInput
                  style={styles.addressInput}
                  placeholder="Type pickup address..."
                  value={pickupAddressSearch}
                  onChangeText={(text) => {
                    setPickupAddressSearch(text);
                    if (text.trim() === '') {
                      setFilteredPickupAddresses([]);
                      setShowAddressSuggestions(false);
                      setPickupAddress('');
                    } else {
                      const filtered = allPickupAddresses.filter(addr =>
                        addr.toLowerCase().includes(text.toLowerCase())
                      );
                      setFilteredPickupAddresses(filtered);
                      setShowAddressSuggestions(filtered.length > 0);
                    }
                  }}
                  onFocus={() => {
                    if (pickupAddressSearch.trim() !== '') {
                      const filtered = allPickupAddresses.filter(addr =>
                        addr.toLowerCase().includes(pickupAddressSearch.toLowerCase())
                      );
                      setFilteredPickupAddresses(filtered);
                      setShowAddressSuggestions(filtered.length > 0);
                    }
                  }}
                />
                {pickupAddressSearch.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearAddressButton}
                    onPress={() => {
                      setPickupAddressSearch('');
                      setPickupAddress('');
                      setFilteredPickupAddresses([]);
                      setShowAddressSuggestions(false);
                    }}
                  >
                    <Text style={styles.clearAddressIcon}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {showAddressSuggestions && filteredPickupAddresses.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView style={styles.suggestionsList} nestedScrollEnabled>
                    {filteredPickupAddresses.map((address, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setPickupAddress(address);
                          setPickupAddressSearch(address);
                          setShowAddressSuggestions(false);
                        }}
                      >
                        <Text style={styles.suggestionIcon}>📍</Text>
                        <Text style={styles.suggestionText}>{address}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {filteredPickupAddresses.length === 0 && pickupAddressSearch.trim() !== '' && (
                <View style={styles.noResultsBox}>
                  <Text style={styles.noResultsText}>
                    ⚠️ No matching pickup points found
                  </Text>
                </View>
              )}
              
              {pickupAddress && (
                <View style={styles.selectedAddressBox}>
                  <Text style={styles.selectedAddressLabel}>✓ Selected Pickup Point:</Text>
                  <Text style={styles.selectedAddressText}>{pickupAddress}</Text>
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Save</Text>
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
  searchContainer: {
    padding: 15,
    paddingBottom: 0,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 8,
  },
  clearIcon: {
    fontSize: 18,
    color: '#999',
    fontWeight: 'bold',
  },
  resultCount: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  resultText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#dbeafe',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoText: {
    color: '#1e40af',
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
  studentCard: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 0,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentInfo: {
    marginBottom: 10,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  studentId: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 5,
  },
  studentDetail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    backgroundColor: '#f59e0b',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
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
    fontSize: 12,
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
    fontSize: 12,
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
    maxHeight: '80%',
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
  pickerContainer: {
    marginBottom: 15,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  selectedAddressBox: {
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  selectedAddressLabel: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedAddressText: {
    fontSize: 14,
    color: '#1e3a8a',
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  addressInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  addressInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  clearAddressButton: {
    padding: 12,
  },
  clearAddressIcon: {
    fontSize: 18,
    color: '#999',
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 10,
    maxHeight: 150,
  },
  suggestionsList: {
    maxHeight: 150,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  noResultsBox: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  noResultsText: {
    fontSize: 12,
    color: '#92400e',
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#1e3a8a',
  },
  photoButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  photoButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
