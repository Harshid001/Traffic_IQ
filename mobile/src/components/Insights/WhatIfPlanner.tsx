import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, Sparkles, Star, Zap, Check } from 'lucide-react-native';
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
  const optimalOffset = whatIfData?.optimal_offset_minutes ?? null;

  const optimalScenario = useMemo(
    () =>
      optimalOffset === null
        ? undefined
        : scenarios.find(s => s.offset_minutes === optimalOffset),
    [scenarios, optimalOffset]
  );

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
          title="No route calculated"
          message="Calculate a corridor first to evaluate best departure windows."
        />
      );
    }
    if (whatIfError) {
      return (
        <ErrorState title="Departure planner unavailable" message={whatIfError} onRetry={retry} />
      );
    }
    if (isLoadingWhatIf && scenarios.length === 0) {
      return <LoadingState size="small" message="Calculating optimal departure schedule..." />;
    }
    if (scenarios.length === 0) {
      return (
        <EmptyState
          title="No departure windows returned"
          message="The schedule engine produced no alternate windows."
          actionLabel="Recalculate"
          onAction={retry}
        />
      );
    }

    const baselineEta = scenarios[0]?.lowest_eta_min ?? 30;

    return (
      <>
        <View style={styles.scenarioList}>
          {scenarios.map((sc, idx) => {
            const isSelected = selectedScenarioIndex === idx;
            const isOptimal = optimalOffset !== null && sc.offset_minutes === optimalOffset;
            const diffMin = Math.round(baselineEta - sc.lowest_eta_min);

            return (
              <TouchableOpacity
                key={`${sc.offset_minutes}-${idx}`}
                activeOpacity={0.75}
                onPress={() => setSelectedScenarioIndex(idx)}
                style={[
                  styles.scenarioCard,
                  isOptimal && styles.scenarioCardOptimal,
                  isSelected && styles.scenarioCardSelected
                ]}
              >
                <View style={styles.scenarioLeft}>
                  <View style={styles.scenarioHeaderRow}>
                    <Text style={[styles.offsetLabel, isOptimal && styles.offsetLabelOptimal]}>
                      {sc.label}
                    </Text>
                    {isOptimal && (
                      <View style={styles.optimalTag}>
                        <Star size={10} color={colors.primary} />
                        <Text style={styles.optimalTagText}>SMART PICK</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.scenarioEta}>
                    Est. Duration: <Text style={styles.scenarioEtaVal}>{Math.round(sc.lowest_eta_min)} min</Text>
                  </Text>
                </View>

                <View style={styles.scenarioRight}>
                  {diffMin > 0 ? (
                    <View style={styles.savingsPill}>
                      <Zap size={11} color={colors.primary} />
                      <Text style={styles.savingsText}>Saves {diffMin}m</Text>
                    </View>
                  ) : diffMin < 0 ? (
                    <Text style={styles.delayText}>+{Math.abs(diffMin)}m delay</Text>
                  ) : (
                    <Text style={styles.baselineText}>Baseline</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Highlight Banner */}
        {optimalScenario && (
          <View style={styles.recommendationBanner}>
            <Sparkles size={16} color={colors.primaryBright} />
            <Text style={styles.recommendationText}>
              {whatIfData?.recommendation || `Leaving ${optimalScenario.label} saves you valuable travel time by avoiding peak bottleneck traffic!`}
            </Text>
          </View>
        )}
      </>
    );
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Clock size={14} color={colors.primary} />
          </View>
          <View style={styles.headerTitleCol}>
            <Text style={styles.title} numberOfLines={1}>Departure Planner</Text>
            <Text style={styles.subTitle} numberOfLines={1}>Best time to leave</Text>
          </View>
        </View>
        {departure && (
          <View style={styles.badgeWrapper}>
            <Badge variant="primary" size="sm">
              Best: {departure.relative}
            </Badge>
          </View>
        )}
      </View>

      {renderBody()}
    </Card>
  );
};

export const WhatIfPlanner = React.memo(WhatIfPlannerBase);

const styles = StyleSheet.create({
  container: {
    padding: spacing.cardPadding,
    marginBottom: spacing.lg,
    borderRadius: spacing.radius.xl
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    minWidth: 0
  },
  headerTitleCol: {
    flex: 1,
    minWidth: 0
  },
  badgeWrapper: {
    flexShrink: 0
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  title: {
    fontSize: 12,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright
  },
  subTitle: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 1
  },
  scenarioList: {
    gap: spacing.xs,
    marginBottom: spacing.md
  },
  scenarioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  scenarioCardOptimal: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryFaint
  },
  scenarioCardSelected: {
    borderWidth: 1.5,
    borderColor: colors.primary
  },
  scenarioLeft: {
    flex: 1
  },
  scenarioHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2
  },
  offsetLabel: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.text.primary
  },
  offsetLabelOptimal: {
    color: colors.primaryBright
  },
  optimalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primarySoft,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: 5,
    paddingVertical: 1
  },
  optimalTagText: {
    fontSize: 9,
    fontWeight: typography.weights.extrabold,
    color: colors.primary
  },
  scenarioEta: {
    fontSize: 11,
    color: colors.text.secondary
  },
  scenarioEtaVal: {
    fontWeight: typography.weights.bold,
    color: colors.text.bright
  },
  scenarioRight: {
    alignItems: 'flex-end'
  },
  savingsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primarySoft,
    borderRadius: spacing.radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3
  },
  savingsText: {
    fontSize: 11,
    fontWeight: typography.weights.extrabold,
    color: colors.primary
  },
  delayText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.dangerBright
  },
  baselineText: {
    fontSize: 11,
    color: colors.text.muted
  },
  recommendationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: spacing.radius.lg,
    padding: spacing.md
  },
  recommendationText: {
    fontSize: typography.sizes.caption,
    lineHeight: 18,
    color: colors.text.bright,
    flex: 1
  }
});
