import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Navigation, GitFork, TrendingUp, Sparkles, SlidersHorizontal } from 'lucide-react-native';
import { useNavigationStore, ActiveTab } from '../../store/navigationStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const TABS: { id: ActiveTab; label: string; icon: any }[] = [
  { id: 'navigate', label: 'Navigate', icon: Navigation },
  { id: 'routes', label: 'Routes', icon: GitFork },
  { id: 'traffic', label: 'Traffic', icon: TrendingUp },
  { id: 'insights', label: 'Insights', icon: Sparkles },
  { id: 'profile', label: 'Profile', icon: SlidersHorizontal }
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
            activeOpacity={0.7}
            onPress={() => setActiveTab(tab.id)}
            style={styles.tabButton}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={isLiveNav ? `${tab.label}, navigation in progress` : tab.label}
          >
            {/* Active pill indicator behind icon */}
            <View style={[styles.iconPill, isActive && styles.iconPillActive]}>
              <View style={styles.iconContainer}>
                <Icon
                  size={22}
                  color={isActive ? colors.primary : colors.text.muted}
                  strokeWidth={isActive ? 2.5 : 1.8}
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
    minHeight: 68,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    minHeight: spacing.touchTargetMin
  },
  iconPill: {
    width: spacing.touchTargetMin,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.radius.lg,
    marginBottom: 2
  },
  iconPillActive: {
    backgroundColor: colors.primaryFaint,
    borderWidth: 1,
    borderColor: colors.primaryBorderSoft
  },
  iconContainer: {
    position: 'relative'
  },
  activeNavDot: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary
  },
  tabLabel: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.medium,
    // Was #64748B at 4.16:1 — below AA for this size. #8B98AC measures 6.78:1.
    color: colors.text.muted,
    marginTop: 1
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold
  }
});
