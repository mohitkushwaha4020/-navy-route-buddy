import { supabase } from '../lib/supabase';
import NotificationService from './NotificationService';

/**
 * Service to trigger notifications based on various events
 */
class NotificationTriggerService {
  private locationCheckInterval: NodeJS.Timeout | null = null;
  private readonly PROXIMITY_THRESHOLD = 1000; // meters
  private readonly CHECK_INTERVAL = 30000; // 30 seconds

  /**
   * Start monitoring for notification triggers
   */
  startMonitoring(userId: string, userRole: string) {
    if (userRole === 'student') {
      this.startProximityMonitoring(userId);
    }
  }

  /**
   * Stop all monitoring
   */
  stopMonitoring() {
    if (this.locationCheckInterval) {
      clearInterval(this.locationCheckInterval);
      this.locationCheckInterval = null;
    }
  }

  /**
   * Monitor bus proximity for students
   */
  private async startProximityMonitoring(studentId: string) {
    this.locationCheckInterval = setInterval(async () => {
      await this.checkBusProximity(studentId);
    }, this.CHECK_INTERVAL);
  }

  /**
   * Check if student's bus is approaching
   */
  private async checkBusProximity(studentId: string) {
    try {
      // Get student's route and bus
      const { data: routeStudent, error: routeError } = await supabase
        .from('route_students')
        .select(`
          *,
          routes!inner(
            id,
            name,
            driver_id,
            status
          )
        `)
        .eq('student_id', studentId)
        .eq('routes.status', 'active')
        .single();

      if (routeError || !routeStudent) return;

      // Get driver's current location
      const { data: driverLocation, error: locationError } = await supabase
        .from('locations')
        .select('*')
        .eq('user_id', routeStudent.routes.driver_id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (locationError || !driverLocation) return;

      // Get student's pickup location (assuming it's stored as coordinates)
      const { data: studentStop, error: stopError } = await supabase
        .from('stop_coordinates')
        .select('*')
        .eq('address', routeStudent.pickup_location)
        .single();

      if (stopError || !studentStop) return;

      // Calculate distance
      const distance = this.calculateDistance(
        driverLocation.latitude,
        driverLocation.longitude,
        studentStop.latitude,
        studentStop.longitude
      );

      // If bus is within threshold, send notification
      if (distance <= this.PROXIMITY_THRESHOLD) {
        const eta = Math.ceil(distance / 250); // Rough estimate: 250m per minute
        
        // Check if notification was already sent recently
        const { data: recentNotif } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', studentId)
          .eq('type', 'info')
          .gte('created_at', new Date(Date.now() - 600000).toISOString()) // Last 10 minutes
          .like('title', '%Bus Approaching%')
          .single();

        if (!recentNotif) {
          await this.sendBusApproachingNotification(
            studentId,
            routeStudent.routes.name,
            eta
          );
        }
      }
    } catch (error) {
      console.error('Error checking bus proximity:', error);
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Send bus approaching notification
   */
  async sendBusApproachingNotification(
    userId: string,
    busName: string,
    eta: number
  ) {
    try {
      // Create notification in database
      const { error } = await supabase.from('notifications').insert({
        user_id: userId,
        title: '🚌 Bus Approaching!',
        message: `${busName} will arrive in approximately ${eta} minutes`,
        type: 'info',
        data: { type: 'bus_approaching', busName, eta },
      });

      if (error) throw error;

      // Local notification will be triggered by the NotificationContext subscription
    } catch (error) {
      console.error('Error sending bus approaching notification:', error);
    }
  }

  /**
   * Send route change notification to all students on a route
   */
  async sendRouteChangeNotification(
    routeId: string,
    routeName: string,
    message: string
  ) {
    try {
      // Get all students on this route
      const { data: students, error } = await supabase
        .from('route_students')
        .select('student_id')
        .eq('route_id', routeId);

      if (error || !students) return;

      // Create notifications for all students
      const notifications = students.map(s => ({
        user_id: s.student_id,
        title: '🔄 Route Update',
        message: `${routeName}: ${message}`,
        type: 'warning',
        data: { type: 'route_change', routeId, routeName, message },
      }));

      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) throw insertError;
    } catch (error) {
      console.error('Error sending route change notification:', error);
    }
  }

  /**
   * Send delay notification
   */
  async sendDelayNotification(
    routeId: string,
    busName: string,
    delayMinutes: number
  ) {
    try {
      const { data: students, error } = await supabase
        .from('route_students')
        .select('student_id')
        .eq('route_id', routeId);

      if (error || !students) return;

      const notifications = students.map(s => ({
        user_id: s.student_id,
        title: '⏰ Bus Delayed',
        message: `${busName} is delayed by ${delayMinutes} minutes`,
        type: 'warning',
        data: { type: 'delay', routeId, busName, delayMinutes },
      }));

      await supabase.from('notifications').insert(notifications);
    } catch (error) {
      console.error('Error sending delay notification:', error);
    }
  }

  /**
   * Send emergency alert to all users
   */
  async sendEmergencyAlert(message: string, targetRole?: string) {
    try {
      let query = supabase.from('profiles').select('id');
      
      if (targetRole) {
        query = query.eq('role', targetRole);
      }

      const { data: users, error } = await query;

      if (error || !users) return;

      const notifications = users.map(u => ({
        user_id: u.id,
        title: '🚨 Emergency Alert',
        message,
        type: 'alert',
        data: { type: 'emergency', message },
      }));

      await supabase.from('notifications').insert(notifications);
    } catch (error) {
      console.error('Error sending emergency alert:', error);
    }
  }

  /**
   * Schedule daily reminder for students
   */
  async scheduleDailyReminder(
    studentId: string,
    busName: string,
    time: string
  ) {
    // This would typically use a cron job or scheduled task
    // For now, we'll just create the notification
    try {
      await supabase.from('notifications').insert({
        user_id: studentId,
        title: '📅 Bus Reminder',
        message: `Your bus ${busName} arrives at ${time}`,
        type: 'info',
        data: { type: 'reminder', busName, time },
      });
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
    }
  }
}

export default new NotificationTriggerService();
