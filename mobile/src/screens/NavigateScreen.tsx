import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
  TextInput
} from 'react-native';
import {
  Search,
  MapPin,
  Check,
  ChevronRight,
  Zap,
  Coffee,
  Car,
  Utensils,
  Home,
  Briefcase,
  Plane,
  Train,
  Layers,
  Sparkles
} from 'lucide-react-native';
import { useNavigationStore } from '../store/navigationStore';
import { CockpitMap } from '../components/Map/CockpitMap';
import { ManeuverHUD } from '../components/Map/ManeuverHUD';
import { BottomSheetContainer } from '../components/BottomSheet/BottomSheetContainer';
import { PredictiveAlertCard } from '../components/Alerts/PredictiveAlertCard';
import { LockScreenAlertModal } from '../components/Alerts/LockScreenAlertModal';
import { ErrorState } from '../components/Common/ErrorState';
import { CORRIDORS, getCorridor } from '../constants/corridors';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { useLayout } from '../theme/useLayout';

/** Drive simulation tick interval. */
const SIM_TICK_MS = 1200;

const QUICK_POIS = [
  { id: 'ev', label: 'EV Charging', icon: Zap, color: colors.poi.ev },
  { id: 'coffee', label: 'Coffee & Cafe', icon: Coffee, color: colors.poi.coffee },
  { id: 'parking', label: 'Parking Space', icon: Car, color: colors.poi.parking },
  { id: 'food', label: 'Dine & Food', icon: Utensils, color: colors.poi.food }
];

const SHORTCUT_DESTINATIONS = [
  { id: 'home', label: 'Home', sub: 'Navi Mumbai', corridorId: 'vashi-dadar', icon: Home },
  { id: 'work', label: 'Office / Tech Park', sub: 'BKC, Mumbai', corridorId: 'thane-bkc', icon: Briefcase },
  { id: 'airport', label: 'International Airport', sub: 'T2 Terminal', corridorId: 'andheri-nariman', icon: Plane },
  { id: 'station', label: 'Central Station', sub: 'CSMT Mumbai', corridorId: 'andheri-nariman', icon: Train }
];

