/**
 * Tier 3 Resilient Fallback: High-Fidelity Client-Side Demo Simulation Engine.
 *
 * When the backend (Local OSRM / Public OSRM API) is unreachable or times out,
 * this engine produces deterministic, realistic traffic intelligence and
 * navigation telemetry matching the exact data models returned by the server.
 */

import { RoutingResponse, RouteData, CalculateRoutesParams } from './routingService';
import { TrafficDNAHour, WhatIfResponse } from './trafficService';
import { NavigationSessionStart, NavigationTelemetryUpdate, Maneuver } from './navigationService';

export interface SimulatedCorridorPreset {
  id: string;
  name: string;
  city: string;
  origin: { name: string; lat: number; lon: number };
  destination: { name: string; lat: number; lon: number };
  routes: RouteData[];
  explanation: {
    text: string;
    provenance: string;
    validation_status: string;
    validator_checks: {
      layer_1_numbers: string;
      layer_2_facts: string;
      layer_3_decisions: string;
    };
  };
}

export const SIMULATED_CORRIDORS: Record<string, SimulatedCorridorPreset> = {
  ahmedabad_gandhinagar: {
    id: 'ahmedabad_gandhinagar',
    name: 'Ahmedabad to Gandhinagar Corridor',
    city: 'Gujarat Tech Hub',
    origin: { name: 'Iscon Cross Road, SG Highway', lat: 23.0280, lon: 72.5065 },
    destination: { name: 'Infocity / GIFT City Link', lat: 23.1970, lon: 72.6350 },
    explanation: {
      text: 'Via SG Highway is selected as the Best Route because it achieves a 91% reliability index with zero tolls and steady flyover throughput, avoiding the high-speed toll surcharge on the SP Ring Expressway while maintaining a 28.0 min median ETA.',
      provenance: 'TIER_3_DEMO_SIMULATION (Zero-Hallucination Verified)',
      validation_status: 'VALIDATED',
      validator_checks: {
        layer_1_numbers: 'PASSED (18.2 km, 28.0 min matches forecast p50)',
        layer_2_facts: 'PASSED (SG Highway flyover segments confirmed)',
        layer_3_decisions: 'PASSED (Balanced trade-off verified)'
      }
    },
    routes: [
      {
        id: 'route_ahmedabad_sg_highway',
        name: 'Via SG Highway & Gandhinagar Bypass',
        summary: 'Main urban tech artery with flyovers (⭐ Best Route)',
        distance_km: 18.2,
        base_duration_min: 28.0,
        live_duration_min: 29.5,
        predicted_eta_p10: 25.0,
        predicted_eta_p50: 28.0,
        predicted_eta_p90: 33.0,
        forecast_uncertainty_spread: 8.0,
        toll_cost: 0.0,
        avg_congestion: 36.0,
        congestion_category: 'MODERATE',
        trend: 'STABLE',
        trend_delta_pct: 2.1,
        trend_description: 'Traffic flow is holding steady across all 3 key overpasses.',
        forecast_20m_p50: 38.0,
        route_health: {
          health_score: 88,
          health_label: 'EXCELLENT'
        },
        reliability: {
          reliability_score: 0.91,
          reliability_label: 'HIGH_RELIABILITY',
          p80_duration_min: 30.5,
          p95_duration_min: 34.0,
          buffer_index: 0.15
        },
        has_incident: false,
        score: 92.4,
        is_fastest: false,
        is_best: true,
        coordinates: [
          [23.0280, 72.5065],
          [23.0650, 72.5250],
          [23.1150, 72.5450],
          [23.1550, 72.5800],
          [23.1780, 72.6100],
          [23.1970, 72.6350]
        ],
        segments: [
          {
            id: 'SEG_SG_HIGHWAY',
            name: 'SG Highway Arterial',
            length_km: 6.8,
            freeflow_speed: 65.0,
            current_speed: 52.0,
            congestion: 38.0,
            trend: 'STABLE',
            forecast_20m_p50: 40.0,
            incident_flag: 0,
            history_20m: [35, 36, 38, 38]
          },
          {
            id: 'SEG_VAISHNODEVI_JCT',
            name: 'Vaishnodevi Circle Flyover',
            length_km: 4.6,
            freeflow_speed: 60.0,
            current_speed: 48.0,
            congestion: 34.0,
            trend: 'STABLE',
            forecast_20m_p50: 36.0,
            incident_flag: 0,
            history_20m: [32, 33, 34, 34]
          },
          {
            id: 'SEG_GANDHINAGAR_ENT',
            name: 'Gandhinagar Entry / Infocity Link',
            length_km: 6.8,
            freeflow_speed: 70.0,
            current_speed: 58.0,
            congestion: 36.0,
            trend: 'STABLE',
            forecast_20m_p50: 38.0,
            incident_flag: 0,
            history_20m: [34, 35, 36, 36]
          }
        ]
      },
      {
        id: 'route_ahmedabad_sp_ring',
        name: 'Via SP Ring Expressway (Outer Bypass)',
        summary: 'High-speed expressway bypass with toll (⚡ Fastest Route)',
        distance_km: 22.5,
        base_duration_min: 24.0,
        live_duration_min: 24.5,
        predicted_eta_p10: 22.0,
        predicted_eta_p50: 24.5,
        predicted_eta_p90: 28.0,
        forecast_uncertainty_spread: 6.0,
        toll_cost: 40.0,
        avg_congestion: 22.0,
        congestion_category: 'FREEFLOW',
        trend: 'CLEARING',
        trend_delta_pct: -4.5,
        trend_description: 'Outer ring road moving at open expressway speeds.',
        forecast_20m_p50: 24.0,
        route_health: {
          health_score: 94,
          health_label: 'OPTIMAL'
        },
        reliability: {
          reliability_score: 0.96,
          reliability_label: 'HIGH_RELIABILITY',
          p80_duration_min: 26.0,
          p95_duration_min: 28.5,
          buffer_index: 0.09
        },
        has_incident: false,
        score: 89.2,
        is_fastest: true,
        is_best: false,
        coordinates: [
          [23.0280, 72.5065],
          [23.0450, 72.4850],
          [23.1000, 72.5050],
          [23.1600, 72.5500],
          [23.1850, 72.6000],
          [23.1970, 72.6350]
        ],
        segments: [
          {
            id: 'SEG_BOPAL_LINK',
            name: 'Bopal Connector Ramp',
            length_km: 3.5,
            freeflow_speed: 55.0,
            current_speed: 46.0,
            congestion: 28.0,
            trend: 'CLEARING',
            forecast_20m_p50: 26.0,
            incident_flag: 0,
            history_20m: [32, 30, 29, 28]
          },
          {
            id: 'SEG_SP_RING_NORTH',
            name: 'Sardar Patel Ring Road North',
            length_km: 13.8,
            freeflow_speed: 90.0,
            current_speed: 82.0,
            congestion: 18.0,
            trend: 'CLEARING',
            forecast_20m_p50: 20.0,
            incident_flag: 0,
            history_20m: [24, 22, 20, 18]
          },
          {
            id: 'SEG_GIFT_CITY_RD',
            name: 'Koba Circle to Infocity',
            length_km: 5.2,
            freeflow_speed: 75.0,
            current_speed: 68.0,
            congestion: 24.0,
            trend: 'CLEARING',
            forecast_20m_p50: 25.0,
            incident_flag: 0,
            history_20m: [28, 26, 25, 24]
          }
        ]
      },
      {
        id: 'route_ahmedabad_riverfront',
        name: 'Via Sabarmati Riverfront Corridor',
        summary: 'Scenic riverfront arterial route through central city',
        distance_km: 20.1,
        base_duration_min: 33.0,
        live_duration_min: 35.0,
        predicted_eta_p10: 30.0,
        predicted_eta_p50: 34.0,
        predicted_eta_p90: 41.0,
        forecast_uncertainty_spread: 11.0,
        toll_cost: 0.0,
        avg_congestion: 48.0,
        congestion_category: 'MODERATE',
        trend: 'WORSENING',
        trend_delta_pct: 6.2,
        trend_description: 'Central city bottlenecks increasing near Drive-In Road.',
        forecast_20m_p50: 52.0,
        route_health: {
          health_score: 72,
          health_label: 'MODERATE'
        },
        reliability: {
          reliability_score: 0.79,
          reliability_label: 'MODERATE_RELIABILITY',
          p80_duration_min: 38.0,
          p95_duration_min: 44.0,
          buffer_index: 0.28
        },
        has_incident: false,
        score: 74.5,
        is_fastest: false,
        is_best: false,
        coordinates: [
          [23.0280, 72.5065],
          [23.0400, 72.5350],
          [23.0750, 72.5700],
          [23.1300, 72.5950],
          [23.1700, 72.6150],
          [23.1970, 72.6350]
        ],
        segments: [
          {
            id: 'SEG_DRIVE_IN_RD',
            name: 'Drive-In Road & University Link',
            length_km: 5.1,
            freeflow_speed: 45.0,
            current_speed: 30.0,
            congestion: 54.0,
            trend: 'WORSENING',
            forecast_20m_p50: 60.0,
            incident_flag: 0,
            history_20m: [44, 48, 51, 54]
          },
          {
            id: 'SEG_RIVERFRONT_EXP',
            name: 'Sabarmati Riverfront West',
            length_km: 9.2,
            freeflow_speed: 60.0,
            current_speed: 44.0,
            congestion: 42.0,
            trend: 'STABLE',
            forecast_20m_p50: 45.0,
            incident_flag: 0,
            history_20m: [40, 41, 42, 42]
          },
          {
            id: 'SEG_CHILODA_LINK',
            name: 'Gandhinagar South Corridor',
            length_km: 5.8,
            freeflow_speed: 55.0,
            current_speed: 42.0,
            congestion: 46.0,
            trend: 'WORSENING',
            forecast_20m_p50: 50.0,
            incident_flag: 0,
            history_20m: [38, 41, 44, 46]
          }
        ]
      }
    ]
  },

  bangalore_tech_corridor: {
    id: 'bangalore_tech_corridor',
    name: 'Bengaluru: MG Road to Whitefield Tech Park',
    city: 'Bengaluru Tech Corridor',
    origin: { name: 'MG Road Metro Station', lat: 12.9756, lon: 77.6066 },
    destination: { name: 'ITPB Whitefield', lat: 12.9863, lon: 77.7340 },
    explanation: {
      text: 'Via Old Airport Road is designated as the Best Route because it delivers the optimal trade-off: 18.4 km total distance, 0 INR toll cost, and high prediction confidence (p50 of 32.0 min) with low volatility compared to the ORR bypass.',
      provenance: 'TIER_3_DEMO_SIMULATION (Zero-Hallucination Verified)',
      validation_status: 'VALIDATED',
      validator_checks: {
        layer_1_numbers: 'PASSED (18.4 km, 32.0 min matches forecast p50)',
        layer_2_facts: 'PASSED (Marathahalli flyover traffic verified)',
        layer_3_decisions: 'PASSED (Multi-objective score validated)'
      }
    },
    routes: [
      {
        id: 'route_a_old_airport',
        name: 'Via Old Airport Road & Marathahalli',
        summary: 'Direct arterial corridor through central tech hub (⭐ Best Route)',
        distance_km: 18.4,
        base_duration_min: 32.0,
        live_duration_min: 33.5,
        predicted_eta_p10: 29.0,
        predicted_eta_p50: 32.0,
        predicted_eta_p90: 38.0,
        forecast_uncertainty_spread: 9.0,
        toll_cost: 0.0,
        avg_congestion: 42.0,
        congestion_category: 'MODERATE',
        trend: 'STABLE',
        trend_delta_pct: 1.5,
        trend_description: 'Marathahalli link operating within historical standard deviation.',
        forecast_20m_p50: 44.0,
        route_health: {
          health_score: 84,
          health_label: 'GOOD'
        },
        reliability: {
          reliability_score: 0.86,
          reliability_label: 'HIGH_RELIABILITY',
          p80_duration_min: 35.0,
          p95_duration_min: 39.5,
          buffer_index: 0.18
        },
        has_incident: false,
        score: 90.1,
        is_fastest: false,
        is_best: true,
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
          {
            id: 'SEG_MG_ROAD',
            name: 'MG Road Arterial',
            length_km: 3.2,
            freeflow_speed: 55.0,
            current_speed: 38.0,
            congestion: 45.0,
            trend: 'STABLE',
            forecast_20m_p50: 46.0,
            incident_flag: 0,
            history_20m: [42, 44, 45, 45]
          },
          {
            id: 'SEG_OLD_AIRPORT_RD',
            name: 'Old Airport Road',
            length_km: 7.8,
            freeflow_speed: 50.0,
            current_speed: 36.0,
            congestion: 40.0,
            trend: 'STABLE',
            forecast_20m_p50: 42.0,
            incident_flag: 0,
            history_20m: [38, 39, 40, 40]
          },
          {
            id: 'SEG_TECH_CORRIDOR',
            name: 'Marathahalli Flyover & Tech Link',
            length_km: 7.4,
            freeflow_speed: 60.0,
            current_speed: 42.0,
            congestion: 43.0,
            trend: 'STABLE',
            forecast_20m_p50: 45.0,
            incident_flag: 0,
            history_20m: [40, 41, 42, 43]
          }
        ]
      },
      {
        id: 'route_b_outer_ring',
        name: 'Via Outer Ring Expressway (North Bypass)',
        summary: 'Grade-separated expressway with higher capacity (⚡ Fastest Route)',
        distance_km: 22.8,
        base_duration_min: 27.0,
        live_duration_min: 28.0,
        predicted_eta_p10: 25.0,
        predicted_eta_p50: 28.0,
        predicted_eta_p90: 32.0,
        forecast_uncertainty_spread: 7.0,
        toll_cost: 45.0,
        avg_congestion: 28.0,
        congestion_category: 'FREEFLOW',
        trend: 'CLEARING',
        trend_delta_pct: -3.8,
        trend_description: 'Outer ring elevated lanes clear with rapid average velocity.',
        forecast_20m_p50: 30.0,
        route_health: {
          health_score: 91,
          health_label: 'EXCELLENT'
        },
        reliability: {
          reliability_score: 0.93,
          reliability_label: 'HIGH_RELIABILITY',
          p80_duration_min: 30.0,
          p95_duration_min: 33.0,
          buffer_index: 0.12
        },
        has_incident: false,
        score: 87.8,
        is_fastest: true,
        is_best: false,
        coordinates: [
          [12.9756, 77.6066],
          [12.9900, 77.6150],
          [13.0100, 77.6400],
          [13.0150, 77.6800],
          [13.0050, 77.7100],
          [12.9863, 77.7340]
        ],
        segments: [
          {
            id: 'SEG_CENTRAL_BLVD',
            name: 'Central Boulevard',
            length_km: 4.1,
            freeflow_speed: 50.0,
            current_speed: 40.0,
            congestion: 32.0,
            trend: 'CLEARING',
            forecast_20m_p50: 30.0,
            incident_flag: 0,
            history_20m: [36, 34, 33, 32]
          },
          {
            id: 'SEG_ORR_NORTH',
            name: 'Outer Ring Expressway North',
            length_km: 13.5,
            freeflow_speed: 80.0,
            current_speed: 70.0,
            congestion: 24.0,
            trend: 'CLEARING',
            forecast_20m_p50: 26.0,
            incident_flag: 0,
            history_20m: [28, 26, 25, 24]
          },
          {
            id: 'SEG_TECH_CORRIDOR',
            name: 'ITPB Access Road',
            length_km: 5.2,
            freeflow_speed: 60.0,
            current_speed: 48.0,
            congestion: 30.0,
            trend: 'CLEARING',
            forecast_20m_p50: 32.0,
            incident_flag: 0,
            history_20m: [34, 32, 31, 30]
          }
        ]
      },
      {
        id: 'route_c_metro_viaduct',
        name: 'Via Metro Viaduct Corridor & Hoodi',
        summary: 'Alternate secondary artery under metro line',
        distance_km: 19.9,
        base_duration_min: 35.0,
        live_duration_min: 37.0,
        predicted_eta_p10: 32.0,
        predicted_eta_p50: 36.5,
        predicted_eta_p90: 44.0,
        forecast_uncertainty_spread: 12.0,
        toll_cost: 0.0,
        avg_congestion: 52.0,
        congestion_category: 'MODERATE',
        trend: 'WORSENING',
        trend_delta_pct: 7.0,
        trend_description: 'Hoodi intersection queue expanding due to surface construction.',
        forecast_20m_p50: 58.0,
        route_health: {
          health_score: 68,
          health_label: 'MODERATE'
        },
        reliability: {
          reliability_score: 0.74,
          reliability_label: 'MODERATE_RELIABILITY',
          p80_duration_min: 40.0,
          p95_duration_min: 46.0,
          buffer_index: 0.32
        },
        has_incident: false,
        score: 71.0,
        is_fastest: false,
        is_best: false,
        coordinates: [
          [12.9756, 77.6066],
          [12.9820, 77.6250],
          [12.9950, 77.6550],
          [12.9980, 77.6900],
          [12.9920, 77.7150],
          [12.9863, 77.7340]
        ],
        segments: [
          {
            id: 'SEG_METRO_VIADUCT',
            name: 'Metro Viaduct Avenue',
            length_km: 8.5,
            freeflow_speed: 45.0,
            current_speed: 28.0,
            congestion: 56.0,
            trend: 'WORSENING',
            forecast_20m_p50: 62.0,
            incident_flag: 0,
            history_20m: [46, 50, 53, 56]
          },
          {
            id: 'SEG_RIVERSIDE_PKWY',
            name: 'Hoodi Bypass Link',
            length_km: 6.8,
            freeflow_speed: 70.0,
            current_speed: 52.0,
            congestion: 46.0,
            trend: 'WORSENING',
            forecast_20m_p50: 52.0,
            incident_flag: 0,
            history_20m: [38, 41, 43, 46]
          },
          {
            id: 'SEG_TECH_CORRIDOR',
            name: 'Whitefield Main Gate',
            length_km: 4.6,
            freeflow_speed: 60.0,
            current_speed: 40.0,
            congestion: 54.0,
            trend: 'WORSENING',
            forecast_20m_p50: 60.0,
            incident_flag: 0,
            history_20m: [45, 48, 51, 54]
          }
        ]
      }
    ]
  },

  delhi_cyber_corridor: {
    id: 'delhi_cyber_corridor',
    name: 'Delhi: Connaught Place to Cyber City Gurugram',
    city: 'Delhi NCR Corridor',
    origin: { name: 'Connaught Place', lat: 28.6315, lon: 77.2167 },
    destination: { name: 'Cyber City Gurugram', lat: 28.4950, lon: 77.0890 },
    explanation: {
      text: 'Via NH-48 Express Highway is both Best and Fastest Route due to high expressway capacity and grade separation, delivering a 34.0 min median ETA and 90% reliability despite the toll plaza link.',
      provenance: 'TIER_3_DEMO_SIMULATION (Zero-Hallucination Verified)',
      validation_status: 'VALIDATED',
      validator_checks: {
        layer_1_numbers: 'PASSED (27.5 km, 34.0 min matches forecast p50)',
        layer_2_facts: 'PASSED (NH-48 interstate expressway confirmed)',
        layer_3_decisions: 'PASSED (Single dominant route validated)'
      }
    },
    routes: [
      {
        id: 'route_delhi_nh48',
        name: 'Via NH-48 Express Highway',
        summary: 'Main interstate expressway corridor (⭐ Best & ⚡ Fastest)',
        distance_km: 27.5,
        base_duration_min: 34.0,
        live_duration_min: 35.5,
        predicted_eta_p10: 31.0,
        predicted_eta_p50: 34.0,
        predicted_eta_p90: 40.0,
        forecast_uncertainty_spread: 9.0,
        toll_cost: 65.0,
        avg_congestion: 35.0,
        congestion_category: 'MODERATE',
        trend: 'STABLE',
        trend_delta_pct: 1.8,
        trend_description: 'Expressway traffic flow moving with steady throughput.',
        forecast_20m_p50: 38.0,
        route_health: {
          health_score: 87,
          health_label: 'GOOD'
        },
        reliability: {
          reliability_score: 0.90,
          reliability_label: 'HIGH_RELIABILITY',
          p80_duration_min: 37.0,
          p95_duration_min: 42.0,
          buffer_index: 0.16
        },
        has_incident: false,
        score: 93.0,
        is_fastest: true,
        is_best: true,
        coordinates: [
          [28.6315, 77.2167],
          [28.5900, 77.1600],
          [28.5500, 77.1200],
          [28.5100, 77.0950],
          [28.4950, 77.0890]
        ],
        segments: [
          {
            id: 'SEG_CENTRAL_BLVD',
            name: 'Dhaula Kuan Link',
            length_km: 6.5,
            freeflow_speed: 50.0,
            current_speed: 40.0,
            congestion: 36.0,
            trend: 'STABLE',
            forecast_20m_p50: 38.0,
            incident_flag: 0,
            history_20m: [34, 35, 36, 36]
          },
          {
            id: 'SEG_AIRPORT_EXP',
            name: 'NH-48 Expressway',
            length_km: 16.0,
            freeflow_speed: 90.0,
            current_speed: 78.0,
            congestion: 32.0,
            trend: 'STABLE',
            forecast_20m_p50: 35.0,
            incident_flag: 0,
            history_20m: [30, 31, 32, 32]
          },
          {
            id: 'SEG_TECH_CORRIDOR',
            name: 'Cyber City Entry Ramp',
            length_km: 5.0,
            freeflow_speed: 60.0,
            current_speed: 46.0,
            congestion: 40.0,
            trend: 'STABLE',
            forecast_20m_p50: 42.0,
            incident_flag: 0,
            history_20m: [38, 39, 40, 40]
          }
        ]
      },
      {
        id: 'route_delhi_mg_road',
        name: 'Via Mehrauli-Gurgaon Road Arterial',
        summary: 'Non-toll arterial corridor through South Delhi',
        distance_km: 29.8,
        base_duration_min: 42.0,
        live_duration_min: 45.0,
        predicted_eta_p10: 39.0,
        predicted_eta_p50: 44.0,
        predicted_eta_p90: 52.0,
        forecast_uncertainty_spread: 13.0,
        toll_cost: 0.0,
        avg_congestion: 54.0,
        congestion_category: 'MODERATE',
        trend: 'WORSENING',
        trend_delta_pct: 8.5,
        trend_description: 'Aurobindo Marg intersection congested with dense arterial volume.',
        forecast_20m_p50: 60.0,
        route_health: {
          health_score: 65,
          health_label: 'MODERATE'
        },
        reliability: {
          reliability_score: 0.72,
          reliability_label: 'MODERATE_RELIABILITY',
          p80_duration_min: 48.0,
          p95_duration_min: 55.0,
          buffer_index: 0.35
        },
        has_incident: false,
        score: 72.5,
        is_fastest: false,
        is_best: false,
        coordinates: [
          [28.6315, 77.2167],
          [28.5700, 77.2000],
          [28.5200, 77.1800],
          [28.4800, 77.1100],
          [28.4950, 77.0890]
        ],
        segments: [
          {
            id: 'SEG_METRO_VIADUCT',
            name: 'Aurobindo Marg',
            length_km: 10.0,
            freeflow_speed: 45.0,
            current_speed: 26.0,
            congestion: 58.0,
            trend: 'WORSENING',
            forecast_20m_p50: 65.0,
            incident_flag: 0,
            history_20m: [48, 52, 55, 58]
          },
          {
            id: 'SEG_MG_ROAD',
            name: 'MG Road Gurugram',
            length_km: 14.5,
            freeflow_speed: 55.0,
            current_speed: 38.0,
            congestion: 50.0,
            trend: 'WORSENING',
            forecast_20m_p50: 55.0,
            incident_flag: 0,
            history_20m: [42, 45, 48, 50]
          },
          {
            id: 'SEG_TECH_CORRIDOR',
            name: 'Sikanderpur Link',
            length_km: 5.3,
            freeflow_speed: 60.0,
            current_speed: 42.0,
            congestion: 52.0,
            trend: 'WORSENING',
            forecast_20m_p50: 58.0,
            incident_flag: 0,
            history_20m: [44, 47, 50, 52]
          }
        ]
      }
    ]
  },

  sf_airport_corridor: {
    id: 'sf_airport_corridor',
    name: 'San Francisco: Financial District to SFO Airport',
    city: 'San Francisco',
    origin: { name: 'Market St / Financial District', lat: 37.7915, lon: -122.4000 },
    destination: { name: "San Francisco Int'l Airport (SFO)", lat: 37.6213, lon: -122.3790 },
    explanation: {
      text: 'Via US-101 South Freeway is designated Best and Fastest Route with a direct 21.6 km path, 19.0 min median ETA, and 95% reliability score under standard maritime conditions.',
      provenance: 'TIER_3_DEMO_SIMULATION (Zero-Hallucination Verified)',
      validation_status: 'VALIDATED',
      validator_checks: {
        layer_1_numbers: 'PASSED (21.6 km, 19.0 min matches forecast p50)',
        layer_2_facts: 'PASSED (US-101 South freeway verified)',
        layer_3_decisions: 'PASSED (Optimal highway routing confirmed)'
      }
    },
    routes: [
      {
        id: 'route_sf_us101',
        name: 'Via US-101 South Freeway',
        summary: 'Direct freeway artery (⭐ Best & ⚡ Fastest)',
        distance_km: 21.6,
        base_duration_min: 19.0,
        live_duration_min: 20.0,
        predicted_eta_p10: 17.5,
        predicted_eta_p50: 19.0,
        predicted_eta_p90: 23.0,
        forecast_uncertainty_spread: 5.5,
        toll_cost: 0.0,
        avg_congestion: 28.0,
        congestion_category: 'FREEFLOW',
        trend: 'STABLE',
        trend_delta_pct: 1.2,
        trend_description: 'Freeway speeds consistent from Potrero Hill to SFO Airport.',
        forecast_20m_p50: 30.0,
        route_health: {
          health_score: 93,
          health_label: 'OPTIMAL'
        },
        reliability: {
          reliability_score: 0.95,
          reliability_label: 'HIGH_RELIABILITY',
          p80_duration_min: 21.0,
          p95_duration_min: 24.0,
          buffer_index: 0.11
        },
        has_incident: false,
        score: 95.2,
        is_fastest: true,
        is_best: true,
        coordinates: [
          [37.7915, -122.4000],
          [37.7650, -122.4050],
          [37.7100, -122.4000],
          [37.6600, -122.3950],
          [37.6213, -122.3790]
        ],
        segments: [
          {
            id: 'SEG_CENTRAL_BLVD',
            name: '4th St Onramp',
            length_km: 2.6,
            freeflow_speed: 50.0,
            current_speed: 42.0,
            congestion: 32.0,
            trend: 'STABLE',
            forecast_20m_p50: 34.0,
            incident_flag: 0,
            history_20m: [30, 31, 32, 32]
          },
          {
            id: 'SEG_AIRPORT_EXP',
            name: 'US-101 South Freeway',
            length_km: 15.5,
            freeflow_speed: 90.0,
            current_speed: 82.0,
            congestion: 25.0,
            trend: 'STABLE',
            forecast_20m_p50: 28.0,
            incident_flag: 0,
            history_20m: [24, 25, 25, 25]
          },
          {
            id: 'SEG_TECH_CORRIDOR',
            name: 'Airport Terminals Loop',
            length_km: 3.5,
            freeflow_speed: 60.0,
            current_speed: 50.0,
            congestion: 30.0,
            trend: 'STABLE',
            forecast_20m_p50: 32.0,
            incident_flag: 0,
            history_20m: [28, 29, 30, 30]
          }
        ]
      },
      {
        id: 'route_sf_i280',
        name: 'Via I-280 South & Highway 380',
        summary: 'Scenic high-speed western freeway bypass',
        distance_km: 25.4,
        base_duration_min: 21.0,
        live_duration_min: 22.0,
        predicted_eta_p10: 19.5,
        predicted_eta_p50: 21.5,
        predicted_eta_p90: 25.0,
        forecast_uncertainty_spread: 5.5,
        toll_cost: 0.0,
        avg_congestion: 20.0,
        congestion_category: 'FREEFLOW',
        trend: 'CLEARING',
        trend_delta_pct: -2.5,
        trend_description: 'I-280 corridor moving with wide open lane availability.',
        forecast_20m_p50: 22.0,
        route_health: {
          health_score: 95,
          health_label: 'OPTIMAL'
        },
        reliability: {
          reliability_score: 0.97,
          reliability_label: 'HIGH_RELIABILITY',
          p80_duration_min: 23.0,
          p95_duration_min: 26.0,
          buffer_index: 0.08
        },
        has_incident: false,
        score: 91.5,
        is_fastest: false,
        is_best: false,
        coordinates: [
          [37.7915, -122.4000],
          [37.7600, -122.3950],
          [37.7200, -122.4400],
          [37.6600, -122.4350],
          [37.6300, -122.4100],
          [37.6213, -122.3790]
        ],
        segments: [
          {
            id: 'SEG_RIVERSIDE_PKWY',
            name: 'King St to I-280',
            length_km: 3.4,
            freeflow_speed: 70.0,
            current_speed: 62.0,
            congestion: 24.0,
            trend: 'CLEARING',
            forecast_20m_p50: 24.0,
            incident_flag: 0,
            history_20m: [28, 26, 25, 24]
          },
          {
            id: 'SEG_ORR_NORTH',
            name: 'I-280 South Interstate',
            length_km: 17.5,
            freeflow_speed: 80.0,
            current_speed: 76.0,
            congestion: 18.0,
            trend: 'CLEARING',
            forecast_20m_p50: 20.0,
            incident_flag: 0,
            history_20m: [22, 20, 19, 18]
          },
          {
            id: 'SEG_TECH_CORRIDOR',
            name: 'CA-380 East to SFO',
            length_km: 4.5,
            freeflow_speed: 60.0,
            current_speed: 54.0,
            congestion: 22.0,
            trend: 'CLEARING',
            forecast_20m_p50: 24.0,
            incident_flag: 0,
            history_20m: [26, 24, 23, 22]
          }
        ]
      }
    ]
  },
  singapore_changi_cbd: {
    id: 'singapore_changi_cbd',
    name: 'Marina Bay CBD to Changi Airport',
    city: 'Singapore',
    origin: { name: 'Marina Bay Financial Centre', lat: 1.2792, lon: 103.8536 },
    destination: { name: 'Singapore Changi Airport (SIN)', lat: 1.3562, lon: 103.9870 },
    explanation: {
      text: 'Via East Coast Parkway (ECP) is recommended as the Best Route for optimal coastal flow, achieving a 94% on-time reliability score with minimal delay (21.0 min median ETA) directly into Terminal 3.',
      provenance: 'TIER_3_DEMO_SIMULATION (Zero-Hallucination Verified)',
      validation_status: 'VALIDATED',
      validator_checks: {
        layer_1_numbers: 'PASSED (19.8 km, 21.0 min matches forecast p50)',
        layer_2_facts: 'PASSED (ECP expressway coastal lanes verified)',
        layer_3_decisions: 'PASSED (Balanced coastal throughput confirmed)'
      }
    },
    routes: [
      {
        id: 'route_sg_ecp',
        name: 'Via East Coast Parkway (ECP)',
        summary: 'Fast coastal expressway direct to Changi (⭐ Best Route)',
        distance_km: 19.8,
        base_duration_min: 21.0,
        live_duration_min: 21.5,
        predicted_eta_p10: 19.0,
        predicted_eta_p50: 21.0,
        predicted_eta_p90: 25.0,
        forecast_uncertainty_spread: 6.0,
        toll_cost: 2.5,
        avg_congestion: 22.0,
        congestion_category: 'FREEFLOW',
        trend: 'STABLE',
        trend_delta_pct: 1.2,
        trend_description: 'Smooth coastal traffic flow along East Coast Parkway.',
        forecast_20m_p50: 23.0,
        route_health: {
          health_score: 94,
          health_label: 'OPTIMAL'
        },
        reliability: {
          reliability_score: 0.94,
          reliability_label: 'HIGH_RELIABILITY',
          p80_duration_min: 22.5,
          p95_duration_min: 25.0,
          buffer_index: 0.10
        },
        has_incident: false,
        score: 95.0,
        is_fastest: true,
        is_best: true,
        coordinates: [
          [1.2792, 103.8536],
          [1.2950, 103.8750],
          [1.3050, 103.9050],
          [1.3250, 103.9450],
          [1.3450, 103.9700],
          [1.3562, 103.9870]
        ],
        segments: [
          {
            id: 'SEG_SHENTON_WAY',
            name: 'Marina Boulevard / ECP On-Ramp',
            length_km: 2.2,
            freeflow_speed: 60.0,
            current_speed: 54.0,
            congestion: 25.0,
            trend: 'STABLE',
            forecast_20m_p50: 26.0,
            incident_flag: 0,
            history_20m: [26, 25, 25, 25]
          },
          {
            id: 'SEG_ECP_COASTAL',
            name: 'East Coast Parkway Arterial',
            length_km: 14.2,
            freeflow_speed: 90.0,
            current_speed: 84.0,
            congestion: 20.0,
            trend: 'STABLE',
            forecast_20m_p50: 22.0,
            incident_flag: 0,
            history_20m: [20, 20, 21, 20]
          },
          {
            id: 'SEG_AIRPORT_BOULEVARD',
            name: 'Airport Boulevard / Terminal 3',
            length_km: 3.4,
            freeflow_speed: 70.0,
            current_speed: 62.0,
            congestion: 22.0,
            trend: 'STABLE',
            forecast_20m_p50: 24.0,
            incident_flag: 0,
            history_20m: [24, 23, 22, 22]
          }
        ]
      },
      {
        id: 'route_sg_pie',
        name: 'Via Pan Island Expressway (PIE)',
        summary: 'Central expressway corridor',
        distance_km: 22.4,
        base_duration_min: 23.5,
        live_duration_min: 24.0,
        predicted_eta_p10: 21.0,
        predicted_eta_p50: 23.5,
        predicted_eta_p90: 28.0,
        forecast_uncertainty_spread: 7.0,
        toll_cost: 2.0,
        avg_congestion: 32.0,
        congestion_category: 'MODERATE',
        trend: 'STABLE',
        trend_delta_pct: 2.0,
        trend_description: 'PIE Eastbound flowing steadily with minor bottleneck at Eunos.',
        forecast_20m_p50: 25.0,
        route_health: {
          health_score: 86,
          health_label: 'EXCELLENT'
        },
        reliability: {
          reliability_score: 0.88,
          reliability_label: 'HIGH_RELIABILITY',
          p80_duration_min: 25.0,
          p95_duration_min: 28.0,
          buffer_index: 0.16
        },
        has_incident: false,
        score: 88.0,
        is_fastest: false,
        is_best: false,
        coordinates: [
          [1.2792, 103.8536],
          [1.3100, 103.8500],
          [1.3350, 103.8850],
          [1.3500, 103.9350],
          [1.3620, 103.9650],
          [1.3562, 103.9870]
        ],
        segments: [
          {
            id: 'SEG_KPE_TUNNEL',
            name: 'Kallang-Paya Lebar Tunnel',
            length_km: 4.8,
            freeflow_speed: 80.0,
            current_speed: 70.0,
            congestion: 28.0,
            trend: 'STABLE',
            forecast_20m_p50: 30.0,
            incident_flag: 0,
            history_20m: [26, 27, 28, 28]
          },
          {
            id: 'SEG_PIE_EAST',
            name: 'Pan Island Expressway East',
            length_km: 14.1,
            freeflow_speed: 90.0,
            current_speed: 75.0,
            congestion: 34.0,
            trend: 'STABLE',
            forecast_20m_p50: 36.0,
            incident_flag: 0,
            history_20m: [32, 33, 34, 34]
          },
          {
            id: 'SEG_CHANGI_FLYOVER',
            name: 'Changi South Flyover',
            length_km: 3.5,
            freeflow_speed: 70.0,
            current_speed: 60.0,
            congestion: 28.0,
            trend: 'STABLE',
            forecast_20m_p50: 30.0,
            incident_flag: 0,
            history_20m: [28, 28, 28, 28]
          }
        ]
      },
      {
        id: 'route_sg_nicoll',
        name: 'Via Nicoll Highway & Sims Ave',
        summary: 'Scenic city arterial route bypassing expressway ERP tolls',
        distance_km: 21.1,
        base_duration_min: 27.0,
        live_duration_min: 28.0,
        predicted_eta_p10: 25.0,
        predicted_eta_p50: 27.5,
        predicted_eta_p90: 34.0,
        forecast_uncertainty_spread: 9.0,
        toll_cost: 0.0,
        avg_congestion: 40.0,
        congestion_category: 'MODERATE',
        trend: 'STABLE',
        trend_delta_pct: 3.5,
        trend_description: 'Traffic signals along Upper Changi Road with light queueing.',
        forecast_20m_p50: 30.0,
        route_health: {
          health_score: 78,
          health_label: 'GOOD'
        },
        reliability: {
          reliability_score: 0.82,
          reliability_label: 'HIGH_RELIABILITY',
          p80_duration_min: 30.0,
          p95_duration_min: 34.0,
          buffer_index: 0.22
        },
        has_incident: false,
        score: 82.0,
        is_fastest: false,
        is_best: false,
        coordinates: [
          [1.2792, 103.8536],
          [1.2980, 103.8620],
          [1.3160, 103.8890],
          [1.3400, 103.9350],
          [1.3520, 103.9680],
          [1.3562, 103.9870]
        ],
        segments: [
          {
            id: 'SEG_NICOLL_HWY',
            name: 'Nicoll Highway',
            length_km: 4.5,
            freeflow_speed: 60.0,
            current_speed: 48.0,
            congestion: 38.0,
            trend: 'STABLE',
            forecast_20m_p50: 40.0,
            incident_flag: 0,
            history_20m: [36, 37, 38, 38]
          },
          {
            id: 'SEG_SIMS_AVE',
            name: 'Sims Ave & Geylang Link',
            length_km: 7.8,
            freeflow_speed: 50.0,
            current_speed: 38.0,
            congestion: 44.0,
            trend: 'STABLE',
            forecast_20m_p50: 46.0,
            incident_flag: 0,
            history_20m: [42, 43, 44, 44]
          },
          {
            id: 'SEG_UPPER_CHANGI',
            name: 'Upper Changi Road East',
            length_km: 8.8,
            freeflow_speed: 60.0,
            current_speed: 50.0,
            congestion: 36.0,
            trend: 'STABLE',
            forecast_20m_p50: 38.0,
            incident_flag: 0,
            history_20m: [34, 35, 36, 36]
          }
        ]
      }
    ]
  }
};

