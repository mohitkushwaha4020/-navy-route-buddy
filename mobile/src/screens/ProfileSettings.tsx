import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function ProfileSettings({ navigation }: any) {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [driverPhotoUrl, setDriverPhotoUrl] = useState<string | null>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    email: user?.email || '',
    role: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          email: data.email || '',
          role: data.role || '',
        });

        // If user is a driver, fetch their photo from buses table
        if (data.role === 'driver') {
          const { data: busData } = await supabase
            .from('buses')
            .select('driver_photo_url')
            .eq('driver_id', user?.id)
            .single();

          if (busData?.driver_photo_url) {
            setDriverPhotoUrl(busData.driver_photo_url);
          }
        }

        // If user is a student, fetch student details
        if (data.role === 'student') {
          const { data: studentData } = await supabase
            .from('approved_students')
            .select('*')
            .eq('email', user?.email)
            .single();

          if (studentData) {
            setStudentDetails(studentData);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
        })
        .eq('id', user?.id);

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Show header only for non-students */}
      {profile.role !== 'student' && (
        <View style={styles.header}>
          <Text style={styles.title}>Profile Settings</Text>
        </View>
      )}

      <View style={styles.section}>
        {profile.role === 'driver' && driverPhotoUrl && (
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: driverPhotoUrl }}
              style={styles.profilePhoto}
            />
            <Text style={styles.photoLabel}>Driver Photo</Text>
          </View>
        )}

        {/* Student Details Card - Read Only */}
        {profile.role === 'student' && studentDetails ? (
          <>
            {studentDetails.profile_photo_url && (
              <View style={styles.photoContainer}>
                <Image
                  source={{ uri: studentDetails.profile_photo_url }}
                  style={styles.profilePhoto}
                />
              </View>
            )}
            
            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>📋 Student Information</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Student ID:</Text>
                <Text style={styles.detailValue}>{studentDetails.student_id}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Full Name:</Text>
                <Text style={styles.detailValue}>{studentDetails.full_name}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{studentDetails.email}</Text>
              </View>
              
              {studentDetails.phone && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone:</Text>
                  <Text style={styles.detailValue}>📱 {studentDetails.phone}</Text>
                </View>
              )}
              
              {studentDetails.pickup_address && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Pickup Address:</Text>
                  <Text style={styles.detailValue}>
                    📍 {studentDetails.pickup_address}
                  </Text>
                </View>
              )}
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Account Status:</Text>
                <Text style={[styles.detailValue, styles.approvedText]}>
                  {studentDetails.is_approved ? '✅ Approved' : '⏳ Pending'}
                </Text>
              </View>
            </View>
          </>
        ) : profile.role !== 'student' ? (
          <>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={profile.full_name}
              onChangeText={(text) => setProfile({ ...profile, full_name: text })}
              placeholder="Enter your full name"
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={profile.phone}
              onChangeText={(text) => setProfile({ ...profile, phone: text })}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={profile.email}
              editable={false}
            />

            <Text style={styles.label}>Role</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{profile.role?.toUpperCase()}</Text>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleUpdate}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Updating...' : 'Update Profile'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1e3a8a',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  section: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  roleBadge: {
    backgroundColor: '#1e3a8a',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#16a34a',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#1e3a8a',
  },
  photoLabel: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
    flex: 1,
    textAlign: 'right',
  },
  approvedText: {
    color: '#16a34a',
    fontWeight: 'bold',
  },
});
