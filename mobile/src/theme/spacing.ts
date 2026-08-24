/**
 * Layout scale. `touchTargetMin` (44) is the Apple HIG / WCAG 2.5.5 minimum;
 * anything smaller must compensate with `hitSlop`.
 */
export const spacing = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 14,
  xxl: 20,

  touchTargetMin: 44,
  touchTargetComfortable: 56,
  cardPadding: 14,
  cardPaddingLg: 20,

  /**
   * Expands the pressable area of controls that are visually smaller than
   * `touchTargetMin` without changing their layout footprint.
   * A 32x32 icon button + 6px slop on each side = 44x44 effective.
   */
  hitSlop: { top: 6, bottom: 6, left: 6, right: 6 },
  hitSlopLarge: { top: 10, bottom: 10, left: 10, right: 10 },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    pill: 999
  }
};
