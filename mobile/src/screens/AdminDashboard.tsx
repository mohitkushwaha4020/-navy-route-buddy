import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, RefreshControl, Modal } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { supabase } from '../lib/supabase';

export default function AdminDashboard({ navigation }: any) {
  const { user } = useAuth();
  const { t, colors } = useSettings();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    totalStudents: 0,
    activeRoutes: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Subscribe to real-time updates
    const profilesSubscription = supabase
      .channel('profiles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchData();
      })
      .subscribe();

    const routesSubscription = supabase
      .channel('routes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'routes' }, () => {
        fetchRoutes();
      })
      .subscribe();

    return () => {
      profilesSubscription.unsubscribe();
      routesSubscription.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchStats(), fetchUsers(), fetchRoutes()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const fetchStats = async () => {
    try {
      const { data: profiles } = await supabase.from('profiles').select('role');
      const { data: activeRoutes } = await supabase
        .from('routes')
        .select('id')
        .eq('status', 'active');
      
      if (profiles) {
        const drivers = profiles.filter((p: any) => p.role === 'driver');
        const students = profiles.filter((p: any) => p.role === 'student');
        
        setStats({
          totalUsers: profiles.length,
          totalDrivers: drivers.length,
          totalStudents: students.length,
          activeRoutes: activeRoutes?.length || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchRoutes = async () => {
    try {
      const { data } = await supabase
        .from('routes')
        .select(`
          *,
          driver:profiles!routes_driver_id_fkey(email, full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (data) {
        setRoutes(data);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };



  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      backgroundColor: colors.primary,
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
    profileButton: {
      backgroundColor: 'white',
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 5,
    },
    profileIcon: {
      fontSize: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 5,
    },
    subtitle: {
      fontSize: 14,
      color: '#e0e0e0',
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 15,
      paddingTop: 20,
      gap: 12,
    },
    statCard: {
      width: '47%',
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 16,
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    statNumber: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 5,
    },
    section: {
      padding: 15,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 15,
    },
    userCard: {
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 8,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    userEmail: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
    },
    userName: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    userRole: {
      fontSize: 12,
      color: colors.textSecondary,
      backgroundColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 5,
      textTransform: 'capitalize',
    },
    routeCard: {
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 8,
      marginBottom: 10,
    },
    routeName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 5,
    },
    routeDriver: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    statusBadge: {
      backgroundColor: colors.success,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.card,
      width: '85%',
      borderRadius: 10,
      padding: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primary,
    },
    closeButton: {
      fontSize: 24,
      color: colors.textSecondary,
      fontWeight: 'bold',
    },
    profileRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    profileLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    profileValue: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
      textAlign: 'right',
    },
    closeModalButton: {
      backgroundColor: colors.primary,
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    closeModalText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t('adminDashboard')}</Text>
            <Text style={styles.subtitle}>{t('welcomeBack')}, {user?.email}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => setProfileModalVisible(true)}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>{t('totalUsers')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalDrivers}</Text>
          <Text style={styles.statLabel}>{t('totalDrivers')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalStudents}</Text>
          <Text style={styles.statLabel}>{t('totalStudents')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.activeRoutes}</Text>
          <Text style={styles.statLabel}>{t('activeRoutes')}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('activeRoutes')}</Text>
        {routes.filter(r => r.status === 'active').map((route) => (
          <View key={route.id} style={styles.routeCard}>
            <Text style={styles.routeName}>{route.name}</Text>
            <Text style={styles.routeDriver}>
              {t('driver')}: {route.driver?.full_name || route.driver?.email || t('notAssigned')}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{t('active')}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('recentUsers')}</Text>
        {users.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userName}>{user.full_name || t('noName')}</Text>
            </View>
            <Text style={styles.userRole}>{user.role || t('noRole')}</Text>
          </View>
        ))}
      </View>
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        visible={profileModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>👤 {t('myProfile')}</Text>
              <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>{t('selectRole')}:</Text>
                <Text style={styles.profileValue}>{t('admin')}</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>{t('email')}:</Text>
                <Text style={styles.profileValue}>{user?.email}</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>{t('userId')}:</Text>
                <Text style={styles.profileValue}>{user?.id}</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>{t('totalUsers')}:</Text>
                <Text style={styles.profileValue}>{stats.totalUsers}</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>{t('activeRoutes')}:</Text>
                <Text style={styles.profileValue}>{stats.activeRoutes}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setProfileModalVisible(false)}
            >
              <Text style={styles.closeModalText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


