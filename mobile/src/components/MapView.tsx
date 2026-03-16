import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';

interface Location {
  latitude: number;
  longitude: number;
}

interface MapMarker {
  id: string;
  coordinate: Location;
  title: string;
  description?: string;
  color?: string;
}

interface MapViewComponentProps {
  markers?: MapMarker[];
  route?: Location[];
  currentLocation?: Location;
  showUserLocation?: boolean;
  onMapReady?: () => void;
}

export default function MapViewComponent({
  markers = [],
  route = [],
  currentLocation,
  showUserLocation = true,
  onMapReady,
}: MapViewComponentProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    // Auto-fit map to show all markers and route
    if (mapRef.current && (markers.length > 0 || route.length > 0)) {
      const coordinates = [
        ...markers.map(m => m.coordinate),
        ...route,
        ...(currentLocation ? [currentLocation] : []),
      ];

      if (coordinates.length > 0) {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(coordinates, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }, 500);
      }
    }
  }, [markers, route, currentLocation]);

  const initialRegion = currentLocation || markers[0]?.coordinate || {
    latitude: 28.6139, // Default: New Delhi
    longitude: 77.2090,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          ...initialRegion,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        onMapReady={onMapReady}
      >
        {/* Route Polyline */}
        {route.length > 1 && (
          <Polyline
            coordinates={route}
            strokeColor="#1e3a8a"
            strokeWidth={4}
            lineDashPattern={[1]}
          />
        )}

        {/* Markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            pinColor={marker.color || 'red'}
          />
        ))}

        {/* Current Location Marker */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Current Location"
            pinColor="blue"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
