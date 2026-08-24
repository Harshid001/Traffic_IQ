import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable
} from 'react-native';
import { Search, MapPin, Check, ChevronRight } from 'lucide-react-native';
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
  const { dialogMaxWidth } = useLayout();

  // The cold-start fetch lives in App.tsx; this screen no longer duplicates it.

  /** Active Drive Simulation Ticker Loop. */
  useEffect(() => {
    if (!isNavigating || !isSimulatingDrive) return;
    const interval = setInterval(() => {
      // `stepSimulation` internally drops overlapping ticks.
      stepSimulation();
    }, SIM_TICK_MS);
    return () => clearInterval(interval);
  }, [isNavigating, isSimulatingDrive, stepSimulation]);

  const handleSelectCorridor = useCallback(
    (id: string) => {
      setSelectedCorridor(id);
      setPickerOpen(false);
    },
    [setSelectedCorridor]
  );

  const currentCorridor = getCorridor(selectedCorridor);
  const destinationLabel = routingData?.corridor_name || currentCorridor.name;

  return (
    <View style={styles.container}>
      {/*
        Single top overlay stack. Everything that floats over the map lives here
        in document order, so the HUD and the alert card stack vertically
        instead of overlapping at fixed offsets.
      */}
      <View style={styles.overlayStack} pointerEvents="box-none">
        {!isNavigating && (
          <>
            {/* Destination selector. This is a real control now — the previous
                version looked like a search field but had no press handler. */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setPickerOpen(true)}
              style={styles.searchBox}
              accessibilityRole="button"
              accessibilityLabel={`Destination: ${destinationLabel}. Tap to choose a corridor.`}
            >
              <Search size={16} color={colors.primary} />
              <View style={styles.searchTextCol}>
                <Text style={styles.searchLabel}>WHERE ARE YOU GOING?</Text>
                <Text style={styles.searchVal} numberOfLines={1}>
                  {destinationLabel}
                </Text>
              </View>
              <ChevronRight size={16} color={colors.text.secondary} />
            </TouchableOpacity>

            {/* Quick Corridor Chips. The old fully-transparent "fade" overlay
                is gone — it communicated nothing and blocked 32px of the row. */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}
            >
              {CORRIDORS.map((corridor) => {
                const isSelected = corridor.id === selectedCorridor;
                const isBusy = isLoadingRoutes && isSelected;
                return (
                  <TouchableOpacity
                    key={corridor.id}
                    activeOpacity={0.7}
                    onPress={() => setSelectedCorridor(corridor.id)}
                    disabled={isLoadingRoutes}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected, busy: isBusy }}
                    accessibilityLabel={corridor.shortLabel}
                  >
                    {isBusy ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <MapPin
                        size={12}
                        color={isSelected ? colors.primary : colors.text.secondary}
                      />
                    )}
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {corridor.shortLabel}
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

        {/* Driving Guidance HUD */}
        {isNavigating && <ManeuverHUD />}

        {/* Proactive Road Alert, stacked below the HUD rather than over it. */}
        <PredictiveAlertCard />
      </View>

      {/* Lockscreen Notification Simulator Modal */}
      <LockScreenAlertModal />

      {/* Dominant Map Canvas */}
      <View style={styles.mapWrapper}>
        <CockpitMap />
      </View>

      {/* Bottom Sheet Drawer */}
      <BottomSheetContainer />

      {/* Corridor picker */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setPickerOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="Close destination picker"
        >
          <Pressable style={[styles.modalContent, { maxWidth: dialogMaxWidth }]} onPress={() => {}}>
            <Text style={styles.modalHeader}>WHERE ARE YOU GOING?</Text>
            {CORRIDORS.map((corridor) => {
              const isSelected = corridor.id === selectedCorridor;
              return (
                <TouchableOpacity
                  key={corridor.id}
                  activeOpacity={0.7}
                  onPress={() => handleSelectCorridor(corridor.id)}
                  style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={`${corridor.name}, ${corridor.city}`}
                >
                  <View style={styles.pickerTextCol}>
                    <Text style={[styles.pickerTitle, isSelected && styles.pickerTitleSelected]}>
                      {corridor.name}
                    </Text>
                    <Text style={styles.pickerCity}>{corridor.city}</Text>
                  </View>
                  {isSelected && <Check size={16} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
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
    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 35,
    gap: spacing.md
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlaySurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.lg,
    paddingHorizontal: spacing.lg,
    minHeight: spacing.touchTargetComfortable,
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8
  },
  searchTextCol: {
    flex: 1
  },
  searchLabel: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted,
    letterSpacing: typography.tracking.normal
  },
  searchVal: {
    fontSize: typography.sizes.label,
    lineHeight: typography.line.label,
    fontWeight: typography.weights.bold,
    color: colors.text.primary
  },
  chipsScroll: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: 2
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.overlaySurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.pill,
    paddingHorizontal: spacing.lg,
    minHeight: 38,
    justifyContent: 'center'
  },
  chipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder
  },
  chipText: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: typography.weights.bold
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
    borderRadius: spacing.radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.cardPadding
  },
  modalHeader: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted,
    letterSpacing: typography.tracking.wide,
    marginBottom: spacing.lg
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    minHeight: spacing.touchTargetMin,
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    backgroundColor: colors.card
  },
  pickerItemSelected: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryFaint
  },
  pickerTextCol: {
    flex: 1,
    paddingRight: spacing.md
  },
  pickerTitle: {
    fontSize: typography.sizes.label,
    lineHeight: typography.line.label,
    fontWeight: typography.weights.bold,
    color: colors.text.primary
  },
  pickerTitleSelected: {
    color: colors.primary
  },
  pickerCity: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.secondary,
    marginTop: 2
  }
});
