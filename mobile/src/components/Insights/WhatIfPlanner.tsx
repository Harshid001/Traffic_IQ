import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, Sparkles, Star } from 'lucide-react-native';
import { useTrafficStore } from '../../store/trafficStore';
import { useNavigationStore } from '../../store/navigationStore';
import { ErrorState } from '../Common/ErrorState';
import { EmptyState } from '../Common/EmptyState';
import { LoadingState } from '../Common/LoadingState';
import { Card } from '../Common/Card';
import { Badge } from '../Common/Badge';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const WhatIfPlannerBase: React.FC = () => {
  const routingData = useNavigationStore(s => s.routingData);
  const whatIfData = useTrafficStore(s => s.whatIfData);
  const isLoadingWhatIf = useTrafficStore(s => s.isLoadingWhatIf);
  const whatIfError = useTrafficStore(s => s.whatIfError);
  const loadWhatIfSimulation = useTrafficStore(s => s.loadWhatIfSimulation);

  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number | null>(null);

  const routes = routingData?.routes;

  useEffect(() => {
    if (routes && routes.length > 0 && !whatIfData && !isLoadingWhatIf && !whatIfError) {
      loadWhatIfSimulation(routes);
    }
  }, [routes, whatIfData, isLoadingWhatIf, whatIfError, loadWhatIfSimulation]);

  const retry = useCallback(() => {
    if (routes && routes.length > 0) loadWhatIfSimulation(routes);
  }, [routes, loadWhatIfSimulation]);

  const scenarios = whatIfData?.departure_evaluations ?? [];

  /**
   * The optimal scenario is matched on `optimal_offset_minutes` — an exact
   * numeric field. The previous `label.includes('30')` substring test also
   * matched "+130 min" and any label containing the digits "30".
   */
  const optimalOffset = whatIfData?.optimal_offset_minutes ?? null;

  const optimalScenario = useMemo(
    () =>
      optimalOffset === null
        ? undefined
        : scenarios.find(s => s.offset_minutes === optimalOffset),
    [scenarios, optimalOffset]
  );

  /** Departure clock time derived from the server's optimal offset. */
  const departure = useMemo(() => {
    if (optimalOffset === null) return null;
    const at = new Date(Date.now() + optimalOffset * 60 * 1000);
    const hh = at.getHours();
    const mm = String(at.getMinutes()).padStart(2, '0');
    const ampm = hh >= 12 ? 'PM' : 'AM';
    return {
      time: `${hh % 12 || 12}:${mm} ${ampm}`,
      relative: optimalOffset === 0 ? 'Now' : `in ${optimalOffset} min`
    };
  }, [optimalOffset]);

  const renderBody = () => {
    if (!routes || routes.length === 0) {
      return (
        <EmptyState
          title="No routes to evaluate"
          message="Calculate a corridor first to see departure options."
        />
      );
    }
    if (whatIfError) {
      return (
        <ErrorState title="Departure forecast unavailable" message={whatIfError} onRetry={retry} />
      );
    }
    if (isLoadingWhatIf && scenarios.length === 0) {
      return <LoadingState size="small" message="Projecting departure windows..." />;
    }
    if (scenarios.length === 0) {
      return (
        <EmptyState
          title="No departure windows returned"
          message="The simulation completed without producing scenarios."
          actionLabel="Re-run"
          onAction={retry}
        />
      );
    }

    return (
      <>
        <View style={styles.scenarioList}>
          {scenarios.map((sc, idx) => {
            const isSelected = selectedScenarioIndex === idx;
            const isOptimal = optimalOffset !== null && sc.offset_minutes === optimalOffset;

            return (
              <TouchableOpacity
                key={`${sc.offset_minutes}-${sc.label}`}
                activeOpacity={0.7}
                onPress={() => setSelectedScenarioIndex(idx)}
                style={[
                  styles.scenarioItem,
                  isOptimal && !isSelected && styles.scenarioItemOptimal,
                  isSelected && styles.scenarioItemSelected
                ]}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`Depart ${sc.label}. Estimated ${sc.lowest_eta_min} minutes via ${sc.best_route_name}.${isOptimal ? ' Recommended departure.' : ''}`}
              >
                <View style={styles.scenarioLeft}>
                  <Text style={styles.scenarioLabel}>{sc.label}</Text>
                  {isOptimal && (
                    <View style={styles.optimalTag}>
                      <Star size={10} color={colors.primary} />
                      <Text style={styles.optimalTagText}>Best</Text>
                    </View>
                  )}
                </View>

                <View style={styles.scenarioRight}>
                  <Text style={styles.scenarioEta}>
                    {sc.lowest_eta_min} <Text style={styles.scenarioEtaUnit}>min</Text>
                  </Text>
                  <Text style={styles.scenarioRoute} numberOfLines={1}>
                    {sc.best_route_name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Recommended Departure Callout — only when the server named one. */}
        {departure && (
          <View style={styles.recommendationCard}>
            <View style={styles.recHeader}>
              <Text style={styles.recLabel}>RECOMMENDED DEPARTURE</Text>
              {whatIfData?.potential_savings_min !== undefined &&
                whatIfData.potential_savings_min > 0 && (
                  <Text style={styles.recSavings}>
                    Save ~{whatIfData.potential_savings_min} min
                  </Text>
                )}
            </View>
            <Text style={styles.recTime}>
              {departure.time} <Text style={styles.recTimeSub}>({departure.relative})</Text>
            </Text>
            {whatIfData?.recommendation && (
              <View style={styles.recBodyRow}>
                <Sparkles size={12} color={colors.primary} />
                <Text style={styles.recBody}>{whatIfData.recommendation}</Text>
              </View>
            )}
            {optimalScenario && (
              <Text style={styles.recRoute}>Via {optimalScenario.best_route_name}</Text>
            )}
          </View>
        )}
      </>
    );
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Clock size={14} color={colors.primary} />
          <Text style={styles.title}>WHEN SHOULD I LEAVE?</Text>
        </View>
        <Badge variant="primary" size="sm">
          Departure Forecast
        </Badge>
      </View>

      <Text style={styles.subText}>
        Chronos-2 projects future clearance windows to calculate your optimal departure time.
      </Text>

      {renderBody()}
    </Card>
  );
};

export const WhatIfPlanner = React.memo(WhatIfPlannerBase);

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.md
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1
  },
  title: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.strong,
    letterSpacing: typography.tracking.normal
  },
  subText: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    color: colors.text.secondary,
    marginBottom: spacing.lg
  },
  scenarioList: {
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  scenarioItem: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: spacing.touchTargetMin,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  scenarioItemSelected: {
    backgroundColor: colors.primaryFaint,
    borderColor: colors.primary
  },
  scenarioItemOptimal: {
    borderColor: colors.primaryBorder
  },
  scenarioLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  scenarioLabel: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.extrabold,
    color: colors.text.primary,
    minWidth: 52
  },
  optimalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primarySoft,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  optimalTagText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.primary,
    textTransform: 'uppercase'
  },
  scenarioRight: {
    alignItems: 'flex-end',
    flexShrink: 1
  },
  scenarioEta: {
    fontSize: typography.sizes.h3,
    lineHeight: typography.line.h3,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  scenarioEtaUnit: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary
  },
  scenarioRoute: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.muted
  },
  recommendationCard: {
    backgroundColor: colors.primaryFaint,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: spacing.radius.lg,
    padding: spacing.lg
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    gap: spacing.md
  },
  recLabel: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.primary,
    letterSpacing: typography.tracking.normal
  },
  recSavings: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.primary
  },
  recTime: {
    fontSize: typography.sizes.h2,
    lineHeight: typography.line.h2,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  recTimeSub: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary
  },
  recBodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xs
  },
  recBody: {
    flex: 1,
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    color: colors.text.body
  },
  recRoute: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.secondary,
    marginTop: spacing.xs
  }
});
