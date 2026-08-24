import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { RoutingResponse, calculateRoutes } from '../services/routingService';
import {
  Maneuver,
  startNavigationSession,
  updateNavigationStep,
  rerouteSession
} from '../services/navigationService';
import { AlertData, AlertLevel, playAlertChime } from '../services/alertService';
import { toUserMessage } from '../services/api';
import { useSettingsStore } from './settingsStore';
import { DEFAULT_CORRIDOR_ID } from '../constants/corridors';
import { universalStorage } from './storage';

export type ActiveTab = 'navigate' | 'routes' | 'traffic' | 'insights' | 'profile';

interface NavigationState {
  // Corridor & Calculation
  selectedCorridor: string;
  isLoadingRoutes: boolean;
  /** Non-null when the last route calculation failed. Drives `ErrorState`. */
  routesError: string | null;
  routingData: RoutingResponse | null;
  selectedRouteId: string | null;

  // Navigation Mode
  isNavigating: boolean;
  isStartingNavigation: boolean;
  /** Non-null when starting a session or stepping telemetry failed. */
  navigationError: string | null;
  isSimulatingDrive: boolean;
  simulationSpeed: number; // 1, 2, 5
  progressPct: number; // 0.0 to 1.0
  currentSpeedKmh: number;
  speedLimitKmh: number;
  currentLat: number;
  currentLon: number;
  headingDeg: number;

  // Maneuvers & Telemetry
  maneuvers: Maneuver[];
  currentManeuver: Maneuver | null;
  remainingDistanceKm: number;
  remainingEtaMin: number;
  arrivalTime: string;
  upcomingSegment: any;

  // Alerts
  activeAlert: AlertData | null;
  isMuted: boolean;
  showLockScreenModal: boolean;
  /** Epoch ms of the last alert surfaced, used to honour the cooldown setting. */
  lastAlertAtMs: number | null;

  // UI Sheets
  bottomSheetExpanded: boolean;
  activeTab: ActiveTab;

