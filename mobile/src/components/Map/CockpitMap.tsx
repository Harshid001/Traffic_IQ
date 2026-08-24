import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions
} from 'react-native';
import Svg, {
  Path,
  Circle,
  G,
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Text as SvgText
} from 'react-native-svg';
import {
  LocateFixed,
  Compass,
  Layers,
  Maximize2,
  Plus,
  Minus,
  Check
} from 'lucide-react-native';
import { useNavigationStore } from '../../store/navigationStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

let WebViewComponent: any = null;
if (Platform.OS !== 'web') {
  try {
    WebViewComponent = require('react-native-webview').WebView;
  } catch {
    WebViewComponent = null;
  }
}

const LEAFLET_VERSION = '1.9.4';
const LEAFLET_CSS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
const LEAFLET_JS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;

export interface MapLayerConfig {
  id: string;
  name: string;
  badge: string;
  url: string;
  labelUrl?: string;
  subdomains: string;
  maxZoom: number;
}

export const MAP_LAYERS: MapLayerConfig[] = [
  {
    id: 'nav_streets',
    name: 'Streets',
    badge: 'Standard',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    maxZoom: 20
  },
  {
    id: 'osm',
    name: 'OpenStreetMap',
    badge: 'OSM',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: 'abc',
    maxZoom: 19
  },
  {
    id: 'satellite',
    name: 'Satellite',
    badge: 'Aerial',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    labelUrl: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    subdomains: 'abcd',
    maxZoom: 19
  },
  {
    id: 'cyber_dark',
    name: 'Dark Map',
    badge: 'Night',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    maxZoom: 20
  }
];

/**
 * Shared Leaflet Stylesheet for simple, clean map rendering.
 */
const SHARED_MAP_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #map { width: 100%; height: 100%; background: #F1F5F9; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .leaflet-control-attribution, .leaflet-control-zoom { display: none !important; }

  /* Simple Clean Vehicle Marker */
  .vehicle-marker-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    pointer-events: none;
  }
  .vehicle-core-dot {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #2563EB;
    border: 2.5px solid #FFFFFF;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease-out;
  }
  .vehicle-arrow-tip {
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 7px solid #FFFFFF;
    transform: translateY(-1px);
  }

  /* Simple Clean Origin & Destination Markers */
  .clean-pin-marker {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 13px;
    border: 2px solid #FFFFFF;
    color: #FFFFFF;
    font-size: 11px;
    font-weight: 800;
    box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    cursor: pointer;
  }
  .origin-pin-bg {
    background: #0284C7;
  }
  .dest-pin-bg {
    background: #16A34A;
  }

  /* Simple Route Time Badges */
  .simple-route-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    white-space: nowrap;
    user-select: none;
  }
  .active-route-badge {
    background: #1E293B;
    border: 1.5px solid #2563EB;
    color: #FFFFFF;
  }
  .active-route-badge .badge-time {
    color: #60A5FA;
    font-weight: 800;
  }
  .alt-route-badge {
    background: #FFFFFF;
    border: 1.5px solid #94A3B8;
    color: #334155;
  }
  .alt-route-badge:hover {
    border-color: #2563EB;
    color: #0F172A;
  }
