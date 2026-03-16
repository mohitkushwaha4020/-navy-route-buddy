import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useNotifications } from '../contexts/NotificationContext';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

interface SideDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export default function SideDrawer({ visible, onClose }: SideDrawerProps) {
  const { user, signOut } = useAuth();
  const { t, colors } = useSettings();
  const { unreadCount } = useNotifications();
  const navigation = useNavigation();
  const [slideAnim] = useState(new Animated.Value(-DRAWER_WIDTH));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    drawer: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: DRAWER_WIDTH,
      backgroundColor: colors.card,
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    header: {
      backgroundColor: colors.primary,
      padding: 20,
      paddingTop: 50,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 5,
    },
    headerSubtitle: {
      fontSize: 14,
      color: '#93c5fd',
    },
    menuItems: {
      flex: 1,
      paddingTop: 20,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuIcon: {
      fontSize: 24,
      marginRight: 15,
    },
    menuText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    footer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    footerText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    badge: {
      backgroundColor: '#ef4444',
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 'auto',
    },
    badgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.drawer,
                { transform: [{ translateX: slideAnim }] },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('dashboard')}</Text>
                <Text style={styles.headerSubtitle}>
                  {user?.user_metadata?.role?.toUpperCase() || 'USER'}
                </Text>
              </View>

              {/* Menu Items */}
              <View style={styles.menuItems}>
                {user?.user_metadata?.role === 'admin' && (
                  <>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        navigation.navigate('ManageBuses' as never);
                        onClose();
                      }}
                    >
                      <Text style={styles.menuIcon}>🚌</Text>
                      <Text style={styles.menuText}>{t('manageBuses')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        navigation.navigate('ActiveRoutesMap' as never);
                        onClose();
                      }}
                    >
                      <Text style={styles.menuIcon}>🗺️</Text>
                      <Text style={styles.menuText}>{t('activeRoutes')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        navigation.navigate('ManageStudents' as never);
                        onClose();
                      }}
                    >
                      <Text style={styles.menuIcon}>🎓</Text>
                      <Text style={styles.menuText}>{t('manageStudents')}</Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    navigation.navigate('Settings' as never);
                    onClose();
                  }}
                >
                  <Text style={styles.menuIcon}>⚙️</Text>
                  <Text style={styles.menuText}>{t('settings')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    navigation.navigate('Notifications' as never);
                    onClose();
                  }}
                >
                  <Text style={styles.menuIcon}>🔔</Text>
                  <Text style={styles.menuText}>{t('notifications')}</Text>
                  {unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleLogout}
                >
                  <Text style={styles.menuIcon}>🚪</Text>
                  <Text style={styles.menuText}>{t('logout')}</Text>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {user?.email}
                </Text>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
