import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import { TrendingUp, Activity, ShieldCheck, Zap } from 'lucide-react-native';
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
  const setSelectedRouteId = useNavigationStore(s => s.setSelectedRouteId);
  const isLoadingRoutes = useNavigationStore(s => s.isLoadingRoutes);
  const routesError = useNavigationStore(s => s.routesError);
  const fetchRoutes = useNavigationStore(s => s.fetchRoutes);
  const selectedCorridor = useNavigationStore(s => s.selectedCorridor);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;

  const retry = useCallback(() => fetchRoutes(selectedCorridor), [fetchRoutes, selectedCorridor]);

  const routes = routingData?.routes ?? [];
  const selectedRoute = useMemo(() => {
    return routes.find(r => r.id === selectedRouteId) || routes[0];
  }, [routes, selectedRouteId]);

  useEffect(() => {
    if (selectedRoute) {
      headerAnim.setValue(0);
      cardsAnim.setValue(0);
      Animated.stagger(100, [
        Animated.timing(headerAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(cardsAnim, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web'
        })
      ]).start();
    }
  }, [selectedRoute?.id, headerAnim, cardsAnim]);

  return (
    <DataStateWrapper
      isLoading={isLoadingRoutes && !selectedRoute}
      skeleton={<TrafficTimelineSkeleton />}
      error={routesError}
      errorTitle="Traffic data unavailable"
      isEmpty={!isLoadingRoutes && !routesError && !selectedRoute}
      emptyTitle="No active route"
      emptyMessage="Calculate a corridor to view live traffic analytics and forecasts."
      emptyIcon={<TrendingUp size={20} color={colors.text.secondary} />}
      isStale={!!routingData?.is_fallback && routingData?.routing_provenance !== 'DEMO'}
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
          <View style={styles.contentWrapper}>
            {/* Header with Animation */}
            <Animated.View style={[styles.screenHeader, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
              <View style={styles.headerTextCol}>
                <View style={styles.titleRow}>
                  <TrendingUp size={18} color={colors.primary} />
                  <Text style={styles.titleText}>Traffic Intelligence</Text>
                </View>
                <Text style={styles.subText} numberOfLines={1}>
                  Real-time congestion analytics for {selectedRoute.name}
                </Text>
              </View>

              <View style={styles.activePill}>
                <View style={styles.liveDot} />
                <Text style={styles.activePillText}>Live Monitor</Text>
              </View>
            </Animated.View>

            {/* Interactive Route Selector Chips */}
            {routes.length > 1 && (
              <Animated.View style={{ opacity: headerAnim }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.routeSelectorScroll}
                >
                  {routes.map(r => {
                    const isSelected = r.id === selectedRoute.id;
                    return (
                      <TouchableOpacity
                        key={r.id}
                        activeOpacity={0.75}
                        onPress={() => setSelectedRouteId(r.id)}
                        style={[styles.routeChip, isSelected && styles.routeChipSelected]}
                      >
                        {r.is_best ? (
                          <ShieldCheck size={11} color={isSelected ? colors.primary : colors.text.muted} />
                        ) : r.is_fastest ? (
                          <Zap size={11} color={isSelected ? colors.fastest : colors.text.muted} />
                        ) : null}
                        <Text style={[styles.routeChipText, isSelected && styles.routeChipTextSelected]}>
                          {r.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </Animated.View>
            )}

            {/* Animated Cards Container */}
            <Animated.View style={{ opacity: cardsAnim, transform: [{ translateY: cardsAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
              {/* Smart Departure & Forecast Timeline */}
              <ForecastTimeline route={selectedRoute} />

              {/* 24-Hour Historical Commute Rhythm */}
              <TrafficDNAPlot route={selectedRoute} />

              {/* Step-by-Step Segment Congestion */}
              <SegmentBottlenecks route={selectedRoute} />
            </Animated.View>
          </View>
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
    marginBottom: spacing.md,
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
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: spacing.radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 3
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary
  },
  activePillText: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold,
    color: colors.primary
  },
  routeSelectorScroll: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
    paddingVertical: 2
  },
  routeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.card,
    borderRadius: spacing.radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 32
  },
  routeChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  routeChipText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary
  },
  routeChipTextSelected: {
    color: colors.primaryBright,
    fontWeight: typography.weights.bold
  }
});
