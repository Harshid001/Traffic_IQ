import { useWindowDimensions } from 'react-native';

/** Breakpoint above which we treat the viewport as a large phone / tablet. */
const WIDE_BREAKPOINT = 400;
const NARROW_BREAKPOINT = 340;

export interface Layout {
  width: number;
  height: number;
  /** True on small phones (iPhone SE class) where labels must shrink. */
  isNarrow: boolean;
  /** True on large phones and tablets where labels can breathe. */
  isWide: boolean;
  /** Width cap for centred dialogs, never wider than the viewport minus gutters. */
  dialogMaxWidth: number;
  /**
   * Proportional cap for inline truncating labels (route names, segment names).
   * Replaces hardcoded pixel maxWidths that clipped text on small screens and
   * wasted space on large ones.
   */
  labelMaxWidth: number;
}

/**
 * Single source of responsive layout facts.
 *
 * The original code hardcoded `maxWidth` values (110, 120, 150, 155, 160, 180,
 * 220, 360) with no reference to the actual viewport, so the same label was
 * clipped on a 320pt screen and left a gap on a 430pt one.
 */
export function useLayout(): Layout {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    isNarrow: width < NARROW_BREAKPOINT,
    isWide: width >= WIDE_BREAKPOINT,
    dialogMaxWidth: Math.min(360, width - 40),
    labelMaxWidth: Math.round(width * 0.42)
  };
}
