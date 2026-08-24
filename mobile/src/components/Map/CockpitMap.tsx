import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LocateFixed, Compass, Map as MapIcon, Navigation2 } from 'lucide-react-native';
import { useNavigationStore } from '../../store/navigationStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const LEAFLET_VERSION = '1.9.4';
const LEAFLET_CSS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
const LEAFLET_JS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;

/**
 * Subresource Integrity hashes for the pinned Leaflet release.
 *
 * These are intentionally empty: a wrong hash silently breaks the map, and the
 * correct base64 digests must be taken from the Leaflet release notes for the
 * exact version above. When populated, they are applied automatically below.
 *
 * The durable fix is to install Leaflet as a pinned npm dependency and bundle
 * it, which removes the third-party CDN from the trust boundary entirely.
 */
const LEAFLET_SRI: { css?: string; js?: string } = {};

export const CockpitMap: React.FC<{ style?: any }> = ({ style }) => {
  const mapContainerRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const puckMarkerRef = useRef<any>(null);
  const hasFittedRef = useRef(false);

  const routingData = useNavigationStore(s => s.routingData);
  const selectedRouteId = useNavigationStore(s => s.selectedRouteId);
  const setSelectedRouteId = useNavigationStore(s => s.setSelectedRouteId);
  const isNavigating = useNavigationStore(s => s.isNavigating);
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
   * Load Leaflet and create the map exactly once.
   *
   * Previously a single effect depending on `currentLat`/`currentLon`/`headingDeg`
   * tore down and rebuilt every polyline and marker on each 1.2s telemetry tick.
   */
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    let cancelled = false;

    const createMap = () => {
      if (cancelled) return;
      const L = (window as any).L;
      const container = mapContainerRef.current;
      if (!L || !container || mapRef.current) return;

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
    };

    if ((window as any).L) {
      createMap();
    } else {
      if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = LEAFLET_CSS;
        link.crossOrigin = 'anonymous';
        if (LEAFLET_SRI.css) link.integrity = LEAFLET_SRI.css;
        document.head.appendChild(link);
      }

      const existing = document.querySelector<HTMLScriptElement>(`script[src="${LEAFLET_JS}"]`);
      if (existing) {
        existing.addEventListener('load', createMap);
      } else {
        const script = document.createElement('script');
        script.src = LEAFLET_JS;
        script.crossOrigin = 'anonymous';
        if (LEAFLET_SRI.js) script.integrity = LEAFLET_SRI.js;
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
    // Intentionally empty: the map is created once and mutated by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Redraw route polylines and endpoints only when the routes themselves change. */
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

    // Origin and destination pins for the selected route.
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

    // Fit the corridor once, then leave the camera under user/nav control.
    if (!isNavigating && coordinates.length > 0 && !hasFittedRef.current) {
      map.fitBounds(L.latLngBounds(coordinates), { padding: [30, 30], maxZoom: 15 });
      hasFittedRef.current = true;
    }
  }, [routes, selectedRouteId, coordinates, isNavigating, setSelectedRouteId]);

  /** Move the vehicle puck. Reuses one marker instead of recreating it. */
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

  // Re-fit when the corridor changes.
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
        /*
          Native has no interactive map: `react-native-maps` / `expo-maps` is not
          installed. Rather than implying a map is present, state it plainly and
          show the telemetry that is actually available.
        */
        <View style={styles.nativeFallback}>
          <View style={styles.nativeIconBox}>
            <MapIcon size={28} color={colors.text.secondary} />
          </View>
          <Text style={styles.nativeTitle}>Map view unavailable on device</Text>
          <Text style={styles.nativeBody}>
            The interactive map currently renders on web only. Turn-by-turn guidance,
            alerts, and telemetry below are fully functional.
          </Text>

          <View style={styles.nativeStats}>
            <View style={styles.nativeStat}>
              <Text style={styles.nativeStatLabel}>POSITION</Text>
              <Text style={styles.nativeStatVal}>
                {currentLat.toFixed(4)}, {currentLon.toFixed(4)}
              </Text>
            </View>
            <View style={styles.nativeStat}>
              <Text style={styles.nativeStatLabel}>HEADING</Text>
              <View style={styles.nativeHeadingRow}>
                <Navigation2
                  size={12}
                  color={colors.primary}
                  strokeWidth={3}
                  style={{ transform: [{ rotate: `${headingDeg - 45}deg` }] }}
                />
                <Text style={styles.nativeStatVal}>{Math.round(headingDeg)}°</Text>
              </View>
            </View>
          </View>

          {selectedRoute && (
            <Text style={styles.nativeRoute} numberOfLines={1}>
              Following {selectedRoute.name}
            </Text>
          )}
        </View>
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
  nativeFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    padding: spacing.xxl
  },
  nativeIconBox: {
    width: 56,
    height: 56,
    borderRadius: spacing.radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg
  },
  nativeTitle: {
    fontSize: typography.sizes.h3,
    lineHeight: typography.line.h3,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center'
  },
  nativeBody: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 300
  },
  nativeStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxl,
    alignSelf: 'stretch',
    maxWidth: 340
  },
  nativeStat: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    padding: spacing.lg
  },
  nativeStatLabel: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted
  },
  nativeStatVal: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.bold,
    color: colors.text.body,
    marginTop: 2
  },
  nativeHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2
  },
  nativeRoute: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.primary,
    fontWeight: typography.weights.bold,
    marginTop: spacing.lg
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
