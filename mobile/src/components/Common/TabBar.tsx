import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Navigation, GitFork, TrendingUp, Sparkles, SlidersHorizontal } from 'lucide-react-native';
import { useNavigationStore, ActiveTab } from '../../store/navigationStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const TABS: { id: ActiveTab; label: string; icon: any }[] = [
  { id: 'navigate', label: 'Navigate', icon: Navigation },
  { id: 'routes', label: 'Routes', icon: GitFork },
  { id: 'traffic', label: 'Traffic', icon: TrendingUp },
  { id: 'insights', label: 'Copilot', icon: Sparkles },
  { id: 'profile', label: 'Driver Hub', icon: SlidersHorizontal }
];

const TabBarBase: React.FC = () => {
  const activeTab = useNavigationStore(s => s.activeTab);
  const setActiveTab = useNavigationStore(s => s.setActiveTab);
  const isNavigating = useNavigationStore(s => s.isNavigating);

  return (
    <View style={styles.shell} pointerEvents="box-none">
      <View style={styles.tabBar} accessibilityRole="tablist">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isLiveNav = tab.id === 'navigate' && isNavigating;

          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.82}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={isLiveNav ? `${tab.label}, navigation in progress` : tab.label}
              hitSlop={6}
            >
              <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                <Icon size={19} color={isActive ? colors.primaryBright : colors.text.muted} strokeWidth={isActive ? 2.5 : 1.8} />
                {isLiveNav && <View style={styles.liveDot} />}
              </View>
              <Text numberOfLines={1} style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export const TabBar = React.memo(TabBarBase);

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
    zIndex: 60
  },
  tabBar: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 6,
    backgroundColor: colors.overlaySurface,
    borderWidth: 1,
    borderColor: colors.glass.strokeStrong,
    borderRadius: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 22
  },
  tabButton: {
    flex: 1,
    minHeight: 50,
    marginHorizontal: 2,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2
  },
  tabButtonActive: {
    backgroundColor: colors.primaryFaint,
    borderWidth: 1,
    borderColor: colors.primaryBorderSoft
  },
  iconWrap: {
    width: 34,
    height: 27,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  iconWrapActive: {
    backgroundColor: colors.primarySoft
  },
  liveDot: {
    position: 'absolute',
    top: 2,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryBright,
    borderWidth: 1.5,
    borderColor: colors.surface
  },
  tabLabel: {
    maxWidth: 68,
    fontSize: 9.5,
    lineHeight: 12,
    fontWeight: typography.weights.semibold,
    color: colors.text.muted,
    textAlign: 'center'
  },
  tabLabelActive: {
    color: colors.text.bright,
    fontWeight: typography.weights.extrabold
  }
});
