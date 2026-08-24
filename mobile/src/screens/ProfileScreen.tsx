import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SlidersHorizontal } from 'lucide-react-native';
import { PreferenceSelector } from '../components/Profile/PreferenceSelector';
import { SystemDiagnostics } from '../components/Profile/SystemDiagnostics';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export const ProfileScreen: React.FC = () => (
  <ScrollView
    style={styles.container}
    contentContainerStyle={styles.contentContainer}
    showsVerticalScrollIndicator={false}
  >
    {/* Header */}
    <View style={styles.screenHeader}>
      <View style={styles.titleRow}>
        <SlidersHorizontal size={16} color={colors.primary} />
        <Text style={styles.titleText}>Driver Preferences</Text>
      </View>
      <Text style={styles.subText}>
        Routing objectives, data sources, and alert thresholds
      </Text>
    </View>

    {/* Multi-Objective Routing Profile Selector */}
    <PreferenceSelector />

    {/* Traffic Source, Alerts, & Microservices */}
    <SystemDiagnostics />
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  contentContainer: {
    padding: spacing.cardPadding,
    paddingBottom: spacing.xxl
  },
  screenHeader: {
    marginBottom: spacing.lg
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  titleText: {
    fontSize: typography.sizes.h3,
    lineHeight: typography.line.h3,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  subText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.secondary,
    marginTop: 1
  }
});
