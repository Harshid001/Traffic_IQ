import { create } from 'zustand';
import {
  TrafficDNAHour,
  WhatIfResponse,
  fetchTrafficDNA,
  fetchWhatIfDeparture
} from '../services/trafficService';
import { RouteData } from '../services/routingService';
import { toUserMessage } from '../services/api';

interface TrafficState {
  selectedSegmentId: string | null;
  dnaData: Record<string, TrafficDNAHour[]>;
  isLoadingDNA: boolean;
  /** Non-null when the Traffic DNA fetch failed. */
  dnaError: string | null;

  whatIfData: WhatIfResponse | null;
  isLoadingWhatIf: boolean;
  /** Non-null when the What-If simulation failed. */
  whatIfError: string | null;

  setSelectedSegmentId: (segmentId: string) => void;
  loadTrafficDNA: (segmentId: string) => Promise<void>;
  loadWhatIfSimulation: (routes: RouteData[]) => Promise<void>;
  reset: () => void;
}

export const useTrafficStore = create<TrafficState>((set, get) => ({
  selectedSegmentId: null,
  dnaData: {},
  isLoadingDNA: false,
  dnaError: null,
  whatIfData: null,
  isLoadingWhatIf: false,
  whatIfError: null,

  setSelectedSegmentId: (selectedSegmentId) => {
    set({ selectedSegmentId });
    if (selectedSegmentId && !get().dnaData[selectedSegmentId]) {
      get().loadTrafficDNA(selectedSegmentId);
    }
  },

  loadTrafficDNA: async (segmentId) => {
    if (!segmentId) return;
    set({ isLoadingDNA: true, dnaError: null });
    try {
      const res = await fetchTrafficDNA(segmentId);
      set((state) => ({
        dnaData: { ...state.dnaData, [segmentId]: res.dna },
        isLoadingDNA: false,
        dnaError: null
      }));
    } catch (err) {
      set({ isLoadingDNA: false, dnaError: toUserMessage(err) });
    }
  },

  loadWhatIfSimulation: async (routes) => {
    if (!routes || !routes.length) return;
    set({ isLoadingWhatIf: true, whatIfError: null });
    try {
      const res = await fetchWhatIfDeparture(routes);
      set({ whatIfData: res, isLoadingWhatIf: false, whatIfError: null });
    } catch (err) {
      set({ isLoadingWhatIf: false, whatIfError: toUserMessage(err), whatIfData: null });
    }
  },

  reset: () =>
    set({
      selectedSegmentId: null,
      dnaData: {},
      isLoadingDNA: false,
      dnaError: null,
      whatIfData: null,
      isLoadingWhatIf: false,
      whatIfError: null
    })
}));