export const NavigateScreen: React.FC = () => {
  const isNavigating = useNavigationStore(s => s.isNavigating);
  const isSimulatingDrive = useNavigationStore(s => s.isSimulatingDrive);
  const stepSimulation = useNavigationStore(s => s.stepSimulation);
  const selectedCorridor = useNavigationStore(s => s.selectedCorridor);
  const setSelectedCorridor = useNavigationStore(s => s.setSelectedCorridor);
  const routingData = useNavigationStore(s => s.routingData);
  const isLoadingRoutes = useNavigationStore(s => s.isLoadingRoutes);
  const routesError = useNavigationStore(s => s.routesError);
  const fetchRoutes = useNavigationStore(s => s.fetchRoutes);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusMapMode, setFocusMapMode] = useState(false);
  const { dialogMaxWidth } = useLayout();

  /** Active Drive Simulation Ticker Loop. */
  useEffect(() => {
    if (!isNavigating || !isSimulatingDrive) return;
    const interval = setInterval(() => {
      stepSimulation();
    }, SIM_TICK_MS);
    return () => clearInterval(interval);
  }, [isNavigating, isSimulatingDrive, stepSimulation]);

  const handleSelectCorridor = useCallback(
    (id: string) => {
      setSelectedCorridor(id);
      setPickerOpen(false);
      setSearchQuery('');
    },
    [setSelectedCorridor]
  );

  const togglePoi = useCallback((id: string) => {
    setSelectedPoi(prev => (prev === id ? null : id));
  }, []);

  const currentCorridor = getCorridor(selectedCorridor);
  const destinationLabel = routingData?.corridor_name || currentCorridor.name;

  const filteredCorridors = CORRIDORS.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q) || c.tag.toLowerCase().includes(q);
  });

  return (
    <View style={styles.container}>
      {/*
        Top Floating Overlay Stack:
        Contains Destination Search, Shortcut POIs, Maneuver HUD, and Predictive Alerts.
      */}
      <View style={styles.overlayStack} pointerEvents="box-none">
        {!isNavigating && (
          <>
            {focusMapMode ? (
              /* Compact Collapsed Top Bar in Focus Map Mode */
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setFocusMapMode(false)}
                style={styles.compactFocusBar}
                accessibilityRole="button"
                accessibilityLabel="Exit full map focus mode and show destination controls"
              >
                <View style={styles.focusBarDot} />
                <Text style={styles.focusBarText} numberOfLines={1}>
                  {destinationLabel}
                </Text>
                <View style={styles.focusRestorePill}>
                  <Text style={styles.focusRestoreText}>Show Controls</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <>
                {/* Interactive Destination Search Box */}
                <View style={styles.searchRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setPickerOpen(true)}
                    style={styles.searchBox}
                    accessibilityRole="button"
                    accessibilityLabel={`Destination: ${destinationLabel}. Tap to change destination.`}
                  >
                    <View style={styles.searchIconRing}>
                      <Search size={15} color={colors.primaryBright} strokeWidth={2.5} />
                    </View>
                    <View style={styles.searchTextCol}>
                      <Text style={styles.searchLabel}>DESTINATION CORRIDOR</Text>
                      <Text style={styles.searchVal} numberOfLines={1}>
                        {destinationLabel}
                      </Text>
                    </View>
                    <View style={styles.searchActionPill}>
                      <Text style={styles.searchActionText}>Change</Text>
                      <ChevronRight size={13} color={colors.primary} />
                    </View>
                  </TouchableOpacity>

                  {/* Focus / Expand Map Viewport Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setFocusMapMode(true)}
                    style={styles.focusMapToggle}
                    accessibilityRole="button"
                    accessibilityLabel="Focus map and hide search controls"
                  >
                    <Sparkles size={14} color={colors.primaryBright} />
                    <Text style={styles.focusMapToggleText}>Map</Text>
                  </TouchableOpacity>
                </View>

                {/* Quick Destination Shortcuts (Home, Work, Airport) */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipsScroll}
                >
                  {SHORTCUT_DESTINATIONS.map(item => {
                    const isSelected = selectedCorridor === item.corridorId;
                    const IconComponent = item.icon;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.75}
                        onPress={() => setSelectedCorridor(item.corridorId)}
                        style={[styles.shortcutChip, isSelected && styles.shortcutChipSelected]}
                        accessibilityRole="button"
                        accessibilityLabel={`Navigate to ${item.label}`}
                      >
                        <IconComponent size={12} color={isSelected ? colors.primary : colors.text.secondary} />
                        <Text style={[styles.shortcutText, isSelected && styles.shortcutTextSelected]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Quick POI Amenities on Route */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.poiScroll}
                >
                  {QUICK_POIS.map(poi => {
                    const active = selectedPoi === poi.id;
                    const Icon = poi.icon;
                    return (
                      <TouchableOpacity
                        key={poi.id}
                        activeOpacity={0.75}
                        onPress={() => togglePoi(poi.id)}
                        style={[styles.poiChip, active && { borderColor: poi.color, backgroundColor: colors.surface }]}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: active }}
                      >
                        <Icon size={12} color={active ? poi.color : colors.text.muted} />
                        <Text style={[styles.poiText, active && { color: colors.text.bright, fontWeight: '700' }]}>
                          {poi.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {routesError && (
                  <ErrorState
                    title="Could not load routes"
                    message={routesError}
                    onRetry={() => fetchRoutes(selectedCorridor)}
                    retryLabel="Retry"
                  />
                )}
              </>
            )}
          </>
        )}

        {/* In-Drive Live Guidance HUD */}
        {isNavigating && <ManeuverHUD />}

        {/* Proactive Real-Time Road Alert */}
        <PredictiveAlertCard />
      </View>

      {/* Lockscreen Notification Simulator Modal */}
      <LockScreenAlertModal />

      {/* Interactive Map Canvas */}
      <View style={styles.mapWrapper}>
        <CockpitMap />
      </View>

      {/* Bottom Sheet Route Selector & Controls */}
      <BottomSheetContainer />

      {/* Destination & Corridor Picker Modal */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setPickerOpen(false);
          setSearchQuery('');
        }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setPickerOpen(false);
            setSearchQuery('');
          }}
          accessibilityRole="button"
          accessibilityLabel="Close destination picker"
        >
          <Pressable
            style={[styles.modalContent, { maxWidth: dialogMaxWidth }]}
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalHeader}>CHOOSE DESTINATION CORRIDOR</Text>
                <Text style={styles.modalSubHeader}>Live traffic optimization ready</Text>
              </View>
              <View style={styles.aiBadge}>
                <Sparkles size={12} color={colors.primary} />
                <Text style={styles.aiBadgeText}>Smart Nav</Text>
              </View>
            </View>

            {/* Search Filter Box */}
            <View style={styles.filterBox}>
              <Search size={15} color={colors.text.muted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Type highway, city or route name..."
                placeholderTextColor={colors.text.dimmed}
                style={styles.filterInput}
                autoFocus
              />
            </View>

            <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
              {filteredCorridors.map(corridor => {
                const isSelected = corridor.id === selectedCorridor;
                return (
                  <TouchableOpacity
                    key={corridor.id}
                    activeOpacity={0.75}
                    onPress={() => handleSelectCorridor(corridor.id)}
                    style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                  >
                    <View style={styles.pickerIconWrapper}>
                      <MapPin size={16} color={isSelected ? colors.primary : colors.text.secondary} />
                    </View>
                    <View style={styles.pickerTextCol}>
                      <View style={styles.pickerTitleRow}>
                        <Text style={[styles.pickerTitle, isSelected && styles.pickerTitleSelected]}>
                          {corridor.name}
                        </Text>
                        <View style={styles.pickerTag}>
                          <Text style={styles.pickerTagText}>{corridor.tag}</Text>
                        </View>
                      </View>
                      <Text style={styles.pickerCity}>{corridor.city} • High-capacity route</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.pickerCheck}>
                        <Check size={14} color={colors.text.onAccent} strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative'
  },
  overlayStack: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    zIndex: 35,
    gap: spacing.sm
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 21, 26, 0.95)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 20,
    paddingHorizontal: 12,
    minHeight: 46,
    gap: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12
  },
  focusMapToggle: {
    height: 46,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(17, 21, 26, 0.95)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8
  },
  focusMapToggleText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.primaryBright
  },
  compactFocusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 21, 26, 0.95)',
    borderWidth: 1.2,
    borderColor: 'rgba(200, 205, 212, 0.4)',
    borderRadius: spacing.radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  focusBarDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primaryBright
  },
  focusBarText: {
    flex: 1,
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.text.bright
  },
  focusRestorePill: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: spacing.radius.pill
  },
  focusRestoreText: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold,
    color: colors.primaryBright
  },
  searchIconRing: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(200, 205, 212, 0.16)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchTextCol: {
    flex: 1
  },
  searchLabel: {
    fontSize: 8.5,
    lineHeight: 10,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted,
    letterSpacing: 0.5
  },
  searchVal: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: typography.weights.bold,
    color: colors.text.bright
  },
  searchActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(200, 205, 212, 0.14)',
    borderRadius: spacing.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 2
  },
  searchActionText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primaryBright
  },
  chipsScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2
  },
  shortcutChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(22, 27, 34, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 30,
    justifyContent: 'center'
  },
  shortcutChipSelected: {
    backgroundColor: 'rgba(200, 205, 212, 0.16)',
    borderColor: 'rgba(200, 205, 212, 0.4)'
  },
  shortcutText: {
    fontSize: 10.5,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary
  },
  shortcutTextSelected: {
    color: colors.primaryBright,
    fontWeight: typography.weights.bold
  },
  poiScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2
  },
  poiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(22, 27, 34, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 9,
    height: 26,
    justifyContent: 'center'
  },
  poiText: {
    fontSize: 9.5,
    fontWeight: typography.weights.medium,
    color: colors.text.muted
  },
  mapWrapper: {
    flex: 1,
    width: '100%'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.scrim,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.xxl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.cardPaddingLg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  modalHeader: {
    fontSize: typography.sizes.label,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright,
    letterSpacing: 0.5
  },
  modalSubHeader: {
    fontSize: typography.sizes.caption,
    color: colors.text.secondary,
    marginTop: 2
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: spacing.radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    gap: 3
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary
  },
  filterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.lg,
    paddingHorizontal: spacing.md,
    height: 40,
    marginBottom: spacing.md,
    gap: spacing.sm
  },
  filterInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.sizes.body
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    minHeight: spacing.touchTargetComfortable,
    borderRadius: spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
    gap: spacing.md
  },
  pickerItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaint
  },
  pickerIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  pickerTextCol: {
    flex: 1
  },
  pickerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm
  },
  pickerTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    flex: 1
  },
  pickerTag: {
    backgroundColor: colors.neutral,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1
  },
  pickerTagText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary
  },
  pickerTitleSelected: {
    color: colors.primary
  },
  pickerCity: {
    fontSize: typography.sizes.caption,
    color: colors.text.muted,
    marginTop: 2
  },
  pickerCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
