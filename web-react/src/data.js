/**
 * TrafficIQ Core Telemetry, Routing & Simulation Data Model.
 * Provides high-precision real GPS coordinates, maneuvers, and deterministic
 * telemetry matching the mobile engine.
 */

export const CORRIDORS = [
  {
    id: 'ahmedabad',
    name: 'Ahmedabad → Gandhinagar',
    city: 'Gujarat Tech Hub',
    tag: 'Tech Corridor',
    cong: 32,
    forecast: 38,
    forecastPeak: 46,
    best: 'Via SG Highway & Gandhinagar Bypass',
    fastest: 'Via SP Ring Expressway (Outer Bypass)',
    sensors: 48,
    weather: '31°C · Clear Skies',
    avgSpeed: '58 km/h',
    speedLimit: 60,
    origin: { name: 'Iscon Cross Road, SG Highway', lat: 23.0280, lon: 72.5065 },
    destination: { name: 'Infocity / GIFT City Link', lat: 23.1970, lon: 72.6350 },
    center: [23.1125, 72.5707],
    defaultZoom: 12,
    incident: {
      type: 'Lane Narrowing',
      location: 'Chiloda Ring Junction',
      delay: '+5 min',
      impactedRoute: 'fastest'
    },
    waypoints: [
      { name: 'ISKCON Cross Rd', type: 'origin', lat: 23.0280, lon: 72.5065 },
      { name: 'Thaltej Underpass', type: 'junction', lat: 23.0650, lon: 72.5250 },
      { name: 'Vaishnodevi Circle', type: 'plaza', lat: 23.1550, lon: 72.5800 },
      { name: 'Infocity / GIFT City', type: 'destination', lat: 23.1970, lon: 72.6350 }
    ]
  },
  {
    id: 'bangalore',
    name: 'MG Road → Whitefield',
    city: 'Bengaluru Tech Corridor',
    tag: 'Metro Corridor',
    cong: 54,
    forecast: 66,
    forecastPeak: 78,
    best: 'Via Old Airport Road & Marathahalli',
    fastest: 'Via Outer Ring Expressway (North Bypass)',
    sensors: 84,
    weather: '24°C · Light Rain',
    avgSpeed: '32 km/h',
    speedLimit: 50,
    origin: { name: 'MG Road Metro Station', lat: 12.9756, lon: 77.6066 },
    destination: { name: 'ITPB Whitefield', lat: 12.9863, lon: 77.7340 },
    center: [12.9810, 77.6703],
    defaultZoom: 12,
    incident: {
      type: 'Metro Construction',
      location: 'Kundalahalli Gate',
      delay: '+11 min',
      impactedRoute: 'fastest'
    },
    waypoints: [
      { name: 'MG Road Trinity', type: 'origin', lat: 12.9756, lon: 77.6066 },
      { name: 'Domlur Flyover', type: 'junction', lat: 12.9630, lon: 77.6400 },
      { name: 'Marathahalli Bridge', type: 'plaza', lat: 12.9550, lon: 77.7000 },
      { name: 'ITPL Whitefield', type: 'destination', lat: 12.9863, lon: 77.7340 }
    ]
  },
  {
    id: 'delhi',
    name: 'Connaught Pl → Cyber City',
    city: 'Delhi NCR Corridor',
    tag: 'Interstate Corridor',
    cong: 47,
    forecast: 58,
    forecastPeak: 72,
    best: 'Via NH-48 Express Highway',
    fastest: 'Via Golf Course Road Link',
    sensors: 96,
    weather: '28°C · Moderate Haze',
    avgSpeed: '46 km/h',
    speedLimit: 70,
    origin: { name: 'Connaught Place Outer', lat: 28.6315, lon: 77.2167 },
    destination: { name: 'Cyber City Gurugram', lat: 28.4950, lon: 77.0890 },
    center: [28.5632, 77.1528],
    defaultZoom: 12,
    incident: {
      type: 'Vehicle Stalled',
      location: 'Dhaula Kuan Incline',
      delay: '+7 min',
      impactedRoute: 'fastest'
    },
    waypoints: [
      { name: 'Connaught Place', type: 'origin', lat: 28.6315, lon: 77.2167 },
      { name: 'Dhaula Kuan Flyover', type: 'junction', lat: 28.5900, lon: 77.1600 },
      { name: 'Mahipalpur Plaza', type: 'plaza', lat: 28.5500, lon: 77.1200 },
      { name: 'DLF Cyber City', type: 'destination', lat: 28.4950, lon: 77.0890 }
    ]
  },
  {
    id: 'sf',
    name: 'Financial Dist → SFO Airport',
    city: 'San Francisco Bay Area',
    tag: 'Coastal Highway',
    cong: 26,
    forecast: 31,
    forecastPeak: 42,
    best: 'Via US-101 South Freeway',
    fastest: 'Via I-280 South & Highway 380',
    sensors: 62,
    weather: '16°C · Coast Mist',
    avgSpeed: '64 km/h',
    speedLimit: 65,
    origin: { name: 'Market & 1st St, FiDi', lat: 37.7915, lon: -122.4000 },
    destination: { name: 'SFO Terminal 2', lat: 37.6213, lon: -122.3790 },
    center: [37.7064, -122.3895],
    defaultZoom: 11,
    incident: {
      type: 'Emergency Maintenance',
      location: 'Cesar Chavez Ramp',
      delay: '+4 min',
      impactedRoute: 'alt'
    },
    waypoints: [
      { name: 'Market St FiDi', type: 'origin', lat: 37.7915, lon: -122.4000 },
      { name: 'Potrero Hill Split', type: 'junction', lat: 37.7650, lon: -122.4050 },
      { name: 'Brisbane Shoreline', type: 'plaza', lat: 37.6600, lon: -122.3950 },
      { name: 'SFO Terminal 2', type: 'destination', lat: 37.6213, lon: -122.3790 }
    ]
  },
  {
    id: 'singapore',
    name: 'Marina Bay → Changi Airport',
    city: 'Singapore Coastal',
    tag: 'Expressway',
    cong: 22,
    forecast: 27,
    forecastPeak: 35,
    best: 'Via East Coast Parkway (ECP)',
    fastest: 'Via Pan Island Expressway (PIE)',
    sensors: 72,
    weather: '29°C · Tropical Humid',
    avgSpeed: '72 km/h',
    speedLimit: 80,
    origin: { name: 'Marina Bay Financial Centre', lat: 1.2792, lon: 103.8536 },
    destination: { name: 'Changi Airport Terminal 3', lat: 1.3562, lon: 103.9870 },
    center: [1.3177, 103.9203],
    defaultZoom: 12,
    incident: {
      type: 'ERP Pricing Surge',
      location: 'Fort Road Gantry',
      delay: '+2 min',
      impactedRoute: 'fastest'
    },
    waypoints: [
      { name: 'Marina Bay Sands', type: 'origin', lat: 1.2792, lon: 103.8536 },
      { name: 'Tanjong Rhu Flyover', type: 'junction', lat: 1.2950, lon: 103.8750 },
      { name: 'Bedok Coastal Line', type: 'plaza', lat: 1.3250, lon: 103.9450 },
      { name: 'Changi Jewel T3', type: 'destination', lat: 1.3562, lon: 103.9870 }
    ]
  }
];