`;

/**
 * Builds self-contained HTML for Native Leaflet WebView.
 */
function buildNativeLeafletHtml(
  allRoutes: any[],
  selectedRouteId: string | null,
  currentLat: number,
  currentLon: number,
  headingDeg: number,
  isNavigating: boolean,
  activeLayerConfig: MapLayerConfig
): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="${LEAFLET_CSS}" />
  <script src="${LEAFLET_JS}"></script>
  <style>
    ${SHARED_MAP_CSS}
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map;
    var baseTileLayer;
    var labelTileLayer;
    var vehicleMarker;
    var routeLayerGroup;
    var pinLayerGroup;
    var currentLayerConfig = ${JSON.stringify(activeLayerConfig)};

    function initMap() {
      if (typeof L === 'undefined') {
        setTimeout(initMap, 80);
        return;
      }

      map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        center: [${currentLat}, ${currentLon}],
        zoom: ${isNavigating ? 16 : 13},
        preferCanvas: true
      });

      applyTileLayers(currentLayerConfig);

      routeLayerGroup = L.layerGroup().addTo(map);
      pinLayerGroup = L.layerGroup().addTo(map);

      renderAllMapElements();
      renderVehicle(${currentLat}, ${currentLon}, ${headingDeg}, ${isNavigating});
    }

    function applyTileLayers(cfg) {
      if (baseTileLayer) map.removeLayer(baseTileLayer);
      if (labelTileLayer) map.removeLayer(labelTileLayer);

      baseTileLayer = L.tileLayer(cfg.url, {
        maxZoom: cfg.maxZoom || 19,
        subdomains: cfg.subdomains || 'abcd'
      }).addTo(map);

      if (cfg.labelUrl) {
        labelTileLayer = L.tileLayer(cfg.labelUrl, {
          maxZoom: cfg.maxZoom || 19,
          subdomains: cfg.subdomains || 'abcd',
          pane: 'markerPane'
        }).addTo(map);
      }
    }

    function renderAllMapElements() {
      if (!map || !routeLayerGroup) return;
      routeLayerGroup.clearLayers();
      pinLayerGroup.clearLayers();

      var routesData = ${JSON.stringify(allRoutes)};
      var selId = ${JSON.stringify(selectedRouteId)};
      var activeCoords = [];
      var selRoute = null;

      // 1. Render Alternative Routes first
      routesData.forEach(function(route) {
        if (!route.coordinates || route.coordinates.length === 0) return;
        var isSel = route.id === selId || (!selId && route.is_best);
        if (isSel) {
          selRoute = route;
          activeCoords = route.coordinates;
          return;
        }

        var coords = route.coordinates;

        // Clean Solid Alternative Line
        var poly = L.polyline(coords, {
          color: '#94A3B8',
          weight: 4,
          opacity: 0.75,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(routeLayerGroup);

        poly.on('click', function() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_ROUTE', routeId: route.id }));
          }
        });

        // Midpoint Route Time Badge
        if (coords.length > 2) {
          var midIdx = Math.floor(coords.length / 2);
          var midPt = coords[midIdx];
          var timeDiff = Math.round((route.predicted_eta_p50 || 0) - (selRoute ? selRoute.predicted_eta_p50 : 0));
          var badgeLabel = (timeDiff > 0 ? '+' + timeDiff + ' min' : (route.predicted_eta_p50 || '') + ' min');

          var altBadgeIcon = L.divIcon({
            className: '',
            html: '<div class="simple-route-badge alt-route-badge">' + badgeLabel + '</div>',
            iconAnchor: [30, 12]
          });

          var altMarker = L.marker(midPt, { icon: altBadgeIcon, zIndexOffset: 200 }).addTo(routeLayerGroup);
          altMarker.on('click', function() {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_ROUTE', routeId: route.id }));
            }
          });
        }
      });

      // 2. Render Active Selected Route (Clean Solid Polyline - No Glow)
      if (selRoute && activeCoords.length > 1) {
        // Subtle outer border line for contrast
        L.polyline(activeCoords, {
          color: '#FFFFFF',
          weight: 8,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(routeLayerGroup);

        // Solid Active Line (Navigation Blue)
        L.polyline(activeCoords, {
          color: '#2563EB',
          weight: 5.5,
          opacity: 1.0,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(routeLayerGroup);

        // Midpoint Active Route ETA Badge
        var midIdx = Math.floor(activeCoords.length / 2);
        var midPt = activeCoords[midIdx];
        var bestBadgeHtml = '<div class="simple-route-badge active-route-badge">' +
          '<span class="badge-time">' + selRoute.predicted_eta_p50 + ' min</span>' +
          '<span>(' + selRoute.distance_km + ' km)</span>' +
        '</div>';

        var bestIcon = L.divIcon({
          className: '',
          html: bestBadgeHtml,
          iconAnchor: [50, 14]
        });
        L.marker(midPt, { icon: bestIcon, zIndexOffset: 500 }).addTo(routeLayerGroup);
      }

      // 3. Render Origin (A) and Destination (B) Simple Markers
      if (activeCoords.length >= 2) {
        var startPt = activeCoords[0];
        var endPt = activeCoords[activeCoords.length - 1];

        // Origin Pin (A)
        var originIcon = L.divIcon({
          className: '',
          html: '<div class="clean-pin-marker origin-pin-bg">A</div>',
          iconAnchor: [13, 13]
        });
        L.marker(startPt, { icon: originIcon, zIndexOffset: 600 }).addTo(pinLayerGroup);

        // Destination Pin (B)
        var destIcon = L.divIcon({
          className: '',
          html: '<div class="clean-pin-marker dest-pin-bg">B</div>',
          iconAnchor: [13, 13]
        });
        L.marker(endPt, { icon: destIcon, zIndexOffset: 600 }).addTo(pinLayerGroup);

        if (!${isNavigating}) {
          map.fitBounds(L.polyline(activeCoords).getBounds(), { padding: [50, 50], maxZoom: 15 });
        }
      }
    }

    function renderVehicle(lat, lon, heading, navigating) {
      if (!map) return;
      var puckHtml = '<div class="vehicle-marker-wrapper">' +
        '<div class="vehicle-core-dot" style="transform: rotate(' + heading + 'deg);">' +
          '<div class="vehicle-arrow-tip"></div>' +
        '</div>' +
      '</div>';

      var puckIcon = L.divIcon({
        className: '',
        html: puckHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      if (vehicleMarker) {
        vehicleMarker.setLatLng([lat, lon]);
        vehicleMarker.setIcon(puckIcon);
      } else {
        vehicleMarker = L.marker([lat, lon], { icon: puckIcon, zIndexOffset: 1000 }).addTo(map);
      }

      if (navigating) {
        map.setView([lat, lon], 16, { animate: true });
      }
    }

    // Bridge RPC Methods
    window.updateVehicle = function(lat, lon, heading, navigating) {
      renderVehicle(lat, lon, heading, navigating);
    };

    window.setMapLayerConfig = function(cfgJson) {
      currentLayerConfig = JSON.parse(cfgJson);
      applyTileLayers(currentLayerConfig);
    };

    window.recenterMap = function(lat, lon, zoom) {
      if (map) map.setView([lat, lon], zoom || 14, { animate: true });
    };

    window.zoomMap = function(delta) {
      if (map) map.setZoom(map.getZoom() + delta);
    };

    window.fitRouteBounds = function() {
      if (!map) return;
      var routesData = ${JSON.stringify(allRoutes)};
      var selId = ${JSON.stringify(selectedRouteId)};
      var sel = routesData.find(function(r){ return r.id === selId; }) || routesData[0];
      if (sel && sel.coordinates && sel.coordinates.length > 1) {
        map.fitBounds(L.polyline(sel.coordinates).getBounds(), { padding: [50, 50], maxZoom: 15 });
      }
    };

    window.onload = initMap;
  </script>
</body>
</html>`;
}

