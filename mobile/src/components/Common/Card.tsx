import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'default' | 'glow-primary' | 'glow-fastest' | 'glow-danger' | 'nested';
  active?: boolean;
  accessibilityLabel?: string;
  disabled?: boolean;
}

/**
 * The single card recipe for the app. Previously this file was dead code while
 * the same surface/border/radius/padding block was retyped in 11 components.
 *
 * `nested` is the inner-cell variant (a card inside a card).
 */
export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  active = false,
  accessibilityLabel,
  disabled = false
}) => {
  const variantStyle = {
    'glow-primary': styles.glowPrimary,
    'glow-fastest': styles.glowFastest,
    'glow-danger': styles.glowDanger,
    nested: styles.nested,
    default: styles.defaultCard
  }[variant];

  const cardContent = (
    <View style={[styles.card, variantStyle, active && styles.activeCard, style]}>{children}</View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected: active, disabled }}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.cardPadding
  },
  defaultCard: {
    borderColor: colors.border
  },
  nested: {
    backgroundColor: colors.card,
    borderRadius: spacing.radius.md,
    padding: spacing.lg
  },
  glowPrimary: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryTint
  },
  glowFastest: {
    borderColor: colors.fastestBorder,
    backgroundColor: colors.fastestTint
  },
  glowDanger: {
    borderColor: colors.dangerBorder,
    backgroundColor: colors.dangerTint
  },
  activeCard: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    backgroundColor: colors.primaryFaint
  }
});
