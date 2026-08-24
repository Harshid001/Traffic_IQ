import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, DimensionValue, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = spacing.radius.sm,
  style
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.75,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true
        })
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity
        },
        style
      ]}
    />
  );
};

export const RouteCardsSkeleton: React.FC = () => (
  <View style={styles.container}>
    {/* Header Skeleton */}
    <View style={styles.headerRow}>
      <Skeleton width={160} height={24} borderRadius={spacing.radius.sm} />
      <Skeleton width={80} height={24} borderRadius={spacing.radius.pill} />
    </View>

    {/* Best Route Card Skeleton */}
    <View style={styles.cardSkeleton}>
      <View style={styles.cardTopRow}>
        <Skeleton width={100} height={20} borderRadius={spacing.radius.pill} />
        <Skeleton width={70} height={16} borderRadius={spacing.radius.sm} />
      </View>
      <Skeleton width="75%" height={22} style={{ marginTop: spacing.md }} />
      <Skeleton width="50%" height={14} style={{ marginTop: spacing.xs }} />

      <View style={styles.statGrid}>
        <View style={styles.statCol}>
          <Skeleton width="80%" height={12} />
          <Skeleton width="100%" height={26} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.statCol}>
          <Skeleton width="80%" height={12} />
          <Skeleton width="100%" height={26} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.statCol}>
          <Skeleton width="80%" height={12} />
          <Skeleton width="100%" height={26} style={{ marginTop: 4 }} />
        </View>
      </View>
    </View>

    {/* Fastest Route Card Skeleton */}
    <View style={styles.cardSkeleton}>
      <View style={styles.cardTopRow}>
        <Skeleton width={110} height={20} borderRadius={spacing.radius.pill} />
        <Skeleton width={60} height={16} borderRadius={spacing.radius.sm} />
      </View>
      <Skeleton width="65%" height={20} style={{ marginTop: spacing.md }} />
      <Skeleton width="45%" height={14} style={{ marginTop: spacing.xs }} />
    </View>

    {/* Tradeoff matrix placeholder */}
    <View style={[styles.cardSkeleton, { height: 120 }]}>
      <Skeleton width="40%" height={16} />
      <Skeleton width="100%" height={40} style={{ marginTop: spacing.lg }} />
    </View>
  </View>
);

export const TrafficTimelineSkeleton: React.FC = () => (
  <View style={styles.container}>
    <View style={styles.headerRow}>
      <Skeleton width={180} height={24} />
      <Skeleton width={90} height={24} borderRadius={spacing.radius.pill} />
    </View>

    <View style={[styles.cardSkeleton, { height: 180 }]}>
      <Skeleton width="50%" height={18} />
      <Skeleton width="100%" height={80} style={{ marginTop: spacing.xl }} />
    </View>

    <View style={[styles.cardSkeleton, { height: 160 }]}>
      <Skeleton width="60%" height={18} />
      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, alignItems: 'flex-end', height: 70 }}>
        {[40, 70, 90, 50, 60, 30].map((h, i) => (
          <Skeleton key={i} width="12%" height={`${h}%` as any} borderRadius={4} />
        ))}
      </View>
    </View>
  </View>
);

export const InsightsSkeleton: React.FC = () => (
  <View style={styles.container}>
    <View style={styles.headerRow}>
      <Skeleton width={160} height={24} />
    </View>
    <Skeleton width="70%" height={14} style={{ marginBottom: spacing.lg }} />

    <View style={[styles.cardSkeleton, { height: 200 }]}>
      <Skeleton width="45%" height={18} />
      <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
        <Skeleton width="100%" height={40} borderRadius={spacing.radius.md} />
        <Skeleton width="100%" height={40} borderRadius={spacing.radius.md} />
        <Skeleton width="100%" height={40} borderRadius={spacing.radius.md} />
      </View>
    </View>

    <View style={[styles.cardSkeleton, { height: 140 }]}>
      <Skeleton width="50%" height={18} />
      <Skeleton width="100%" height={50} style={{ marginTop: spacing.lg }} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.borderStrong
  },
  container: {
    flex: 1,
    padding: spacing.cardPadding,
    gap: spacing.lg
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs
  },
  cardSkeleton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.xl,
    padding: spacing.cardPadding
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  statGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  statCol: {
    flex: 1
  }
});
