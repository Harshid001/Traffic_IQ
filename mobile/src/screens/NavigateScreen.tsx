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
  Sparkles,
  X
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

/** Drive simulation tick interval - 500ms for fluid responsiveness. */
const SIM_TICK_MS = 500;

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
  const [searchQuery, setSearchQuery] = useState('');
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

  const currentCorridor = getCorridor(selectedCorridor);
  const destinationLabel = routingData?.corridor_name || currentCorridor.name;

  const filteredCorridors = CORRIDORS.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q) || c.tag.toLowerCase().includes(q);
  });

  return (
    <View style={styles.container}>
      {/* Top Floating Overlay Stack */}
      <View style={styles.overlayStack} pointerEvents="box-none">
        {!isNavigating && (
          <>
            {/* Interactive Destination Card */}
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
            </View>

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
              <View style={styles.modalHeaderLeft}>
                <Text style={styles.modalHeader}>Select Corridor</Text>
                <Text style={styles.modalSubHeader}>Live multi-route navigation</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setPickerOpen(false);
                  setSearchQuery('');
                }}
                style={styles.modalCloseButton}
                hitSlop={spacing.hitSlop}
                accessibilityRole="button"
                accessibilityLabel="Close corridor picker"
              >
                <X size={17} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Search Filter Box */}
            <View style={styles.filterBox}>
              <Search size={15} color={colors.text.muted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Type highway, city or corridor..."
                placeholderTextColor={colors.text.dimmed}
                style={styles.filterInput}
                autoFocus
              />
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
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
                      <Text style={[styles.pickerTitle, isSelected && styles.pickerTitleSelected]}>
                        {corridor.name}
                      </Text>
                      <Text style={styles.pickerCity}>{corridor.city}</Text>
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
    marginBottom: spacing.md,
    gap: spacing.md
  },
  modalHeaderLeft: {
    flex: 1,
    minWidth: 0
  },
  modalHeader: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  modalSubHeader: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  filterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.lg,
    paddingHorizontal: spacing.md,
    height: 42,
    marginBottom: spacing.md,
    gap: spacing.sm
  },
  filterInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 13
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    minHeight: 56,
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
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  pickerTextCol: {
    flex: 1,
    minWidth: 0
  },
  pickerTitle: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
    color: colors.text.primary
  },
  pickerTitleSelected: {
    color: colors.primaryBright,
    fontWeight: typography.weights.extrabold
  },
  pickerCity: {
    fontSize: 11,
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
