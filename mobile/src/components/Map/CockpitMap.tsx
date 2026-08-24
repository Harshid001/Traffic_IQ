import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop, Line, Rect, Text as SvgText } from 'react-native-svg';
import { LocateFixed, Compass, Navigation2, Zap, ShieldCheck } from 'lucide-react-native';
import { useNavigationStore } from '../../store/navigationStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const LEAFLET_VERSION = '1.9.4';
const LEAFLET_CSS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
const LEAFLET_JS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;

/**
 * Enhanced Vector Route Map Visualizer (used on Native, offline, or during map loading).
 */
const RouteIllustrationMap: React.FC<{
  coordinates: [number, number][];
  currentLat: number;
  currentLon: number;
  headingDeg: number;
  routeName: string;
  distanceKm: number;
  etaMin: number;
  isNavigating: boolean;
  progressPct: number;
  segments?: any[];
}> = ({
  coordinates,
  currentLat,
  currentLon,
  headingDeg,
  routeName,
  distanceKm,
  etaMin,
  isNavigating,
  progressPct,
  segments = []
}) => {
  const width = 360;
  const height = 380;
  const padding = 50;

  // Project lat/lon to SVG canvas coordinates
  const { points, puckPos } = useMemo(() => {
    if (!coordinates || coordinates.length < 2) {
      // Default placeholder path
      return {
        points: [
          { x: 60, y: 300 },
          { x: 120, y: 220 },
          { x: 190, y: 200 },
          { x: 260, y: 120 },
          { x: 300, y: 60 }
        ],
        puckPos: { x: 120, y: 220 }
      };
    }

    const lats = coordinates.map(c => c[0]);
    const lons = coordinates.map(c => c[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const latSpan = Math.max(0.001, maxLat - minLat);
    const lonSpan = Math.max(0.001, maxLon - minLon);

    const pts = coordinates.map(([lat, lon]) => {
      const normX = (lon - minLon) / lonSpan;
      const normY = (lat - minLat) / latSpan;
      return {
        x: padding + normX * (width - 2 * padding),
        y: height - padding - normY * (height - 2 * padding)
      };
    });

    const puckX = padding + ((currentLon - minLon) / lonSpan) * (width - 2 * padding);
    const puckY = height - padding - ((currentLat - minLat) / latSpan) * (height - 2 * padding);

    return {
      points: pts,
      puckPos: {
        x: Math.max(padding, Math.min(width - padding, puckX)),
        y: Math.max(padding, Math.min(height - padding, puckY))
      }
    };
  }, [coordinates, currentLat, currentLon]);

  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`, '');
  }, [points]);

  const originPt = points[0] || { x: 60, y: 300 };
  const destPt = points[points.length - 1] || { x: 300, y: 60 };

  return (
    <View style={styles.illustrationContainer}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="routeGlow" x1="0" y1="1" x2="1" y2="0">
            <Stop offset="0%" stopColor={colors.info} stopOpacity="0.9" />
            <Stop offset="50%" stopColor={colors.primary} stopOpacity="0.95" />
            <Stop offset="100%" stopColor={colors.primaryBright} stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="pathBacking" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.neutral} stopOpacity="0.5" />
            <Stop offset="100%" stopColor={colors.surface} stopOpacity="0.8" />
          </LinearGradient>
        </Defs>

        {/* Ambient Grid Lines */}
        <Line x1="40" y1="100" x2="320" y2="100" stroke={colors.border} strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />
        <Line x1="40" y1="200" x2="320" y2="200" stroke={colors.border} strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />
        <Line x1="40" y1="300" x2="320" y2="300" stroke={colors.border} strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />
        <Line x1="120" y1="40" x2="120" y2="340" stroke={colors.border} strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />
        <Line x1="240" y1="40" x2="240" y2="340" stroke={colors.border} strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />

        {/* Glow halo behind active route */}
        <Path d={pathD} fill="none" stroke={colors.primary} strokeWidth="12" strokeOpacity="0.15" strokeLinecap="round" strokeLinejoin="round" />
        <Path d={pathD} fill="none" stroke={colors.primary} strokeWidth="8" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Primary Route Path */}
        <Path d={pathD} fill="none" stroke="url(#routeGlow)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Intermediate waypoint checkpoints */}
        {points.slice(1, -1).map((pt, i) => (
          <G key={`wp-${i}`}>
            <Circle cx={pt.x} cy={pt.y} r="5" fill={colors.card} stroke={colors.primaryBorder} strokeWidth="2" />
            <Circle cx={pt.x} cy={pt.y} r="2" fill={colors.primary} />
          </G>
        ))}

        {/* Origin Pin A */}
        <G>
          <Circle cx={originPt.x} cy={originPt.y} r="14" fill={colors.infoSoft} stroke={colors.info} strokeWidth="1.5" />
          <Circle cx={originPt.x} cy={originPt.y} r="9" fill={colors.info} />
          <SvgText x={originPt.x} y={originPt.y + 3.5} fill="#000" fontSize="9" fontWeight="bold" textAnchor="middle">
            A
          </SvgText>
        </G>

        {/* Destination Pin B */}
        <G>
          <Circle cx={destPt.x} cy={destPt.y} r="14" fill={colors.primarySoft} stroke={colors.primary} strokeWidth="1.5" />
          <Circle cx={destPt.x} cy={destPt.y} r="9" fill={colors.primary} />
          <SvgText x={destPt.x} y={destPt.y + 3.5} fill="#000" fontSize="9" fontWeight="bold" textAnchor="middle">
            B
          </SvgText>
        </G>

        {/* Vehicle Navigation Puck */}
        <G transform={`translate(${puckPos.x}, ${puckPos.y}) rotate(${headingDeg})`}>
          <Circle cx="0" cy="0" r="14" fill={colors.primaryGlow} />
          <Circle cx="0" cy="0" r="10" fill={colors.primary} stroke="#FFF" strokeWidth="2" />
          <Path d="M 0 -6 L 4 4 L 0 2 L -4 4 Z" fill={colors.background} />
        </G>
      </Svg>

      {/* Visual Route Info Card */}
      <View style={styles.routePill}>
        <View style={styles.routePillHeader}>
          <View style={styles.liveIndicator}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveLabel}>{isNavigating ? 'SIMULATED NAVIGATION' : 'ROUTE VISUALIZER'}</Text>
          </View>
          <Text style={styles.routeDistance}>{distanceKm} km · {etaMin} min</Text>
        </View>
        <Text style={styles.routeNameText} numberOfLines={1}>
          {routeName}
        </Text>
      </View>
    </View>
  );
};

export const CockpitMap: React.FC<{ style?: any }> = ({ style }) => {
  const mapContainerRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const puckMarkerRef = useRef<any>(null);
  const hasFittedRef = useRef(false);
  const [webMapReady, setWebMapReady] = useState(false);

  const routingData = useNavigationStore(s => s.routingData);
  const selectedRouteId = useNavigationStore(s => s.selectedRouteId);
  const setSelectedRouteId = useNavigationStore(s => s.setSelectedRouteId);
  const isNavigating = useNavigationStore(s => s.isNavigating);
  const progressPct = useNavigationStore(s => s.progressPct);
  const currentLat = useNavigationStore(s => s.currentLat);
  const currentLon = useNavigationStore(s => s.currentLon);
  const headingDeg = useNavigationStore(s => s.headingDeg);

  const routes = routingData?.routes ?? [];

  const selectedRoute = useMemo(
    () => routes.find(r => r.id === selectedRouteId) || routes[0],
    [routes, selectedRouteId]
  );

  const coordinates = selectedRoute?.coordinates ?? [];

  /**
   * Load Leaflet on Web.
   */
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    let cancelled = false;

    const createMap = () => {
      if (cancelled) return;
      const L = (window as any).L;
      const container = mapContainerRef.current;
      if (!L || !container || mapRef.current) return;

      try {
        const map = L.map(container, {
          center: [currentLat, currentLon],
          zoom: 13,
          zoomControl: false,
          attributionControl: false
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19
        }).addTo(map);

        routeLayerRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;
        setWebMapReady(true);
      } catch {
        setWebMapReady(false);
      }
    };

    if ((window as any).L) {
      createMap();
    } else {
      if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = LEAFLET_CSS;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }

      const existing = document.querySelector<HTMLScriptElement>(`script[src="${LEAFLET_JS}"]`);
      if (existing) {
        existing.addEventListener('load', createMap);
      } else {
        const script = document.createElement('script');
        script.src = LEAFLET_JS;
        script.crossOrigin = 'anonymous';
        script.onload = createMap;
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        routeLayerRef.current = null;
        puckMarkerRef.current = null;
      }
    };
  }, []);

  /** Redraw web polylines when routes change */
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const L = (window as any)?.L;
    const map = mapRef.current;
    const layer = routeLayerRef.current;
    if (!L || !map || !layer || routes.length === 0) return;

    layer.clearLayers();

    routes.forEach((route) => {
      if (!route.coordinates || route.coordinates.length === 0) return;
      const isSelected = route.id === selectedRouteId;

      const color = isSelected
        ? route.is_best
          ? colors.primary
          : route.is_fastest
            ? colors.fastest
            : colors.info
        : route.is_best
          ? colors.primaryDeep
          : route.is_fastest
            ? colors.fastestDeep
            : colors.map.inactiveDim;

      const polyline = L.polyline(route.coordinates, {
        color,
        weight: isSelected ? 6 : 4,
        opacity: isSelected ? 0.95 : 0.5,
        lineCap: 'round',
        lineJoin: 'round'
      });

      polyline.on('click', () => {
        if (!isNavigating) setSelectedRouteId(route.id);
      });

      layer.addLayer(polyline);
    });

    if (coordinates.length > 1) {
      const makePin = (label: string, bg: string) =>
        L.divIcon({
          className: '',
          html: `<div style="width:20px;height:20px;border-radius:50%;background:${bg};border:2px solid #FFF;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;color:#000;">${label}</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

      layer.addLayer(L.marker(coordinates[0], { icon: makePin('A', colors.info) }));
      layer.addLayer(
        L.marker(coordinates[coordinates.length - 1], { icon: makePin('B', colors.primary) })
      );
    }

    if (!isNavigating && coordinates.length > 0 && !hasFittedRef.current) {
      map.fitBounds(L.latLngBounds(coordinates), { padding: [30, 30], maxZoom: 15 });
      hasFittedRef.current = true;
    }
  }, [routes, selectedRouteId, coordinates, isNavigating, setSelectedRouteId]);

  /** Move vehicle puck on web */
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const L = (window as any)?.L;
    const map = mapRef.current;
    if (!L || !map) return;

    const html = `
      <div style="width:28px;height:28px;border-radius:50%;background:${colors.primary};border:2.5px solid #FFF;box-shadow:0 0 12px rgba(16,185,129,0.8);display:flex;align-items:center;justify-content:center;transform:rotate(${headingDeg}deg);transition:transform 0.3s ease;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="${colors.background}"><path d="M12 2L2 22l10-4 10 4L12 2z"/></svg>
      </div>`;

    const icon = L.divIcon({ className: '', html, iconSize: [28, 28], iconAnchor: [14, 14] });

    if (puckMarkerRef.current) {
      puckMarkerRef.current.setLatLng([currentLat, currentLon]);
      puckMarkerRef.current.setIcon(icon);
    } else {
      puckMarkerRef.current = L.marker([currentLat, currentLon], {
        icon,
        zIndexOffset: 1000
      }).addTo(map);
    }

    if (isNavigating) {
      map.setView([currentLat, currentLon], 16, { animate: true });
    }
  }, [currentLat, currentLon, headingDeg, isNavigating]);

  useEffect(() => {
    hasFittedRef.current = false;
  }, [selectedRoute?.id]);

  const handleRecenter = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setView([currentLat, currentLon], isNavigating ? 16 : 14, { animate: true });
    }
  }, [currentLat, currentLon, isNavigating]);

  return (
    <View style={[styles.container, style]}>
      {Platform.OS === 'web' ? (
        <div
          ref={mapContainerRef}
          style={{ width: '100%', height: '100%', backgroundColor: colors.background }}
        />
      ) : (
        /* Native Vector Route Map Illustration */
        <RouteIllustrationMap
          coordinates={coordinates}
          currentLat={currentLat}
          currentLon={currentLon}
          headingDeg={headingDeg}
          routeName={selectedRoute?.name || 'Active Corridor Route'}
          distanceKm={selectedRoute?.distance_km || 18.2}
          etaMin={selectedRoute?.predicted_eta_p50 || 28.0}
          isNavigating={isNavigating}
          progressPct={progressPct}
          segments={selectedRoute?.segments}
        />
      )}

      {/* Floating Recenter & Compass Controls */}
      <View style={styles.floatingControls}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleRecenter}
          style={styles.controlButton}
          hitSlop={spacing.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Recenter map on current position"
        >
          <LocateFixed size={18} color={colors.primary} />
        </TouchableOpacity>

        <View
          style={styles.controlButton}
          accessibilityLabel={`Heading ${Math.round(headingDeg)} degrees`}
        >
          <Compass size={16} color={colors.fastest} />
          <Text style={styles.compassLabel}>N</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative'
  },
  illustrationContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  routePill: {
    position: 'absolute',
    bottom: 90,
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.overlaySurface,
    borderRadius: spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    gap: 4
  },
  routePillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary
  },
  liveLabel: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.primary
  },
  routeDistance: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold
  },
  routeNameText: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.bold,
    color: colors.text.primary
  },
  floatingControls: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.xl,
    zIndex: 30,
    gap: spacing.md
  },
  controlButton: {
    width: spacing.touchTargetMin,
    height: spacing.touchTargetMin,
    borderRadius: spacing.radius.md,
    backgroundColor: colors.overlaySurface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  compassLabel: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.secondary
  }
});