const RAW_ROUTES = {
  ahmedabad: [
    {
      id: 'best',
      type: 'best',
      name: 'Via SG Highway & Gandhinagar Bypass',
      summary: 'Main urban tech artery with flyovers (⭐ Best Route)',
      eta: 28,
      p10: 25,
      p50: 28,
      p90: 33,
      dist: 18.2,
      cong: 36,
      reliability: 91,
      toll: 0,
      delta: 0,
      color: '#38BDF8',
      coordinates: [
        [23.0280, 72.5065],
        [23.0650, 72.5250],
        [23.1150, 72.5450],
        [23.1550, 72.5800],
        [23.1780, 72.6100],
        [23.1970, 72.6350]
      ],
      segments: [
        { name: 'SG Highway Arterial', length_km: 6.8, speed: 52, congestion: 38 },
        { name: 'Vaishnodevi Circle Flyover', length_km: 4.6, speed: 48, congestion: 34 },
        { name: 'Gandhinagar Entry / Infocity Link', length_km: 6.8, speed: 58, congestion: 36 }
      ],
      description: 'Optimal reliability curve shielding against peak delay variance. Verified toll-free.'
    },
    {
      id: 'fastest',
      type: 'fastest',
      name: 'Via SP Ring Expressway (Outer Bypass)',
      summary: 'High-speed expressway bypass with toll (⚡ Fastest Route)',
      eta: 24,
      p10: 22,
      p50: 24.5,
      p90: 28,
      dist: 22.5,
      cong: 22,
      reliability: 96,
      toll: 40,
      delta: -4,
      color: '#FBBF24',
      coordinates: [
        [23.0280, 72.5065],
        [23.0450, 72.4850],
        [23.1000, 72.5050],
        [23.1600, 72.5500],
        [23.1850, 72.6000],
        [23.1970, 72.6350]
      ],
      segments: [
        { name: 'Bopal Connector Ramp', length_km: 3.5, speed: 46, congestion: 28 },
        { name: 'Sardar Patel Ring Road North', length_km: 13.8, speed: 82, congestion: 18 },
        { name: 'Koba Circle to Infocity', length_km: 5.2, speed: 68, congestion: 24 }
      ],
      description: 'Saves 4 minutes with grade-separated lanes. FastTag payment ₹40.'
    },
    {
      id: 'alt',
      type: 'alt',
      name: 'Via Sabarmati Riverfront Corridor',
      summary: 'Scenic riverfront arterial route through central city',
      eta: 34,
      p10: 30,
      p50: 34,
      p90: 41,
      dist: 20.1,
      cong: 48,
      reliability: 79,
      toll: 0,
      delta: 6,
      color: '#94A3B8',
      coordinates: [
        [23.0280, 72.5065],
        [23.0400, 72.5350],
        [23.0750, 72.5700],
        [23.1300, 72.5950],
        [23.1700, 72.6150],
        [23.1970, 72.6350]
      ],
      segments: [
        { name: 'Drive-In Road & University Link', length_km: 5.1, speed: 30, congestion: 54 },
        { name: 'Sabarmati Riverfront West', length_km: 9.2, speed: 44, congestion: 42 },
        { name: 'Gandhinagar South Corridor', length_km: 5.8, speed: 42, congestion: 46 }
      ],
      description: 'Longer perimeter routing with scenic river view but moderate city intersection delay.'
    }
  ],

  bangalore: [
    {
      id: 'best',
      type: 'best',
      name: 'Via Old Airport Road & Marathahalli',
      summary: 'Direct arterial corridor through central tech hub (⭐ Best Route)',
      eta: 32,
      p10: 29,
      p50: 32,
      p90: 38,
      dist: 18.4,
      cong: 42,
      reliability: 86,
      toll: 0,
      delta: 0,
      color: '#38BDF8',
      coordinates: [
        [12.9756, 77.6066],
        [12.9715, 77.6200],
        [12.9630, 77.6400],
        [12.9570, 77.6650],
        [12.9550, 77.7000],
        [12.9700, 77.7200],
        [12.9863, 77.7340]
      ],
      segments: [
        { name: 'MG Road Arterial', length_km: 3.2, speed: 38, congestion: 45 },
        { name: 'Old Airport Road', length_km: 7.8, speed: 36, congestion: 40 },
        { name: 'Marathahalli Flyover & Tech Link', length_km: 7.4, speed: 42, congestion: 43 }
      ],
      description: 'High prediction confidence (P50: 32 min) with 0 toll cost and stable flyover throughput.'
    },
    {
      id: 'fastest',
      type: 'fastest',
      name: 'Via Outer Ring Expressway (North Bypass)',
      summary: 'Grade-separated expressway with higher capacity (⚡ Fastest Route)',
      eta: 28,
      p10: 25,
      p50: 28,
      p90: 32,
      dist: 22.8,
      cong: 28,
      reliability: 93,
      toll: 45,
      delta: -4,
      color: '#FBBF24',
      coordinates: [
        [12.9756, 77.6066],
        [12.9900, 77.6150],
        [13.0100, 77.6400],
        [13.0150, 77.6800],
        [13.0050, 77.7100],
        [12.9863, 77.7340]
      ],
      segments: [
        { name: 'Central Boulevard', length_km: 4.1, speed: 40, congestion: 32 },
        { name: 'Outer Ring Expressway North', length_km: 13.5, speed: 70, congestion: 24 },
        { name: 'ITPB Access Road', length_km: 5.2, speed: 48, congestion: 30 }
      ],
      description: 'Outer ring elevated lanes clear with rapid average velocity. Saves 4 min.'
    },
    {
      id: 'alt',
      type: 'alt',
      name: 'Via Metro Viaduct Corridor & Hoodi',
      summary: 'Alternate secondary artery under metro line',
      eta: 37,
      p10: 32,
      p50: 36.5,
      p90: 44,
      dist: 19.9,
      cong: 52,
      reliability: 74,
      toll: 0,
      delta: 5,
      color: '#94A3B8',
      coordinates: [
        [12.9756, 77.6066],
        [12.9820, 77.6250],
        [12.9950, 77.6550],
        [12.9980, 77.6900],
        [12.9920, 77.7150],
        [12.9863, 77.7340]
      ],
      segments: [
        { name: 'Metro Viaduct Avenue', length_km: 8.5, speed: 28, congestion: 56 },
        { name: 'Hoodi Bypass Link', length_km: 6.8, speed: 52, congestion: 46 },
        { name: 'Whitefield Main Gate', length_km: 4.6, speed: 40, congestion: 54 }
      ],
      description: 'Secondary option with surface construction queues near Hoodi intersection.'
    }
  ],

  delhi: [
    {
      id: 'best',
      type: 'best',
      name: 'Via NH-48 Express Highway',
      summary: 'Main interstate expressway corridor (⭐ Best & ⚡ Fastest)',
      eta: 34,
      p10: 31,
      p50: 34,
      p90: 40,
      dist: 27.5,
      cong: 35,
      reliability: 90,
      toll: 65,
      delta: 0,
      color: '#38BDF8',
      coordinates: [
        [28.6315, 77.2167],
        [28.5900, 77.1600],
        [28.5500, 77.1200],
        [28.5100, 77.0950],
        [28.4950, 77.0890]
      ],
      segments: [
        { name: 'Dhaula Kuan Link', length_km: 6.5, speed: 40, congestion: 36 },
        { name: 'NH-48 Expressway', length_km: 16.0, speed: 78, congestion: 32 },
        { name: 'Cyber City Entry Ramp', length_km: 5.0, speed: 46, congestion: 40 }
      ],
      description: 'High expressway capacity with grade separation, delivering steady throughput.'
    },
    {
      id: 'fastest',
      type: 'fastest',
      name: 'Via Golf Course Road Link',
      summary: 'FastTag expressway via DLF phase 5',
      eta: 33,
      p10: 30,
      p50: 33,
      p90: 42,
      dist: 28.2,
      cong: 42,
      reliability: 84,
      toll: 75,
      delta: -1,
      color: '#FBBF24',
      coordinates: [
        [28.6315, 77.2167],
        [28.5800, 77.1800],
        [28.5300, 77.1400],
        [28.4800, 77.1000],
        [28.4950, 77.0890]
      ],
      segments: [
        { name: 'Chanakyapuri Flyover', length_km: 7.2, speed: 42, congestion: 38 },
        { name: 'Mehrauli Toll Connector', length_km: 14.0, speed: 74, congestion: 36 },
        { name: 'Golf Course Underpass', length_km: 7.0, speed: 52, congestion: 44 }
      ],
      description: 'Signal-free underground corridors with minor peak queuing at Sir Shankar Plaza.'
    },
    {
      id: 'alt',
      type: 'alt',
      name: 'Via Mehrauli-Gurgaon Road Arterial',
      summary: 'Non-toll arterial corridor through South Delhi',
      eta: 44,
      p10: 39,
      p50: 44,
      p90: 52,
      dist: 29.8,
      cong: 54,
      reliability: 72,
      toll: 0,
      delta: 10,
      color: '#94A3B8',
      coordinates: [
        [28.6315, 77.2167],
        [28.5700, 77.2000],
        [28.5200, 77.1800],
        [28.4800, 77.1100],
        [28.4950, 77.0890]
      ],
      segments: [
        { name: 'Aurobindo Marg', length_km: 10.0, speed: 26, congestion: 58 },
        { name: 'MG Road Gurugram', length_km: 14.5, speed: 38, congestion: 50 },
        { name: 'Sikanderpur Link', length_km: 5.3, speed: 42, congestion: 52 }
      ],
      description: 'Toll-free alternative with heavy urban traffic at Aurobindo Marg.'
    }
  ],

  sf: [
    {
      id: 'best',
      type: 'best',
      name: 'Via US-101 South Freeway',
      summary: 'Direct freeway artery (⭐ Best & ⚡ Fastest)',
      eta: 19,
      p10: 17.5,
      p50: 19.0,
      p90: 23,
      dist: 21.6,
      cong: 28,
      reliability: 95,
      toll: 0,
      delta: 0,
      color: '#38BDF8',
      coordinates: [
        [37.7915, -122.4000],
        [37.7650, -122.4050],
        [37.7100, -122.4000],
        [37.6600, -122.3950],
        [37.6213, -122.3790]
      ],
      segments: [
        { name: '4th St Onramp', length_km: 2.6, speed: 42, congestion: 32 },
        { name: 'US-101 South Freeway', length_km: 15.5, speed: 82, congestion: 25 },
        { name: 'Airport Terminals Loop', length_km: 3.5, speed: 50, congestion: 30 }
      ],
      description: 'Direct 21.6 km path with 95% reliability under standard maritime conditions.'
    },
    {
      id: 'fastest',
      type: 'fastest',
      name: 'Via I-280 South & Highway 380',
      summary: 'Scenic high-speed western freeway bypass',
      eta: 21.5,
      p10: 19.5,
      p50: 21.5,
      p90: 25,
      dist: 25.4,
      cong: 20,
      reliability: 97,
      toll: 0,
      delta: 2.5,
      color: '#FBBF24',
      coordinates: [
        [37.7915, -122.4000],
        [37.7600, -122.3950],
        [37.7200, -122.4400],
        [37.6600, -122.4350],
        [37.6300, -122.4100],
        [37.6213, -122.3790]
      ],
      segments: [
        { name: 'King St to I-280', length_km: 3.4, speed: 62, congestion: 24 },
        { name: 'I-280 South Interstate', length_km: 17.5, speed: 76, congestion: 18 },
        { name: 'CA-380 East to SFO', length_km: 4.5, speed: 54, congestion: 22 }
      ],
      description: 'Open lane availability with panoramic Junipero Serra freeway view.'
    },
    {
      id: 'alt',
      type: 'alt',
      name: 'Via Bayshore Boulevard Bypass',
      summary: 'Surface arterial fallback avoiding highway bottlenecks',
      eta: 28,
      p10: 25,
      p50: 28,
      p90: 34,
      dist: 22.8,
      cong: 42,
      reliability: 82,
      toll: 0,
      delta: 9,
      color: '#94A3B8',
      coordinates: [
        [37.7915, -122.4000],
        [37.7500, -122.3900],
        [37.7000, -122.4050],
        [37.6500, -122.4100],
        [37.6213, -122.3790]
      ],
      segments: [
        { name: 'Mission & Cesar Chavez', length_km: 4.8, speed: 32, congestion: 46 },
        { name: 'Bayshore Boulevard', length_km: 12.5, speed: 48, congestion: 38 },
        { name: 'San Bruno Ave Link', length_km: 5.5, speed: 40, congestion: 44 }
      ],
      description: 'Surface arterial corridor when freeway incidents occur.'
    }
  ],

  singapore: [
    {
      id: 'best',
      type: 'best',
      name: 'Via East Coast Parkway (ECP)',
      summary: 'Fast coastal expressway direct to Changi (⭐ Best Route)',
      eta: 21,
      p10: 19,
      p50: 21,
      p90: 25,
      dist: 19.8,
      cong: 22,
      reliability: 94,
      toll: 2.5,
      delta: 0,
      color: '#38BDF8',
      coordinates: [
        [1.2792, 103.8536],
        [1.2950, 103.8750],
        [1.3050, 103.9050],
        [1.3250, 103.9450],
        [1.3450, 103.9700],
        [1.3562, 103.9870]
      ],
      segments: [
        { name: 'Marina Boulevard / ECP On-Ramp', length_km: 2.2, speed: 54, congestion: 25 },
        { name: 'East Coast Parkway Arterial', length_km: 14.2, speed: 84, congestion: 20 },
        { name: 'Airport Boulevard / Terminal 3', length_km: 3.4, speed: 62, congestion: 22 }
      ],
      description: 'Smooth coastal expressway with 94% on-time reliability score.'
    },
    {
      id: 'fastest',
      type: 'fastest',
      name: 'Via Pan Island Expressway (PIE)',
      summary: 'Central expressway corridor',
      eta: 23.5,
      p10: 21,
      p50: 23.5,
      p90: 28,
      dist: 22.4,
      cong: 32,
      reliability: 88,
      toll: 2.0,
      delta: 2.5,
      color: '#FBBF24',
      coordinates: [
        [1.2792, 103.8536],
        [1.3100, 103.8500],
        [1.3350, 103.8850],
        [1.3500, 103.9350],
        [1.3620, 103.9650],
        [1.3562, 103.9870]
      ],
      segments: [
        { name: 'Kallang-Paya Lebar Tunnel', length_km: 4.8, speed: 70, congestion: 28 },
        { name: 'Pan Island Expressway East', length_km: 14.1, speed: 75, congestion: 34 },
        { name: 'Changi South Flyover', length_km: 3.5, speed: 60, congestion: 28 }
      ],
      description: 'Central express corridor with tunnel link and moderate merge volume at Eunos.'
    },
    {
      id: 'alt',
      type: 'alt',
      name: 'Via Nicoll Highway & Sims Ave',
      summary: 'Scenic city arterial route bypassing expressway ERP tolls',
      eta: 27.5,
      p10: 25,
      p50: 27.5,
      p90: 34,
      dist: 21.1,
      cong: 40,
      reliability: 82,
      toll: 0,
      delta: 6.5,
      color: '#94A3B8',
      coordinates: [
        [1.2792, 103.8536],
        [1.3000, 103.8650],
        [1.3180, 103.8900],
        [1.3380, 103.9400],
        [1.3562, 103.9870]
      ],
      segments: [
        { name: 'Nicoll Highway Link', length_km: 4.5, speed: 45, congestion: 42 },
        { name: 'Geylang & Sims Avenue', length_km: 11.2, speed: 38, congestion: 40 },
        { name: 'Upper Changi Road East', length_km: 5.4, speed: 46, congestion: 36 }
      ],
      description: 'Zero-toll arterial corridor through eastern neighborhoods.'
    }
  ]
};

