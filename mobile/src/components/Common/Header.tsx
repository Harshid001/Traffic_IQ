import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable } from 'react-native';
import { Navigation, MapPin, ChevronDown, Check, Bell, FlaskConical } from 'lucide-react-native';
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
  const { dialogMaxWidth, isNarrow } = useLayout();

  const currentCorridor = getCorridor(selectedCorridor);
  const isDemo = trafficMode === 'DEMO';

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedCorridor(id);
      setModalVisible(false);
    },
    [setSelectedCorridor]
  );

  return (
    <View style={styles.header}>
      {/* Brand & Live Beacon */}
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Navigation
            size={16}
            color={colors.text.onAccent}
            strokeWidth={2.5}
            style={{ transform: [{ rotate: '45deg' }] }}
          />
        </View>
        <View style={styles.brandTextCol}>
          <View style={styles.titleRow}>
            <Text style={styles.brandTitle}>
              Traffic<Text style={styles.brandHighlight}>IQ</Text>
            </Text>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            {isDemo && (
              <View style={styles.demoPill}>
                <FlaskConical size={10} color={colors.fastest} />
                <Text style={styles.demoText}>DEMO</Text>
              </View>
            )}
          </View>
          <Text style={styles.brandSub}>Chronos-2 Engine</Text>
        </View>
      </View>

      {/* Corridor Selector Pill */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
        style={styles.corridorButton}
        hitSlop={spacing.hitSlop}
        accessibilityRole="button"
        accessibilityLabel={`Navigation corridor: ${currentCorridor.name}. Tap to change.`}
        accessibilityHint="Opens the corridor picker"
      >
        <MapPin size={12} color={colors.primary} />
        <Text style={styles.corridorButtonText} numberOfLines={1}>
          {isNarrow ? currentCorridor.shortLabel : currentCorridor.name}
        </Text>
        <ChevronDown size={12} color={colors.text.secondary} />
      </TouchableOpacity>

      {/* Background Alert Simulation Bell */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setShowLockScreenModal(true)}
        style={styles.bellButton}
        hitSlop={spacing.hitSlop}
        accessibilityRole="button"
        accessibilityLabel={
          activeAlert
            ? 'Show lock screen alert preview. One alert is active.'
            : 'Show lock screen alert preview'
        }
      >
        <Bell size={16} color={colors.text.primary} />
        {activeAlert && <View style={styles.alertDot} />}
      </TouchableOpacity>

      {/* Corridor Picker Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        {/* Backdrop dismiss; the inner Pressable stops the tap from bubbling. */}
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
          accessibilityRole="button"
          accessibilityLabel="Close corridor picker"
        >
          <Pressable style={[styles.modalContent, { maxWidth: dialogMaxWidth }]} onPress={() => {}}>
            <Text style={styles.modalHeader}>SELECT NAVIGATION CORRIDOR</Text>
            {CORRIDORS.map((corridor) => {
              const isSelected = corridor.id === selectedCorridor;
              return (
                <TouchableOpacity
                  key={corridor.id}
                  activeOpacity={0.7}
                  onPress={() => handleSelect(corridor.id)}
                  style={[styles.corridorItem, isSelected && styles.corridorItemSelected]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={`${corridor.name}, ${corridor.city}`}
                >
                  <View style={styles.corridorItemText}>
                    <Text
                      style={[
                        styles.corridorItemTitle,
                        isSelected && styles.corridorItemTitleSelected
                      ]}
                    >
                      {corridor.name}
                    </Text>
                    <Text style={styles.corridorItemCity}>{corridor.city}</Text>
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

export const Header = React.memo(HeaderBase);

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    zIndex: 40
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: spacing.radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md
  },
  brandTextCol: {
    justifyContent: 'center'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  brandTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright,
    letterSpacing: typography.tracking.normal
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
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    marginLeft: spacing.sm
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 3
  },
  liveText: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.primaryBright
  },
  brandSub: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.muted,
    fontWeight: typography.weights.medium
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fastestFaint,
    borderWidth: 1,
    borderColor: colors.fastestBorder,
    borderRadius: spacing.radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    marginLeft: spacing.xs,
    gap: 3
  },
  demoText: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.fastest
  },
  corridorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.xl,
    paddingHorizontal: spacing.lg,
    minHeight: 36,
    // Shrinks with the viewport instead of a fixed 155px cap.
    flexShrink: 1,
    flex: 1,
    marginHorizontal: spacing.md
  },
  corridorButtonText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.strong,
    fontWeight: typography.weights.semibold,
    marginHorizontal: spacing.xs,
    flex: 1
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: spacing.radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    position: 'absolute',
    top: 6,
    right: 6
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
  corridorItem: {
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
  corridorItemSelected: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryFaint
  },
  corridorItemText: {
    flex: 1,
    paddingRight: spacing.md
  },
  corridorItemTitle: {
    fontSize: typography.sizes.label,
    lineHeight: typography.line.label,
    fontWeight: typography.weights.bold,
    color: colors.text.primary
  },
  corridorItemTitleSelected: {
    color: colors.primary
  },
  corridorItemCity: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.secondary,
    marginTop: 2
  }
});
