import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  type: 'bus_approaching' | 'route_change' | 'delay' | 'emergency' | 'reminder';
  busId?: string;
  routeId?: string;
  eta?: number;
  message?: string;
}

class NotificationService {
  private notificationListener: any;
  private responseListener: any;

  async initialize(userId: string) {
    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    // Get push token
    const token = await this.getPushToken();
    
    if (token) {
      // Save token to database
      await this.savePushToken(userId, token);
    }

    // Setup notification listeners
    this.setupListeners();

    return token;
  }

  async getPushToken() {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return null;
    }

    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push token:', token);
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  async savePushToken(userId: string, token: string) {
    try {
      const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';
      
      const { error } = await supabase
        .from('push_tokens')
        .upsert({
          user_id: userId,
          token,
          device_type: deviceType,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,token'
        });

      if (error) throw error;
      console.log('Push token saved successfully');
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  setupListeners() {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      const data = response.notification.request.content.data as NotificationData;
      this.handleNotificationTap(data);
    });
  }

  handleNotificationTap(data: NotificationData) {
    // Handle navigation based on notification type
    switch (data.type) {
      case 'bus_approaching':
        // Navigate to bus tracking map
        console.log('Navigate to bus tracking');
        break;
      case 'route_change':
        // Navigate to route details
        console.log('Navigate to route details');
        break;
      case 'emergency':
        // Show emergency alert
        console.log('Show emergency alert');
        break;
      default:
        console.log('Unknown notification type');
    }
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: NotificationData,
    trigger?: Notifications.NotificationTriggerInput
  ) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
        },
        trigger: trigger || null, // null means immediate
      });
      return id;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  async cancelNotification(notificationId: string) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getBadgeCount() {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Helper methods for specific notification types
  async sendBusApproachingNotification(busName: string, eta: number, busId: string) {
    return this.scheduleLocalNotification(
      '🚌 Bus Approaching!',
      `${busName} will arrive in ${eta} minutes`,
      {
        type: 'bus_approaching',
        busId,
        eta,
      }
    );
  }

  async sendRouteChangeNotification(routeName: string, message: string, routeId: string) {
    return this.scheduleLocalNotification(
      '🔄 Route Update',
      `${routeName}: ${message}`,
      {
        type: 'route_change',
        routeId,
        message,
      }
    );
  }

  async sendDelayNotification(busName: string, delayMinutes: number, busId: string) {
    return this.scheduleLocalNotification(
      '⏰ Bus Delayed',
      `${busName} is delayed by ${delayMinutes} minutes`,
      {
        type: 'delay',
        busId,
        eta: delayMinutes,
      }
    );
  }

  async sendEmergencyNotification(message: string) {
    return this.scheduleLocalNotification(
      '🚨 Emergency Alert',
      message,
      {
        type: 'emergency',
        message,
      }
    );
  }

  async sendDailyReminder(busName: string, time: string) {
    return this.scheduleLocalNotification(
      '📅 Bus Reminder',
      `Your bus ${busName} arrives at ${time}`,
      {
        type: 'reminder',
        message: time,
      }
    );
  }
}

export default new NotificationService();
