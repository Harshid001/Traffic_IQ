import React, { useEffect, useMemo } from 'react';
import { MapContainer as LeafletMap, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom Map Bounds Auto-fitter
function MapAutoBounds({ coordinates }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [coordinates, map]);
  return null;
}

// Custom SVG Icons
const createPinIcon = (color, label) => {
  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="background-color: ${color}; width: 26px; height: 26px; border-radius: 50%; border: 3px solid #0f172a; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px ${color}80; color: white; font-weight: bold; font-size: 11px;">
          ${label}
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid ${color};"></div>
      </div>
    `,
    iconSize: [26, 34],
    iconAnchor: [13, 34],
  });
};

const createVehicleIcon = () => {
  return L.divIcon({
    className: 'custom-vehicle',
    html: `
      <div style="position: relative; width: 32px; height: 32px; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: #3b82f6; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 24px; height: 24px; border-radius: 50%; background: #2563eb; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px #3b82f6;">
          <svg style="width: 14px; height: 14px; color: white;" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export default function MapContainerComponent({
  routes = [],
  selectedRouteId,
  onSelectRoute,
  origin,
  destination,
  vehiclePosition,
  isSimulatingDrive,
}) {
  const originPos = origin ? [origin.lat, origin.lon] : [12.9756, 77.6066];
  const destPos = destination ? [destination.lat, destination.lon] : [12.9863, 77.7340];

  // Collect all coordinates to compute bounds
  const allCoords = useMemo(() => {
    const coords = [];
    routes.forEach((r) => {
      if (r.coordinates) coords.push(...r.coordinates);
    });
    return coords.length > 0 ? coords : [originPos, destPos];
  }, [routes, originPos, destPos]);

  return (
    <div className="relative w-full h-[460px] lg:h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <LeafletMap
        center={originPos}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full dark-tiles"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapAutoBounds coordinates={allCoords} />

        {/* Origin and Destination Markers */}
        <Marker position={originPos} icon={createPinIcon('#10b981', 'A')}>
          <Popup>
            <div className="text-slate-900 text-xs font-semibold p-1">
              <strong>Origin:</strong> {origin?.name || 'Start Point'}
            </div>
          </Popup>
        </Marker>

        <Marker position={destPos} icon={createPinIcon('#ef4444', 'B')}>
          <Popup>
            <div className="text-slate-900 text-xs font-semibold p-1">
              <strong>Destination:</strong> {destination?.name || 'Destination'}
            </div>
          </Popup>
        </Marker>

        {/* Live Moving Vehicle Marker */}
        {isSimulatingDrive && vehiclePosition && (
          <Marker position={vehiclePosition} icon={createVehicleIcon()} zIndexOffset={1000}>
            <Popup>
              <div className="text-slate-900 text-xs font-medium p-1">
                <strong>Simulated Vehicle Active</strong><br />
                Speed: 42 km/h &bull; Telemetry Active
              </div>
            </Popup>
          </Marker>
        )}

        {/* Render Route Polylines */}
        {routes.map((r) => {
          const isSelected = r.id === selectedRouteId;
          const isBest = r.is_best;
          const isFastest = r.is_fastest;

          let color = '#64748b'; // Slate
          let weight = 4;
          let opacity = 0.6;
          let dashArray = null;

          if (isBest) {
            color = '#10b981'; // Emerald Neon
            weight = 6;
            opacity = 0.95;
          } else if (isFastest) {
            color = '#f59e0b'; // Amber Gold
            weight = 5;
            opacity = 0.9;
            dashArray = '8, 8';
          }

          if (isSelected && !isBest && !isFastest) {
            color = '#38bdf8'; // Light blue
            weight = 5;
            opacity = 0.9;
          }

          return (
            <Polyline
              key={r.id}
              positions={r.coordinates}
              pathOptions={{
                color,
                weight: isSelected ? weight + 2 : weight,
                opacity,
                dashArray,
                lineJoin: 'round',
              }}
              eventHandlers={{
                click: () => onSelectRoute(r.id),
              }}
            >
              <Popup>
                <div className="text-slate-900 text-xs p-1 max-w-[200px]">
                  <div className="font-bold text-sm mb-1">{r.name}</div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>ETA (P50):</span>
                    <strong className="text-emerald-700">{r.predicted_eta_p50} min</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Congestion:</span>
                    <strong className={r.avg_congestion > 50 ? 'text-red-600' : 'text-slate-700'}>
                      {r.avg_congestion}% ({r.congestion_category})
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Forecast 20m:</span>
                    <strong>{r.forecast_20m_p50}%</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Score:</span>
                    <strong className="text-indigo-700 font-bold">{r.score}/100</strong>
                  </div>
                </div>
              </Popup>
            </Polyline>
          );
        })}
      </LeafletMap>

      {/* Floating Map Legend */}
      <div className="absolute bottom-4 left-4 z-[500] bg-slate-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-800 text-[11px] flex flex-col gap-1.5 shadow-xl">
        <div className="font-semibold text-slate-200 uppercase tracking-wider text-[10px] flex items-center justify-between gap-4">
          <span>Map Intelligence</span>
          <span className="text-emerald-400 font-mono">LIVE FEED</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
          <span className="text-slate-300 font-medium">Best Route (Multi-Objective)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1.5 rounded-full bg-amber-500 border-dashed"></span>
          <span className="text-slate-300 font-medium">Fastest Route (Min P50 ETA)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1.5 rounded-full bg-slate-500"></span>
          <span className="text-slate-400">Alternative Path</span>
        </div>
      </div>
    </div>
  );
}