/**
 * Generates rich maneuvers for turn-by-turn guidance.
 */
export function generateManeuvers(route) {
  const segments = route.segments || [];
  const dist = route.dist || 18.0;

  if (segments.length === 0) {
    return [
      {
        step: 1,
        type: 'straight',
        icon: 'arrow-up',
        instruction: 'Head straight on main corridor',
        distance_km: Math.round(dist * 0.4 * 10) / 10,
        road_name: 'Main Expressway',
        congestion: 25
      },
      {
        step: 2,
        type: 'turn-right',
        icon: 'corner-up-right',
        instruction: 'Turn right onto exit bypass',
        distance_km: Math.round(dist * 0.4 * 10) / 10,
        road_name: 'Exit Bypass',
        congestion: 35
      },
      {
        step: 3,
        type: 'arrive',
        icon: 'map-pin',
        instruction: 'Arrive at destination on right',
        distance_km: Math.round(dist * 0.2 * 10) / 10,
        road_name: 'Destination Link',
        congestion: 15
      }
    ];
  }

  return segments.map((seg, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === segments.length - 1;
    const type = isFirst ? 'straight' : isLast ? 'arrive' : idx % 2 === 1 ? 'turn-right' : 'straight';
    const icon = isFirst ? 'arrow-up' : isLast ? 'map-pin' : idx % 2 === 1 ? 'corner-up-right' : 'arrow-up';
    const instruction = isFirst
      ? `Head toward ${seg.name}`
      : isLast
      ? `Arrive at destination via ${seg.name}`
      : `Continue onto ${seg.name}`;

    return {
      step: idx + 1,
      type,
      icon,
      instruction,
      distance_km: seg.length_km,
      road_name: seg.name,
      congestion: seg.congestion
    };
  });
}