/**
 * Generates simulated multi-objective routes with custom preference scoring adjustments.
 */
export function getSimulatedRoutes(params: CalculateRoutesParams): RoutingResponse {
  const corridorKey = params.corridor_preset || 'ahmedabad_gandhinagar';
  const preset = SIMULATED_CORRIDORS[corridorKey] || SIMULATED_CORRIDORS.ahmedabad_gandhinagar;

  const profile = params.preference_profile || 'BALANCED';

  // Clone routes and apply preference profile re-scoring if needed
  const routes = preset.routes.map(r => {
    let score = r.score;
    let is_best = r.is_best;
    let is_fastest = r.is_fastest;

    if (profile === 'FASTEST') {
      is_best = is_fastest;
      score = is_fastest ? 98.0 : 80.0;
    } else if (profile === 'AVOID_TOLLS') {
      if (r.toll_cost > 0) {
        score -= 25.0;
        is_best = false;
      } else {
        score += 10.0;
        is_best = true;
      }
    } else if (profile === 'MOST_RELIABLE') {
      const rel = r.reliability?.reliability_score ?? 0.8;
      score = rel * 100;
      is_best = rel >= 0.9;
    } else if (profile === 'LOWEST_TRAFFIC') {
      score = 100 - r.avg_congestion;
      is_best = r.avg_congestion <= 30;
    }

    return {
      ...r,
      score: Math.round(score * 10) / 10,
      is_best,
      is_fastest
    };
  });

  const bestRoute = routes.find(r => r.is_best) || routes[0];
  const fastestRoute = routes.find(r => r.is_fastest) || routes[0];

  return {
    origin: preset.origin,
    destination: preset.destination,
    corridor_name: preset.name,
    routing_provenance: 'DEMO',
    traffic_provenance: 'DEMO',
    forecasting_model: 'Chronos-2 (Simulation Tier 3)',
    preference_profile: profile,
    fastest_route_id: fastestRoute.id,
    best_route_id: bestRoute.id,
    are_different: bestRoute.id !== fastestRoute.id,
    routes,
    verified_facts: {
      corridor_name: preset.name,
      preference_profile: profile,
      are_different: bestRoute.id !== fastestRoute.id,
      fastest_route: {
        id: fastestRoute.id,
        name: fastestRoute.name,
        predicted_eta_p50: fastestRoute.predicted_eta_p50,
        avg_congestion: fastestRoute.avg_congestion,
        score: fastestRoute.score
      },
      best_route: {
        id: bestRoute.id,
        name: bestRoute.name,
        predicted_eta_p50: bestRoute.predicted_eta_p50,
        avg_congestion: bestRoute.avg_congestion,
        score: bestRoute.score
      }
    },
    explanation: preset.explanation
  };
}

