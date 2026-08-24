import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sparkles, CheckCircle, ChevronDown, Check, X, AlertTriangle, FileText } from 'lucide-react-native';
import { RouteData } from '../../services/routingService';
import { normalizeReliability } from '../../utils/format';
import { Card } from '../Common/Card';
import { Badge } from '../Common/Badge';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface ValidatorChecks {
  layer_1_numbers: string;
  layer_2_facts: string;
  layer_3_decisions: string;
}

interface VerifiedExplanationProps {
  explanation: {
    text: string;
    provenance: string;
    validation_status: string;
    validator_checks?: ValidatorChecks;
  };
  verifiedFacts: any;
  bestRoute: RouteData;
}

const CHECK_LABELS: Record<keyof ValidatorChecks, string> = {
  layer_1_numbers: 'Layer 1: Numerical Fact Consistency',
  layer_2_facts: 'Layer 2: Road Entity Grounding',
  layer_3_decisions: 'Layer 3: Decision Safety Alignment'
};

/** A check result counts as passing only when the server says so. */
const isPass = (value: string | undefined): boolean =>
  value !== undefined && /^(pass|passed|ok|true|valid)$/i.test(value.trim());

/** The verified seal is only earned when validation explicitly passed. */
const isValidated = (status: string | undefined): boolean =>
  status !== undefined && /^(pass|passed|validated|verified|ok)$/i.test(status.trim());

