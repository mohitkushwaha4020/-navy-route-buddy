import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface BusLocation {
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  updated_at: string;
}

interface LocationContextType {
  busLocations: Map<string, BusLocation>;
  subscribeToBusLocation: (busId: string) => void;
  unsubscribeFromBusLocation: (busId: string) => void;
  subscribeToAllBuses: () => void;
  unsubscribeFromAll: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [busLocations, setBusLocations] = useState<Map<string, BusLocation>>(new Map());
  const [subscriptions, setSubscriptions] = useState<Map<string, RealtimeChannel>>(new Map());

  // Subscribe to specific bus location
  const subscribeToBusLocation = (busId: string) => {
    if (subscriptions.has(busId)) {
      console.log(`Already subscribed to bus ${busId}`);
      return;
    }

    const channel = supabase
      .channel(`bus-location-${busId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'locations',
          filter: `user_id=eq.${busId}`,
        },
        (payload) => {
          console.log('Location update received:', payload);
          
          if (payload.new) {
            const location = payload.new as BusLocation;
            setBusLocations((prev) => {
              const updated = new Map(prev);
              updated.set(busId, location);
              return updated;
            });
          }
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for bus ${busId}:`, status);
      });

    setSubscriptions((prev) => {
      const updated = new Map(prev);
      updated.set(busId, channel);
      return updated;
    });
  };

  // Unsubscribe from specific bus
  const unsubscribeFromBusLocation = (busId: string) => {
    const channel = subscriptions.get(busId);
    if (channel) {
      supabase.removeChannel(channel);
      setSubscriptions((prev) => {
        const updated = new Map(prev);
        updated.delete(busId);
        return updated;
      });
      setBusLocations((prev) => {
        const updated = new Map(prev);
        updated.delete(busId);
        return updated;
      });
    }
  };

  // Subscribe to all active buses
  const subscribeToAllBuses = () => {
    const channel = supabase
      .channel('all-bus-locations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'locations',
        },
        (payload) => {
          console.log('All buses location update:', payload);
          
          if (payload.new) {
            const location = payload.new as BusLocation;
            setBusLocations((prev) => {
              const updated = new Map(prev);
              updated.set(location.user_id, location);
              return updated;
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('All buses subscription status:', status);
      });

    setSubscriptions((prev) => {
      const updated = new Map(prev);
      updated.set('all-buses', channel);
      return updated;
    });
  };

  // Unsubscribe from all
  const unsubscribeFromAll = () => {
    subscriptions.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    setSubscriptions(new Map());
    setBusLocations(new Map());
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromAll();
    };
  }, []);

  return (
    <LocationContext.Provider
      value={{
        busLocations,
        subscribeToBusLocation,
        unsubscribeFromBusLocation,
        subscribeToAllBuses,
        unsubscribeFromAll,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};