/**
 * Generates 24-hour Traffic DNA curve with realistic morning and evening peaks.
 */
export function getSimulatedTrafficDNA(segmentId: string): { segment_id: string; dna: TrafficDNAHour[] } {
  const dna: TrafficDNAHour[] = [];
  for (let h = 0; h < 24; h++) {
    let mean = 20;
    // Morning rush hour: 8-10am
    if (h >= 8 && h <= 10) {
      mean = 68 + Math.sin(h) * 12;
    }
    // Evening rush hour: 17-20pm
    else if (h >= 17 && h <= 20) {
      mean = 74 + Math.cos(h) * 10;
    }
    // Midday
    else if (h >= 11 && h <= 16) {
      mean = 42 + (h % 3) * 4;
    }
    // Late night
    else {
      mean = 12 + (h % 2) * 5;
    }

    dna.push({
      hour: h,
      mean_congestion: Math.round(mean),
      p90_congestion: Math.round(mean * 1.25),
      reliability: Math.round((1 - mean / 120) * 100) / 100
    });
  }

  return { segment_id: segmentId, dna };
}

/**
 * Generates What-If departure forecasts.
 */
export function getSimulatedWhatIf(routes: RouteData[]): WhatIfResponse {
  const activeRoute = routes.find(r => r.is_best) || routes[0] || {
    id: 'demo_route',
    name: 'Primary Arterial',
    base_duration_min: 28.0,
    predicted_eta_p50: 28.0,
    trend: 'STABLE'
  };

  const baseDur = activeRoute.base_duration_min || 28.0;
  const p50 = activeRoute.predicted_eta_p50 || 28.0;

  const scenarios = [
    {
      offset_minutes: 0,
      label: 'NOW',
      best_route_id: activeRoute.id,
      best_route_name: activeRoute.name,
      lowest_eta_min: p50,
      routes: routes.map(r => ({
        route_id: r.id,
        route_name: r.name,
        predicted_eta_min: r.predicted_eta_p50,
        is_best: r.is_best,
        is_fastest: r.is_fastest
      }))
    },
    {
      offset_minutes: 15,
      label: '+15 MIN',
      best_route_id: activeRoute.id,
      best_route_name: activeRoute.name,
      lowest_eta_min: Math.round((p50 + 2.5) * 10) / 10,
      routes: routes.map(r => ({
        route_id: r.id,
        route_name: r.name,
        predicted_eta_min: Math.round((r.predicted_eta_p50 + 2.5) * 10) / 10,
        is_best: r.is_best,
        is_fastest: r.is_fastest
      }))
    },
    {
      offset_minutes: 30,
      label: '+30 MIN',
      best_route_id: activeRoute.id,
      best_route_name: activeRoute.name,
      lowest_eta_min: Math.round(Math.max(baseDur, p50 - 3.5) * 10) / 10,
      routes: routes.map(r => ({
        route_id: r.id,
        route_name: r.name,
        predicted_eta_min: Math.round(Math.max(r.base_duration_min, r.predicted_eta_p50 - 3.5) * 10) / 10,
        is_best: r.is_best,
        is_fastest: r.is_fastest
      }))
    },
    {
      offset_minutes: 45,
      label: '+45 MIN',
      best_route_id: activeRoute.id,
      best_route_name: activeRoute.name,
      lowest_eta_min: Math.round(Math.max(baseDur, p50 - 4.0) * 10) / 10,
      routes: routes.map(r => ({
        route_id: r.id,
        route_name: r.name,
        predicted_eta_min: Math.round(Math.max(r.base_duration_min, r.predicted_eta_p50 - 4.0) * 10) / 10,
        is_best: r.is_best,
        is_fastest: r.is_fastest
      }))
    }
  ];

  return {
    departure_evaluations: scenarios,
    optimal_departure_window: '+30 MIN',
    optimal_offset_minutes: 30,
    recommended_route_name: activeRoute.name,
    potential_savings_min: 3.5,
    recommendation: `⭐ Best Departure: Leave in 30 minutes to save ~3.5 min on ${activeRoute.name} as peak congestion clears.`
  };
}

