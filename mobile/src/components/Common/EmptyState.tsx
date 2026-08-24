import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'inline' | 'screen';
}

/**
 * Shown when a request succeeded but returned nothing. Distinct from
 * `ErrorState` so the driver can tell "no data" from "request failed".
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
  actionLabel,
  onAction,
  variant = 'inline'
}) => (
  <View style={[styles.container, variant === 'screen' && styles.screen]}>
    <View style={styles.iconBox}>{icon ?? <Inbox size={20} color={colors.text.secondary} />}</View>
    <Text style={styles.title}>{title}</Text>
    {message && <Text style={styles.message}>{message}</Text>}
    {actionLabel && onAction && (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onAction}
        style={styles.actionButton}
        hitSlop={spacing.hitSlop}
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
      >
        <Text style={styles.actionText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
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
  actionButton: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.xl,
    minHeight: spacing.touchTargetMin,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl
  },
  actionText: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.extrabold,
    color: colors.primary,
    letterSpacing: typography.tracking.normal,
    textTransform: 'uppercase'
  }
});
