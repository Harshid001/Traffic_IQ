import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { TrendingUp, Activity } from 'lucide-react-native';
import { useNavigationStore } from '../store/navigationStore';
import { ForecastTimeline } from '../components/Traffic/ForecastTimeline';
import { TrafficDNAPlot } from '../components/Traffic/TrafficDNAPlot';
import { SegmentBottlenecks } from '../components/Traffic/SegmentBottlenecks';
import { DataStateWrapper } from '../components/Common/DataStateWrapper';
import { TrafficTimelineSkeleton } from '../components/Common/SkeletonLoader';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export const TrafficScreen: React.FC = () => {
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
      skeleton={<TrafficTimelineSkeleton />}
      error={routesError}
      errorTitle="Traffic data unavailable"
      isEmpty={!isLoadingRoutes && !routesError && !selectedRoute}
      emptyTitle="No active route"
      emptyMessage="Calculate a corridor to see traffic analytics."
      emptyIcon={<TrendingUp size={20} color={colors.text.secondary} />}
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
            <View style={styles.headerTextCol}>
              <View style={styles.titleRow}>
                <TrendingUp size={16} color={colors.primary} />
                <Text style={styles.titleText}>Traffic Intelligence</Text>
              </View>
              <Text style={styles.subText} numberOfLines={1}>
                Real-time analytics for {selectedRoute.name}
              </Text>
            </View>

            <View style={styles.activePill}>
              <Activity size={10} color={colors.primary} />
              <Text style={styles.activePillText}>Active Monitor</Text>
            </View>
          </View>

          {/* Chronos-2 Forecast */}
          <ForecastTimeline route={selectedRoute} />

          {/* 24-Hour Historical Traffic DNA */}
          <TrafficDNAPlot route={selectedRoute} />

          {/* Segment Congestion Monitor */}
          <SegmentBottlenecks route={selectedRoute} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.md
  },
  headerTextCol: {
    flex: 1
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
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryFaint,
    borderWidth: 1,
    borderColor: colors.primaryBorderSoft,
    borderRadius: spacing.radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 3
  },
  activePillText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.primary
  }
});
