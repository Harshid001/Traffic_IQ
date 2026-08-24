import { TextStyle } from 'react-native';

/**
 * Type scale. Nothing below `micro` (11) may be used for text — sub-11px labels
 * are unreadable on a phone in a moving vehicle and were the single largest
 * legibility defect in the original code.
 *
 * `lineHeight` values are paired with each size so multi-line text never
 * collapses; use `typography.line.<size>` alongside `typography.sizes.<size>`.
 */
export const typography = {
  sizes: {
    hero: 32,
    h1: 24,
    h2: 20,
    h3: 16,
    body: 14,
    label: 13,
    caption: 12,
    /** Absolute minimum readable size. Use for uppercase eyebrow labels only. */
    micro: 11
  },
  line: {
    hero: 38,
    h1: 30,
    h2: 26,
    h3: 22,
    body: 20,
    label: 18,
    caption: 17,
    micro: 15
  },
  weights: {
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
    extrabold: '800' as TextStyle['fontWeight']
  },
  tracking: {
    tight: 0.2,
    normal: 0.5,
    wide: 1
  }
};