/**
 * Returns routes with attached maneuvers.
 */
export function buildRoutes(corridor) {
  const corridorId = corridor?.id || 'ahmedabad';
  const routes = RAW_ROUTES[corridorId] || RAW_ROUTES.ahmedabad;

  return routes.map((r) => ({
    ...r,
    maneuvers: generateManeuvers(r)
  }));
}

/**
 * Interpolates vehicle position, bearing, remaining ETA/distance, speed, and maneuver.
 */
export function interpolateDriveStep(progressPct, activeRoute, corridor) {
  const progress = Math.max(0.0, Math.min(1.0, progressPct));
  const totalDist = activeRoute.dist || 18.2;
  const baseEta = activeRoute.eta || 28;

  const remainingDist = Math.round(Math.max(0.0, totalDist * (1.0 - progress)) * 10) / 10;
  const remainingEta = Math.round(Math.max(0.0, baseEta * (1.0 - progress)) * 10) / 10;

  const now = new Date();
  now.setMinutes(now.getMinutes() + remainingEta);
  const arrivalTime = `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

  const maneuvers = activeRoute.maneuvers || generateManeuvers(activeRoute);
  const stepIdx = Math.min(maneuvers.length - 1, Math.floor(progress * maneuvers.length));
  const currentManeuver = maneuvers[stepIdx] || maneuvers[0];

  const coords = activeRoute.coordinates || [];
  let curLat = corridor?.origin?.lat || 23.0280;
  let curLon = corridor?.origin?.lon || 72.5065;
  let headingDeg = 45;

  if (coords.length >= 2) {
    const totalSegments = coords.length - 1;
    const currentSegIdx = Math.min(totalSegments - 1, Math.floor(progress * totalSegments));
    const subProgress = (progress * totalSegments) - currentSegIdx;
    const p1 = coords[currentSegIdx];
    const p2 = coords[currentSegIdx + 1];

    curLat = Math.round((p1[0] + (p2[0] - p1[0]) * subProgress) * 100000) / 100000;
    curLon = Math.round((p1[1] + (p2[1] - p1[1]) * subProgress) * 100000) / 100000;

    const dLat = p2[0] - p1[0];
    const dLon = p2[1] - p1[1];
    headingDeg = Math.round(((Math.atan2(dLon, dLat) * 180 / Math.PI) + 360) % 360);
  }

  // Realistic dynamic speed with slight variance
  const speedLimit = corridor?.speedLimit || 60;
  const segments = activeRoute.segments || [];
  const segIdx = Math.min(segments.length - 1, Math.floor(progress * segments.length));
  const upcomingSeg = segments[segIdx] || { name: 'Main Expressway', congestion: 30, speed: 54 };
  const baseSpeed = upcomingSeg.speed || 52;
  const speedJitter = Math.sin(progress * 20) * 3;
  const currentSpeed = Math.round(Math.max(25, Math.min(speedLimit + 5, baseSpeed + speedJitter)));

  return {
    progressPct: Math.round(progress * 1000) / 1000,
    remainingDistanceKm: remainingDist,
    remainingEtaMin: remainingEta,
    arrivalTime,
    currentLat: curLat,
    currentLon: curLon,
    headingDeg,
    currentSpeedKmh: currentSpeed,
    speedLimitKmh: speedLimit,
    currentManeuver: {
      ...currentManeuver,
      dist_to_action_m: Math.max(50, Math.round((1 - (progress * maneuvers.length - stepIdx)) * 600))
    },
    upcomingSegment: upcomingSeg
  };
}

const QUICK_PROMPTS = [
  { label: 'Why recommended?', query: 'why is this route recommended' },
  { label: 'Best departure?', query: 'when should I depart' },
  { label: 'Tolls & FastTag?', query: 'what are the toll costs' },
  { label: 'Bottlenecks?', query: 'any bottlenecks or hazards' }
];

export function getQuickPrompts() {
  return QUICK_PROMPTS;
}

export function answerCopilot(query, corridor) {
  const c = corridor;
  const q = query.toLowerCase();
  if (q.includes('why') || q.includes('recommend')) {
    return `⭐ ${c.best} balances time (~28 min) with 91% reliability along ${c.name}, shielding you from delay spikes at ${c.cong}% traffic. Toll-free.`;
  }
  if (q.includes('depart') || q.includes('when') || q.includes('time')) {
    return `🕒 Leaving in 15–20 min is ideal — traffic is ${c.cong}% now and projected to hit ${c.forecast}% in 20 min as peak sets in.`;
  }
  if (q.includes('toll') || q.includes('cost') || q.includes('fasttag') || q.includes('fee')) {
    return `💳 ${c.best} is toll-free; ${c.fastest} carries ~₹40-₹60 in FastTag tolls with minimal queuing.`;
  }
  if (q.includes('bottleneck') || q.includes('hazard') || q.includes('incident')) {
    return c.incident
      ? `⚠️ Alert: ${c.incident.type} reported near ${c.incident.location} causing ${c.incident.delay} delay on ${c.fastest}. Recommended route ${c.best} bypasses this completely.`
      : `✅ Clear flow along ${c.best} — steady at ${c.cong}% density with no severe bottlenecks.`;
  }
  return `🚗 For ${c.name}, ${c.best} is optimal (~28 min, ${c.cong}% traffic, 91% reliability). Ask about timing, tolls, or bottlenecks!`;
}

export function greeting(corridor) {
  return `Hello! I'm your TrafficIQ Copilot. Loaded live telemetry for ${corridor.name}. Ask me about congestion, departure timing, tolls, or route trade-offs!`;
}

