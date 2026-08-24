"""
Geographical presets and coordinate waypoints for major urban tech corridors and navigation corridors.
"""

GEO_PRESETS = {
    "ahmedabad_gandhinagar": {
        "name": "Ahmedabad to Gandhinagar Corridor",
        "city": "Ahmedabad - Gandhinagar",
        "origin": {"name": "Iscon Cross Road, SG Highway", "lat": 23.0280, "lon": 72.5065},
        "destination": {"name": "Infocity / GIFT City Link", "lat": 23.1970, "lon": 72.6350},
        "routes": [
            {
                "id": "route_ahmedabad_sg_highway",
                "name": "Via SG Highway & Gandhinagar Bypass",
                "summary": "Main urban tech artery with flyovers (⭐ Best Route)",
                "distance_km": 18.2,
                "base_duration_min": 28.0,
                "toll_cost": 0.0,
                "segments": [
                    {"id": "SEG_SG_HIGHWAY", "name": "SG Highway Arterial", "length_km": 6.8, "freeflow": 65.0},
                    {"id": "SEG_VAISHNODEVI_JCT", "name": "Vaishnodevi Circle Flyover", "length_km": 4.6, "freeflow": 60.0},
                    {"id": "SEG_GANDHINAGAR_ENT", "name": "Gandhinagar Entry / Infocity Link", "length_km": 6.8, "freeflow": 70.0}
                ],
                "coordinates": [
                    [23.0280, 72.5065],
                    [23.0650, 72.5250],
                    [23.1150, 72.5450],
                    [23.1550, 72.5800],
                    [23.1780, 72.6100],
                    [23.1970, 72.6350]
                ]
            },
            {
                "id": "route_ahmedabad_sp_ring",
                "name": "Via SP Ring Expressway (Outer Bypass)",
                "summary": "High-speed expressway bypass with toll (⚡ Fastest Route)",
                "distance_km": 22.5,
                "base_duration_min": 26.0,
                "toll_cost": 40.0,
                "segments": [
                    {"id": "SEG_BOPAL_LINK", "name": "Bopal Connector Ramp", "length_km": 3.5, "freeflow": 55.0},
                    {"id": "SEG_SP_RING_NORTH", "name": "Sardar Patel Ring Road North", "length_km": 13.8, "freeflow": 90.0},
                    {"id": "SEG_GIFT_CITY_RD", "name": "Koba Circle to Infocity", "length_km": 5.2, "freeflow": 75.0}
                ],
                "coordinates": [
                    [23.0280, 72.5065],
                    [23.0450, 72.4850],
                    [23.1000, 72.5050],
                    [23.1600, 72.5500],
                    [23.1850, 72.6000],
                    [23.1970, 72.6350]
                ]
            },
            {
                "id": "route_ahmedabad_riverfront",
                "name": "Via Sabarmati Riverfront Corridor",
                "summary": "Scenic riverfront arterial route through central city",
                "distance_km": 20.1,
                "base_duration_min": 33.0,
                "toll_cost": 0.0,
                "segments": [
                    {"id": "SEG_DRIVE_IN_RD", "name": "Drive-In Road & University Link", "length_km": 5.1, "freeflow": 45.0},
                    {"id": "SEG_RIVERFRONT_EXP", "name": "Sabarmati Riverfront West", "length_km": 9.2, "freeflow": 60.0},
                    {"id": "SEG_CHILODA_LINK", "name": "Gandhinagar South Corridor", "length_km": 5.8, "freeflow": 55.0}
                ],
                "coordinates": [
                    [23.0280, 72.5065],
                    [23.0400, 72.5350],
                    [23.0750, 72.5700],
                    [23.1300, 72.5950],
                    [23.1700, 72.6150],
                    [23.1970, 72.6350]
                ]
            }
        ]
    },
    "bangalore_tech_corridor": {
        "name": "Bengaluru: MG Road to Whitefield Tech Park",
        "city": "Bengaluru",
        "origin": {"name": "MG Road Metro Station", "lat": 12.9756, "lon": 77.6066},
        "destination": {"name": "ITPB Whitefield", "lat": 12.9863, "lon": 77.7340},
        "routes": [
            {
                "id": "route_a_old_airport",
                "name": "Via Old Airport Road & Marathahalli",
                "summary": "Direct arterial corridor through central tech hub",
                "distance_km": 18.4,
                "base_duration_min": 32.0,
                "toll_cost": 0.0,
                "segments": [
                    {"id": "SEG_MG_ROAD", "name": "MG Road Arterial", "length_km": 3.2, "freeflow": 55.0},
                    {"id": "SEG_OLD_AIRPORT_RD", "name": "Old Airport Road", "length_km": 7.8, "freeflow": 50.0},
                    {"id": "SEG_TECH_CORRIDOR", "name": "Marathahalli Flyover & Tech Link", "length_km": 7.4, "freeflow": 60.0}
                ],
                "coordinates": [
                    [12.9756, 77.6066],
                    [12.9715, 77.6200],
                    [12.9630, 77.6400],
                    [12.9570, 77.6650],
                    [12.9550, 77.7000],
                    [12.9700, 77.7200],
                    [12.9863, 77.7340]
                ]
            },
            {
                "id": "route_b_outer_ring",
                "name": "Via Outer Ring Expressway (North Bypass)",
                "summary": "Grade-separated expressway with higher capacity",
                "distance_km": 22.8,
                "base_duration_min": 28.0,
                "toll_cost": 45.0,
                "segments": [
                    {"id": "SEG_CENTRAL_BLVD", "name": "Central Boulevard", "length_km": 4.1, "freeflow": 50.0},
                    {"id": "SEG_ORR_NORTH", "name": "Outer Ring Expressway North", "length_km": 13.5, "freeflow": 80.0},
                    {"id": "SEG_TECH_CORRIDOR", "name": "ITPB Access Road", "length_km": 5.2, "freeflow": 60.0}
                ],
                "coordinates": [
                    [12.9756, 77.6066],
                    [12.9900, 77.6150],
                    [13.0100, 77.6400],
                    [13.0150, 77.6800],
                    [13.0050, 77.7100],
                    [12.9863, 77.7340]
                ]
            },
            {
                "id": "route_c_metro_viaduct",
                "name": "Via Metro Viaduct Corridor & Hoodi",
                "summary": "Alternate secondary artery under metro line",
                "distance_km": 19.9,
                "base_duration_min": 35.0,
                "toll_cost": 0.0,
                "segments": [
                    {"id": "SEG_METRO_VIADUCT", "name": "Metro Viaduct Avenue", "length_km": 8.5, "freeflow": 45.0},
                    {"id": "SEG_RIVERSIDE_PKWY", "name": "Hoodi Bypass Link", "length_km": 6.8, "freeflow": 70.0},
                    {"id": "SEG_TECH_CORRIDOR", "name": "Whitefield Main Gate", "length_km": 4.6, "freeflow": 60.0}
                ],
                "coordinates": [
                    [12.9756, 77.6066],
                    [12.9820, 77.6250],
                    [12.9950, 77.6550],
                    [12.9980, 77.6900],
                    [12.9920, 77.7150],
                    [12.9863, 77.7340]
                ]
            }
        ]
    },
    "delhi_cyber_corridor": {
        "name": "Delhi: Connaught Place to Cyber City Gurugram",
        "city": "Delhi NCR",
        "origin": {"name": "Connaught Place", "lat": 28.6315, "lon": 77.2167},
        "destination": {"name": "Cyber City Gurugram", "lat": 28.4950, "lon": 77.0890},
        "routes": [
            {
                "id": "route_delhi_nh48",
                "name": "Via NH-48 Express Highway",
                "summary": "Main interstate expressway corridor",
                "distance_km": 27.5,
                "base_duration_min": 34.0,
                "toll_cost": 65.0,
                "segments": [
                    {"id": "SEG_CENTRAL_BLVD", "name": "Dhaula Kuan Link", "length_km": 6.5, "freeflow": 50.0},
                    {"id": "SEG_AIRPORT_EXP", "name": "NH-48 Expressway", "length_km": 16.0, "freeflow": 90.0},
                    {"id": "SEG_TECH_CORRIDOR", "name": "Cyber City Entry Ramp", "length_km": 5.0, "freeflow": 60.0}
                ],
                "coordinates": [
                    [28.6315, 77.2167],
                    [28.5900, 77.1600],
                    [28.5500, 77.1200],
                    [28.5100, 77.0950],
                    [28.4950, 77.0890]
                ]
            },
            {
                "id": "route_delhi_mg_road",
                "name": "Via Mehrauli-Gurgaon Road Arterial",
                "summary": "Non-toll arterial corridor through South Delhi",
                "distance_km": 29.8,
                "base_duration_min": 42.0,
                "toll_cost": 0.0,
                "segments": [
                    {"id": "SEG_METRO_VIADUCT", "name": "Aurobindo Marg", "length_km": 10.0, "freeflow": 45.0},
                    {"id": "SEG_MG_ROAD", "name": "MG Road Gurugram", "length_km": 14.5, "freeflow": 55.0},
                    {"id": "SEG_TECH_CORRIDOR", "name": "Sikanderpur Link", "length_km": 5.3, "freeflow": 60.0}
                ],
                "coordinates": [
                    [28.6315, 77.2167],
                    [28.5700, 77.2000],
                    [28.5200, 77.1800],
                    [28.4800, 77.1100],
                    [28.4950, 77.0890]
                ]
            }
        ]
    },
    "sf_airport_corridor": {
        "name": "San Francisco: Financial District to SFO Airport",
        "city": "San Francisco",
        "origin": {"name": "Market St / Financial District", "lat": 37.7915, "lon": -122.4000},
        "destination": {"name": "San Francisco Int'l Airport (SFO)", "lat": 37.6213, "lon": -122.3790},
        "routes": [
            {
                "id": "route_sf_us101",
                "name": "Via US-101 South Freeway",
                "summary": "Direct freeway artery",
                "distance_km": 21.6,
                "base_duration_min": 19.0,
                "toll_cost": 0.0,
                "segments": [
                    {"id": "SEG_CENTRAL_BLVD", "name": "4th St Onramp", "length_km": 2.6, "freeflow": 50.0},
                    {"id": "SEG_AIRPORT_EXP", "name": "US-101 South Freeway", "length_km": 15.5, "freeflow": 90.0},
                    {"id": "SEG_TECH_CORRIDOR", "name": "Airport Terminals Loop", "length_km": 3.5, "freeflow": 60.0}
                ],
                "coordinates": [
                    [37.7915, -122.4000],
                    [37.7650, -122.4050],
                    [37.7100, -122.4000],
                    [37.6600, -122.3950],
                    [37.6213, -122.3790]
                ]
            },
            {
                "id": "route_sf_i280",
                "name": "Via I-280 South & Highway 380",
                "summary": "Scenic high-speed western freeway bypass",
                "distance_km": 25.4,
                "base_duration_min": 21.0,
                "toll_cost": 0.0,
                "segments": [
                    {"id": "SEG_RIVERSIDE_PKWY", "name": "King St to I-280", "length_km": 3.4, "freeflow": 70.0},
                    {"id": "SEG_ORR_NORTH", "name": "I-280 South Interstate", "length_km": 17.5, "freeflow": 80.0},
                    {"id": "SEG_TECH_CORRIDOR", "name": "CA-380 East to SFO", "length_km": 4.5, "freeflow": 60.0}
                ],
                "coordinates": [
                    [37.7915, -122.4000],
                    [37.7600, -122.3950],
                    [37.7200, -122.4400],
                    [37.6600, -122.4350],
                    [37.6300, -122.4100],
                    [37.6213, -122.3790]
                ]
            }
        ]
    },
    "singapore_changi_cbd": {
        "name": "Singapore: Marina Bay CBD to Changi Airport",
        "city": "Singapore",
        "origin": {"name": "Marina Bay Financial Centre", "lat": 1.2792, "lon": 103.8536},
        "destination": {"name": "Singapore Changi Airport (SIN)", "lat": 1.3562, "lon": 103.9870},
        "routes": [
            {
                "id": "route_sg_ecp",
                "name": "Via East Coast Parkway (ECP)",
                "summary": "Fast coastal expressway direct to Changi (⭐ Best Route)",
                "distance_km": 19.8,
                "base_duration_min": 21.0,
                "toll_cost": 2.5,
                "segments": [
                    {"id": "SEG_SHENTON_WAY", "name": "Marina Boulevard / ECP On-Ramp", "length_km": 2.2, "freeflow": 60.0},
                    {"id": "SEG_ECP_COASTAL", "name": "East Coast Parkway Arterial", "length_km": 14.2, "freeflow": 90.0},
                    {"id": "SEG_AIRPORT_BOULEVARD", "name": "Airport Boulevard / Terminal 3", "length_km": 3.4, "freeflow": 70.0}
                ],
                "coordinates": [
                    [1.2792, 103.8536],
                    [1.2950, 103.8750],
                    [1.3050, 103.9050],
                    [1.3250, 103.9450],
                    [1.3450, 103.9700],
                    [1.3562, 103.9870]
                ]
            },
            {
                "id": "route_sg_pie",
                "name": "Via Pan Island Expressway (PIE)",
                "summary": "Central expressway alternative (⚡ Fastest Route)",
                "distance_km": 22.4,
                "base_duration_min": 23.5,
                "toll_cost": 2.0,
                "segments": [
                    {"id": "SEG_KPE_TUNNEL", "name": "Kallang-Paya Lebar Tunnel", "length_km": 4.8, "freeflow": 80.0},
                    {"id": "SEG_PIE_EAST", "name": "Pan Island Expressway East", "length_km": 14.1, "freeflow": 90.0},
                    {"id": "SEG_CHANGI_FLYOVER", "name": "Changi South Flyover", "length_km": 3.5, "freeflow": 70.0}
                ],
                "coordinates": [
                    [1.2792, 103.8536],
                    [1.3100, 103.8500],
                    [1.3350, 103.8850],
                    [1.3500, 103.9350],
                    [1.3620, 103.9650],
                    [1.3562, 103.9870]
                ]
            },
            {
                "id": "route_sg_nicoll",
                "name": "Via Nicoll Highway & Sims Ave",
                "summary": "Scenic city boulevard avoiding expressway ERP tolls",
                "distance_km": 21.1,
                "base_duration_min": 27.0,
                "toll_cost": 0.0,
                "segments": [
                    {"id": "SEG_NICOLL_HWY", "name": "Nicoll Highway", "length_km": 4.5, "freeflow": 60.0},
                    {"id": "SEG_SIMS_AVE", "name": "Sims Ave & Geylang Link", "length_km": 7.8, "freeflow": 50.0},
                    {"id": "SEG_UPPER_CHANGI", "name": "Upper Changi Road East", "length_km": 8.8, "freeflow": 60.0}
                ],
                "coordinates": [
                    [1.2792, 103.8536],
                    [1.2980, 103.8620],
                    [1.3160, 103.8890],
                    [1.3400, 103.9350],
                    [1.3520, 103.9680],
                    [1.3562, 103.9870]
                ]
            }
        ]
    }
}
