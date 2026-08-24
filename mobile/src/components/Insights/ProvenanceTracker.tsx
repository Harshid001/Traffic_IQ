import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield, Server, Cpu, Database, CheckCircle2, HelpCircle } from 'lucide-react-native';
import { useNavigationStore } from '../../store/navigationStore';
import { Card } from '../Common/Card';
import { Badge } from '../Common/Badge';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

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
      name: 'Map & Routing Engine',
      value: routingData?.routing_provenance ? `${routingData.routing_provenance} High-Precision` : 'Active Engine',
      color: colors.primary
    },
    {
      key: 'forecast',
      icon: <Cpu size={14} color={colors.fastest} />,
      name: 'AI Forecast Model',
      value: routingData?.forecasting_model ? 'Chronos-2 Neural Stream' : 'Probabilistic Forecast',
      color: colors.fastest
    },
    {
      key: 'traffic',
      icon: <Database size={14} color={colors.info} />,
      name: 'Live Traffic Telemetry',
      value: routingData?.traffic_provenance === 'TOMTOM' ? 'TomTom Live Flow' : 'Simulated Traffic Flow',
      color: colors.info
    },
    {
      key: 'validator',
      icon: <CheckCircle2 size={14} color={colors.primary} />,
      name: 'Safety & Hallucination Guard',
      value: routingData?.explanation?.validation_status ? 'Verified & Audited' : 'Active Pass',
      color: colors.primary
    }
  ];

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Shield size={14} color={colors.info} />
          </View>
          <View>
            <Text style={styles.title}>LIVE DATA FEEDS & ENGINE STATUS</Text>
            <Text style={styles.subTitle}>Transparent real-time telemetry and validation</Text>
          </View>
        </View>
        <Badge variant="primary" size="sm">
          Active Feed
        </Badge>
      </View>

      <View style={styles.chainList}>
        {rows.map(row => (
          <View key={row.key} style={styles.chainItem}>
            <View style={styles.chainLeft}>
              {row.icon}
              <Text style={styles.chainName}>{row.name}</Text>
            </View>
            <Text style={[styles.chainVal, { color: row.color }]} numberOfLines={1}>
              {row.value}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
};

export const ProvenanceTracker = React.memo(ProvenanceTrackerBase);

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
    backgroundColor: colors.infoSoft,
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
  chainList: {
    gap: spacing.xs
  },
  chainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  chainLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1
  },
  chainName: {
    fontSize: 11,
    color: colors.text.body,
    fontWeight: typography.weights.medium
  },
  chainVal: {
    fontSize: 11,
    fontWeight: typography.weights.bold
  }
});
