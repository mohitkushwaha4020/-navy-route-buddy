import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface Marker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  color?: string;
  icon?: string;
}

interface OSMMapViewProps {
  markers?: Marker[];
  center?: { latitude: number; longitude: number };
  zoom?: number;
  showUserLocation?: boolean;
  trackUserLocation?: boolean; // Enable continuous user location tracking
  polyline?: { latitude: number; longitude: number }[];
  onMarkerPress?: (markerId: string) => void;
  onMapClick?: (latitude: number, longitude: number, address: string) => void;
  onUserLocationUpdate?: (latitude: number, longitude: number) => void;
}

export default function OSMMapView({
  markers = [],
  center = { latitude: 23.1815, longitude: 79.9864 }, // Jabalpur, Madhya Pradesh
  zoom = 17, // Maximum detail for all place names
  showUserLocation = false,
  trackUserLocation = false,
  polyline = [],
  onMarkerPress,
  onMapClick,
  onUserLocationUpdate,
}: OSMMapViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    updateMap();
  }, [markers, center, polyline, userLocation]);

  useEffect(() => {
    if (trackUserLocation) {
      startTrackingUserLocation();
    } else {
      stopTrackingUserLocation();
    }

    return () => {
      stopTrackingUserLocation();
    };
  }, [trackUserLocation]);

  const startTrackingUserLocation = () => {
    const Geolocation = require('@react-native-community/geolocation').default;
    
    // Get initial location
    Geolocation.getCurrentPosition(
      (position: any) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(location);
        onUserLocationUpdate?.(location.latitude, location.longitude);
        
        // Center map on user location
        webViewRef.current?.injectJavaScript(`
          map.setView([${location.latitude}, ${location.longitude}], ${zoom});
          true;
        `);
      },
      (error: any) => console.error('Error getting location:', error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    // Watch location continuously
    watchIdRef.current = Geolocation.watchPosition(
      (position: any) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(location);
        onUserLocationUpdate?.(location.latitude, location.longitude);
      },
      (error: any) => console.error('Error watching location:', error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 5000, // Update every 5 seconds
      }
    );
  };

  const stopTrackingUserLocation = () => {
    if (watchIdRef.current !== null) {
      const Geolocation = require('@react-native-community/geolocation').default;
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const updateMap = () => {
    if (!webViewRef.current) return;

    const markersJS = JSON.stringify(markers);
    const polylineJS = JSON.stringify(polyline);
    const centerJS = JSON.stringify(center);
    const userLocationJS = userLocation ? JSON.stringify(userLocation) : 'null';

    webViewRef.current.injectJavaScript(`
      updateMap(${markersJS}, ${polylineJS}, ${centerJS}, ${zoom}, ${userLocationJS});
      true;
    `);
  };

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'markerClick' && onMarkerPress) {
        onMarkerPress(data.markerId);
      }
      
      // Handle map click - only if onMapClick callback is provided
      if (data.type === 'mapClick' && onMapClick) {
        const { latitude, longitude } = data;
        
        // Get Digipin code for clicked location
        const DigipinGeocodingService = require('../services/DigipinGeocodingService').default;
        const address = await DigipinGeocodingService.reverseGeocode(latitude, longitude);
        
        if (address) {
          onMapClick(latitude, longitude, address);
        }
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html { margin: 0; padding: 0; height: 100%; width: 100%; }
        #map { height: 100%; width: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        let map;
        let markersLayer = [];
        let polylineLayer = null;
        let userLocationMarker = null;
        const enableMapClick = ${!!onMapClick}; // Enable map click only if callback provided

        // Initialize map - Default to Jabalpur with maximum detail
        map = L.map('map', {
          zoomControl: true,
          minZoom: 2, // World level zoom out
          maxZoom: 19,
          preferCanvas: false // Better for labels
        }).setView([23.1815, 79.9864], 17);

        // Use OpenStreetMap standard tiles (best labels and building names)
        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          minZoom: 2, // World level zoom out
          maxNativeZoom: 19,
          detectRetina: true // Better quality on high-DPI screens
        });

        osmLayer.addTo(map);

        // Custom marker icons
        const busIcon = L.divIcon({
          html: '<div style="background: #3b82f6; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><span style="font-size: 24px;">🚌</span></div>',
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const studentIcon = L.divIcon({
          html: '<div style="background: #10b981; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><span style="font-size: 24px;">📍</span></div>',
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const stopIcon = (text) => {
          // Extract first word or first 8 characters of place name
          const displayText = text.split(',')[0].split(' ')[0].substring(0, 8);
          return L.divIcon({
            html: '<div style="background: #3b82f6; min-width: 60px; height: 28px; border-radius: 14px; display: flex; align-items: center; justify-content: center; padding: 0 10px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><span style="color: white; font-weight: bold; font-size: 11px; white-space: nowrap;">' + displayText + '</span></div>',
            className: '',
            iconSize: [60, 28],
            iconAnchor: [30, 14]
          });
        };

        // User location icon (pulsing blue dot)
        const userLocationIcon = L.divIcon({
          html: '<div style="position: relative; width: 20px; height: 20px;"><div style="position: absolute; width: 20px; height: 20px; background: #3b82f6; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(59,130,246,0.6);"></div><div style="position: absolute; width: 20px; height: 20px; background: rgba(59,130,246,0.3); border-radius: 50%; animation: pulse 2s infinite;"></div></div><style>@keyframes pulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; }}</style>',
          className: '',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        function updateMap(markers, polyline, center, zoom, userLocation) {
          // Clear existing markers
          markersLayer.forEach(marker => map.removeLayer(marker));
          markersLayer = [];

          // Clear existing polyline
          if (polylineLayer) {
            map.removeLayer(polylineLayer);
            polylineLayer = null;
          }

          // Update or create user location marker
          if (userLocation) {
            if (userLocationMarker) {
              userLocationMarker.setLatLng([userLocation.latitude, userLocation.longitude]);
            } else {
              userLocationMarker = L.marker([userLocation.latitude, userLocation.longitude], { 
                icon: userLocationIcon,
                zIndexOffset: 1000 // Keep on top
              }).addTo(map);
              userLocationMarker.bindPopup('📍 Your Location');
            }
          } else if (userLocationMarker) {
            map.removeLayer(userLocationMarker);
            userLocationMarker = null;
          }

          // Add new markers
          markers.forEach((marker, index) => {
            let icon;
            if (marker.icon === 'bus') {
              icon = busIcon;
            } else if (marker.icon === 'student') {
              icon = studentIcon;
            } else if (marker.icon === 'stop') {
              // Use place name from title or marker id
              const placeName = marker.title ? marker.title.split('\\n')[1] || marker.title : 'Stop ' + (index + 1);
              icon = stopIcon(placeName);
            } else {
              const placeName = marker.title ? marker.title.split('\\n')[1] || marker.title : 'Stop ' + (index + 1);
              icon = stopIcon(placeName);
            }

            const leafletMarker = L.marker([marker.latitude, marker.longitude], { icon })
              .addTo(map);

            if (marker.title) {
              leafletMarker.bindPopup(marker.title);
            }

            leafletMarker.on('click', () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'markerClick',
                markerId: marker.id
              }));
            });

            markersLayer.push(leafletMarker);
          });

          // Add polyline
          if (polyline && polyline.length > 0) {
            const latlngs = polyline.map(p => [p.latitude, p.longitude]);
            polylineLayer = L.polyline(latlngs, {
              color: '#1e3a8a',
              weight: 4,
              opacity: 0.7
            }).addTo(map);
          }

          // Fit bounds if markers exist
          if (markers.length > 0 || polyline.length > 0) {
            const bounds = [];
            markers.forEach(m => bounds.push([m.latitude, m.longitude]));
            polyline.forEach(p => bounds.push([p.latitude, p.longitude]));
            
            if (bounds.length > 0) {
              map.fitBounds(bounds, { padding: [50, 50] });
            }
          } else {
            map.setView([center.latitude, center.longitude], zoom);
          }
        }

        // Initial update
        updateMap([], [], { latitude: ${center.latitude}, longitude: ${center.longitude} }, ${zoom}, null);

        // Add map click listener only if enabled (for location picker)
        if (enableMapClick) {
          let clickMarker = null;
          map.on('click', function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            
            // Add marker at clicked location
            if (clickMarker) {
              map.removeLayer(clickMarker);
            }
            
            // Create custom pin icon for clicked location
            const clickIcon = L.divIcon({
              html: '<div style="background: #f59e0b; width: 25px; height: 25px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"><span style="transform: rotate(45deg); font-size: 14px;">📍</span></div>',
              className: '',
              iconSize: [25, 25],
              iconAnchor: [12, 25]
            });
            
            clickMarker = L.marker([lat, lng], { icon: clickIcon }).addTo(map);
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapClick',
              latitude: lat,
              longitude: lng
            }));
          });
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={true}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
