import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Navigation, GitFork, TrendingUp, Sparkles, SlidersHorizontal } from 'lucide-react-native';
import { useNavigationStore, ActiveTab } from '../../store/navigationStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

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
    <View style={styles.tabBar} accessibilityRole="tablist">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isLiveNav = tab.id === 'navigate' && isNavigating;

        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.75}
            onPress={() => setActiveTab(tab.id)}
            style={styles.tabButton}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={isLiveNav ? `${tab.label}, navigation in progress` : tab.label}
          >
            {/* Active Pill Container */}
            <View style={[styles.iconPill, isActive && styles.iconPillActive]}>
              <View style={styles.iconContainer}>
                <Icon
                  size={20}
                  color={isActive ? colors.primaryBright : colors.text.muted}
                  strokeWidth={isActive ? 2.4 : 1.8}
                />
                {isLiveNav && <View style={styles.activeNavDot} />}
              </View>
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const TabBar = React.memo(TabBarBase);

const styles = StyleSheet.create({
  tabBar: {
    minHeight: 66,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.sm,
    paddingTop: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    zIndex: 40
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    minHeight: spacing.touchTargetMin
  },
  iconPill: {
    width: 44,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.radius.pill,
    marginBottom: 2
  },
  iconPillActive: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder
  },
  iconContainer: {
    position: 'relative'
  },
  activeNavDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.surface
  },
  tabLabel: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
    marginTop: 1
  },
  tabLabelActive: {
    color: colors.primaryBright,
    fontWeight: typography.weights.bold
  }
});