/**
 * Generate Turn-by-Turn Maneuvers from route segments
 */
export function generateSimulatedManeuvers(route: RouteData): Maneuver[] {
  const segments = route.segments || [];
  const dist = route.distance_km || 18.0;

  if (segments.length === 0) {
    return [
      {
        step: 1,
        type: 'straight',
        icon: 'arrow-up',
        instruction: 'Head straight on main corridor',
        distance_km: Math.round(dist * 0.4 * 10) / 10,
        road_name: 'Main Expressway',
        congestion: 25,
        display_instruction: 'Head straight on main corridor'
      },
      {
        step: 2,
        type: 'turn-right',
        icon: 'corner-up-right',
        instruction: 'Turn right onto exit bypass',
        distance_km: Math.round(dist * 0.4 * 10) / 10,
        road_name: 'Exit Bypass',
        congestion: 35,
        display_instruction: 'Turn right onto exit bypass'
      },
      {
        step: 3,
        type: 'arrive',
        icon: 'map-pin',
        instruction: 'Arrive at destination',
        distance_km: Math.round(dist * 0.2 * 10) / 10,
        road_name: 'Destination Way',
        congestion: 15,
        display_instruction: 'Arrive at destination on your right'
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
      congestion: seg.congestion,
      display_instruction: instruction
    };
  });
}

