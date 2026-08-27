import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Navigation2,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  BellRing,
  X,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Compass,
  Gauge
} from 'lucide-react';
import CockpitMapCanvas from '../components/CockpitMapCanvas';
import RouteMatrix from '../components/RouteMatrix';
import CopilotWidget from '../components/CopilotWidget';
import {
  CORRIDORS,
  buildRoutes,
  interpolateDriveStep
} from '../data';

const SPEED_STEPS = [1, 2, 5];
const SIM_TICK_MS = 500; // 500ms for smooth 60fps simulation feel

export default function Demo() {
  const [corridor, setCorridor] = useState(CORRIDORS[0]);
  const [selectedRouteId, setSelectedRouteId] = useState('best');
  const [timeHorizon, setTimeHorizon] = useState('now');
  const [showGuide, setShowGuide] = useState(true);
  const tabRefs = useRef([]);

  // Navigation simulation state
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSimulatingDrive, setIsSimulatingDrive] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [progressPct, setProgressPct] = useState(0.0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);

  // Live telemetry state
  const [telemetry, setTelemetry] = useState({
    currentLat: CORRIDORS[0].origin.lat,
    currentLon: CORRIDORS[0].origin.lon,
    headingDeg: 45,
    currentSpeedKmh: 54,
    speedLimitKmh: 60,
    remainingDistanceKm: 18.2,
    remainingEtaMin: 28,
    arrivalTime: '--:--',
    currentManeuver: null,
    upcomingSegment: null
  });

  const routes = buildRoutes(corridor);
  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  // Corridor Selection Handler
  const handleCorridorClick = (c) => {
    setCorridor(c);
    setSelectedRouteId('best');
    setIsNavigating(false);
    setIsSimulatingDrive(false);
    setProgressPct(0.0);
    setActiveAlert(null);

    const cRoutes = buildRoutes(c);
    const firstRoute = cRoutes[0];
    const initialStep = interpolateDriveStep(0.0, firstRoute, c);
    setTelemetry({
      currentLat: c.origin.lat,
      currentLon: c.origin.lon,
      headingDeg: initialStep.headingDeg,
      currentSpeedKmh: initialStep.currentSpeedKmh,
      speedLimitKmh: initialStep.speedLimitKmh,
      remainingDistanceKm: firstRoute.dist,
      remainingEtaMin: firstRoute.eta,
      arrivalTime: initialStep.arrivalTime,
      currentManeuver: initialStep.currentManeuver,
      upcomingSegment: initialStep.upcomingSegment
    });
  };

  // Keyboard navigation for corridor tabs
  const handleTabKeyDown = (e, index) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % CORRIDORS.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + CORRIDORS.length) % CORRIDORS.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = CORRIDORS.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    handleCorridorClick(CORRIDORS[nextIndex]);
    tabRefs.current[nextIndex]?.focus();
  };

  // Start Navigation Demo
  const handleStartNavigation = useCallback(() => {
    const initialStep = interpolateDriveStep(0.0, activeRoute, corridor);
    setIsNavigating(true);
    setIsSimulatingDrive(true);
    setProgressPct(0.0);
    setActiveAlert(null);
    setTelemetry({
      currentLat: corridor.origin.lat,
      currentLon: corridor.origin.lon,
      headingDeg: initialStep.headingDeg,
      currentSpeedKmh: initialStep.currentSpeedKmh,
      speedLimitKmh: initialStep.speedLimitKmh,
      remainingDistanceKm: activeRoute.dist,
      remainingEtaMin: activeRoute.eta,
      arrivalTime: initialStep.arrivalTime,
      currentManeuver: initialStep.currentManeuver,
      upcomingSegment: initialStep.upcomingSegment
    });
  }, [activeRoute, corridor]);

  // Stop / Exit Navigation
  const handleStopNavigation = useCallback(() => {
    setIsNavigating(false);
    setIsSimulatingDrive(false);
    setProgressPct(0.0);
    setActiveAlert(null);
  }, []);

  // Toggle Play / Pause Drive Simulation
  const handleTogglePlay = useCallback(() => {
    if (progressPct >= 1.0) {
      handleStartNavigation();
    } else {
      setIsSimulatingDrive((prev) => !prev);
    }
  }, [progressPct, handleStartNavigation]);

  // Cycle Simulation Speed (1x, 2x, 5x)
  const handleCycleSpeed = useCallback(() => {
    setSimulationSpeed((prev) => {
      const idx = SPEED_STEPS.indexOf(prev);
      return SPEED_STEPS[(idx + 1) % SPEED_STEPS.length];
    });
  }, []);

  // Reload / Restart Demo
  const handleReloadDemo = useCallback(() => {
    const initialStep = interpolateDriveStep(0.0, activeRoute, corridor);
    setProgressPct(0.0);
    setActiveAlert(null);
    setIsSimulatingDrive(true);
    setTelemetry({
      currentLat: corridor.origin.lat,
      currentLon: corridor.origin.lon,
      headingDeg: initialStep.headingDeg,
      currentSpeedKmh: initialStep.currentSpeedKmh,
      speedLimitKmh: initialStep.speedLimitKmh,
      remainingDistanceKm: activeRoute.dist,
      remainingEtaMin: activeRoute.eta,
      arrivalTime: initialStep.arrivalTime,
      currentManeuver: initialStep.currentManeuver,
      upcomingSegment: initialStep.upcomingSegment
    });
  }, [activeRoute, corridor]);

  // Interactive Progress Bar Scrubber
  const handleScrubProgress = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0.0, Math.min(1.0, clickX / rect.width));
    setProgressPct(newProgress);

    const step = interpolateDriveStep(newProgress, activeRoute, corridor);
    setTelemetry((prev) => ({
      ...prev,
      ...step
    }));
  };

  // Trigger Proactive Bottleneck Alert
  const handleTriggerSimulatedAlert = useCallback(() => {
    const altRoute = routes.find((r) => r.id !== activeRoute.id) || routes[1];
    const savings = Math.max(3, Math.round(activeRoute.eta - altRoute.eta + 4));

    setActiveAlert({
      level: 'BETTER_ROUTE',
      title: 'Severe Bottleneck Predicted Ahead',
      message: `Heavy congestion (+20m forecast: 88%) detected on upcoming road link. Alternative route ${altRoute.name} saves ~${savings} min.`,
      better_route_id: altRoute.id,
      savings_min: savings,
      current_cong: 72,
      fc20_cong: 88,
      expected_delay_min: 6.5
    });
  }, [routes, activeRoute]);

  // Accept Reroute Action
  const handleAcceptReroute = useCallback((targetRouteId) => {
    setSelectedRouteId(targetRouteId);
    setActiveAlert(null);
    const newRoute = routes.find((r) => r.id === targetRouteId) || routes[0];
    const step = interpolateDriveStep(progressPct, newRoute, corridor);
    setTelemetry((prev) => ({
      ...prev,
      ...step
    }));
  }, [routes, progressPct, corridor]);

  // Active Simulation Drive Loop
  useEffect(() => {
    if (!isNavigating || !isSimulatingDrive) return;

    const interval = setInterval(() => {
      setProgressPct((prev) => {
        // Complete full drive in 30 seconds @ 1x speed (60 ticks @ 500ms)
        const TOTAL_TICKS = 60;
        const delta = (1.0 / TOTAL_TICKS) * simulationSpeed;
        const next = Math.min(1.0, prev + delta);

        const step = interpolateDriveStep(next, activeRoute, corridor);
        setTelemetry((t) => ({
          ...t,
          ...step
        }));

        // Proactive alert trigger around ~35% progress during live drive
        if (next >= 0.32 && next <= 0.45 && !activeAlert) {
          const altRoute = routes.find((r) => r.id !== activeRoute.id) || routes[1];
          const savings = Math.max(3, Math.round(activeRoute.eta - altRoute.eta + 4));
          setActiveAlert({
            level: 'BETTER_ROUTE',
            title: 'Severe Bottleneck Predicted Ahead',
            message: `Sudden congestion (+20m outlook: 86%) on upcoming flyover. Bypass saves ~${savings} min.`,
            better_route_id: altRoute.id,
            savings_min: savings,
            current_cong: 68,
            fc20_cong: 86,
            expected_delay_min: 5.5
          });
        }

        if (next >= 1.0) {
          setIsSimulatingDrive(false);
        }

        return next;
      });
    }, SIM_TICK_MS);

    return () => clearInterval(interval);
  }, [isNavigating, isSimulatingDrive, simulationSpeed, activeRoute, corridor, activeAlert, routes]);

  const isReached = progressPct >= 1.0;
  const progressWhole = Math.round(progressPct * 100);

  return (
    <div className="px-4 sm:px-6 lg:px-[60px] py-10 max-w-[1520px] mx-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div>
          <span className="eyebrow">
            <span className="pulse-dot" /> Live Traffic Intelligence
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-100 tracking-tight mt-1">
            Traffic Intelligence <span className="gradient-text">Cockpit</span>
          </h1>
          <p className="text-slate-300 mt-2 text-sm sm:text-base max-w-2xl">
            Real-time GPS streets map navigation with predictive congestion forecasting, live turn-by-turn guidance, and AI co-driver explanations.
          </p>
        </div>

        {/* Telemetry Status Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="glass px-3.5 py-2.5 rounded-2xl flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-left">
              <div className="text-[0.6rem] text-slate-500 font-bold uppercase">Sensors</div>
              <div className="text-xs font-bold text-slate-100">{corridor.sensors} Online</div>
            </div>
          </div>
          <div className="glass px-3.5 py-2.5 rounded-2xl flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <div className="text-left">
              <div className="text-[0.6rem] text-slate-500 font-bold uppercase">Corridor Speed</div>
              <div className="text-xs font-bold text-primary-bright">{corridor.avgSpeed}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Guide Banner */}
      {showGuide && (
        <div className="mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-4 animate-fadeUp">
          <div className="flex items-center gap-3 text-sm text-slate-200">
            <span className="text-xl">💡</span>
            <span>
              <strong className="text-primary-bright">Interactive Live Demo:</strong> Choose a corridor → Click <strong className="text-white">Start Navigation</strong> to launch live GPS drive simulation with real Streets map tiles, turn-by-turn HUD, and AI alerts!
            </span>
          </div>
          <button
            onClick={() => setShowGuide(false)}
            className="text-slate-400 hover:text-slate-200 text-sm flex-shrink-0 cursor-pointer"
            aria-label="Dismiss guide"
          >
            Got it ✕
          </button>
        </div>
      )}

      {/* Corridor Selector Bar */}
      <div className="glass p-3 sm:p-4 rounded-3xl mb-8 flex items-center justify-between gap-4 flex-wrap shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <span id="corridor-tab-label" className="text-xs font-bold uppercase tracking-wider text-slate-400 hidden lg:inline">
            Corridor:
          </span>
          <div
            role="tablist"
            aria-labelledby="corridor-tab-label"
            className="flex gap-2 flex-wrap"
          >
            {CORRIDORS.map((c, idx) => {
              const isSelected = c.id === corridor.id;
              return (
                <button
                  key={c.id}
                  ref={(el) => (tabRefs.current[idx] = el)}
                  id={`tab-${c.id}`}
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`panel-${c.id}`}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => handleCorridorClick(c)}
                  onKeyDown={(e) => handleTabKeyDown(e, idx)}
                  className={`tab-pill flex items-center gap-2 ${
                    isSelected
                      ? 'bg-primary text-ink font-bold border-primary shadow-glow'
                      : 'bg-ink/80 border-white/10 text-slate-300 hover:text-slate-100 hover:border-white/20'
                  }`}
                >
                  <span>{c.city}</span>
                  <span
                    className={`text-[0.7rem] px-1.5 py-0.5 rounded-full font-bold ${
                      isSelected ? 'bg-ink/20 text-ink' : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {c.cong}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-xs text-slate-300 font-medium px-2">
          Route: <strong className="text-slate-100">{corridor.name}</strong>
        </div>
      </div>

      {/* Main Command Center Grid */}
      <div
        id={`panel-${corridor.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${corridor.id}`}
        className="grid lg:grid-cols-12 gap-8 items-start"
      >
        {/* Left Column: Map & Simulation Controls (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Interactive Streets Map Canvas */}
          <CockpitMapCanvas
            corridor={corridor}
            routes={routes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={setSelectedRouteId}
            timeHorizon={timeHorizon}
            setTimeHorizon={setTimeHorizon}
            // Navigation props
            isNavigating={isNavigating}
            progressPct={progressPct}
            currentLat={telemetry.currentLat}
            currentLon={telemetry.currentLon}
            headingDeg={telemetry.headingDeg}
            currentSpeedKmh={telemetry.currentSpeedKmh}
            speedLimitKmh={telemetry.speedLimitKmh}
            currentManeuver={telemetry.currentManeuver}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted((prev) => !prev)}
            onRestartDemo={handleReloadDemo}
            onTriggerAlert={handleTriggerSimulatedAlert}
          />

          {/* Navigation Cockpit Action Bar (Start, Pause, Resume, Speed, Reload, Stop) */}
          <div className="glass p-4 rounded-3xl border border-white/10 flex flex-col gap-4 shadow-xl">
            {isNavigating ? (
              <>
                {/* Trip Progress Bar Track & Label */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className={isReached ? 'text-emerald-400' : 'text-primary-bright'}>
                      {isReached ? 'TRIP COMPLETED (100%)' : `TRIP PROGRESS (${progressWhole}%)`}
                    </span>
                    <span className="text-slate-400">
                      {isReached ? '🎉 Destination Reached' : `EST. ARRIVAL ${telemetry.arrivalTime}`}
                    </span>
                  </div>

                  {/* Interactive Scrubber Bar */}
                  <div
                    onClick={handleScrubProgress}
                    className="w-full h-3 rounded-full bg-surface border border-white/10 overflow-hidden cursor-pointer relative group"
                    title="Click to seek drive position"
                  >
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        isReached
                          ? 'bg-emerald-400 shadow-glow'
                          : 'bg-gradient-to-r from-primary to-primary-bright shadow-glow'
                      }`}
                      style={{ width: `${progressWhole}%` }}
                    />
                  </div>
                </div>

                {/* Bottom Navigation Control Buttons */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  {/* Left: ETA & Distance Summary */}
                  <div className="flex items-center gap-3">
                    {isReached ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={20} className="text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-300">Arrived at Destination</span>
                      </div>
                    ) : (
                      <div>
                        <div className="text-lg font-bold text-slate-100 flex items-baseline gap-1.5">
                          <span className="text-primary-bright">{telemetry.remainingEtaMin} min</span>
                          <span className="text-xs font-normal text-slate-400">· {telemetry.remainingDistanceKm} km left</span>
                        </div>
                        <div className="text-[0.65rem] text-slate-400 truncate max-w-[200px]">
                          {activeRoute.name}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Simulation Controls */}
                  <div className="flex items-center gap-2">
                    {/* Trigger Simulated Alert */}
                    <button
                      onClick={handleTriggerSimulatedAlert}
                      className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 active:scale-95 cursor-pointer transition-all flex items-center gap-1.5 text-xs font-semibold"
                      title="Trigger AI Traffic Advisory"
                    >
                      <BellRing size={15} />
                      <span className="hidden sm:inline">Trigger Alert</span>
                    </button>

                    {/* Speed Multiplier */}
                    <button
                      onClick={handleCycleSpeed}
                      className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 active:scale-95 cursor-pointer transition-all flex items-center gap-1 text-xs font-bold"
                      title="Cycle Simulation Speed"
                    >
                      <FastForward size={14} className="text-primary-bright" />
                      <span>{simulationSpeed}x</span>
                    </button>

                    {/* Play / Pause Toggle */}
                    <button
                      onClick={handleTogglePlay}
                      className="w-10 h-10 rounded-xl bg-primary text-ink font-bold flex items-center justify-center hover:bg-primary-bright active:scale-95 shadow-glow cursor-pointer transition-all"
                      title={isSimulatingDrive ? 'Pause Simulation' : 'Resume Simulation'}
                    >
                      {isSimulatingDrive ? (
                        <Pause size={18} strokeWidth={3} />
                      ) : (
                        <Play size={18} strokeWidth={3} />
                      )}
                    </button>

                    {/* Reload / Restart Demo */}
                    <button
                      onClick={handleReloadDemo}
                      className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 active:scale-95 cursor-pointer transition-all"
                      title="Restart Navigation Demo from Start"
                      aria-label="Restart Demo"
                    >
                      <RotateCcw size={16} />
                    </button>

                    {/* Stop / Exit Navigation */}
                    <button
                      onClick={handleStopNavigation}
                      className="p-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-95 cursor-pointer transition-all"
                      title="Exit Navigation"
                      aria-label="Exit Navigation"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Overview Mode: Large Glowing Start Navigation Button */
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-xs uppercase font-bold text-slate-400">Ready to Drive</div>
                  <div className="text-sm font-semibold text-slate-100">
                    {activeRoute.name} · <span className="text-primary-bright">{activeRoute.eta} min</span> ({activeRoute.dist} km)
                  </div>
                </div>

                <button
                  onClick={handleStartNavigation}
                  className="btn btn-primary px-6 py-3 text-sm font-bold flex items-center gap-2 shadow-glow hover:shadow-glow-lg"
                >
                  <Navigation2 size={18} strokeWidth={2.8} className="rotate-45" />
                  <span>Start Navigation Demo</span>
                </button>
              </div>
            )}
          </div>

          {/* Proactive Traffic Advisory Card */}
          {activeAlert && (
            <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 shadow-2xl animate-fadeUp">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-bold uppercase tracking-wider text-amber-400">
                      Live AI Traffic Advisory
                    </div>
                    <h3 className="text-sm font-bold text-slate-100">{activeAlert.title}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setActiveAlert(null)}
                  className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                  aria-label="Dismiss Alert"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-slate-200 mb-4">{activeAlert.message}</p>

              {/* Metrics row */}
              <div className="grid grid-cols-3 gap-2 mb-4 bg-ink/60 border border-white/5 rounded-2xl p-3 text-center">
                <div>
                  <div className="text-[0.65rem] text-slate-400 uppercase">Current Congestion</div>
                  <div className="text-sm font-bold text-slate-100">{activeAlert.current_cong}%</div>
                </div>
                <div>
                  <div className="text-[0.65rem] text-slate-400 uppercase">Forecast (+20m)</div>
                  <div className="text-sm font-bold text-amber-400">{activeAlert.fc20_cong}%</div>
                </div>
                <div>
                  <div className="text-[0.65rem] text-slate-400 uppercase">Est. Delay</div>
                  <div className="text-sm font-bold text-red-400">+{activeAlert.expected_delay_min}m</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setActiveAlert(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-300 hover:bg-white/10 cursor-pointer transition-all"
                >
                  Ignore
                </button>
                {activeAlert.better_route_id && (
                  <button
                    onClick={() => handleAcceptReroute(activeAlert.better_route_id)}
                    className="btn btn-primary px-4 py-1.5 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Zap size={14} />
                    <span>Switch Route (Save ~{activeAlert.savings_min}m)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Stats & Telemetry Cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl glass flex flex-col justify-between">
              <span className="text-[0.7rem] uppercase font-bold text-slate-400 block mb-1">
                ⏱️ Expected ETA
              </span>
              <div className="font-display text-2xl font-bold text-primary">
                {isNavigating ? telemetry.remainingEtaMin : activeRoute.p50 || 28}{' '}
                <span className="text-sm font-normal text-slate-300">min</span>
              </div>
              <span className="text-xs text-slate-400 mt-1">
                Best: {activeRoute.p10}m · Worst: {activeRoute.p90}m
              </span>
            </div>

            <div className="p-4 rounded-2xl glass flex flex-col justify-between">
              <span className="text-[0.7rem] uppercase font-bold text-slate-400 block mb-1">
                🏎️ Live Velocity
              </span>
              <div className="font-display text-2xl font-bold text-emerald-400">
                {isNavigating ? `${telemetry.currentSpeedKmh}` : corridor.avgSpeed.split(' ')[0]}{' '}
                <span className="text-sm font-normal text-slate-300">km/h</span>
              </div>
              <span className="text-xs text-slate-400 mt-1">
                Speed Limit: {corridor.speedLimit || 60} km/h
              </span>
            </div>

            <div className="p-4 rounded-2xl glass flex flex-col justify-between">
              <span className="text-[0.7rem] uppercase font-bold text-slate-400 block mb-1">
                💳 Toll Cost
              </span>
              <div className="font-display text-2xl font-bold text-slate-100">
                ₹{activeRoute.toll || 0}
              </div>
              <span className="text-xs text-slate-400 mt-1">
                {activeRoute.toll === 0 ? 'Toll-free route' : 'FastTag automatic payment'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Route Matrix & Copilot (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <RouteMatrix
            routes={routes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={setSelectedRouteId}
          />

          <CopilotWidget corridor={corridor} heightClass="h-[250px]" telemetry={telemetry} />
        </div>
      </div>
    </div>
  );
}