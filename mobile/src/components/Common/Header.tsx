import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { Navigation, MapPin, ChevronDown, Check, Bell, Sparkles, Search, Compass } from 'lucide-react-native';
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
  const routingData = useNavigationStore(s => s.routingData);
  const trafficMode = useSettingsStore(s => s.trafficMode);
  const { dialogMaxWidth, isNarrow } = useLayout();

  const [modalVisible, setModalVisible] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const currentCorridor = getCorridor(selectedCorridor);
  const isLive = trafficMode === 'REAL' && routingData?.traffic_provenance === 'TOMTOM';

  const filteredCorridors = useMemo(() => {
    const query = searchFilter.trim().toLowerCase();
    if (!query) return CORRIDORS;
    return CORRIDORS.filter(c => `${c.name} ${c.city} ${c.tag}`.toLowerCase().includes(query));
  }, [searchFilter]);

  const closeModal = () => {
    setModalVisible(false);
    setSearchFilter('');
  };

  return (
    <View style={styles.header}>
      <View style={styles.brandBlock}>
        <View style={styles.logoBadge}>
          <Navigation size={17} color={colors.text.onAccent} strokeWidth={2.7} style={{ transform: [{ rotate: '45deg' }] }} />
        </View>
        <View style={styles.brandText}>
          <View style={styles.titleRow}>
            <Text style={styles.brandTitle}>Traffic<Text style={styles.brandAccent}>IQ</Text></Text>
            <View style={[styles.statusPill, isLive ? styles.livePill : styles.smartPill]}>
              {isLive ? <View style={styles.statusDot} /> : <Sparkles size={9} color={colors.primaryBright} />}
              <Text style={[styles.statusText, isLive ? styles.liveText : styles.smartText]}>{isLive ? 'LIVE' : 'SMART'}</Text>
            </View>
          </View>
          {!isNarrow && <Text style={styles.brandSub}>Predictive traffic intelligence</Text>}
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => setModalVisible(true)}
        style={styles.destinationButton}
        hitSlop={spacing.hitSlop}
        accessibilityRole="button"
        accessibilityLabel={`Destination ${currentCorridor.name}`}
        accessibilityHint="Opens route corridor picker"
      >
        <View style={styles.destinationIcon}><MapPin size={13} color={colors.primaryBright} /></View>
        <View style={styles.destinationText}>
          <Text style={styles.destinationLabel}>DESTINATION</Text>
          <Text numberOfLines={1} style={styles.destinationValue}>{isNarrow ? currentCorridor.shortLabel : currentCorridor.name}</Text>
        </View>
        <ChevronDown size={14} color={colors.text.secondary} />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => setShowLockScreenModal(true)}
        style={[styles.alertButton, activeAlert && styles.alertButtonActive]}
        hitSlop={spacing.hitSlop}
        accessibilityRole="button"
        accessibilityLabel={activeAlert ? 'Active traffic alert' : 'Traffic alerts'}
      >
        <Bell size={18} color={activeAlert ? colors.warningBright : colors.text.primary} />
        {activeAlert && <View style={styles.alertDot} />}
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <Pressable style={styles.modalBackdrop} onPress={closeModal} accessibilityRole="button" accessibilityLabel="Close destination picker">
          <Pressable accessible={false} style={[styles.modal, { maxWidth: dialogMaxWidth }]} onPress={event => event.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleWrap}>
                <Text style={styles.modalEyebrow}>ROUTE PLANNER</Text>
                <Text style={styles.modalTitle}>Where are you headed?</Text>
                <Text style={styles.modalSubtitle}>Pick a corridor to update traffic intelligence.</Text>
              </View>
              <View style={styles.modalIcon}><Compass size={18} color={colors.primaryBright} /></View>
            </View>

            <View style={styles.searchBox}>
              <Search size={15} color={colors.text.muted} />
              <TextInput value={searchFilter} onChangeText={setSearchFilter} placeholder="Search city, road or corridor" placeholderTextColor={colors.text.dimmed} style={styles.searchInput} autoCorrect={false} />
            </View>

            <ScrollView style={styles.corridorList} showsVerticalScrollIndicator={false}>
              {filteredCorridors.map(corridor => {
                const selected = corridor.id === selectedCorridor;
                return (
                  <TouchableOpacity
                    key={corridor.id}
                    activeOpacity={0.78}
                    onPress={() => { setSelectedCorridor(corridor.id); closeModal(); }}
                    style={[styles.corridorRow, selected && styles.corridorRowSelected]}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                  >
                    <View style={[styles.corridorIcon, selected && styles.corridorIconSelected]}>
                      <MapPin size={15} color={selected ? colors.primaryBright : colors.text.secondary} />
                    </View>
                    <View style={styles.corridorCopy}>
                      <View style={styles.corridorTitleRow}>
                        <Text style={[styles.corridorTitle, selected && styles.corridorTitleSelected]} numberOfLines={1}>{corridor.name}</Text>
                        <View style={[styles.tag, selected && styles.tagSelected]}><Text style={[styles.tagText, selected && styles.tagTextSelected]}>{corridor.tag}</Text></View>
                      </View>
                      <Text style={styles.corridorMeta}>{corridor.city} · predictive traffic ready</Text>
                    </View>
                    {selected && <View style={styles.checkCircle}><Check size={14} color={colors.text.onAccent} strokeWidth={3} /></View>}
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

export const Header = React.memo(HeaderBase);

const styles = StyleSheet.create({
  header: { minHeight: 66, paddingHorizontal: 12, gap: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, zIndex: 80 },
  brandBlock: { flexDirection: 'row', alignItems: 'center', flexShrink: 0 },
  logoBadge: { width: 36, height: 36, borderRadius: 13, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.32, shadowRadius: 9 },
  brandText: { marginLeft: 9, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandTitle: { fontSize: 16, lineHeight: 19, color: colors.text.bright, fontWeight: typography.weights.extrabold, letterSpacing: -0.3 },
  brandAccent: { color: colors.primaryBright },
  brandSub: { marginTop: 1, fontSize: 8.5, lineHeight: 11, color: colors.text.muted, fontWeight: typography.weights.medium, letterSpacing: 0.15 },
  statusPill: { minHeight: 19, paddingHorizontal: 6, borderRadius: 10, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 3 },
  livePill: { backgroundColor: colors.primarySoft, borderColor: colors.primaryBorder },
  smartPill: { backgroundColor: colors.primaryFaint, borderColor: colors.primaryBorderSoft },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primaryBright },
  statusText: { fontSize: 8, lineHeight: 10, fontWeight: typography.weights.extrabold, letterSpacing: 0.6 },
  liveText: { color: colors.primaryBright },
  smartText: { color: colors.primary },
  destinationButton: { flex: 1, minWidth: 0, minHeight: 42, paddingHorizontal: 9, borderRadius: 14, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', gap: 8 },
  destinationIcon: { width: 27, height: 27, borderRadius: 10, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  destinationText: { flex: 1, minWidth: 0 },
  destinationLabel: { fontSize: 7.5, lineHeight: 9, color: colors.text.muted, fontWeight: typography.weights.extrabold, letterSpacing: 0.7 },
  destinationValue: { marginTop: 1, fontSize: 11.5, lineHeight: 14, color: colors.text.bright, fontWeight: typography.weights.bold },
  alertButton: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  alertButtonActive: { borderColor: colors.warningBorder, backgroundColor: colors.warningSoft },
  alertDot: { position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.danger, borderWidth: 1.5, borderColor: colors.card },
  modalBackdrop: { flex: 1, padding: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.scrim },
  modal: { width: '100%', maxHeight: '82%', padding: 18, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.6, shadowRadius: 28 },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  modalTitleWrap: { flex: 1, paddingRight: 12 },
  modalEyebrow: { fontSize: 8, lineHeight: 10, letterSpacing: 1, color: colors.primaryBright, fontWeight: typography.weights.extrabold },
  modalTitle: { marginTop: 3, fontSize: 20, lineHeight: 24, color: colors.text.bright, fontWeight: typography.weights.extrabold },
  modalSubtitle: { marginTop: 3, fontSize: 11, lineHeight: 15, color: colors.text.secondary },
  modalIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  searchBox: { height: 44, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  searchInput: { flex: 1, minWidth: 0, color: colors.text.primary, fontSize: 13 },
  corridorList: { maxHeight: 450 },
  corridorRow: { minHeight: 60, padding: 10, marginBottom: 8, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', gap: 9 },
  corridorRowSelected: { borderColor: colors.primaryBorder, backgroundColor: colors.primaryFaint },
  corridorIcon: { width: 34, height: 34, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  corridorIconSelected: { borderColor: colors.primaryBorder, backgroundColor: colors.primarySoft },
  corridorCopy: { flex: 1, minWidth: 0 },
  corridorTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  corridorTitle: { flex: 1, fontSize: 13, lineHeight: 16, color: colors.text.primary, fontWeight: typography.weights.bold },
  corridorTitleSelected: { color: colors.primaryBright },
  tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 7, backgroundColor: colors.neutral },
  tagSelected: { backgroundColor: colors.primarySoft },
  tagText: { fontSize: 8, color: colors.text.secondary, fontWeight: typography.weights.extrabold },
  tagTextSelected: { color: colors.primaryBright },
  corridorMeta: { marginTop: 2, fontSize: 10, lineHeight: 13, color: colors.text.muted },
  checkCircle: { width: 23, height: 23, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }
});
