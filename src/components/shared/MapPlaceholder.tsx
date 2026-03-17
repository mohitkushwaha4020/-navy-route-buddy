import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { X, Maximize2 } from "lucide-react";

interface MapPlaceholderProps {
  className?: string;
  showBusMarker?: boolean;
  busPosition?: { lat: number; lng: number };
  userStopPosition?: { lat: number; lng: number };
  center?: { lat: number; lng: number };
  zoom?: number;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };

declare global {
  interface Window {
    google: any;
    initGoogleMap: () => void;
    _gmapsReady: boolean;
    _gmapsCallbacks: (() => void)[];
  }
}

function loadGoogleMapsScript(callback: () => void) {
  if (!window._gmapsCallbacks) window._gmapsCallbacks = [];

  if (window._gmapsReady) {
    callback();
    return;
  }

  window._gmapsCallbacks.push(callback);

  if (document.getElementById("google-maps-script")) return;

  window.initGoogleMap = () => {
    window._gmapsReady = true;
    window._gmapsCallbacks.forEach((cb) => cb());
    window._gmapsCallbacks = [];
  };

  const script = document.createElement("script");
  script.id = "google-maps-script";
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initGoogleMap`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

function initMap(
  container: HTMLDivElement,
  mapCenter: { lat: number; lng: number },
  zoom: number,
  showBusMarker: boolean,
  busPosition?: { lat: number; lng: number },
  userStopPosition?: { lat: number; lng: number }
) {
  const map = new window.google.maps.Map(container, {
    center: mapCenter,
    zoom,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
  });

  if (showBusMarker && busPosition) {
    new window.google.maps.Marker({
      position: busPosition,
      map,
      title: "Bus Location",
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/bus.png",
        scaledSize: new window.google.maps.Size(40, 40),
      },
    });
  }

  if (userStopPosition) {
    new window.google.maps.Marker({
      position: userStopPosition,
      map,
      title: "Your Stop",
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        scaledSize: new window.google.maps.Size(36, 36),
      },
    });
  }

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
}

export const MapPlaceholder = ({
  className,
  showBusMarker = true,
  busPosition,
  userStopPosition,
  center,
  zoom = 13,
}: MapPlaceholderProps) => {
  const inlineRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const mapCenter = center || busPosition || userStopPosition || DEFAULT_CENTER;

  // Init inline map
  useEffect(() => {
    loadGoogleMapsScript(() => {
      if (inlineRef.current) {
        initMap(inlineRef.current, mapCenter, zoom, showBusMarker, busPosition, userStopPosition);
      }
    });
  }, []);

  // Init fullscreen map when modal opens
  useEffect(() => {
    if (!isFullscreen) return;
    // Small delay to ensure DOM is rendered
    const timer = setTimeout(() => {
      loadGoogleMapsScript(() => {
        if (fullscreenRef.current) {
          initMap(fullscreenRef.current, mapCenter, zoom + 1, showBusMarker, busPosition, userStopPosition);
        }
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  return (
    <>
      {/* Inline map */}
      <div
        className={cn("relative w-full min-h-[300px] rounded-2xl overflow-hidden cursor-pointer group", className)}
        onClick={() => setIsFullscreen(true)}
      >
        <div ref={inlineRef} style={{ width: "100%", height: "100%", minHeight: "300px" }} />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2 shadow-lg">
            <Maximize2 className="w-5 h-5 text-[#1e3a8a]" />
          </div>
        </div>
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="flex items-center justify-between px-4 py-3 bg-[#1e3a8a] text-white shrink-0">
            <span className="font-semibold text-lg">🗺️ Live Map</span>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div
            ref={fullscreenRef}
            style={{ width: "100%", height: "calc(100vh - 56px)" }}
          />
        </div>
      )}
    </>
  );
};
