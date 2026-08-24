import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield, Server, Cpu, Database, CheckCircle2, HelpCircle } from 'lucide-react-native';
import { useNavigationStore } from '../../store/navigationStore';
import { Card } from '../Common/Card';
import { Badge } from '../Common/Badge';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

/** `null` renders as "Not reported" instead of a plausible-looking default. */
interface ChainRow {
  key: string;
  icon: React.ReactNode;
  name: string;
  value: string | null;
  color: string;
}

const ProvenanceTrackerBase: React.FC = () => {
  const routingData = useNavigationStore(s => s.routingData);

  const rows: ChainRow[] = [
    {
      key: 'routing',
      icon: <Server size={14} color={colors.primary} />,
      name: 'OSRM Candidate Engine',
      value: routingData?.routing_provenance ? `${routingData.routing_provenance} TIER` : null,
      color: colors.primary
    },
    {
      key: 'forecast',
      icon: <Cpu size={14} color={colors.fastest} />,
      name: 'Forecasting Backbone',
      value: routingData?.forecasting_model ?? null,
      color: colors.fastest
    },
    {
      key: 'traffic',
      icon: <Database size={14} color={colors.info} />,
      name: 'Live Traffic Telemetry',
      value: routingData?.traffic_provenance ? `${routingData.traffic_provenance} MODE` : null,
      color: colors.info
    },
    {
      key: 'validator',
      icon: <CheckCircle2 size={14} color={colors.primary} />,
      name: 'AI Safety Validator',
      value: routingData?.explanation?.validation_status ?? null,
      color: colors.primary
    }
  ];

  const allReported = rows.every(r => r.value !== null);

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Shield size={14} color={colors.info} />
          <Text style={styles.title}>SYSTEM PROVENANCE & DATA CHAIN</Text>
        </View>
        {/* The badge now reflects whether the chain was actually reported. */}
        <Badge variant={allReported ? 'info' : 'neutral'} size="sm">
          {allReported ? 'Complete' : 'Partial'}
        </Badge>
      </View>

      <View style={styles.chainList}>
        {rows.map(row => (
          <Card variant="nested" key={row.key} style={styles.chainItem}>
            <View style={styles.chainLeft}>
              {row.value === null ? <HelpCircle size={14} color={colors.text.muted} /> : row.icon}
              <Text style={styles.chainName}>{row.name}</Text>
            </View>
            <Text
              style={[
                styles.chainVal,
                { color: row.value === null ? colors.text.muted : row.color }
              ]}
              numberOfLines={1}
            >
              {row.value ?? 'Not reported'}
            </Text>
          </Card>
        ))}
      </View>
    </Card>
  );
};

export const ProvenanceTracker = React.memo(ProvenanceTrackerBase);

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
  chainList: {
    gap: spacing.sm
  },
  chainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  chainLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1
  },
  chainName: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    color: colors.text.body,
    flexShrink: 1
  },
  chainVal: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.extrabold,
    maxWidth: '45%',
    textAlign: 'right'
  }
});
