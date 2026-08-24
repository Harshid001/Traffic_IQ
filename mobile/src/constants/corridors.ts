/**
 * Single source of truth for the selectable corridors.
 *
 * `Header.tsx` and `NavigateScreen.tsx` previously each held their own list and
 * the labels had drifted apart ("MG Road → Whitefield" vs "Bengaluru Tech Park"),
 * so the same corridor was named two different things in one session.
 */
export interface Corridor {
  id: string;
  /** Full origin → destination label. Used in the header pill and picker. */
  name: string;
  /** Region subtitle shown under the name in the picker. */
  city: string;
  /** Abbreviated label for the horizontally scrolling quick chips. */
  shortLabel: string;
  /** True for simulated benchmark corridors. */
  isDemoCorridor: boolean;
  /** Category badge text. */
  tag: string;
}

export const CORRIDORS: Corridor[] = [
  {
    id: 'ahmedabad_gandhinagar',
    name: 'Ahmedabad → Gandhinagar',
    city: 'Gujarat Tech Hub',
    shortLabel: 'Ahmedabad → Gandhinagar',
    isDemoCorridor: true,
    tag: 'Demo Corridor'
  },
  {
    id: 'bangalore_tech_corridor',
    name: 'MG Road → Whitefield',
    city: 'Bengaluru Tech Corridor',
    shortLabel: 'MG Road → Whitefield',
    isDemoCorridor: true,
    tag: 'Demo Corridor'
  },
  {
    id: 'delhi_cyber_corridor',
    name: 'Connaught Pl → Cyber City',
    city: 'Delhi NCR Corridor',
    shortLabel: 'Connaught Pl → Cyber City',
    isDemoCorridor: true,
    tag: 'Demo Corridor'
  },
  {
    id: 'sf_airport_corridor',
    name: 'Financial Dist → SFO Airport',
    city: 'San Francisco',
    shortLabel: 'Financial Dist → SFO',
    isDemoCorridor: true,
    tag: 'Demo Corridor'
  }
];

export const DEFAULT_CORRIDOR_ID = CORRIDORS[0].id;

export function getCorridor(id: string | null | undefined): Corridor {
  return CORRIDORS.find(c => c.id === id) || CORRIDORS[0];
}

