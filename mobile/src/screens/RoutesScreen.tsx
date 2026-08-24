import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { GitFork, Sparkles, Navigation } from 'lucide-react-native';
import { useNavigationStore } from '../store/navigationStore';
import { RouteComparisonCard } from '../components/Routes/RouteComparisonCard';
import { TradeoffMatrix } from '../components/Routes/TradeoffMatrix';
import { VerifiedExplanation } from '../components/Routes/VerifiedExplanation';
import { DataStateWrapper } from '../components/Common/DataStateWrapper';
import { RouteCardsSkeleton } from '../components/Common/SkeletonLoader';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export const RoutesScreen: React.FC = () => {
  const routingData = useNavigationStore(s => s.routingData);
  const isLoadingRoutes = useNavigationStore(s => s.isLoadingRoutes);
  const routesError = useNavigationStore(s => s.routesError);
  const fetchRoutes = useNavigationStore(s => s.fetchRoutes);
  const selectedCorridor = useNavigationStore(s => s.selectedCorridor);

  const retry = useCallback(() => fetchRoutes(selectedCorridor), [fetchRoutes, selectedCorridor]);

  const routes = routingData?.routes ?? [];

  const { fastestRoute, bestRoute, otherRoutes } = useMemo(() => {
    const fastest = routes.find(r => r.is_fastest) || routes[0];
    const best = routes.find(r => r.is_best) || routes[0];
    return {
      fastestRoute: fastest,
      bestRoute: best,
      otherRoutes: routes.filter(r => r.id !== fastest?.id && r.id !== best?.id)
    };
  }, [routes]);

  return (
    <DataStateWrapper
      isLoading={isLoadingRoutes && routes.length === 0}
      skeleton={<RouteCardsSkeleton />}
      error={routesError}
      errorTitle="Route calculation failed"
      isEmpty={!isLoadingRoutes && !routesError && routes.length === 0}
      emptyTitle="No routes scored"
      emptyMessage="Calculate a corridor to see route comparison and alternatives."
      emptyIcon={<GitFork size={20} color={colors.text.secondary} />}
      isStale={!!routingData?.is_fallback && routingData?.routing_provenance !== 'DEMO'}
      lastUpdatedAt={routingData?.fetched_at}
      onRetry={retry}
      retryLabel="Retry"
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          {/* Screen Header */}
          <View style={styles.screenHeader}>
          <View style={styles.headerTextCol}>
            <View style={styles.titleRow}>
              <GitFork size={18} color={colors.primary} />
              <Text style={styles.titleText}>Route Explorer</Text>
            </View>
            <Text style={styles.subText} numberOfLines={1}>
              {routingData?.corridor_name || 'Active navigation corridor'}
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{routes.length} Alternatives</Text>
          </View>
        </View>

        {/* Top Primary Route Cards */}
        {bestRoute && (
          <View>
            <RouteComparisonCard
              route={bestRoute}
              type="best"
              timeDeltaMin={fastestRoute && fastestRoute.id !== bestRoute.id ? Math.round(bestRoute.predicted_eta_p50 - fastestRoute.predicted_eta_p50) : 0}
            />
            {fastestRoute && fastestRoute.id !== bestRoute.id && (
              <RouteComparisonCard
                route={fastestRoute}
                type="fastest"
                timeDeltaMin={Math.round(fastestRoute.predicted_eta_p50 - bestRoute.predicted_eta_p50)}
              />
            )}
          </View>
        )}

        {/* AI Driving Copilot Explanation */}
        {bestRoute && routingData?.explanation && (
          <VerifiedExplanation
            explanation={routingData.explanation}
            verifiedFacts={routingData.verified_facts}
            bestRoute={bestRoute}
          />
        )}

        {/* Trade-off Matrix */}
        {fastestRoute && bestRoute && fastestRoute.id !== bestRoute.id && (
          <TradeoffMatrix fastestRoute={fastestRoute} bestRoute={bestRoute} />
        )}

        {/* Secondary Options */}
        {otherRoutes.length > 0 && (
          <View style={styles.secondarySection}>
            <Text style={styles.secondaryTitle}>ADDITIONAL SCENIC & TOLL-FREE ALTERNATIVES</Text>
            {otherRoutes.map(r => (
              <RouteComparisonCard
                key={r.id}
                route={r}
                type="alternative"
                timeDeltaMin={bestRoute ? Math.round(r.predicted_eta_p50 - bestRoute.predicted_eta_p50) : 0}
              />
            ))}
          </View>
        )}
        </View>
      </ScrollView>
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
    paddingBottom: 140
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 580,
    alignSelf: 'center'
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
    gap: spacing.xs
  },
  titleText: {
    fontSize: typography.sizes.h2,
    lineHeight: typography.line.h2,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  subText: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 1
  },
  countBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: spacing.radius.pill,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: 4
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold,
    color: colors.primary
  },
  secondarySection: {
    marginTop: spacing.md
  },
  secondaryTitle: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: spacing.sm
  }
});
