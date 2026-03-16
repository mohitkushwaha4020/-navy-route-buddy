import React, { useRef, useEffect } from 'react';
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

interface MapPLSViewProps {
  markers?: Marker[];
  center?: { latitude: number; longitude: number };
  zoom?: number;
  showUserLocation?: boolean;
  polyline?: { latitude: number; longitude: number }[];
  onMarkerPress?: (markerId: string) => void;
}

// MapPLS API Keys - Replace with your actual keys
const MAPPLS_MAP_SDK_KEY = 'YOUR_MAP_SDK_KEY_HERE';
const MAPPLS_REST_API_KEY = 'YOUR_REST_API_KEY_HERE';

export default function MapPLSView({
  markers = [],
  center = { latitude: 23.1815, longitude: 79.9864 }, // Jabalpur, Madhya Pradesh
  zoom = 15,
  showUserLocation = false,
  polyline = [],
  onMarkerPress,
}: MapPLSViewProps) {
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    updateMap();
  }, [markers, center, polyline]);

  const updateMap = () => {
    if (!webViewRef.current) return;

    const markersJS = JSON.stringify(markers);
    const polylineJS = JSON.stringify(polyline);
    const centerJS = JSON.stringify(center);

    webViewRef.current.injectJavaScript(`
      updateMap(${markersJS}, ${polylineJS}, ${centerJS}, ${zoom});
      true;
    `);
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerClick' && onMarkerPress) {
        onMarkerPress(data.markerId);
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
      <script src="https://apis.mappls.com/advancedmaps/api/${MAPPLS_MAP_SDK_KEY}/map_sdk?layer=vector&v=3.0&callback=initMap"></script>
      <style>
        body, html { margin: 0; padding: 0; height: 100%; width: 100%; }
        #map { height: 100%; width: 100%; }
        .mappls-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          font-size: 24px;
        }
        .bus-icon { background: #3b82f6; }
        .student-icon { background: #10b981; }
        .stop-icon { 
          background: #ef4444; 
          width: 30px; 
          height: 30px;
          font-size: 12px;
          font-weight: bold;
          color: white;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        let map;
        let markersLayer = [];
        let polylineLayer = null;

        function initMap() {
          // Initialize MapPLS map centered on Jabalpur
          map = new mappls.Map('map', {
            center: [${center.latitude}, ${center.longitude}],
            zoom: ${zoom},
            zoomControl: true,
            location: ${showUserLocation}
          });

          // Initial update
          updateMap([], [], { latitude: ${center.latitude}, longitude: ${center.longitude} }, ${zoom});
        }

        function updateMap(markers, polyline, center, zoom) {
          // Clear existing markers
          markersLayer.forEach(marker => {
            if (marker && marker.remove) {
              marker.remove();
            }
          });
          markersLayer = [];

          // Clear existing polyline
          if (polylineLayer && polylineLayer.remove) {
            polylineLayer.remove();
            polylineLayer = null;
          }

          // Add new markers
          markers.forEach((marker, index) => {
            let iconHtml = '';
            let iconClass = '';
            
            if (marker.icon === 'bus') {
              iconHtml = '🚌';
              iconClass = 'bus-icon';
            } else if (marker.icon === 'student') {
              iconHtml = '📍';
              iconClass = 'student-icon';
            } else if (marker.icon === 'stop') {
              iconHtml = (index + 1).toString();
              iconClass = 'stop-icon';
            } else {
              iconHtml = (index + 1).toString();
              iconClass = 'stop-icon';
            }

            const markerDiv = document.createElement('div');
            markerDiv.className = 'mappls-icon ' + iconClass;
            markerDiv.innerHTML = iconHtml;

            const mapplsMarker = new mappls.Marker({
              map: map,
              position: [marker.latitude, marker.longitude],
              icon: markerDiv,
              title: marker.title || ''
            });

            mapplsMarker.addListener('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'markerClick',
                markerId: marker.id
              }));
            });

            markersLayer.push(mapplsMarker);
          });

          // Add polyline
          if (polyline && polyline.length > 0) {
            const path = polyline.map(p => [p.latitude, p.longitude]);
            
            polylineLayer = new mappls.Polyline({
              map: map,
              path: path,
              strokeColor: '#1e3a8a',
              strokeWeight: 4,
              strokeOpacity: 0.7
            });
          }

          // Fit bounds if markers exist
          if (markers.length > 0 || polyline.length > 0) {
            const bounds = new mappls.LatLngBounds();
            
            markers.forEach(m => {
              bounds.extend([m.latitude, m.longitude]);
            });
            
            polyline.forEach(p => {
              bounds.extend([p.latitude, p.longitude]);
            });
            
            if (bounds && map.fitBounds) {
              map.fitBounds(bounds, { padding: 50 });
            }
          } else {
            map.setCenter([center.latitude, center.longitude]);
            map.setZoom(zoom);
          }
        }

        // Handle errors
        window.addEventListener('error', function(e) {
          console.error('MapPLS Error:', e.message);
        });
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
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
        }}
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
