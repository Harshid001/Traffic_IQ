import { useWindowDimensions } from 'react-native';

const WIDE_BREAKPOINT = 480;
const NARROW_BREAKPOINT = 350;
const TABLET_BREAKPOINT = 768;

export interface Layout {
  width: number;
  height: number;
  isNarrow: boolean;
  isWide: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  dialogMaxWidth: number;
  labelMaxWidth: number;
  sheetMaxHeight: number;
}

export function useLayout(): Layout {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    isNarrow: width < NARROW_BREAKPOINT,
    isWide: width >= WIDE_BREAKPOINT,
    isTablet: width >= TABLET_BREAKPOINT && width < 1024,
    isDesktop: width >= 1024,
    dialogMaxWidth: Math.min(420, width - 32),
    labelMaxWidth: Math.round(width * 0.45),
    sheetMaxHeight: Math.min(560, Math.round(height * 0.78))
  };
}
