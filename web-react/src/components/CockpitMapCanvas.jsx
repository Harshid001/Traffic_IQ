import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  Navigation2,
  Maximize2,
  Plus,
  Minus,
  Layers,
  Volume2,
  VolumeX,
  AlertTriangle,
  ArrowUp,
  CornerUpRight,
  CornerUpLeft,
  ArrowUpRight,
  ArrowUpLeft,
  MapPin,
  Flame,
  Radio,
  ShieldAlert,
  X,
  Check
} from 'lucide-react';

const STREETS_LAYER_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const DARK_LAYER_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

const HAZARD_OPTIONS = [
  { id: 'jam', label: 'Heavy Traffic Jam', icon: Flame, color: '#EF4444' },
  { id: 'police', label: 'Speed Camera / Police', icon: Radio, color: '#38BDF8' },
  { id: 'hazard', label: 'Road Hazard / Object', icon: AlertTriangle, color: '#F59E0B' },
  { id: 'work', label: 'Construction / Roadwork', icon: ShieldAlert, color: '#EC4899' }
];

export default function CockpitMapCanvas({
  corridor,
  routes,
  selectedRouteId,
  onSelectRoute,
  timeHorizon,
  setTimeHorizon,
  // Navigation simulation props
  isNavigating = false,
  progressPct = 0,
  currentLat,
  currentLon,
  headingDeg = 0,
  currentSpeedKmh = 50,
  speedLimitKmh = 60,
  currentManeuver,
  isMuted = false,
  onToggleMute,
  onRestartDemo,
  onTriggerAlert
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const polylinesLayerGroupRef = useRef(null);
  const markersLayerGroupRef = useRef(null);
  const vehicleMarkerRef = useRef(null);

  const [mapStyle, setMapStyle] = useState('streets'); // 'streets' | 'dark'
  const [hazardModalOpen, setHazardModalOpen] = useState(false);
  const [reportedHazard, setReportedHazard] = useState(null);
  const [activeLayers, setActiveLayers] = useState({
    heatmap: true,
    alerts: true,
    badges: true
  });

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  // Helper to format congestion multiplier based on horizon scrubber
  const getCongestionMultiplier = () => {
    if (timeHorizon === '+10m') return 1.18;
    if (timeHorizon === '+20m') return 1.38;
    return 1.0;
  };
  const multiplier = getCongestionMultiplier();
  const currentCong = Math.min(99, Math.round(corridor.cong * multiplier));
  const congColor = currentCong > 50 ? 'text-red-400' : currentCong > 35 ? 'text-amber-400' : 'text-emerald-400';

  // Maneuver Icon helper
  const renderManeuverIcon = () => {
    const iconProps = { size: 24, className: 'text-primary-bright', strokeWidth: 2.8 };
    switch (currentManeuver?.type) {
      case 'turn-right':
        return <CornerUpRight {...iconProps} />;
      case 'turn-left':
        return <CornerUpLeft {...iconProps} />;
      case 'slight-right':
        return <ArrowUpRight {...iconProps} />;
      case 'slight-left':
        return <ArrowUpLeft {...iconProps} />;
      case 'arrive':
        return <MapPin {...iconProps} />;
      case 'straight':
      default:
        return <ArrowUp {...iconProps} />;
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const center = corridor?.center || [23.1125, 72.5707];
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        center,
        zoom: corridor?.defaultZoom || 12,
        preferCanvas: true,
        fadeAnimation: false,
        markerZoomAnimation: true
      });

      // Base tile layer
      const tileUrl = mapStyle === 'streets' ? STREETS_LAYER_URL : DARK_LAYER_URL;
      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 20,
        subdomains: 'abcd'
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      polylinesLayerGroupRef.current = L.layerGroup().addTo(map);
      markersLayerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map instance across rerenders for smooth transitions
    };
  }, []);

  // Update Base Tile Layer when style toggled
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const tileUrl = mapStyle === 'streets' ? STREETS_LAYER_URL : DARK_LAYER_URL;
    tileLayerRef.current.setUrl(tileUrl);
  }, [mapStyle]);

  // Render Routes and Markers whenever corridor, routes, or selected route changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const polyGroup = polylinesLayerGroupRef.current;
    const markGroup = markersLayerGroupRef.current;
    if (!map || !polyGroup || !markGroup) return;

    polyGroup.clearLayers();
    markGroup.clearLayers();

    // Render route polylines
    routes.forEach((r) => {
      const isSelected = r.id === selectedRouteId;
      const coords = r.coordinates || [];
      if (coords.length < 2) return;

      // Glow backing for selected route
      if (isSelected) {
        L.polyline(coords, {
          color: r.color,
          weight: 12,
          opacity: 0.25,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(polyGroup);

        // Animated dashed travel line
        L.polyline(coords, {
          color: '#FFFFFF',
          weight: 3,
          dashArray: '8, 12',
          opacity: 0.8,
          lineCap: 'round',
          className: 'animated-dash-path'
        }).addTo(polyGroup);
      }

      // Main route polyline
      const polyline = L.polyline(coords, {
        color: r.color,
        weight: isSelected ? 6 : 4,
        opacity: isSelected ? 1 : 0.45,
        dashArray: !isSelected && r.type === 'alt' ? '6, 6' : undefined,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(polyGroup);

      polyline.on('click', () => {
        onSelectRoute(r.id);
      });

      // Floating ETA Badge on route midpoint
      if (activeLayers.badges && coords.length >= 2) {
        const midIdx = Math.floor(coords.length / 2);
        const midCoord = coords[midIdx];
        const badgeHtml = `
          <div class="simple-route-badge ${isSelected ? 'active-route-badge' : 'alt-route-badge'}">
            <span class="badge-time">${r.eta} min</span>
            <span style="font-size: 10px; opacity: 0.8;">(${r.dist}km)</span>
          </div>
        `;
        const badgeIcon = L.divIcon({
          className: '',
          html: badgeHtml,
          iconSize: [80, 24],
          iconAnchor: [40, 24]
        });

        const badgeMarker = L.marker(midCoord, { icon: badgeIcon, zIndexOffset: isSelected ? 500 : 200 }).addTo(markGroup);
        badgeMarker.on('click', () => onSelectRoute(r.id));
      }
    });

    // Render Origin Pin (Point A)
    if (corridor.origin) {
      const originHtml = `
        <div class="clean-pin-marker origin-pin-bg">
          <span>A</span>
        </div>
      `;
      const originIcon = L.divIcon({
        className: '',
        html: originHtml,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      L.marker([corridor.origin.lat, corridor.origin.lon], { icon: originIcon, zIndexOffset: 600 }).addTo(markGroup);
    }

    // Render Destination Pin (Point B)
    if (corridor.destination) {
      const destHtml = `
        <div class="clean-pin-marker dest-pin-bg">
          <span>B</span>
        </div>
      `;
      const destIcon = L.divIcon({
        className: '',
        html: destHtml,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      L.marker([corridor.destination.lat, corridor.destination.lon], { icon: destIcon, zIndexOffset: 600 }).addTo(markGroup);
    }

    // Fit map bounds to active route if not currently in active drive navigation
    if (!isNavigating && activeRoute?.coordinates?.length) {
      const bounds = L.polyline(activeRoute.coordinates).getBounds();
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [corridor, routes, selectedRouteId, activeLayers.badges, isNavigating]);

  // Update or Render Vehicle Navigation Puck
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const lat = currentLat || corridor?.origin?.lat || 23.0280;
    const lon = currentLon || corridor?.origin?.lon || 72.5065;

    if (!isNavigating) {
      if (vehicleMarkerRef.current) {
        map.removeLayer(vehicleMarkerRef.current);
        vehicleMarkerRef.current = null;
      }
      return;
    }

    const puckHtml = `
      <div class="vehicle-marker-wrapper">
        <div class="vehicle-pulse-ring"></div>
        <div class="vehicle-core-dot" style="transform: rotate(${headingDeg}deg);">
          <div class="vehicle-arrow-tip"></div>
        </div>
      </div>
    `;

    const puckIcon = L.divIcon({
      className: '',
      html: puckHtml,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    if (vehicleMarkerRef.current) {
      vehicleMarkerRef.current.setLatLng([lat, lon]);
      vehicleMarkerRef.current.setIcon(puckIcon);
    } else {
      vehicleMarkerRef.current = L.marker([lat, lon], {
        icon: puckIcon,
        zIndexOffset: 1000
      }).addTo(map);
    }

    // Smoothly follow vehicle without overriding user manual zoom
    map.panTo([lat, lon], { animate: true, duration: 0.5 });
  }, [isNavigating, currentLat, currentLon, headingDeg]);

  // Map Controls Helpers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (isNavigating && currentLat && currentLon) {
      map.setView([currentLat, currentLon], 15, { animate: true });
    } else if (activeRoute?.coordinates?.length) {
      map.fitBounds(L.polyline(activeRoute.coordinates).getBounds(), { padding: [40, 40], maxZoom: 14 });
    }
  };

  const handleReportHazard = (hazardId) => {
    setReportedHazard(hazardId);
    setTimeout(() => {
      setReportedHazard(null);
      setHazardModalOpen(false);
    }, 1200);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-card overflow-hidden shadow-frame flex flex-col hover:border-white/15 transition-all duration-300 relative">
      {/* Top Map Control Bar */}
      <div className="px-5 py-3.5 border-b border-white/10 bg-surface/80 backdrop-blur-md flex items-center justify-between gap-4 flex-wrap z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100">
            <span className="pulse-dot" />
            <span className="tracking-wide">
              {isNavigating ? 'LIVE NAVIGATION ACTIVE' : 'LIVE STREETS MAP'}
            </span>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="text-xs text-slate-300 font-medium hidden sm:inline">
            {corridor.city}
          </span>
        </div>

        {/* Forecast Horizon Scrubber */}
        {!isNavigating && (
          <div className="flex items-center gap-1 bg-ink border border-white/10 p-1 rounded-full text-xs">
            <span className="text-[0.65rem] uppercase font-bold text-slate-400 px-2 hidden md:inline">
              Forecast:
            </span>
            {[
              { id: 'now', label: 'Now' },
              { id: '+10m', label: '+10 min' },
              { id: '+20m', label: '+20 min' }
            ].map((h) => (
              <button
                key={h.id}
                onClick={() => setTimeHorizon(h.id)}
                className={`px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  timeHorizon === h.id
                    ? 'bg-primary text-ink shadow-sm'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        )}

        {/* Map Layers & Style Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMapStyle(mapStyle === 'streets' ? 'dark' : 'streets')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border border-white/10 bg-ink/70 text-slate-200 hover:text-white hover:border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
            title="Toggle Map Style"
          >
            <Layers size={13} className="text-primary-bright" />
            <span>{mapStyle === 'streets' ? 'Streets Map' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative w-full h-[380px] lg:h-[450px] bg-ink overflow-hidden select-none">
        {/* Leaflet Mount DIV */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* In-Drive Live Guidance HUD Banner */}
        {isNavigating && currentManeuver && (
          <div className="absolute top-3 inset-x-4 z-30 animate-fadeUp">
            <div className="glass bg-ink/90 border-primary/30 p-3 sm:p-4 rounded-2xl flex items-center justify-between gap-3 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
                  {renderManeuverIcon()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm sm:text-base font-bold text-primary-bright">
                      {currentManeuver.dist_to_action_m ? `${currentManeuver.dist_to_action_m} m` : 'Ahead'}
                    </span>
                    {currentManeuver.road_name && (
                      <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-white/10 text-slate-200 font-medium truncate max-w-[180px]">
                        {currentManeuver.road_name}
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                    {currentManeuver.instruction}
                  </div>
                </div>
              </div>

              {/* Maneuver HUD Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Hazard Report */}
                <button
                  onClick={() => setHazardModalOpen(true)}
                  className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 flex items-center justify-center cursor-pointer transition-all"
                  title="Report Road Hazard"
                  aria-label="Report Road Hazard"
                >
                  <AlertTriangle size={15} />
                </button>

                {/* Voice Guidance Toggle */}
                <button
                  onClick={onToggleMute}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 flex items-center justify-center cursor-pointer transition-all"
                  title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                  aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isMuted ? <VolumeX size={15} className="text-slate-400" /> : <Volume2 size={15} className="text-primary-bright" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Weather & Telemetry Floating Badges (When Not Navigating) */}
        {!isNavigating && (
          <div className="absolute top-4 left-4 z-10 flex gap-2 flex-wrap pointer-events-none">
            <div className="glass px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 text-slate-200">
              <span>🌦️ {corridor.weather}</span>
            </div>
            <div className="glass px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 text-slate-200">
              <span>🏎️ {corridor.avgSpeed} avg</span>
            </div>
            <div className={`glass px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 font-semibold ${congColor}`}>
              <span>📊 {currentCong}% Congestion</span>
            </div>
          </div>
        )}

        {/* Floating Map Zoom & Recenter Controls */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5">
          <button
            onClick={handleRecenter}
            className="w-8 h-8 rounded-xl glass flex items-center justify-center text-slate-200 hover:text-white hover:border-primary/40 active:scale-95 cursor-pointer transition-all shadow-md"
            title="Recenter / Fit Bounds"
            aria-label="Recenter Map"
          >
            <Maximize2 size={14} />
          </button>
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-xl glass flex items-center justify-center text-slate-200 hover:text-white hover:border-primary/40 active:scale-95 cursor-pointer transition-all shadow-md"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <Plus size={15} />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-xl glass flex items-center justify-center text-slate-200 hover:text-white hover:border-primary/40 active:scale-95 cursor-pointer transition-all shadow-md"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <Minus size={15} />
          </button>
        </div>

        {/* Selected Route Floating HUD (When not in navigation mode) */}
        {!isNavigating && (
          <div className="absolute bottom-4 left-4 right-16 z-10 flex items-center justify-between gap-3 glass p-3 rounded-2xl animate-fadeUp">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20 flex-shrink-0"
                style={{ backgroundColor: activeRoute?.color || '#38BDF8' }}
              />
              <div className="min-w-0">
                <div className="text-[0.65rem] uppercase tracking-wider text-slate-400 font-semibold">
                  Selected Corridor Route
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                  {activeRoute?.name}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-right flex-shrink-0">
              <div>
                <div className="text-[0.65rem] text-slate-400 uppercase">ETA</div>
                <div className="text-sm sm:text-base font-bold text-primary">
                  {Math.round(
                    (activeRoute?.eta || 28) *
                      (timeHorizon === '+20m' ? 1.25 : timeHorizon === '+10m' ? 1.1 : 1.0)
                  )}{' '}
                  min
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-[0.65rem] text-slate-400 uppercase">Distance</div>
                <div className="text-sm font-semibold text-slate-200">
                  {activeRoute?.dist} km
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Road Hazard Report Modal */}
      {hazardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-md animate-fadeUp">
          <div className="bg-card border border-white/15 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-400" />
                <h3 className="font-display font-bold text-base text-slate-100">Report Road Hazard</h3>
              </div>
              <button
                onClick={() => setHazardModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Help drivers by reporting real-time road conditions along your corridor.
            </p>

            <div className="flex flex-col gap-2.5">
              {HAZARD_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isReported = reportedHazard === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleReportHazard(opt.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      isReported
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent size={18} style={{ color: opt.color }} />
                      <span className="text-xs font-semibold">{opt.label}</span>
                    </div>
                    {isReported ? (
                      <Check size={16} className="text-emerald-400" />
                    ) : (
                      <span className="text-[0.65rem] text-slate-400 uppercase font-bold">Report</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