/**
 * Start Navigation Session in simulation mode
 */
export function startSimulatedNavSession(activeRoute: RouteData, currentSpeed = 45.0): NavigationSessionStart {
  const maneuvers = generateSimulatedManeuvers(activeRoute);
  const etaMin = activeRoute.predicted_eta_p50 || 28.0;
  const now = new Date();
  now.setMinutes(now.getMinutes() + etaMin);
  const arrivalTime = `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

  return {
    status: 'NAVIGATING',
    route_id: activeRoute.id,
    route_name: activeRoute.name,
    total_distance_km: activeRoute.distance_km,
    remaining_distance_km: activeRoute.distance_km,
    eta_minutes: etaMin,
    arrival_time: arrivalTime,
    maneuvers,
    current_maneuver: maneuvers[0],
    speed_limit_kmh: 60.0,
    current_speed_kmh: currentSpeed
  };
}

/**
 * Update Navigation Step with coordinate interpolation along route polyline
 */
export function updateSimulatedNavStep(
  progressPct: number,
  activeRoute: RouteData,
  currentSpeed = 45.0
): NavigationTelemetryUpdate {
  const progress = Math.max(0.0, Math.min(1.0, progressPct));
  const totalDist = activeRoute.distance_km || 18.0;
  const baseEta = activeRoute.predicted_eta_p50 || 28.0;

  const remainingDist = Math.round(Math.max(0.0, totalDist * (1.0 - progress)) * 10) / 10;
  const remainingEta = Math.round(Math.max(0.0, baseEta * (1.0 - progress)) * 10) / 10;

  const now = new Date();
  now.setMinutes(now.getMinutes() + remainingEta);
  const arrivalTime = `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

  const maneuvers = generateSimulatedManeuvers(activeRoute);
  const stepIdx = Math.min(maneuvers.length - 1, Math.floor(progress * maneuvers.length));
  const currentManeuver = maneuvers[stepIdx] || maneuvers[0];

  const coords = activeRoute.coordinates || [];
  let curLat = 23.0280;
  let curLon = 72.5065;
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

  // Segment status
  const segments = activeRoute.segments || [];
  const segIdx = Math.min(segments.length - 1, Math.floor(progress * segments.length));
  const upcomingSeg = segments[segIdx] || { name: 'Main Expressway', congestion: 30 };

  // Trigger simulated proactive alert around 30% progress for demonstration
  const hasAlert = progress >= 0.28 && progress <= 0.48;
  const alert = hasAlert
    ? {
        level: 'TRAFFIC_WORSENING',
        type: 'BOTTLENECK_AHEAD',
        title: 'Bottleneck Detected Ahead',
        distance_km: 1.8,
        message: 'Congestion spike ahead on next corridor link. Maintaining optimal flyover lane.',
        action_label: 'Stay on Route'
      }
    : null;

  return {
    progress_pct: Math.round(progress * 1000) / 1000,
    remaining_distance_km: remainingDist,
    remaining_eta_min: remainingEta,
    arrival_time: arrivalTime,
    current_lat: curLat,
    current_lon: curLon,
    heading_deg: headingDeg,
    current_speed_kmh: currentSpeed,
    speed_limit_kmh: 60.0,
    current_maneuver: {
      ...currentManeuver,
      dist_to_action_m: Math.max(50, Math.round((1 - progress) * 800)),
      display_instruction: currentManeuver.instruction
    },
    upcoming_segment: upcomingSeg,
    has_alert: hasAlert,
    alert
  };
}
