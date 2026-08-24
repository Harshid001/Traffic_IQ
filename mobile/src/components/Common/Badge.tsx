import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface BadgeProps {
  variant?: 'primary' | 'fastest' | 'warning' | 'danger' | 'info' | 'neutral';
  children: React.ReactNode;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  size?: 'sm' | 'md';
  /** `pill` is fully rounded; `tag` uses a small radius for inline labels. */
  shape?: 'pill' | 'tag';
}

/**
 * The single badge recipe. Previously dead code while the emerald badge block
 * was retyped in 11 components.
 */
const BadgeBase: React.FC<BadgeProps> = ({
  variant = 'primary',
  children,
  icon,
  style,
  size = 'md',
  shape = 'pill'
}) => {
  const containerStyle = {
    fastest: styles.fastest,
    warning: styles.warning,
    danger: styles.danger,
    info: styles.info,
    neutral: styles.neutral,
    primary: styles.primary
  }[variant];

  const labelStyle = {
    fastest: styles.fastestText,
    warning: styles.warningText,
    danger: styles.dangerText,
    info: styles.infoText,
    neutral: styles.neutralText,
    primary: styles.primaryText
  }[variant];

  return (
    <View
      style={[
        styles.badge,
        containerStyle,
        shape === 'tag' ? styles.shapeTag : styles.shapePill,
        size === 'sm' ? styles.sizeSm : styles.sizeMd,
        style
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.text, labelStyle, size === 'sm' ? styles.textSm : styles.textMd]}>
        {children}
      </Text>
    </View>
  );
};

export const Badge = React.memo(BadgeBase);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    alignSelf: 'flex-start'
  },
  shapePill: {
    borderRadius: spacing.radius.pill
  },
  shapeTag: {
    borderRadius: spacing.radius.sm
  },
  sizeSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  sizeMd: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs
  },
  iconContainer: {
    marginRight: spacing.xs
  },
  text: {
    fontWeight: typography.weights.bold,
    letterSpacing: typography.tracking.normal,
    textTransform: 'uppercase'
  },
  textSm: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.line.micro
  },
  textMd: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption
  },
  primary: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder
  },
  primaryText: {
    color: colors.primaryBright
  },
  fastest: {
    backgroundColor: colors.fastestSoft,
    borderColor: colors.fastestBorder
  },
  fastestText: {
    color: colors.fastestBright
  },
  warning: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warningBorder
  },
  warningText: {
    color: colors.warningBright
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerBorder
  },
  dangerText: {
    color: colors.dangerBright
  },
  info: {
    backgroundColor: colors.infoSoft,
    borderColor: colors.infoBorder
  },
  infoText: {
    color: colors.infoBright
  },
  neutral: {
    backgroundColor: colors.neutral,
    borderColor: colors.borderStrong
  },
  neutralText: {
    color: colors.text.secondary
  }
});