const VerifiedExplanationBase: React.FC<VerifiedExplanationProps> = ({
  explanation,
  verifiedFacts,
  bestRoute
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const reliabilityPct = normalizeReliability(bestRoute.reliability?.reliability_score);
  const validated = isValidated(explanation.validation_status);

  /**
   * Render the model's actual prose. The previous version discarded
   * `explanation.text` entirely and printed four hardcoded bullets, so the
   * "zero-hallucination" panel was itself the only fabricated content on screen.
   * Sentence-splitting is presentational only — no text is invented or dropped.
   */
  const paragraphs = useMemo(() => {
    const text = (explanation.text || '').trim();
    if (!text) return [];
    return text
      .split(/\n+|(?<=\.)\s+(?=[A-Z(])/)
      .map(s => s.trim())
      .filter(Boolean);
  }, [explanation.text]);

  const checks = explanation.validator_checks;
  const checkEntries = checks
    ? (Object.keys(CHECK_LABELS) as (keyof ValidatorChecks)[]).map(key => ({
        key,
        label: CHECK_LABELS[key],
        value: checks[key]
      }))
    : [];

  /** Extra scalar facts returned by the server, rendered verbatim. */
  const extraFacts = useMemo(() => {
    if (!verifiedFacts || typeof verifiedFacts !== 'object') return [];
    return Object.entries(verifiedFacts)
      .filter(([, v]) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')
      .slice(0, 8)
      .map(([k, v]) => ({ label: k.replace(/_/g, ' '), value: String(v) }));
  }, [verifiedFacts]);

  return (
    <Card
      variant={validated ? 'glow-primary' : 'glow-fastest'}
      style={styles.container}
    >
      {/* Top Bar. The seal reflects `validation_status`, it is not decorative. */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Sparkles size={14} color={validated ? colors.primary : colors.fastest} />
          <Text style={styles.title}>WHY THIS ROUTE?</Text>
        </View>
        {validated ? (
          <Badge variant="primary" size="sm" icon={<CheckCircle size={12} color={colors.primary} />}>
            Validated
          </Badge>
        ) : (
          <Badge
            variant="fastest"
            size="sm"
            icon={<AlertTriangle size={12} color={colors.fastest} />}
          >
            {explanation.validation_status || 'Unverified'}
          </Badge>
        )}
      </View>

      {/* Model explanation, verbatim. */}
      {paragraphs.length > 0 ? (
        <View style={styles.bulletCol}>
          {paragraphs.map((line, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>{line}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noExplanation}>
          The routing engine did not return an explanation for this decision.
        </Text>
      )}

      {explanation.provenance ? (
        <Text style={styles.provenance}>Source: {explanation.provenance}</Text>
      ) : null}

      {/* Verified Facts Accordion Trigger */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setDrawerOpen(!drawerOpen)}
        style={styles.accordionButton}
        accessibilityRole="button"
        accessibilityState={{ expanded: drawerOpen }}
        accessibilityLabel="Verified facts and safety audit"
        accessibilityHint={drawerOpen ? 'Collapses the audit detail' : 'Expands the audit detail'}
      >
        <View style={styles.accordionLeft}>
          <FileText size={12} color={validated ? colors.primary : colors.fastest} />
          <Text style={styles.accordionTitle}>VERIFIED FACTS & SAFETY AUDIT</Text>
        </View>
        <ChevronDown
          size={14}
          color={colors.text.secondary}
          style={{ transform: [{ rotate: drawerOpen ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity>

      {/* Expandable Facts Table */}
      {drawerOpen && (
        <View style={styles.drawerContent}>
          <View style={styles.gridRow}>
            <Card variant="nested" style={styles.gridCell}>
              <Text style={styles.gridCellLabel}>PREDICTED ETA (P50)</Text>
              <Text style={styles.gridCellVal}>
                {bestRoute.predicted_eta_p50 ?? '—'} min
              </Text>
            </Card>
            <Card variant="nested" style={styles.gridCell}>
              <Text style={styles.gridCellLabel}>CONGESTION INDEX</Text>
              <Text style={[styles.gridCellVal, { color: colors.primary }]}>
                {bestRoute.avg_congestion === undefined || bestRoute.avg_congestion === null
                  ? '—'
                  : `${Math.round(bestRoute.avg_congestion)}%`}
              </Text>
            </Card>
          </View>
          <View style={styles.gridRow}>
            <Card variant="nested" style={styles.gridCell}>
              <Text style={styles.gridCellLabel}>RELIABILITY INDEX</Text>
              <Text style={styles.gridCellVal}>
                {bestRoute.reliability ? `${reliabilityPct}%` : '—'}
              </Text>
            </Card>
            <Card variant="nested" style={styles.gridCell}>
              <Text style={styles.gridCellLabel}>20M FORECAST</Text>
              <Text style={[styles.gridCellVal, { color: colors.fastest }]}>
                {bestRoute.forecast_20m_p50 === undefined || bestRoute.forecast_20m_p50 === null
                  ? '—'
                  : `${Math.round(bestRoute.forecast_20m_p50)}%`}
              </Text>
            </Card>
          </View>

          {/* Validation Checklist — each row reflects the server's own result. */}
          <Card variant="nested" style={styles.checklistCard}>
            <Text style={styles.checklistHeader}>3-LAYER VALIDATOR ENGINE CHECKS:</Text>
            {checkEntries.length === 0 ? (
              <Text style={styles.checklistEmpty}>
                The server did not report per-layer validator results.
              </Text>
            ) : (
              checkEntries.map(({ key, label, value }) => {
                const passed = isPass(value);
                return (
                  <View key={key} style={styles.checkItem}>
                    <View style={styles.checkItemLeft}>
                      {passed ? (
                        <Check size={12} color={colors.primary} />
                      ) : (
                        <X size={12} color={colors.danger} />
                      )}
                      <Text style={styles.checkItemText}>{label}</Text>
                    </View>
                    <Text style={[styles.passTag, !passed && styles.failTag]}>
                      {value ? value.toUpperCase() : 'NOT REPORTED'}
                    </Text>
                  </View>
                );
              })
            )}
          </Card>

          {/* Raw verified facts from the payload. */}
          {extraFacts.length > 0 && (
            <Card variant="nested" style={styles.checklistCard}>
              <Text style={styles.checklistHeader}>GROUNDED FACTS FROM PAYLOAD:</Text>
              {extraFacts.map(fact => (
                <View key={fact.label} style={styles.checkItem}>
                  <Text style={styles.factLabel} numberOfLines={1}>
                    {fact.label}
                  </Text>
                  <Text style={styles.factValue} numberOfLines={1}>
                    {fact.value}
                  </Text>
                </View>
              ))}
            </Card>
          )}
        </View>
      )}
    </Card>
  );
};

export const VerifiedExplanation = React.memo(VerifiedExplanationBase);

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.md
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  title: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright,
    letterSpacing: typography.tracking.normal
  },
  bulletCol: {
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm
  },
  bulletDot: {
    fontSize: typography.sizes.body,
    lineHeight: typography.line.caption,
    fontWeight: typography.weights.extrabold,
    color: colors.primary
  },
  bulletText: {
    flex: 1,
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    color: colors.text.body
  },
  noExplanation: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginBottom: spacing.md
  },
  provenance: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.muted,
    marginBottom: spacing.lg
  },
  accordionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    minHeight: spacing.touchTargetMin,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1
  },
  accordionTitle: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.secondary,
    letterSpacing: typography.tracking.normal
  },
  drawerContent: {
    marginTop: spacing.lg,
    gap: spacing.sm
  },
  gridRow: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  gridCell: {
    flex: 1,
    padding: spacing.md
  },
  gridCellLabel: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted
  },
  gridCellVal: {
    fontSize: typography.sizes.label,
    lineHeight: typography.line.label,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright,
    marginTop: 2
  },
  checklistCard: {
    gap: spacing.sm
  },
  checklistHeader: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted,
    marginBottom: 2
  },
  checklistEmpty: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.secondary,
    fontStyle: 'italic'
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  checkItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1
  },
  checkItemText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.body,
    flex: 1
  },
  passTag: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    color: colors.primary
  },
  failTag: {
    color: colors.danger
  },
  factLabel: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    color: colors.text.secondary,
    textTransform: 'capitalize',
    flex: 1
  },
  factValue: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.bold,
    color: colors.text.body,
    maxWidth: '50%'
  }
});
