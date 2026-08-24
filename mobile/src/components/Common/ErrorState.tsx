import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface ErrorStateProps {
  /** Human-readable failure reason. Never fabricate a fallback value here. */
  message: string;
  title?: string;
  onRetry?: () => void;
  retryLabel?: string;
  /** `inline` renders inside a card slot; `screen` fills the viewport. */
  variant?: 'inline' | 'screen';
}

/**
 * Canonical failure surface. Rendered whenever a fetch rejects, in place of the
 * plausible-looking placeholder data the components used to invent.
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  title = 'Unable to load data',
  onRetry,
  retryLabel = 'Retry',
  variant = 'inline'
}) => (
  <View
    style={[styles.container, variant === 'screen' && styles.screen]}
    accessibilityRole="alert"
    accessibilityLiveRegion="polite"
  >
    <View style={styles.iconBox}>
      <AlertTriangle size={20} color={colors.danger} />
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
    {onRetry && (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onRetry}
        style={styles.retryButton}
        hitSlop={spacing.hitSlop}
        accessibilityRole="button"
        accessibilityLabel={retryLabel}
      >
        <RefreshCw size={14} color={colors.text.onAccent} />
        <Text style={styles.retryText}>{retryLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: colors.background,
    marginBottom: 0
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: spacing.radius.md,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md
  },
  title: {
    fontSize: typography.sizes.label,
    lineHeight: typography.line.label,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center'
  },
  message: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.xl,
    minHeight: spacing.touchTargetMin,
    justifyContent: 'center',
    marginTop: spacing.xl
  },
  retryText: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.extrabold,
    color: colors.text.onAccent,
    letterSpacing: typography.tracking.normal,
    textTransform: 'uppercase'
  }
});
