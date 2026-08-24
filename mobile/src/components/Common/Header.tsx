import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable, TextInput } from 'react-native';
import { Navigation, MapPin, ChevronDown, Check, Bell, Sparkles, Search, Compass, Radio } from 'lucide-react-native';
import { useNavigationStore } from '../../store/navigationStore';
import { useSettingsStore } from '../../store/settingsStore';
import { CORRIDORS, getCorridor } from '../../constants/corridors';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useLayout } from '../../theme/useLayout';

const HeaderBase: React.FC = () => {
  const selectedCorridor = useNavigationStore(s => s.selectedCorridor);
  const setSelectedCorridor = useNavigationStore(s => s.setSelectedCorridor);
  const setShowLockScreenModal = useNavigationStore(s => s.setShowLockScreenModal);
  const activeAlert = useNavigationStore(s => s.activeAlert);
  const trafficMode = useSettingsStore(s => s.trafficMode);

  const [modalVisible, setModalVisible] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const { dialogMaxWidth, isNarrow } = useLayout();

  const currentCorridor = getCorridor(selectedCorridor);
  const isLive = trafficMode === 'REAL' && useNavigationStore.getState().routingData?.traffic_provenance === 'TOMTOM';

  const filteredCorridors = useMemo(() => {
    if (!searchFilter.trim()) return CORRIDORS;
    const q = searchFilter.toLowerCase();
    return CORRIDORS.filter(
      c => c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q) || c.tag.toLowerCase().includes(q)
    );
  }, [searchFilter]);

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedCorridor(id);
      setModalVisible(false);
      setSearchFilter('');
    },
    [setSelectedCorridor]
  );

  return (
    <View style={styles.header}>
      {/* Brand & Live Status Indicator */}
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Navigation
            size={16}
            color={colors.text.onAccent}
            strokeWidth={2.6}
            style={{ transform: [{ rotate: '45deg' }] }}
          />
        </View>
        <View style={styles.brandTextCol}>
          <View style={styles.titleRow}>
            <Text style={styles.brandTitle}>
              Traffic<Text style={styles.brandHighlight}>IQ</Text>
            </Text>
            {/* Live / Smart Status Pill */}
            {isLive ? (
              <View style={styles.livePill} accessibilityLabel="Live TomTom traffic stream active">
                <View style={styles.livePulseDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            ) : (
              <View style={styles.smartPill} accessibilityLabel="Smart Copilot navigation active">
                <Sparkles size={10} color={colors.primary} />
                <Text style={styles.smartText}>COPILOT</Text>
              </View>
            )}
          </View>
          <Text style={styles.brandSub}>Smart Driver Navigation</Text>
        </View>
      </View>

      {/* Interactive Destination / Corridor Selector */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => setModalVisible(true)}
        style={styles.corridorButton}
        hitSlop={spacing.hitSlop}
        accessibilityRole="button"
        accessibilityLabel={`Navigation corridor: ${currentCorridor.name}. Tap to change destination.`}
        accessibilityHint="Opens destination corridor picker"
      >
        <View style={styles.corridorIconWrapper}>
          <MapPin size={13} color={colors.primary} />
        </View>
        <View style={styles.corridorTextCol}>
          <Text style={styles.corridorEyebrow}>DESTINATION</Text>
          <Text style={styles.corridorButtonText} numberOfLines={1}>
            {isNarrow ? currentCorridor.shortLabel : currentCorridor.name}
          </Text>
        </View>
        <ChevronDown size={14} color={colors.text.secondary} />
      </TouchableOpacity>

      {/* Safety Alert Notification Center Button */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => setShowLockScreenModal(true)}
        style={[styles.bellButton, activeAlert ? styles.bellButtonActive : null]}
        hitSlop={spacing.hitSlop}
        accessibilityRole="button"
        accessibilityLabel={
          activeAlert ? 'Safety alert active. Tap to view lockscreen preview.' : 'Safety alerts center'
        }
      >
        <Bell size={17} color={activeAlert ? colors.warningBright : colors.text.primary} />
        {activeAlert && <View style={styles.alertDot} />}
      </TouchableOpacity>

      {/* Destination & Corridor Picker Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalVisible(false);
          setSearchFilter('');
        }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setModalVisible(false);
            setSearchFilter('');
          }}
          accessibilityRole="button"
          accessibilityLabel="Close destination picker"
        >
          <Pressable
            accessible={false}
            style={[styles.modalContent, { maxWidth: dialogMaxWidth }]}
            onPress={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalHeader}>WHERE ARE YOU HEADED?</Text>
                <Text style={styles.modalSubHeader}>Choose a route corridor to navigate</Text>
              </View>
              <View style={styles.modalHeaderIcon}>
                <Compass size={18} color={colors.primary} />
              </View>
            </View>

            {/* Quick Search Bar */}
            <View style={styles.modalSearchBox}>
              <Search size={15} color={colors.text.muted} />
              <TextInput
                value={searchFilter}
                onChangeText={setSearchFilter}
                placeholder="Search city, expressway, or route..."
                placeholderTextColor={colors.text.dimmed}
                style={styles.modalSearchInput}
                autoCorrect={false}
              />
            </View>

            {/* Corridors List */}
            <View style={styles.modalList}>
              {filteredCorridors.map(corridor => {
                const isSelected = corridor.id === selectedCorridor;
                return (
                  <TouchableOpacity
                    key={corridor.id}
                    activeOpacity={0.7}
                    onPress={() => handleSelect(corridor.id)}
                    style={[styles.corridorItem, isSelected && styles.corridorItemSelected]}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={`${corridor.name}, ${corridor.city}, ${corridor.tag}`}
                  >
                    <View style={styles.corridorItemIconCol}>
                      <View style={[styles.corridorItemIcon, isSelected && styles.corridorItemIconSelected]}>
                        <MapPin size={15} color={isSelected ? colors.primary : colors.text.secondary} />
                      </View>
                    </View>
                    <View style={styles.corridorItemText}>
                      <View style={styles.corridorItemTop}>
                        <Text style={[styles.corridorItemTitle, isSelected && styles.corridorItemTitleSelected]}>
                          {corridor.name}
                        </Text>
                        <View style={[styles.corridorTag, isSelected && styles.corridorTagSelected]}>
                          <Text style={[styles.corridorTagText, isSelected && styles.corridorTagTextSelected]}>
                            {corridor.tag}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.corridorItemCity}>{corridor.city} • High-Traffic Corridor</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.checkCircle}>
                        <Check size={14} color={colors.text.onAccent} strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export const Header = React.memo(HeaderBase);

const styles = StyleSheet.create({
  header: {
    height: 64,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.cardPadding,
    zIndex: 40,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: spacing.radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6
  },
  brandTextCol: {
    justifyContent: 'center'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  brandTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright,
    letterSpacing: typography.tracking.tight
  },
  brandHighlight: {
    color: colors.primary
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: spacing.radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
    gap: 4
  },
  livePulseDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary
  },
  liveText: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold,
    color: colors.primaryBright,
    letterSpacing: 0.5
  },
  smartPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryFaint,
    borderWidth: 1,
    borderColor: colors.primaryBorderSoft,
    borderRadius: spacing.radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
    gap: 3
  },
  smartText: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold,
    color: colors.primary
  },
  brandSub: {
    fontSize: 10,
    lineHeight: 12,
    color: colors.text.muted,
    fontWeight: typography.weights.medium
  },
  corridorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: spacing.radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    minHeight: 40,
    flexShrink: 1,
    flex: 1,
    marginHorizontal: spacing.md,
    gap: spacing.sm
  },
  corridorIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  corridorTextCol: {
    flex: 1,
    justifyContent: 'center'
  },
  corridorEyebrow: {
    fontSize: 9,
    lineHeight: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    letterSpacing: 0.5
  },
  corridorButtonText: {
    fontSize: typography.sizes.caption,
    lineHeight: 15,
    color: colors.text.bright,
    fontWeight: typography.weights.semibold
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: spacing.radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  bellButtonActive: {
    borderColor: colors.warningBorder,
    backgroundColor: colors.warningSoft
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    position: 'absolute',
    top: 7,
    right: 7,
    borderWidth: 1.5,
    borderColor: colors.surface
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
    marginBottom: spacing.lg
  },
  modalHeader: {
    fontSize: typography.sizes.label,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright,
    letterSpacing: typography.tracking.normal
  },
  modalSubHeader: {
    fontSize: typography.sizes.caption,
    color: colors.text.secondary,
    marginTop: 2
  },
  modalHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.lg,
    paddingHorizontal: spacing.md,
    height: 42,
    marginBottom: spacing.lg,
    gap: spacing.sm
  },
  modalSearchInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.sizes.body
  },
  modalList: {
    gap: spacing.sm
  },
  corridorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    minHeight: spacing.touchTargetComfortable,
    borderRadius: spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: spacing.md
  },
  corridorItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaint
  },
  corridorItemIconCol: {
    justifyContent: 'center'
  },
  corridorItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  corridorItemIconSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder
  },
  corridorItemText: {
    flex: 1
  },
  corridorItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm
  },
  corridorItemTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    flex: 1
  },
  corridorItemTitleSelected: {
    color: colors.primary
  },
  corridorTag: {
    backgroundColor: colors.neutral,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  corridorTagSelected: {
    backgroundColor: colors.primarySoft
  },
  corridorTagText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary
  },
  corridorTagTextSelected: {
    color: colors.primary
  },
  corridorItemCity: {
    fontSize: typography.sizes.caption,
    color: colors.text.muted,
    marginTop: 2
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
