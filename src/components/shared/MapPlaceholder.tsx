import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MapPlaceholderProps {
  className?: string;
  showBusMarker?: boolean;
  busPosition?: { lat: number; lng: number };
  userStopPosition?: { lat: number; lng: number };
  center?: { lat: number; lng: number };
  zoom?: number;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Default center: India (New Delhi)
const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };

declare global {
  interface Window {
    google: any;
    initGoogleMap: () => void;
  }
}

let scriptLoaded = false;
let scriptLoading = false;
const callbacks: (() => void)[] = [];

function loadGoogleMapsScript(callback: () => void) {
  if (scriptLoaded) {
    callback();
    return;
  }
  callbacks.push(callback);
  if (scriptLoading) return;
  scriptLoading = true;

  window.initGoogleMap = () => {
    scriptLoaded = true;
    callbacks.forEach((cb) => cb());
    callbacks.length = 0;
  };

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initGoogleMap`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

export const MapPlaceholder = ({
  className,
  showBusMarker = true,
  busPosition,
  userStopPosition,
  center,
  zoom = 13,
}: MapPlaceholderProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const busMarkerRef = useRef<any>(null);
  const stopMarkerRef = useRef<any>(null);

  const mapCenter = center || busPosition || userStopPosition || DEFAULT_CENTER;

  useEffect(() => {
    loadGoogleMapsScript(() => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
        ],
      });
      mapInstanceRef.current = map;

      // Bus marker (blue bus icon)
      if (showBusMarker && busPosition) {
        busMarkerRef.current = new window.google.maps.Marker({
          position: busPosition,
          map,
          title: "Bus Location",
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/bus.png",
            scaledSize: new window.google.maps.Size(40, 40),
          },
        });
      }

      // Stop marker (red pin)
      if (userStopPosition) {
        stopMarkerRef.current = new window.google.maps.Marker({
          position: userStopPosition,
          map,
          title: "Your Stop",
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scaledSize: new window.google.maps.Size(36, 36),
          },
        });
      }

      // Draw route line between bus and stop
      if (busPosition && userStopPosition) {
        new window.google.maps.Polyline({
          path: [busPosition, userStopPosition],
          geodesic: true,
          strokeColor: "#1e3a8a",
          strokeOpacity: 0.8,
          strokeWeight: 3,
          map,
        });
      }
    });
  }, []);

  // Update bus marker position dynamically
  useEffect(() => {
    if (busMarkerRef.current && busPosition) {
      busMarkerRef.current.setPosition(busPosition);
    }
  }, [busPosition]);

  return (
    <div
      ref={mapRef}
      className={cn("relative w-full min-h-[300px] rounded-2xl overflow-hidden", className)}
    />
  );
};
