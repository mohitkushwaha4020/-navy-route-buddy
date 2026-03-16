import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { supabase } from '../lib/supabase';

interface NotificationPreferences {
  bus_approaching: boolean;
  route_changes: boolean;
  delays: boolean;
  emergency_alerts: boolean;
  daily_reminders: boolean;
}

const NotificationSettingsScreen = () => {
  const { user } = useAuth();
  const { isDarkMode } = useSettings();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    bus_approaching: true,
    route_changes: true,
    delays: true,
    emergency_alerts: true,
    daily_reminders: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data?.notification_preferences) {
        setPreferences(data.notification_preferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: newPreferences })
        .eq('id', user?.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating preferences:', error);
      Alert.alert('Error', 'Failed to update notification preferences');
      // Revert on error
      setPreferences(preferences);
    }
  };

  const notificationTypes = [
    {
      key: 'bus_approaching' as keyof NotificationPreferences,
      icon: '🚌',
      title: 'Bus Approaching',
      description: 'Get notified when your bus is nearby',
    },
    {
      key: 'route_changes' as keyof NotificationPreferences,
      icon: '🔄',
      title: 'Route Changes',
      description: 'Updates about route modifications',
    },
    {
      key: 'delays' as keyof NotificationPreferences,
      icon: '⏰',
      title: 'Delays',
      description: 'Alerts about bus delays',
    },
    {
      key: 'emergency_alerts' as keyof NotificationPreferences,
      icon: '🚨',
      title: 'Emergency Alerts',
      description: 'Critical safety notifications',
    },
    {
      key: 'daily_reminders' as keyof NotificationPreferences,
      icon: '📅',
      title: 'Daily Reminders',
      description: 'Daily bus schedule reminders',
    },
  ];

  if (loading) {
    return (
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>
          Notification Preferences
        </Text>
        <Text style={[styles.headerSubtitle, isDarkMode && styles.darkSubText]}>
          Choose which notifications you want to receive
        </Text>
      </View>

      <View style={styles.section}>
        {notificationTypes.map((type) => (
          <View
            key={type.key}
            style={[styles.preferenceItem, isDarkMode && styles.darkCard]}
          >
            <View style={styles.preferenceLeft}>
              <Text style={styles.preferenceIcon}>{type.icon}</Text>
              <View style={styles.preferenceText}>
                <Text style={[styles.preferenceTitle, isDarkMode && styles.darkText]}>
                  {type.title}
                </Text>
                <Text style={[styles.preferenceDescription, isDarkMode && styles.darkSubText]}>
                  {type.description}
                </Text>
              </View>
            </View>
            <Switch
              value={preferences[type.key]}
              onValueChange={(value) => updatePreference(type.key, value)}
              trackColor={{ false: '#767577', true: '#93c5fd' }}
              thumbColor={preferences[type.key] ? '#1e3a8a' : '#f4f3f4'}
            />
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, isDarkMode && styles.darkSubText]}>
          💡 Emergency alerts cannot be disabled for safety reasons
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  darkText: {
    color: '#fff',
  },
  darkSubText: {
    color: '#aaa',
  },
  darkCard: {
    backgroundColor: '#2a2a2a',
  },
  section: {
    marginTop: 20,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  preferenceText: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 13,
    color: '#666',
  },
  footer: {
    padding: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default NotificationSettingsScreen;