export const FEATURES = [
  { icon: '🧭', title: 'Multi-Route Scoring', text: 'Every corridor returns several alternatives, ranked by a blend of speed, reliability, and toll cost.' },
  { icon: '📈', title: 'Probabilistic ETA Forecasts', text: 'P10 / P50 / P90 bounds and a 20-minute congestion projection, not a single optimistic guess.' },
  { icon: '🤖', title: 'AI Driving Copilot', text: 'A conversational co-driver grounded in live telemetry — ask why, when to leave, or about tolls.' },
  { icon: '🛡️', title: 'Explainable "Verified" Routing', text: 'Three-layer validation — numbers, facts, decisions — so recommendations are never a black box.' },
  { icon: '🚨', title: 'Proactive Reroute Alerts', text: 'Bottleneck ahead? TrafficIQ suggests an alternative and shows exactly how many minutes you save.' },
  { icon: '📡', title: 'Tiered Offline Resilience', text: 'Backend → cached → client-side simulation. The app never shows a dead screen.' }
];

export const STEPS = [
  { num: '01', title: 'Pick a corridor', text: 'Choose your commute — Ahmedabad, Bengaluru, Delhi NCR, SFO, or Singapore.' },
  { num: '02', title: 'Compare routes', text: 'See best vs. fastest with reliability, congestion, and toll trade-offs.' },
  { num: '03', title: 'Drive with Copilot', text: 'Turn-by-turn guidance with live alerts and an AI co-driver explaining every call.' }
];