import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Sparkles, MessageSquare, Check, HelpCircle, ArrowRight } from 'lucide-react-native';
import { useNavigationStore } from '../store/navigationStore';
import { WhatIfPlanner } from '../components/Insights/WhatIfPlanner';
import { ReliabilityScorecard } from '../components/Insights/ReliabilityScorecard';
import { ProvenanceTracker } from '../components/Insights/ProvenanceTracker';
import { DataStateWrapper } from '../components/Common/DataStateWrapper';
import { InsightsSkeleton } from '../components/Common/SkeletonLoader';
import { Card } from '../components/Common/Card';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

const COPILOT_QUESTIONS = [
  {
    id: 'q1',
    query: 'When is traffic lightest today?',
    answer: 'Optimal departure window is before 8:00 AM or after 8:15 PM to avoid peak highway delays.'
  },
  {
    id: 'q2',
    query: 'How much do I save taking the best route?',
    answer: 'The recommended Smart Route saves ~12–16 mins by avoiding the central junction bottleneck.'
  },
  {
    id: 'q3',
    query: 'Are there any toll-free alternatives?',
    answer: 'Yes, check the Routes tab for alternate bypass corridors with ₹0 tolls.'
  }
];

export const InsightsScreen: React.FC = () => {
  const routingData = useNavigationStore(s => s.routingData);
  const selectedRouteId = useNavigationStore(s => s.selectedRouteId);
  const isLoadingRoutes = useNavigationStore(s => s.isLoadingRoutes);
  const routesError = useNavigationStore(s => s.routesError);
  const fetchRoutes = useNavigationStore(s => s.fetchRoutes);
  const selectedCorridor = useNavigationStore(s => s.selectedCorridor);

  const [activeQueryId, setActiveQueryId] = useState<string | null>(null);

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
      errorTitle="Copilot insights unavailable"
      isEmpty={!isLoadingRoutes && !routesError && !selectedRoute}
      emptyTitle="No active trip"
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
          <View style={styles.contentWrapper}>
            {/* Header */}
            <View style={styles.screenHeader}>
            <View style={styles.titleRow}>
              <Sparkles size={18} color={colors.primary} />
              <Text style={styles.titleText}>Driving Copilot</Text>
            </View>
            <Text style={styles.subText}>
              Departure planning, reliability bounds & smart driver assistant
            </Text>
          </View>

          {/* Interactive Copilot Quick Queries */}
          <Card style={styles.queriesCard}>
            <View style={styles.queriesHeader}>
              <MessageSquare size={14} color={colors.primary} />
              <Text style={styles.queriesTitle}>ASK SMART COPILOT</Text>
            </View>

            <View style={styles.queryPillsRow}>
              {COPILOT_QUESTIONS.map(item => {
                const isActive = activeQueryId === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.75}
                    onPress={() => setActiveQueryId(isActive ? null : item.id)}
                    style={[styles.queryPill, isActive && styles.queryPillActive]}
                  >
                    <Text style={[styles.queryPillText, isActive && styles.queryPillTextActive]}>
                      {item.query}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {activeQueryId && (
              <View style={styles.answerBox}>
                <View style={styles.answerIcon}>
                  <Sparkles size={13} color={colors.primaryBright} />
                </View>
                <Text style={styles.answerText}>
                  {COPILOT_QUESTIONS.find(q => q.id === activeQueryId)?.answer}
                </Text>
              </View>
            )}
          </Card>

          {/* Smart Departure Assistant */}
          <WhatIfPlanner />

          {/* Driver On-Time Confidence Scorecard */}
          <ReliabilityScorecard route={selectedRoute} />

          {/* System Feeds & Engine Provenance */}
          <ProvenanceTracker />
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
    paddingBottom: spacing.xxl
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 580,
    alignSelf: 'center'
  },
  screenHeader: {
    marginBottom: spacing.lg
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
  queriesCard: {
    padding: spacing.cardPadding,
    marginBottom: spacing.lg,
    borderRadius: spacing.radius.xl
  },
  queriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm
  },
  queriesTitle: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright,
    letterSpacing: 0.5
  },
  queryPillsRow: {
    gap: spacing.xs
  },
  queryPill: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  queryPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaint
  },
  queryPillText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary
  },
  queryPillTextActive: {
    color: colors.primaryBright,
    fontWeight: typography.weights.bold
  },
  answerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: spacing.radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryBorder
  },
  answerIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1
  },
  answerText: {
    flex: 1,
    fontSize: typography.sizes.caption,
    lineHeight: 18,
    color: colors.text.bright,
    fontWeight: typography.weights.medium
  }
});