/**
 * Clean Vector Route Visualizer Fallback (SVG).
 */
const RouteIllustrationMap: React.FC<{
  coordinates: [number, number][];
  currentLat: number;
  currentLon: number;
  headingDeg: number;
  isNavigating?: boolean;
  selectedRoute?: any;
}> = ({
  coordinates,
  currentLat,
  currentLon,
  headingDeg,
  selectedRoute
}) => {
  const { width: winWidth, height: winHeight } = useWindowDimensions();
  const width = Math.max(320, winWidth);
  const height = Math.max(400, winHeight - 120);
  const padding = 50;

  const { points, puckPos } = useMemo(() => {
    if (!coordinates || coordinates.length < 2) {
      return {
        points: [
          { x: 50, y: height - 80 },
          { x: 110, y: height - 150 },
          { x: 180, y: height - 210 },
          { x: 260, y: height - 280 },
          { x: width - 60, y: 70 }
        ],
        puckPos: { x: 110, y: height - 150 }
      };
    }

    const lats = coordinates.map(c => c[0]);
    const lons = coordinates.map(c => c[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const latSpan = Math.max(0.0005, maxLat - minLat);
    const lonSpan = Math.max(0.0005, maxLon - minLon);

    const availW = width - 2 * padding;
    const availH = height - 2 * padding;
    const scale = Math.min(availW / lonSpan, availH / latSpan);

    const offsetX = (width - lonSpan * scale) / 2;
    const offsetY = (height - latSpan * scale) / 2;

    const pts = coordinates.map(([lat, lon]) => ({
      x: offsetX + (lon - minLon) * scale,
      y: height - (offsetY + (lat - minLat) * scale)
    }));

    const puckX = offsetX + ((currentLon - minLon) / lonSpan) * (lonSpan * scale);
    const puckY = height - (offsetY + ((currentLat - minLat) / latSpan) * (latSpan * scale));

    return {
      points: pts,
      puckPos: {
        x: Math.max(padding, Math.min(width - padding, puckX)),
        y: Math.max(padding, Math.min(height - padding, puckY))
      }
    };
  }, [coordinates, currentLat, currentLon, width, height]);

  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`, '');
  }, [points]);

  const originPt = points[0] || { x: 50, y: height - 80 };
  const destPt = points[points.length - 1] || { x: width - 60, y: 70 };
  const midPt = points[Math.floor(points.length / 2)] || { x: width / 2, y: height / 2 };

  return (
    <View style={styles.illustrationContainer}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#1E293B" stopOpacity="1" />
            <Stop offset="100%" stopColor="#0F172A" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        <Rect x="0" y="0" width={width} height={height} fill="url(#bgGrad)" />

        {/* Clean Solid Route Path - No Glow */}
        <Path d={pathD} fill="none" stroke="#FFFFFF" strokeWidth="8" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round" />
        <Path d={pathD} fill="none" stroke="#2563EB" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Origin Pin A */}
        <G transform={`translate(${originPt.x}, ${originPt.y})`}>
          <Circle cx="0" cy="0" r="12" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
          <SvgText x="0" y="4" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
            A
          </SvgText>
        </G>

        {/* Destination Pin B */}
        <G transform={`translate(${destPt.x}, ${destPt.y})`}>
          <Circle cx="0" cy="0" r="12" fill="#16A34A" stroke="#FFFFFF" strokeWidth="2" />
          <SvgText x="0" y="4" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
            B
          </SvgText>
        </G>

        {/* Midpoint ETA Badge */}
        {selectedRoute && (
          <G transform={`translate(${midPt.x - 40}, ${midPt.y - 12})`}>
            <Rect width="80" height="24" rx="12" fill="#0F172A" stroke="#2563EB" strokeWidth="1.5" />
            <SvgText x="40" y="16" fill="#60A5FA" fontSize="10" fontWeight="bold" textAnchor="middle">
              {`${selectedRoute.predicted_eta_p50} min`}
            </SvgText>
          </G>
        )}

        {/* Vehicle Dot */}
        <G transform={`translate(${puckPos.x}, ${puckPos.y})`}>
          <Circle cx="0" cy="0" r="10" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
        </G>
      </Svg>
    </View>
  );
};

export const CockpitMap: React.FC<{
  style?: any;
}> = ({ style }) => {
  const mapContainerRef = useRef<any>(null);
  const webViewRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const baseTileRef = useRef<any>(null);
  const labelTileRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const pinLayerRef = useRef<any>(null);
  const puckMarkerRef = useRef<any>(null);
  const hasFittedRef = useRef<boolean>(false);

  const [activeLayerIndex, setActiveLayerIndex] = useState(0);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [useFallbackSvg, setUseFallbackSvg] = useState(false);

  const currentLat = useNavigationStore(s => s.currentLat);
  const currentLon = useNavigationStore(s => s.currentLon);
  const headingDeg = useNavigationStore(s => s.headingDeg);
  const isNavigating = useNavigationStore(s => s.isNavigating);
  const routingData = useNavigationStore(s => s.routingData);
  const selectedRouteId = useNavigationStore(s => s.selectedRouteId);
  const setSelectedRouteId = useNavigationStore(s => s.setSelectedRouteId);

  const allRoutes = routingData?.routes ?? [];
  const selectedRoute = useMemo(
    () => allRoutes.find(r => r.id === selectedRouteId) || allRoutes[0],
    [allRoutes, selectedRouteId]
  );
  const coordinates: [number, number][] = useMemo(
    () => selectedRoute?.coordinates ?? [],
    [selectedRoute]
  );

  const currentLayer = MAP_LAYERS[activeLayerIndex];

  // Select Map Layer
  const handleSelectLayer = useCallback((index: number) => {
    setActiveLayerIndex(index);
    setShowLayerMenu(false);
    const cfg = MAP_LAYERS[index];

    if (Platform.OS === 'web' && mapRef.current) {
      if (baseTileRef.current) mapRef.current.removeLayer(baseTileRef.current);
      if (labelTileRef.current) mapRef.current.removeLayer(labelTileRef.current);

      const L = (window as any)?.L;
      if (L) {
        baseTileRef.current = L.tileLayer(cfg.url, {
          maxZoom: cfg.maxZoom || 19,
          subdomains: cfg.subdomains || 'abcd'
        }).addTo(mapRef.current);

        if (cfg.labelUrl) {
          labelTileRef.current = L.tileLayer(cfg.labelUrl, {
            maxZoom: cfg.maxZoom || 19,
            subdomains: cfg.subdomains || 'abcd',
            pane: 'markerPane'
          }).addTo(mapRef.current);
        }
      }
    } else if (webViewRef.current) {
      webViewRef.current.injectJavaScript(
        `if (window.setMapLayerConfig) window.setMapLayerConfig('${JSON.stringify(cfg)}'); true;`
      );
    }
  }, []);

  // Recenter map
  const handleRecenter = useCallback(() => {
    if (Platform.OS === 'web' && mapRef.current) {
      mapRef.current.setView([currentLat, currentLon], isNavigating ? 16 : 14, { animate: true });
    } else if (webViewRef.current) {
      webViewRef.current.injectJavaScript(
        `if (window.recenterMap) window.recenterMap(${currentLat}, ${currentLon}, ${isNavigating ? 16 : 14}); true;`
      );
    }
  }, [currentLat, currentLon, isNavigating]);

  // Fit all routes in viewport
  const handleFitRouteBounds = useCallback(() => {
    if (Platform.OS === 'web' && mapRef.current && coordinates.length > 1) {
      const L = (window as any)?.L;
      if (L) {
        mapRef.current.fitBounds(L.polyline(coordinates).getBounds(), {
          padding: [50, 50],
          maxZoom: 15
        });
      }
    } else if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`if (window.fitRouteBounds) window.fitRouteBounds(); true;`);
    }
  }, [coordinates]);

  // Zoom In / Out
  const handleZoom = useCallback((delta: number) => {
    if (Platform.OS === 'web' && mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + delta);
    } else if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`if (window.zoomMap) window.zoomMap(${delta}); true;`);
    }
  }, []);

  // Send vehicle updates to Native WebView
  useEffect(() => {
    if (Platform.OS !== 'web' && webViewRef.current) {
      webViewRef.current.injectJavaScript(
        `if (window.updateVehicle) window.updateVehicle(${currentLat}, ${currentLon}, ${headingDeg}, ${isNavigating}); true;`
      );
    }
  }, [currentLat, currentLon, headingDeg, isNavigating]);

  // Web Leaflet Initialization
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }

    if (!document.getElementById('leaflet-custom-style')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'leaflet-custom-style';
      styleEl.innerHTML = SHARED_MAP_CSS;
      document.head.appendChild(styleEl);
    }

    const initWebMap = () => {
      const L = (window as any)?.L;
      if (!L || !mapContainerRef.current || mapRef.current) return;

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        center: [currentLat, currentLon],
        zoom: 13,
        preferCanvas: true
      });

      const cfg = MAP_LAYERS[activeLayerIndex];
      baseTileRef.current = L.tileLayer(cfg.url, {
        maxZoom: cfg.maxZoom || 19,
        subdomains: cfg.subdomains || 'abcd'
      }).addTo(map);

      if (cfg.labelUrl) {
        labelTileRef.current = L.tileLayer(cfg.labelUrl, {
          maxZoom: cfg.maxZoom || 19,
          subdomains: cfg.subdomains || 'abcd',
          pane: 'markerPane'
        }).addTo(map);
      }

      routeLayerRef.current = L.layerGroup().addTo(map);
      pinLayerRef.current = L.layerGroup().addTo(map);

      mapRef.current = map;
    };

    if ((window as any)?.L) {
      initWebMap();
    } else if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = LEAFLET_JS;
      script.onload = initWebMap;
      document.head.appendChild(script);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Web Leaflet Polylines, Markers & Badges Sync
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const L = (window as any)?.L;
    const map = mapRef.current;
    if (!L || !map || !routeLayerRef.current || !pinLayerRef.current) return;

    routeLayerRef.current.clearLayers();
    pinLayerRef.current.clearLayers();

    if (allRoutes.length === 0) return;

    const sel = selectedRoute || allRoutes[0];
    const activeCoords: [number, number][] = sel?.coordinates ?? [];

    // 1. Alternative Routes
    allRoutes.forEach((route) => {
      if (!route.coordinates || route.coordinates.length === 0) return;
      const isSelected = route.id === sel?.id;
      if (isSelected) return;

      const coords = route.coordinates;

      // Clean Solid Line
      const poly = L.polyline(coords, {
        color: '#94A3B8',
        weight: 4,
        opacity: 0.75,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(routeLayerRef.current);

      poly.on('click', () => setSelectedRouteId(route.id));

      // Midpoint Time Badge
      if (coords.length > 2) {
        const midIdx = Math.floor(coords.length / 2);
        const midPt = coords[midIdx];
        const timeDiff = Math.round((route.predicted_eta_p50 || 0) - (sel ? sel.predicted_eta_p50 : 0));
        const badgeLabel = timeDiff > 0 ? `+${timeDiff} min` : `${route.predicted_eta_p50} min`;

        const altBadgeIcon = L.divIcon({
          className: '',
          html: `<div class="simple-route-badge alt-route-badge">${badgeLabel}</div>`,
          iconAnchor: [30, 12]
        });

        const altMarker = L.marker(midPt, { icon: altBadgeIcon, zIndexOffset: 200 }).addTo(routeLayerRef.current);
        altMarker.on('click', () => setSelectedRouteId(route.id));
      }
    });

    // 2. Selected Active Route (Clean Solid Polyline - No Glow)
    if (activeCoords.length > 1) {
      // Subtle white outline casing for high contrast on streets
      L.polyline(activeCoords, {
        color: '#FFFFFF',
        weight: 8,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(routeLayerRef.current);

      // Solid Navigation Blue Line
      L.polyline(activeCoords, {
        color: '#2563EB',
        weight: 5.5,
        opacity: 1.0,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(routeLayerRef.current);

      // Midpoint Active Route ETA Badge
      const midIdx = Math.floor(activeCoords.length / 2);
      const midPt = activeCoords[midIdx];
      const bestBadgeHtml = `<div class="simple-route-badge active-route-badge">` +
        `<span class="badge-time">${sel.predicted_eta_p50} min</span>` +
        `<span>(${sel.distance_km} km)</span>` +
      `</div>`;

      const bestIcon = L.divIcon({
        className: '',
        html: bestBadgeHtml,
        iconAnchor: [50, 14]
      });
      L.marker(midPt, { icon: bestIcon, zIndexOffset: 500 }).addTo(routeLayerRef.current);

      // 3. Origin (A) and Destination (B) Pin Markers
      const startPt = activeCoords[0];
      const endPt = activeCoords[activeCoords.length - 1];

      const originIcon = L.divIcon({
        className: '',
        html: `<div class="clean-pin-marker origin-pin-bg">A</div>`,
        iconAnchor: [13, 13]
      });
      L.marker(startPt, { icon: originIcon, zIndexOffset: 600 }).addTo(pinLayerRef.current);

      const destIcon = L.divIcon({
        className: '',
        html: `<div class="clean-pin-marker dest-pin-bg">B</div>`,
        iconAnchor: [13, 13]
      });
      L.marker(endPt, { icon: destIcon, zIndexOffset: 600 }).addTo(pinLayerRef.current);

      if (!hasFittedRef.current && !isNavigating) {
        map.fitBounds(L.polyline(activeCoords).getBounds(), { padding: [50, 50], maxZoom: 15 });
        hasFittedRef.current = true;
      }
    }
  }, [allRoutes, selectedRoute?.id, coordinates, isNavigating, setSelectedRouteId]);

  // Web Leaflet Vehicle Marker Sync
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const L = (window as any)?.L;
    const map = mapRef.current;
    if (!L || !map) return;

    const puckHtml = `
      <div class="vehicle-marker-wrapper">
        <div class="vehicle-core-dot" style="transform: rotate(${headingDeg}deg);">
          <div class="vehicle-arrow-tip"></div>
        </div>
      </div>`;

    const puckIcon = L.divIcon({
      className: '',
      html: puckHtml,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    if (puckMarkerRef.current) {
      puckMarkerRef.current.setLatLng([currentLat, currentLon]);
      puckMarkerRef.current.setIcon(puckIcon);
    } else {
      puckMarkerRef.current = L.marker([currentLat, currentLon], {
        icon: puckIcon,
        zIndexOffset: 1000
      }).addTo(map);
    }

    if (isNavigating) {
      map.setView([currentLat, currentLon], 16, { animate: true });
    }
  }, [currentLat, currentLon, headingDeg, isNavigating]);

  const nativeHtml = useMemo(() => {
    if (Platform.OS === 'web' || !WebViewComponent) return '';
    return buildNativeLeafletHtml(
      allRoutes,
      selectedRouteId,
      currentLat,
      currentLon,
      headingDeg,
      isNavigating,
      currentLayer
    );
  }, [allRoutes, selectedRouteId, currentLat, currentLon, headingDeg, isNavigating, currentLayer]);

  return (
    <View style={[styles.container, style]}>
      {Platform.OS === 'web' ? (
        <div
          ref={mapContainerRef}
          style={{ width: '100%', height: '100%', backgroundColor: '#E2E8F0' }}
        />
      ) : WebViewComponent && !useFallbackSvg ? (
        <WebViewComponent
          ref={webViewRef}
          source={{ html: nativeHtml }}
          style={styles.webView}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={(e: any) => {
            try {
              const d = JSON.parse(e.nativeEvent.data);
              if (d.type === 'SELECT_ROUTE') setSelectedRouteId(d.routeId);
            } catch {}
          }}
          onError={() => setUseFallbackSvg(true)}
        />
      ) : (
        <RouteIllustrationMap
          coordinates={coordinates}
          currentLat={currentLat}
          currentLon={currentLon}
          headingDeg={headingDeg}
          isNavigating={isNavigating}
          selectedRoute={selectedRoute}
        />
      )}

      {/* Cockpit Floating Controls Island (Right Side) */}
      <View style={styles.floatingControlsIsland}>
        {/* Recenter User Location */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleRecenter}
          style={styles.controlButton}
          hitSlop={spacing.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Recenter map on current location"
        >
          <LocateFixed size={18} color="#2563EB" strokeWidth={2.4} />
        </TouchableOpacity>

        {/* Fit Entire Route Bounds */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleFitRouteBounds}
          style={styles.controlButton}
          hitSlop={spacing.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Fit all route options in map viewport"
        >
          <Maximize2 size={16} color={colors.text.bright} strokeWidth={2.2} />
        </TouchableOpacity>

        {/* Layer Switcher Button */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setShowLayerMenu(prev => !prev)}
          style={[styles.controlButton, showLayerMenu && styles.controlButtonActive]}
          hitSlop={spacing.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Toggle map layer selector"
        >
          <Layers size={17} color={showLayerMenu ? '#2563EB' : colors.text.bright} strokeWidth={2.2} />
        </TouchableOpacity>

        {/* Zoom In (+) */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => handleZoom(1)}
          style={styles.zoomButtonTop}
          hitSlop={spacing.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Zoom in"
        >
          <Plus size={16} color={colors.text.bright} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Zoom Out (-) */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => handleZoom(-1)}
          style={styles.zoomButtonBottom}
          hitSlop={spacing.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Zoom out"
        >
          <Minus size={16} color={colors.text.bright} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Compass Widget */}
        <View style={styles.compassCard} accessibilityLabel={`Heading ${Math.round(headingDeg)} degrees`}>
          <Compass
            size={16}
            color={colors.dangerBright}
            style={{ transform: [{ rotate: `${-headingDeg}deg` }] }}
          />
        </View>
      </View>

      {/* Map Layer Selector Floating Modal */}
      {showLayerMenu && (
        <View style={styles.layerSelectorModal}>
          <View style={styles.layerModalHeader}>
            <Text style={styles.layerModalTitle}>MAP LAYERS</Text>
            <TouchableOpacity onPress={() => setShowLayerMenu(false)}>
              <Text style={styles.layerModalClose}>Close</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.layerGrid}>
            {MAP_LAYERS.map((layer, idx) => {
              const isSelected = activeLayerIndex === idx;
              return (
                <TouchableOpacity
                  key={layer.id}
                  activeOpacity={0.8}
                  onPress={() => handleSelectLayer(idx)}
                  style={[styles.layerTileOption, isSelected && styles.layerTileOptionSelected]}
                  accessibilityRole="button"
                  accessibilityLabel={`Switch map layer to ${layer.name}`}
                >
                  <View style={styles.layerTileHeader}>
                    <Text style={[styles.layerTileName, isSelected && styles.layerTileNameSelected]}>
                      {layer.name}
                    </Text>
                    {isSelected && <Check size={14} color="#2563EB" strokeWidth={3} />}
                  </View>
                  <Text style={styles.layerTileBadge}>{layer.badge}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    position: 'relative'
  },
  webView: {
    flex: 1,
    backgroundColor: '#E2E8F0'
  },
  illustrationContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  floatingControlsIsland: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 35,
    gap: 6
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: spacing.radius.lg,
    backgroundColor: colors.overlaySurface,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 8
  },
  controlButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: colors.surface
  },
  zoomButtonTop: {
    width: 40,
    height: 32,
    borderTopLeftRadius: spacing.radius.lg,
    borderTopRightRadius: spacing.radius.lg,
    backgroundColor: colors.overlaySurface,
    borderWidth: 1.5,
    borderBottomWidth: 0.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center'
  },
  zoomButtonBottom: {
    width: 40,
    height: 32,
    borderBottomLeftRadius: spacing.radius.lg,
    borderBottomRightRadius: spacing.radius.lg,
    backgroundColor: colors.overlaySurface,
    borderWidth: 1.5,
    borderTopWidth: 0.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center'
  },
  compassCard: {
    width: 40,
    height: 36,
    borderRadius: spacing.radius.md,
    backgroundColor: colors.overlaySurface,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2
  },
  layerSelectorModal: {
    position: 'absolute',
    top: spacing.md,
    right: 56,
    width: 200,
    backgroundColor: colors.overlayCard,
    borderRadius: spacing.radius.xl,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    padding: spacing.md,
    zIndex: 50,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 14
  },
  layerModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  layerModalTitle: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright,
    letterSpacing: 0.5
  },
  layerModalClose: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary
  },
  layerGrid: {
    gap: 6
  },
  layerTileOption: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: spacing.radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  layerTileOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: colors.primaryFaint
  },
  layerTileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  layerTileName: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.text.primary
  },
  layerTileNameSelected: {
    color: '#60A5FA'
  },
  layerTileBadge: {
    fontSize: 9,
    color: colors.text.muted,
    marginTop: 1
  }
});
