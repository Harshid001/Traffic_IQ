import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface LoadingStateProps {
  message?: string;
  variant?: 'inline' | 'screen';
  size?: 'small' | 'large';
}

/** Canonical pending surface, announced to screen readers. */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  variant = 'inline',
  size = 'large'
}) => (
  <View
    style={[styles.container, variant === 'screen' && styles.screen]}
    accessibilityRole="progressbar"
    accessibilityLabel={message || 'Loading'}
    accessibilityLiveRegion="polite"
  >
    <ActivityIndicator size={size} color={colors.primary} />
    {message && <Text style={styles.message}>{message}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  message: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.line.caption,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    textAlign: 'center'
  }
});
