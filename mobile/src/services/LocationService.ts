import Geolocation from '@react-native-community/geolocation';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  altitude: number | null;
  timestamp: number;
}

interface LocationUpdate {
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  altitude: number | null;
  updated_at: string;
}

class LocationService {
  private watchId: number | null = null;
  private isTracking: boolean = false;
  private userId: string | null = null;
  private updateInterval: number = 5000; // 5 seconds
  private lastUpdateTime: number = 0;
  private offlineQueue: LocationUpdate[] = [];
  private readonly OFFLINE_QUEUE_KEY = 'location_offline_queue';
  private readonly MAX_QUEUE_SIZE = 100;

  // Configuration for better accuracy and battery optimization
  private readonly HIGH_ACCURACY_CONFIG = {
    enableHighAccuracy: true,
    distanceFilter: 10, // Update every 10 meters
    interval: 5000, // Update every 5 seconds
    fastestInterval: 3000, // Fastest update 3 seconds
    maximumAge: 10000, // Use cached location if less than 10 seconds old
    timeout: 15000,
  };

  private readonly BATTERY_SAVER_CONFIG = {
    enableHighAccuracy: false,
    distanceFilter: 50, // Update every 50 meters
    interval: 15000, // Update every 15 seconds
    fastestInterval: 10000,
    maximumAge: 30000,
    timeout: 20000,
  };

  constructor() {
    this.loadOfflineQueue();
  }

  // Load offline queue from storage
  private async loadOfflineQueue() {
    try {
      const queueData = await AsyncStorage.getItem(this.OFFLINE_QUEUE_KEY);
      if (queueData) {
        this.offlineQueue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
    }
  }

  // Save offline queue to storage
  private async saveOfflineQueue() {
    try {
      await AsyncStorage.setItem(
        this.OFFLINE_QUEUE_KEY,
        JSON.stringify(this.offlineQueue.slice(-this.MAX_QUEUE_SIZE))
      );
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  // Start tracking with battery optimization
  async startTracking(
    userId: string,
    batterySaver: boolean = false,
    callback?: (location: LocationData) => void
  ): Promise<void> {
    if (this.isTracking) {
      console.log('Already tracking');
      return;
    }

    this.userId = userId;
    this.isTracking = true;

    const config = batterySaver
      ? this.BATTERY_SAVER_CONFIG
      : this.HIGH_ACCURACY_CONFIG;

    // Process offline queue first
    await this.processOfflineQueue();

    this.watchId = Geolocation.watchPosition(
      async (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading,
          altitude: position.coords.altitude,
          timestamp: position.timestamp,
        };

        // Throttle updates based on time interval
        const now = Date.now();
        if (now - this.lastUpdateTime >= this.updateInterval) {
          this.lastUpdateTime = now;
          await this.updateLocation(locationData);
          callback?.(locationData);
        }
      },
      (error) => {
        console.error('Location error:', error);
      },
      config
    );

    console.log('Location tracking started');
  }

  // Stop tracking
  stopTracking(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
    this.userId = null;
    console.log('Location tracking stopped');
  }

  // Update location to Supabase with offline support
  private async updateLocation(location: LocationData): Promise<void> {
    if (!this.userId) return;

    const locationUpdate: LocationUpdate = {
      user_id: this.userId,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      speed: location.speed,
      heading: location.heading,
      altitude: location.altitude,
      updated_at: new Date().toISOString(),
    };

    try {
      // Try to update online
      const { error } = await supabase
        .from('locations')
        .upsert(locationUpdate, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      // If successful and we have offline queue, process it
      if (this.offlineQueue.length > 0) {
        await this.processOfflineQueue();
      }
    } catch (error) {
      console.error('Error updating location, adding to offline queue:', error);
      // Add to offline queue
      this.offlineQueue.push(locationUpdate);
      await this.saveOfflineQueue();
    }
  }

  // Process offline queue when connection is restored
  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;

    console.log(`Processing ${this.offlineQueue.length} offline locations`);

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const location of queue) {
      try {
        const { error } = await supabase
          .from('locations')
          .upsert(location, {
            onConflict: 'user_id',
          });

        if (error) {
          // If still failing, add back to queue
          this.offlineQueue.push(location);
        }
      } catch (error) {
        console.error('Error processing offline location:', error);
        this.offlineQueue.push(location);
      }
    }

    await this.saveOfflineQueue();
  }

  // Get current location once (for initial positioning)
  async getCurrentLocation(): Promise<LocationData | null> {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
            heading: position.coords.heading,
            altitude: position.coords.altitude,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          console.error('Error getting current location:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  // Check if tracking is active
  isActive(): boolean {
    return this.isTracking;
  }

  // Get offline queue size
  getOfflineQueueSize(): number {
    return this.offlineQueue.length;
  }

  // Set update interval
  setUpdateInterval(interval: number): void {
    this.updateInterval = interval;
  }
}

// Export singleton instance
export default new LocationService();
