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
  }
}

let scriptLoaded = false;
let scriptLoading = false;
const callbacks: (() => void)[] = [];

function loadGoogleMapsScript(callback: () => void) {
  if (scriptLoaded) { callback(); return; }
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

function GoogleMap({
  containerRef,
  mapCenter,
  zoom,
  showBusMarker,
  busPosition,
  userStopPosition,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  mapCenter: { lat: number; lng: number };
  zoom: number;
  showBusMarker: boolean;
  busPosition?: { lat: number; lng: number };
  userStopPosition?: { lat: number; lng: number };
}) {
  useEffect(() => {
    loadGoogleMapsScript(() => {
      if (!containerRef.current) return;
      const map = new window.google.maps.Map(containerRef.current, {
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
    });
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
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
  const fullscreenMapRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const mapCenter = center || busPosition || userStopPosition || DEFAULT_CENTER;

  return (
    <>
      {/* Inline map with click to expand */}
      <div
        className={cn("relative w-full min-h-[300px] rounded-2xl overflow-hidden cursor-pointer group", className)}
        onClick={() => setIsFullscreen(true)}
      >
        <GoogleMap
          containerRef={mapRef}
          mapCenter={mapCenter}
          zoom={zoom}
          showBusMarker={showBusMarker}
          busPosition={busPosition}
          userStopPosition={userStopPosition}
        />
        {/* Expand hint overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2 shadow-lg">
            <Maximize2 className="w-5 h-5 text-[#1e3a8a]" />
          </div>
        </div>
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#1e3a8a] text-white">
            <span className="font-semibold text-lg">🗺️ Live Map</span>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {/* Full map */}
          <div className="flex-1">
            <GoogleMap
              containerRef={fullscreenMapRef}
              mapCenter={mapCenter}
              zoom={zoom + 1}
              showBusMarker={showBusMarker}
              busPosition={busPosition}
              userStopPosition={userStopPosition}
            />
          </div>
        </div>
      )}
    </>
  );
};
