import { fetchJson } from './api';
import { RouteData } from './routingService';
import {
  startSimulatedNavSession,
  updateSimulatedNavStep,
  generateSimulatedManeuvers
} from './demoFallbackEngine';

export {
  startSimulatedNavSession,
  updateSimulatedNavStep,
  generateSimulatedManeuvers
};

export interface Maneuver {
  step: number;
  type: string;
  icon: string;
  instruction: string;
  distance_km: number;
  road_name: string;
  congestion?: number;
  dist_to_action_m?: number;
  display_instruction?: string;
}

export interface NavigationSessionStart {
  status: string;
  route_id: string;
  route_name: string;
  total_distance_km: number;
  remaining_distance_km: number;
  eta_minutes: number;
  arrival_time: string;
  maneuvers: Maneuver[];
  current_maneuver: Maneuver;
  speed_limit_kmh: number;
  current_speed_kmh: number;
}

export interface NavigationTelemetryUpdate {
  progress_pct: number;
  remaining_distance_km: number;
  remaining_eta_min: number;
  arrival_time: string;
  current_lat: number;
  current_lon: number;
  heading_deg: number;
  current_speed_kmh: number;
  speed_limit_kmh: number;
  current_maneuver: Maneuver;
  upcoming_segment: any;
  has_alert: boolean;
  alert: {
    level: string;
    type: string;
    title: string;
    distance_km?: number;
    message: string;
    action_label?: string;
    timestamp?: string;
    better_route_id?: string;
    savings_min?: number;
  } | null;
}

export async function startNavigationSession(
  activeRoute: RouteData,
  allRoutes: RouteData[],
  bestRouteId: string,
  fastestRouteId: string,
  currentSpeed = 45.0,
  signal?: AbortSignal
): Promise<NavigationSessionStart> {
  try {
    return await fetchJson<NavigationSessionStart>('/api/navigation/session/start', {
      method: 'POST',
      signal,
      timeoutMs: 4000,
      body: JSON.stringify({
        active_route: activeRoute,
        all_routes: allRoutes,
        best_route_id: bestRouteId,
        fastest_route_id: fastestRouteId,
        current_speed_kmh: currentSpeed
      })
    });
  } catch (err) {
    return startSimulatedNavSession(activeRoute, currentSpeed);
  }
}

export async function updateNavigationStep(
  progressPct: number,
  activeRoute: RouteData,
  allRoutes: RouteData[],
  bestRouteId: string,
  currentSpeed = 45.0,
  currentLat?: number,
  currentLon?: number,
  signal?: AbortSignal
): Promise<NavigationTelemetryUpdate> {
  try {
    return await fetchJson<NavigationTelemetryUpdate>('/api/navigation/session/update', {
      method: 'POST',
      signal,
      timeoutMs: 4000,
      body: JSON.stringify({
        progress_pct: progressPct,
        current_speed_kmh: currentSpeed,
        active_route: activeRoute,
        all_routes: allRoutes,
        best_route_id: bestRouteId,
        current_lat: currentLat,
        current_lon: currentLon
      })
    });
  } catch (err) {
    return updateSimulatedNavStep(progressPct, activeRoute, currentSpeed);
  }
}

export async function rerouteSession(
  newRouteId: string,
  allRoutes: RouteData[],
  currentProgressPct = 0.0,
  signal?: AbortSignal
): Promise<any> {
  try {
    return await fetchJson<any>('/api/navigation/session/reroute', {
      method: 'POST',
      signal,
      timeoutMs: 4000,
      body: JSON.stringify({
        new_route_id: newRouteId,
        all_routes: allRoutes,
        current_progress_pct: currentProgressPct
      })
    });
  } catch (err) {
    const newRoute = allRoutes.find(r => r.id === newRouteId) || allRoutes[0];
    const maneuvers = generateSimulatedManeuvers(newRoute);
    const etaMin = newRoute.predicted_eta_p50 || 25.0;
    const now = new Date();
    now.setMinutes(now.getMinutes() + etaMin);
    const arrivalTime = `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

    return {
      status: 'REROUTED',
      active_route: newRoute,
      maneuvers,
      current_maneuver: maneuvers[0],
      remaining_distance_km: newRoute.distance_km,
      remaining_eta_min: etaMin,
      arrival_time: arrivalTime
    };
  }
}

