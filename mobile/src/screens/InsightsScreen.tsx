import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useNavigationStore } from '../store/navigationStore';
import { WhatIfPlanner } from '../components/Insights/WhatIfPlanner';
import { ReliabilityScorecard } from '../components/Insights/ReliabilityScorecard';
import { ProvenanceTracker } from '../components/Insights/ProvenanceTracker';
import { DataStateWrapper } from '../components/Common/DataStateWrapper';
import { InsightsSkeleton } from '../components/Common/SkeletonLoader';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export const InsightsScreen: React.FC = () => {
  const routingData = useNavigationStore(s => s.routingData);
  const selectedRouteId = useNavigationStore(s => s.selectedRouteId);
  const isLoadingRoutes = useNavigationStore(s => s.isLoadingRoutes);
  const routesError = useNavigationStore(s => s.routesError);
  const fetchRoutes = useNavigationStore(s => s.fetchRoutes);
  const selectedCorridor = useNavigationStore(s => s.selectedCorridor);

  const retry = useCallback(() => fetchRoutes(selectedCorridor), [fetchRoutes, selectedCorridor]);

  const selectedRoute = useMemo(() => {
    const routes = routingData?.routes ?? [];
    return routes.find(r => r.id === selectedRouteId) || routes[0];
  }, [routingData, selectedRouteId]);

  return (
    <DataStateWrapper
      isLoading={isLoadingRoutes && !selectedRoute}
      skeleton={<InsightsSkeleton />}
      error={routesError}
      errorTitle="Insights unavailable"
      isEmpty={!isLoadingRoutes && !routesError && !selectedRoute}
      emptyTitle="No route to analyse"
      emptyMessage="Calculate a corridor to see departure planning and reliability bounds."
      emptyIcon={<Sparkles size={20} color={colors.text.secondary} />}
      isStale={!!routingData?.is_fallback}
      lastUpdatedAt={routingData?.fetched_at}
      onRetry={retry}
      retryLabel="Retry"
    >
      {selectedRoute && (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.screenHeader}>
            <View style={styles.titleRow}>
              <Sparkles size={16} color={colors.primary} />
              <Text style={styles.titleText}>Deep Insights</Text>
            </View>
            <Text style={styles.subText}>
              What-If departures, reliability bounds and provenance
            </Text>
          </View>

          <WhatIfPlanner />

          <ReliabilityScorecard route={selectedRoute} />

          <ProvenanceTracker />
        </ScrollView>
      )}
    </DataStateWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  contentContainer: {
    padding: spacing.cardPadding,
    paddingBottom: spacing.xxl
  },
  stateWrapper: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.cardPadding
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
