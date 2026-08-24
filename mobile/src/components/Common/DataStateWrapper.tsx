import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { RefreshCw, WifiOff, Clock } from 'lucide-react-native';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface DataStateWrapperProps {
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  isStale?: boolean;
  lastUpdatedAt?: number | null;
  onRetry?: () => void;
  retryLabel?: string;
  skeleton?: React.ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  errorTitle?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'screen' | 'inline';
}

function formatTimeAgo(timestampMs: number | null | undefined): string {
  if (!timestampMs) return 'recently';
  const sec = Math.max(0, Math.floor((Date.now() - timestampMs) / 1000));
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}

export const DataStateWrapper: React.FC<DataStateWrapperProps> = ({
  isLoading = false,
  error = null,
  isEmpty = false,
  isStale = false,
  lastUpdatedAt = null,
  onRetry,
  retryLabel = 'Retry',
  skeleton,
  emptyTitle = 'No data available',
  emptyMessage = 'No items found for this selection.',
  emptyIcon,
  errorTitle = 'Unable to load data',
  children,
  style,
  variant = 'screen'
}) => {
  // 1. Loading State (with Skeleton or Activity Indicator)
  if (isLoading) {
    if (skeleton) {
      return <View style={[styles.container, style]}>{skeleton}</View>;
    }
    return (
      <View style={[styles.container, styles.centered, style]}>
        <RefreshCw size={24} color={colors.primary} />
      </View>
    );
  }

  // 2. Hard Error State (no data available to show)
  if (error && !children) {
    return (
      <View style={[styles.container, variant === 'screen' && styles.centered, style]}>
        <ErrorState
          title={errorTitle}
          message={error}
          onRetry={onRetry}
          retryLabel={retryLabel}
          variant={variant}
        />
      </View>
    );
  }

  // 3. Empty State
  if (isEmpty && !children) {
    return (
      <View style={[styles.container, variant === 'screen' && styles.centered, style]}>
        <EmptyState
          title={emptyTitle}
          message={emptyMessage}
          icon={emptyIcon}
          actionLabel={onRetry ? retryLabel : undefined}
          onAction={onRetry}
        />
      </View>
    );
  }

  // 4. Stale Cache / Normal Content
  return (
    <View style={[styles.container, style]}>
      {isStale && (
        <View style={styles.staleBanner}>
          <View style={styles.staleLeft}>
            <WifiOff size={12} color={colors.fastest} />
            <Text style={styles.staleText}>
              Offline Cache · Last updated {formatTimeAgo(lastUpdatedAt)}
            </Text>
          </View>
          {onRetry && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onRetry}
              style={styles.staleRetryBtn}
              hitSlop={spacing.hitSlop}
              accessibilityRole="button"
              accessibilityLabel="Refresh live data"
            >
              <RefreshCw size={10} color={colors.primary} />
              <Text style={styles.staleRetryText}>Refresh</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  centered: {
    justifyContent: 'center',
    padding: spacing.cardPadding
  },
  staleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.fastestFaint,
    borderBottomWidth: 1,
    borderBottomColor: colors.fastestBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    zIndex: 10
  },
  staleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1
  },
  staleText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.semibold,
    color: colors.fastestBright
  },
  staleRetryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primarySoft,
    borderRadius: spacing.radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  staleRetryText: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro,
    fontWeight: typography.weights.bold,
    color: colors.primary
  }
});
