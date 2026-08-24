import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import MapContainer from './components/MapContainer';
import RouteComparison from './components/RouteComparison';
import AiExplanationCard from './components/AiExplanationCard';
import TrafficFutureVision from './components/TrafficFutureVision';
import TrafficDnaChart from './components/TrafficDnaChart';
import WhatIfDeparture from './components/WhatIfDeparture';
import PredictiveRoadAlertBanner from './components/PredictiveRoadAlertBanner';
import PreferenceSelector from './components/PreferenceSelector';
import EvaluationBenchmarkModal from './components/EvaluationBenchmarkModal';
import { calculateRoutes, explainRoute, evaluateDrivingAlerts } from './services/api';
import { MapPin, Navigation, RefreshCw, Layers, ShieldCheck, Zap } from 'lucide-react';

const CORRIDORS = [
  { id: 'bangalore_tech_corridor', name: 'Bengaluru: MG Road → Whitefield' },
  { id: 'delhi_cyber_corridor', name: 'Delhi NCR: Connaught Place → Cyber City' },
  { id: 'sf_airport_corridor', name: 'San Francisco: Downtown → SFO Airport' },
];

export default function App() {
  const [corridor, setCorridor] = useState('bangalore_tech_corridor');
  const [profile, setProfile] = useState('BALANCED');
  const [trafficMode, setTrafficMode] = useState('DEMO'); // "REAL" or "DEMO"
  
  const [routeData, setRouteData] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);

  // Driving Simulation State
  const [isSimulatingDrive, setIsSimulatingDrive] = useState(false);
  const [vehicleProgress, setVehicleProgress] = useState(0.1);
  const [vehiclePosition, setVehiclePosition] = useState(null);
  const [activeAlert, setActiveAlert] = useState(null);

  // Benchmark Modal State
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);

  const driveIntervalRef = useRef(null);

  // Fetch routes whenever corridor, profile, or traffic mode changes
  useEffect(() => {
    fetchRoutes();
  }, [corridor, profile, trafficMode]);

  async function fetchRoutes() {
    setIsLoading(true);
    try {
      const res = await calculateRoutes({
        corridor_preset: corridor,
        preference_profile: profile,
        force_traffic_mode: trafficMode,
      });
      setRouteData(res);
      // Default selection to Best Route
      setSelectedRouteId(res.best_route_id || (res.routes?.[0]?.id ?? null));
      // Set initial vehicle position to origin
      if (res.origin) {
        setVehiclePosition([res.origin.lat, res.origin.lon]);
      }
    } catch (e) {
      console.error('Failed to calculate routes:', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRefreshExplanation() {
    if (!routeData?.verified_facts) return;
    setIsExplaining(true);
    try {
      const expRes = await explainRoute(routeData.verified_facts);
      setRouteData((prev) => ({
        ...prev,
        explanation: expRes,
      }));
    } catch (e) {
      console.error('Failed to refresh explanation:', e);
    } finally {
      setIsExplaining(false);
    }
  }

  // Handle Driving Simulation
  useEffect(() => {
    if (!isSimulatingDrive) {
      if (driveIntervalRef.current) clearInterval(driveIntervalRef.current);
      return;
    }

    const activeRoute = routeData?.routes?.find((r) => r.id === selectedRouteId) || routeData?.routes?.[0];
    if (!activeRoute || !activeRoute.coordinates || activeRoute.coordinates.length < 2) return;

    const coords = activeRoute.coordinates;
    let step = 0;

    driveIntervalRef.current = setInterval(async () => {
      step = (step + 1) % coords.length;
      const progress = step / (coords.length - 1);
      setVehicleProgress(progress);
      setVehiclePosition(coords[step]);

      // Telemetry Alert Evaluation every few steps
      if (step % 2 === 0 && routeData) {
        try {
          const alertRes = await evaluateDrivingAlerts({
            current_speed_kmh: 42.0,
            progress_pct: progress,
            active_route: activeRoute,
            all_routes: routeData.routes,
            best_route_id: routeData.best_route_id,
          });
          if (alertRes.has_alert) {
            setActiveAlert(alertRes.alert);
          }
        } catch (e) {
          console.debug('Alert check error:', e);
        }
      }
    }, 2200);

    return () => clearInterval(driveIntervalRef.current);
  }, [isSimulatingDrive, routeData, selectedRouteId]);

  const selectedRoute =
    routeData?.routes?.find((r) => r.id === selectedRouteId) || routeData?.routes?.[0];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header
        routingProvenance={routeData?.routing_provenance}
        trafficProvenance={routeData?.traffic_provenance}
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        isSimulatingDrive={isSimulatingDrive}
        onToggleSimulateDrive={() => setIsSimulatingDrive(!isSimulatingDrive)}
        trafficMode={trafficMode}
        onToggleTrafficMode={() => setTrafficMode(trafficMode === 'REAL' ? 'DEMO' : 'REAL')}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 flex flex-col gap-5">
        {/* Predictive Road Alert Banner (Proactive Notification Toast) */}
        <PredictiveRoadAlertBanner
          alert={activeAlert}
          onDismiss={() => setActiveAlert(null)}
          onSwitchRoute={(newRouteId) => {
            setSelectedRouteId(newRouteId);
            setActiveAlert(null);
          }}
        />

        {/* Top Control Bar: Corridor Presets & Preferences */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Corridor Preset Picker */}
          <div className="lg:col-span-4 glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  Navigation Corridor
                </span>
                <span className="text-[10px] font-mono text-slate-400">OSRM Linked</span>
              </div>
              <div className="space-y-1.5">
                {CORRIDORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCorridor(c.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      corridor === c.id
                        ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 shadow-sm'
                        : 'bg-slate-900/50 hover:bg-slate-900 text-slate-300 border border-transparent'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="truncate">Origin: {routeData?.origin?.name || 'Loading...'}</span>
              <button
                onClick={fetchRoutes}
                disabled={isLoading}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-mono text-[11px]"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Recalculate</span>
              </button>
            </div>
          </div>

          {/* User Objective Profile Selector */}
          <div className="lg:col-span-8">
            <PreferenceSelector
              currentProfile={profile}
              onSelectProfile={(newProfile) => setProfile(newProfile)}
            />
          </div>
        </div>

        {/* Central Map & Primary Route Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Map Cockpit View */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <MapContainer
              routes={routeData?.routes || []}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
              origin={routeData?.origin}
              destination={routeData?.destination}
              vehiclePosition={vehiclePosition}
              isSimulatingDrive={isSimulatingDrive}
            />

            {/* Traffic Future Vision Timeline */}
            {selectedRoute && <TrafficFutureVision selectedRoute={selectedRoute} />}
          </div>

          {/* Route Intelligence Panel */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Side-by-Side Fastest vs Best Comparison */}
            <RouteComparison
              routes={routeData?.routes || []}
              fastestRouteId={routeData?.fastest_route_id}
              bestRouteId={routeData?.best_route_id}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
              areDifferent={routeData?.are_different}
            />

            {/* Why This Route? Local AI Explanation Card */}
            <AiExplanationCard
              explanationData={routeData?.explanation}
              verifiedFacts={routeData?.verified_facts}
              onRefreshExplanation={handleRefreshExplanation}
              isLoadingExplanation={isExplaining}
            />
          </div>
        </div>

        {/* Lower Row: What-If Departure & Traffic DNA Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* What-If Departure Planner */}
          {routeData?.routes && <WhatIfDeparture routes={routeData.routes} />}

          {/* 24-Hour Traffic DNA Bar Visualizer */}
          {selectedRoute && <TrafficDnaChart selectedRoute={selectedRoute} />}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#080c14] border-t border-slate-800/80 px-4 py-3 text-center text-xs text-slate-500">
        Predictive &bull; Explainable &bull; Multi-Objective &bull; Zero-Hallucination Local AI Engine &bull; Built with FastAPI, Chronos-2, OSRM & React
      </footer>

      {/* Evaluation Benchmark Modal */}
      <EvaluationBenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
      />
    </div>
  );
}
