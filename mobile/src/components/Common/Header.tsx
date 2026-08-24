import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Navigation, Bell, Sparkles, Bot, MessageSquare } from 'lucide-react-native';
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

      {/* AI Copilot Chat Button (Local phi4-mini) */}
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => setChatModalVisible(true)}
        style={styles.aiButton}
        hitSlop={spacing.hitSlop}
        accessibilityRole="button"
        accessibilityLabel="Open TrafficIQ AI Copilot chat powered by local phi4-mini model"
        accessibilityHint="Ask questions about traffic, route delays, bottlenecks, and tolls"
      >
        <View style={styles.aiIconWrap}>
          <Bot size={15} color={colors.primaryBright} />
          <View style={styles.aiDot} />
        </View>
        <View style={styles.aiTextCol}>
          <View style={styles.aiLabelRow}>
            <Text style={styles.aiLabel}>AI COPILOT</Text>
            <View style={styles.aiModelTag}>
              <Text style={styles.aiModelTagText}>phi4</Text>
            </View>
          </View>
          <Text numberOfLines={1} style={styles.aiValue}>
            {isNarrow ? 'Ask AI' : 'Ask Copilot'}
          </Text>
        </View>
        {!isNarrow && <Sparkles size={13} color={colors.primary} />}
      </TouchableOpacity>

      {/* Safety Alert Notification Center Button */}
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

      {/* Interactive Copilot AI Chat Modal */}
      <AiChatModal visible={chatModalVisible} onClose={() => setChatModalVisible(false)} />
    </View>
  );
};

export const Header = React.memo(HeaderBase);

const styles = StyleSheet.create({
  header: {
    minHeight: 66,
    paddingHorizontal: 12,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
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
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.32,
    shadowRadius: 9
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
    lineHeight: 19,
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
    minHeight: 19,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  livePill: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder
  },
  smartPill: {
    backgroundColor: colors.primaryFaint,
    borderColor: colors.primaryBorderSoft
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primaryBright
  },
  statusText: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: typography.weights.extrabold,
    letterSpacing: 0.6
  },
  liveText: {
    color: colors.primaryBright
  },
  smartText: {
    color: colors.primary
  },
  aiButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryFaint,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6
  },
  aiIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  aiDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryBright
  },
  aiTextCol: {
    flex: 1,
    minWidth: 0
  },
  aiLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  aiLabel: {
    fontSize: 7.5,
    lineHeight: 9,
    color: colors.primaryBright,
    fontWeight: typography.weights.extrabold,
    letterSpacing: 0.7
  },
  aiModelTag: {
    backgroundColor: colors.primarySoft,
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 0.5
  },
  aiModelTagText: {
    fontSize: 7,
    fontWeight: typography.weights.extrabold,
    color: colors.primaryBright
  },
  aiValue: {
    marginTop: 1,
    fontSize: 11.5,
    lineHeight: 14,
    color: colors.text.bright,
    fontWeight: typography.weights.bold
  },
  alertButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
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
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.card
  }
});
