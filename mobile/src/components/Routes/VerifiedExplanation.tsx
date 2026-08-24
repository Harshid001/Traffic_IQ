import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sparkles, CheckCircle, ChevronDown, Check, X, AlertTriangle, ShieldCheck } from 'lucide-react-native';
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
  layer_1_numbers: 'Trip Numbers & ETA Accuracy',
  layer_2_facts: 'Road Entity & Intersection Grounding',
  layer_3_decisions: 'Safety & Traffic Rule Alignment'
};

const isPass = (value: string | undefined): boolean =>
  value !== undefined && /^(pass|passed|ok|true|valid)$/i.test(value.trim());

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

  const extraFacts = useMemo(() => {
    if (!verifiedFacts || typeof verifiedFacts !== 'object') return [];
    return Object.entries(verifiedFacts)
      .filter(([, v]) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')
      .slice(0, 8)
      .map(([k, v]) => ({ label: k.replace(/_/g, ' '), value: String(v) }));
  }, [verifiedFacts]);

  return (
    <Card variant={validated ? 'glow-primary' : 'glow-fastest'} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Sparkles size={14} color={colors.primaryBright} />
          </View>
          <View>
            <Text style={styles.title}>AI DRIVING COPILOT ANALYSIS</Text>
            <Text style={styles.subTitle}>Why this recommendation was chosen</Text>
          </View>
        </View>
        {validated ? (
          <Badge variant="primary" size="sm" icon={<ShieldCheck size={12} color={colors.primary} />}>
            Verified Smart Route
          </Badge>
        ) : (
          <Badge variant="fastest" size="sm" icon={<AlertTriangle size={12} color={colors.fastest} />}>
            {explanation.validation_status || 'Unverified'}
          </Badge>
        )}
      </View>

      {/* Model explanation bullets */}
      {paragraphs.length > 0 ? (
        <View style={styles.bulletCol}>
          {paragraphs.map((line, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <View style={styles.bulletIcon}>
                <Check size={12} color={colors.primary} strokeWidth={3} />
              </View>
              <Text style={styles.bulletText}>{line}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noExplanation}>
          Optimal recommendation selected based on live TomTom congestion data.
        </Text>
      )}

      {/* Verified Data Drawer Trigger */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => setDrawerOpen(!drawerOpen)}
        style={styles.accordionButton}
        accessibilityRole="button"
        accessibilityState={{ expanded: drawerOpen }}
      >
        <View style={styles.accordionLeft}>
          <ShieldCheck size={14} color={colors.primary} />
          <Text style={styles.accordionLabel}>Verified Route Safety & Multi-Layer Audit</Text>
        </View>
        <ChevronDown
          size={16}
          color={colors.text.secondary}
          style={drawerOpen ? { transform: [{ rotate: '180deg' }] } : undefined}
        />
      </TouchableOpacity>

      {drawerOpen && (
        <View style={styles.auditDrawer}>
          {/* Validator Layers */}
          {checkEntries.length > 0 && (
            <View style={styles.checksCol}>
              <Text style={styles.drawerSectionTitle}>ENGINE VERIFICATION CHECKS</Text>
              {checkEntries.map(check => {
                const passed = isPass(check.value);
                return (
                  <View key={check.key} style={styles.checkRow}>
                    <View style={[styles.checkBadge, passed ? styles.checkBadgePass : styles.checkBadgeFail]}>
                      {passed ? (
                        <Check size={12} color={colors.primary} strokeWidth={3} />
                      ) : (
                        <X size={12} color={colors.danger} strokeWidth={3} />
                      )}
                    </View>
                    <View style={styles.checkTextCol}>
                      <Text style={styles.checkLabel}>{check.label}</Text>
                      <Text style={[styles.checkVal, passed ? styles.checkValPass : styles.checkValFail]}>
                        {check.value}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Extra Route Facts */}
          {extraFacts.length > 0 && (
            <View style={styles.factsCol}>
              <Text style={styles.drawerSectionTitle}>AUDITED NUMERICAL FACTS</Text>
              <View style={styles.factsGrid}>
                {extraFacts.map(f => (
                  <View key={f.label} style={styles.factCell}>
                    <Text style={styles.factLabel}>{f.label.toUpperCase()}</Text>
                    <Text style={styles.factVal}>{f.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </Card>
  );
};

export const VerifiedExplanation = React.memo(VerifiedExplanationBase);

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
    marginBottom: spacing.md
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold,
    color: colors.text.bright,
    letterSpacing: 0.5
  },
  subTitle: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 1
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
  bulletIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2
  },
  bulletText: {
    flex: 1,
    fontSize: typography.sizes.caption,
    lineHeight: 18,
    color: colors.text.body
  },
  noExplanation: {
    fontSize: typography.sizes.caption,
    color: colors.text.muted,
    fontStyle: 'italic',
    marginBottom: spacing.sm
  },
  accordionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border
  },
  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  accordionLabel: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary
  },
  auditDrawer: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md
  },
  drawerSectionTitle: {
    fontSize: 9,
    fontWeight: typography.weights.extrabold,
    color: colors.text.muted,
    letterSpacing: 0.5,
    marginBottom: spacing.xs
  },
  checksCol: {
    gap: spacing.xs
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: spacing.radius.sm,
    padding: spacing.sm,
    gap: spacing.sm
  },
  checkBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkBadgePass: {
    backgroundColor: colors.primarySoft
  },
  checkBadgeFail: {
    backgroundColor: colors.dangerSoft
  },
  checkTextCol: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  checkLabel: {
    fontSize: 11,
    color: colors.text.secondary
  },
  checkVal: {
    fontSize: 10,
    fontWeight: typography.weights.extrabold
  },
  checkValPass: {
    color: colors.primary
  },
  checkValFail: {
    color: colors.danger
  },
  factsCol: {
    gap: spacing.xs
  },
  factsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs
  },
  factCell: {
    backgroundColor: colors.card,
    borderRadius: spacing.radius.sm,
    padding: spacing.sm,
    minWidth: '48%',
    flex: 1
  },
  factLabel: {
    fontSize: 9,
    color: colors.text.muted,
    fontWeight: typography.weights.bold
  },
  factVal: {
    fontSize: 11,
    color: colors.text.bright,
    fontWeight: typography.weights.bold,
    marginTop: 2
  }
});
