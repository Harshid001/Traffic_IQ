import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Navigation, Bell, Sparkles } from 'lucide-react-native';
import { useNavigationStore } from '../../store/navigationStore';
import { AiChatModal } from '../Copilot/AiChatModal';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const HeaderBase: React.FC = () => {
  const setShowLockScreenModal = useNavigationStore(s => s.setShowLockScreenModal);
  const activeAlert = useNavigationStore(s => s.activeAlert);

  const [chatModalVisible, setChatModalVisible] = useState(false);

  return (
    <View style={styles.header}>
      {/* Brand Logo & Name */}
      <View style={styles.brandBlock}>
        <View style={styles.logoBadge}>
          <Navigation size={18} color={colors.text.onAccent} strokeWidth={2.8} style={{ transform: [{ rotate: '45deg' }] }} />
        </View>
        <View style={styles.brandText}>
          <Text style={styles.brandTitle}>Traffic<Text style={styles.brandAccent}>IQ</Text></Text>
        </View>
      </View>

      {/* Right Action Icons (AI Copilot Logo & Alert Bell) */}
      <View style={styles.actionsRight}>
        {/* AI Copilot Logo Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setChatModalVisible(true)}
          style={styles.aiButton}
          hitSlop={spacing.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Open TrafficIQ AI Copilot chat"
        >
          <Sparkles size={17} color={colors.text.bright} strokeWidth={2.4} />
          <View style={styles.aiPulseDot} />
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
      </View>

      {/* Interactive Copilot AI Chat Modal */}
      <AiChatModal visible={chatModalVisible} onClose={() => setChatModalVisible(false)} />
    </View>
  );
};

export const Header = React.memo(HeaderBase);

const styles = StyleSheet.create({
  header: {
    minHeight: 56,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(17, 21, 26, 0.98)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 80
  },
  brandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    marginRight: 10
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    flexShrink: 0
  },
  brandText: {
    marginLeft: 9,
    justifyContent: 'center',
    flex: 1,
    minWidth: 0
  },
  brandTitle: {
    fontSize: 17,
    lineHeight: 20,
    color: colors.text.bright,
    fontWeight: typography.weights.extrabold,
    letterSpacing: -0.3
  },
  brandAccent: {
    color: colors.text.secondary
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0
  },
  aiButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4
  },
  aiPulseDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryBright,
    borderWidth: 1.2,
    borderColor: colors.surface
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
