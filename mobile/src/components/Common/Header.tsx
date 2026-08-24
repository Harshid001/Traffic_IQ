import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Navigation, Bell, Sparkles, Bot } from 'lucide-react-native';
import { useNavigationStore } from '../../store/navigationStore';
import { useSettingsStore } from '../../store/settingsStore';
import { AiChatModal } from '../Copilot/AiChatModal';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useLayout } from '../../theme/useLayout';

const HeaderBase: React.FC = () => {
  const setShowLockScreenModal = useNavigationStore(s => s.setShowLockScreenModal);
  const activeAlert = useNavigationStore(s => s.activeAlert);
  const routingData = useNavigationStore(s => s.routingData);
  const trafficMode = useSettingsStore(s => s.trafficMode);
  const { isNarrow } = useLayout();

  const [chatModalVisible, setChatModalVisible] = useState(false);
  const isLive = trafficMode === 'REAL' && routingData?.traffic_provenance === 'TOMTOM';

  return (
    <View style={styles.header}>
      {/* Brand & Live Traffic Status */}
      <View style={styles.brandBlock}>
        <View style={styles.logoBadge}>
          <Navigation size={18} color={colors.text.onAccent} strokeWidth={2.8} style={{ transform: [{ rotate: '45deg' }] }} />
        </View>
        <View style={styles.brandText}>
          <View style={styles.titleRow}>
            <Text style={styles.brandTitle}>Traffic<Text style={styles.brandAccent}>IQ</Text></Text>
            <View style={[styles.statusPill, isLive ? styles.livePill : styles.smartPill]}>
              {isLive ? <View style={styles.statusDot} /> : <Sparkles size={10} color={colors.primaryBright} />}
              <Text style={[styles.statusText, isLive ? styles.liveText : styles.smartText]}>{isLive ? 'LIVE' : 'SMART'}</Text>
            </View>
          </View>
          {!isNarrow && <Text style={styles.brandSub}>Predictive traffic intelligence</Text>}
        </View>
      </View>

      {/* Modern AI Copilot Pill (Phi-4 mini grounded) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setChatModalVisible(true)}
        style={styles.aiPill}
        hitSlop={spacing.hitSlop}
        accessibilityRole="button"
        accessibilityLabel="Open TrafficIQ AI Copilot chat"
      >
        <View style={styles.aiIconBubble}>
          <Bot size={14} color={colors.primaryBright} strokeWidth={2.4} />
          <View style={styles.aiPulseDot} />
        </View>
        <Text numberOfLines={1} style={styles.aiPillTitle}>
          Copilot
        </Text>
        <View style={styles.modelBadge}>
          <Text style={styles.modelBadgeText}>phi4</Text>
        </View>
      </TouchableOpacity>

      {/* Safety Alert Notification Center Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setShowLockScreenModal(true)}
        style={[styles.alertButton, activeAlert && styles.alertButtonActive]}
        hitSlop={spacing.hitSlop}
        accessibilityRole="button"
        accessibilityLabel={activeAlert ? 'Active traffic alert' : 'Traffic alerts'}
      >
        <Bell size={18} color={activeAlert ? colors.warningBright : colors.text.primary} strokeWidth={2} />
        {activeAlert && <View style={styles.alertDot} />}
      </TouchableOpacity>

      {/* Interactive Copilot AI Chat Modal */}
      <AiChatModal visible={chatModalVisible} onClose={() => setChatModalVisible(false)} />
    </View>
  );
};

export const Header = React.memo(HeaderBase);

const styles = StyleSheet.create({
  header: {
    minHeight: 62,
    paddingHorizontal: 14,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(17, 21, 26, 0.98)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 80
  },
  brandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8
  },
  brandText: {
    marginLeft: 9,
    justifyContent: 'center'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  brandTitle: {
    fontSize: 16,
    lineHeight: 20,
    color: colors.text.bright,
    fontWeight: typography.weights.extrabold,
    letterSpacing: -0.3
  },
  brandAccent: {
    color: colors.primaryBright
  },
  brandSub: {
    marginTop: 1,
    fontSize: 8.5,
    lineHeight: 11,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
    letterSpacing: 0.15
  },
  statusPill: {
    minHeight: 18,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5
  },
  livePill: {
    backgroundColor: 'rgba(200, 205, 212, 0.15)',
    borderColor: 'rgba(200, 205, 212, 0.4)'
  },
  smartPill: {
    backgroundColor: 'rgba(200, 205, 212, 0.10)',
    borderColor: 'rgba(200, 205, 212, 0.25)'
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primaryBright
  },
  statusText: {
    fontSize: 8.5,
    lineHeight: 10,
    fontWeight: typography.weights.extrabold,
    letterSpacing: 0.6
  },
  liveText: {
    color: colors.primaryBright
  },
  smartText: {
    color: colors.primaryBright
  },
  aiPill: {
    height: 38,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(226, 230, 235, 0.35)',
    backgroundColor: 'rgba(200, 205, 212, 0.10)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5
  },
  aiIconBubble: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(200, 205, 212, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  aiPulseDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primaryBright,
    borderWidth: 1,
    borderColor: colors.surface
  },
  aiPillTitle: {
    fontSize: 11.5,
    lineHeight: 14,
    color: colors.text.bright,
    fontWeight: typography.weights.bold,
    letterSpacing: -0.1
  },
  modelBadge: {
    backgroundColor: 'rgba(200, 205, 212, 0.22)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4
  },
  modelBadgeText: {
    fontSize: 8.5,
    lineHeight: 10,
    color: colors.primaryBright,
    fontWeight: typography.weights.extrabold
  },
  alertButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  alertButtonActive: {
    borderColor: colors.warningBorder,
    backgroundColor: colors.warningSoft
  },
  alertDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.warningBright,
    borderWidth: 1.5,
    borderColor: colors.card
  }
});