  // Actions
  setSelectedCorridor: (corridor: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setBottomSheetExpanded: (expanded: boolean) => void;
  toggleBottomSheet: () => void;
  setSelectedRouteId: (routeId: string) => void;
  toggleMute: () => void;
  setShowLockScreenModal: (show: boolean) => void;
  clearRoutesError: () => void;
  clearNavigationError: () => void;

  // Async Route & Session Handlers
  fetchRoutes: (
    corridorOverride?: string,
    preferenceOverride?: string,
    trafficModeOverride?: string
  ) => Promise<void>;
  startNavigation: () => Promise<void>;
  stopNavigation: () => void;
  toggleDriveSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  stepSimulation: (deltaProgress?: number) => Promise<void>;
  dismissActiveAlert: () => void;
  triggerSimulatedAlert: (customAlert?: Partial<AlertData>) => void;
  acceptReroute: (newRouteId: string) => Promise<void>;
}

let stepInFlight = false;

function emitAlertCue(level: AlertLevel, isMuted: boolean): void {
  if (isMuted) return;
  if (!useSettingsStore.getState().soundEnabled) return;
  playAlertChime(level);
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      selectedCorridor: DEFAULT_CORRIDOR_ID,
      isLoadingRoutes: false,
      routesError: null,
      routingData: null,
      selectedRouteId: null,

      isNavigating: false,
      isStartingNavigation: false,
      navigationError: null,
      isSimulatingDrive: false,
      simulationSpeed: 1,
      progressPct: 0.0,
      currentSpeedKmh: 0,
      speedLimitKmh: 60.0,
      currentLat: 23.0280,
      currentLon: 72.5065,
      headingDeg: 45,

      maneuvers: [],
      currentManeuver: null,
      remainingDistanceKm: 0,
      remainingEtaMin: 0,
      arrivalTime: '--:--',
      upcomingSegment: null,

      activeAlert: null,
      isMuted: false,
      showLockScreenModal: false,
      lastAlertAtMs: null,

      bottomSheetExpanded: false,
      activeTab: 'navigate',

      setSelectedCorridor: (corridor) => {
        set({ selectedCorridor: corridor });
        get().fetchRoutes(corridor);
      },

      setActiveTab: (activeTab) => set({ activeTab }),

      setBottomSheetExpanded: (bottomSheetExpanded) => set({ bottomSheetExpanded }),

      toggleBottomSheet: () => set((state) => ({ bottomSheetExpanded: !state.bottomSheetExpanded })),

      setSelectedRouteId: (selectedRouteId) => set({ selectedRouteId }),

      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

      setShowLockScreenModal: (showLockScreenModal) => set({ showLockScreenModal }),

      clearRoutesError: () => set({ routesError: null }),

      clearNavigationError: () => set({ navigationError: null }),

      fetchRoutes: async (corridorOverride, preferenceOverride, trafficModeOverride) => {
        const corridor = corridorOverride || get().selectedCorridor;
        const settings = useSettingsStore.getState();

        set({ isLoadingRoutes: true, routesError: null });
        try {
          const res = await calculateRoutes({
            corridor_preset: corridor,
            preference_profile: preferenceOverride || settings.preferenceProfile,
            force_traffic_mode: trafficModeOverride || settings.trafficMode
          });

          if (!res.routes || res.routes.length === 0) {
            set({
              routingData: res,
              selectedRouteId: null,
              isLoadingRoutes: false,
              remainingDistanceKm: 0,
              remainingEtaMin: 0
            });
            return;
          }

          const bestId = res.best_route_id || res.routes[0].id;
          const active = res.routes.find(r => r.id === bestId) || res.routes[0];

          set({
            routingData: res,
            selectedRouteId: active.id,
            isLoadingRoutes: false,
            routesError: null,
            remainingDistanceKm: active.distance_km,
            remainingEtaMin: active.predicted_eta_p50
          });
        } catch (err) {
          set({
            isLoadingRoutes: false,
            routesError: toUserMessage(err),
            routingData: null,
            selectedRouteId: null
          });
        }
      },

      startNavigation: async () => {
        const { routingData, selectedRouteId, isMuted } = get();
        if (!routingData || !routingData.routes.length) {
          set({ navigationError: 'No route is available to navigate.' });
          return;
        }

        const activeRoute = routingData.routes.find(r => r.id === selectedRouteId) || routingData.routes[0];

        set({ isStartingNavigation: true, navigationError: null });
        try {
          const session = await startNavigationSession(
            activeRoute,
            routingData.routes,
            routingData.best_route_id,
            routingData.fastest_route_id,
            activeRoute.live_duration_min > 0
              ? Math.round((activeRoute.distance_km / activeRoute.live_duration_min) * 60)
              : 45
          );

          const firstCoord = activeRoute.coordinates?.[0];

          set({
            isNavigating: true,
            isStartingNavigation: false,
            isSimulatingDrive: true,
            progressPct: 0.0,
            currentLat: firstCoord ? firstCoord[0] : get().currentLat,
            currentLon: firstCoord ? firstCoord[1] : get().currentLon,
            maneuvers: session.maneuvers,
            currentManeuver: session.current_maneuver,
            remainingDistanceKm: session.remaining_distance_km,
            remainingEtaMin: session.eta_minutes,
            arrivalTime: session.arrival_time,
            speedLimitKmh: session.speed_limit_kmh,
            currentSpeedKmh: session.current_speed_kmh,
            bottomSheetExpanded: false
          });

          emitAlertCue('MANEUVER', isMuted);
        } catch (err) {
          set({ isStartingNavigation: false, navigationError: toUserMessage(err) });
          throw err;
        }
      },

      stopNavigation: () => {
        stepInFlight = false;
        set({
          isNavigating: false,
          isSimulatingDrive: false,
          progressPct: 0.0,
          activeAlert: null,
          navigationError: null,
          currentManeuver: null,
          maneuvers: [],
          upcomingSegment: null,
          lastAlertAtMs: null,
          bottomSheetExpanded: false
        });
      },

      toggleDriveSimulation: () => {
        set((state) => ({ isSimulatingDrive: !state.isSimulatingDrive }));
      },

      setSimulationSpeed: (simulationSpeed) => set({ simulationSpeed }),

      stepSimulation: async (deltaProgress) => {
        const {
          isNavigating,
          isSimulatingDrive,
          progressPct,
          simulationSpeed,
          routingData,
          selectedRouteId,
          activeAlert,
          isMuted,
          lastAlertAtMs
        } = get();

        if (!isNavigating || !isSimulatingDrive || !routingData) return;
        if (stepInFlight) return;

        const activeRoute = routingData.routes.find(r => r.id === selectedRouteId) || routingData.routes[0];
        if (!activeRoute) return;

        const delta = deltaProgress ?? 0.015 * simulationSpeed;
        const nextProgress = Math.min(1.0, progressPct + delta);

        stepInFlight = true;
        try {
          const update = await updateNavigationStep(
            nextProgress,
            activeRoute,
            routingData.routes,
            routingData.best_route_id,
            get().currentSpeedKmh || 45
          );

          if (update.has_alert && update.alert) {
            const settings = useSettingsStore.getState();
            const cooldownMs = settings.alertCooldownSeconds * 1000;
            const cooledDown = lastAlertAtMs === null || Date.now() - lastAlertAtMs >= cooldownMs;
            const isNewAlert = !activeAlert || activeAlert.title !== update.alert.title;

            if (settings.backgroundAlertsEnabled && isNewAlert && cooledDown) {
              emitAlertCue((update.alert.level as AlertLevel) || 'TRAFFIC_WORSENING', isMuted);
              set({ activeAlert: update.alert, lastAlertAtMs: Date.now() });
            }
          }

          set({
            progressPct: nextProgress,
            navigationError: null,
            remainingDistanceKm: update.remaining_distance_km,
            remainingEtaMin: update.remaining_eta_min,
            arrivalTime: update.arrival_time,
            currentLat: update.current_lat,
            currentLon: update.current_lon,
            headingDeg: update.heading_deg,
            currentSpeedKmh: update.current_speed_kmh,
            speedLimitKmh: update.speed_limit_kmh ?? get().speedLimitKmh,
            currentManeuver: update.current_maneuver,
            upcomingSegment: update.upcoming_segment
          });

          if (nextProgress >= 1.0) {
            set({ isSimulatingDrive: false });
          }
        } catch (err) {
          set({ isSimulatingDrive: false, navigationError: toUserMessage(err) });
        } finally {
          stepInFlight = false;
        }
      },

      dismissActiveAlert: () => set({ activeAlert: null }),

      triggerSimulatedAlert: (customAlert) => {
        const { routingData, selectedRouteId, isMuted } = get();
        const routes = routingData?.routes ?? [];
        const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[0];
        const altRoute = routes.find(r => r.id !== activeRoute?.id) || routes[1];

        const savings = activeRoute && altRoute
          ? Math.max(2.0, Math.round(activeRoute.predicted_eta_p50 - altRoute.predicted_eta_p50))
          : 6.0;

        const fakeAlert: AlertData = {
          level: 'BETTER_ROUTE',
          type: 'proactive_bottleneck_warning',
          title: 'Severe Bottleneck Predicted Ahead',
          message: `Heavy congestion (+20m forecast: 88%) detected on upcoming road. Alternative route saves ~${savings} min.`,
          action_label: 'Accept Reroute',
          better_route_id: altRoute?.id,
          savings_min: savings,
          current_cong: 72,
          fc20_cong: 88,
          expected_delay_min: 7.5,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ...(customAlert || {})
        };

        emitAlertCue('BETTER_ROUTE', isMuted);
        set({ activeAlert: fakeAlert, lastAlertAtMs: Date.now() });
      },

      acceptReroute: async (newRouteId) => {
        const { routingData, progressPct, isMuted } = get();
        if (!routingData) return;

        try {
          const rerouteRes = await rerouteSession(newRouteId, routingData.routes, progressPct);

          emitAlertCue('BETTER_ROUTE', isMuted);

          set({
            selectedRouteId: newRouteId,
            activeAlert: null,
            navigationError: null,
            maneuvers: rerouteRes.maneuvers,
            currentManeuver: rerouteRes.current_maneuver,
            remainingDistanceKm: rerouteRes.remaining_distance_km,
            remainingEtaMin: rerouteRes.remaining_eta_min,
            arrivalTime: rerouteRes.arrival_time
          });
        } catch (err) {
          set({ navigationError: toUserMessage(err) });
        }
      }
    }),
    {
      name: 'trafficiq-navigation',
      storage: createJSONStorage(() => universalStorage),
      partialize: (state) => ({
        selectedCorridor: state.selectedCorridor,
        selectedRouteId: state.selectedRouteId,
        activeTab: state.activeTab,
      }),
    }
  )
);
