import React, { createContext, useContext, useEffect, useState } from 'react';
import NotificationService from '../services/NotificationService';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface NotificationContextType {
  isInitialized: boolean;
  unreadCount: number;
  notifications: any[];
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  isInitialized: false,
  unreadCount: 0,
  notifications: [],
  refreshNotifications: async () => {},
  markAsRead: async () => {},
  clearAll: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      initializeNotifications();
      subscribeToNotifications();
    }

    return () => {
      NotificationService.cleanup();
    };
  }, [user]);

  const initializeNotifications = async () => {
    if (!user?.id) return;

    try {
      await NotificationService.initialize(user.id);
      setIsInitialized(true);
      await refreshNotifications();
      
      // Start monitoring for proximity-based notifications
      const NotificationTriggerService = (await import('../services/NotificationTriggerService')).default;
      NotificationTriggerService.startMonitoring(user.id, user.user_metadata?.role || 'student');
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const subscribeToNotifications = () => {
    if (!user?.id) return;

    // Subscribe to new notifications from database
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('New notification:', payload);
          handleNewNotification(payload.new);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleNewNotification = async (notification: any) => {
    // Show local notification
    await NotificationService.scheduleLocalNotification(
      notification.title,
      notification.message,
      notification.data
    );

    // Refresh notifications list
    await refreshNotifications();
  };

  const refreshNotifications = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      const unread = data?.filter(n => !n.read).length || 0;
      setUnreadCount(unread);
      await NotificationService.setBadgeCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      await refreshNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const clearAll = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false);

      if (error) throw error;
      await refreshNotifications();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        isInitialized,
        unreadCount,
        notifications,
        refreshNotifications,
        markAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
