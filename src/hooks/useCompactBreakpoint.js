import { Grid } from 'antd';

/** Desktop layout từ breakpoint lg (≥992px). */
export function useCompactBreakpoint() {
  const screens = Grid.useBreakpoint();
  const isDesktop = screens.lg !== false;
  const isTablet = Boolean(screens.md) && screens.lg === false;
  const isMobile = screens.md === false;

  return {
    screens,
    isDesktop,
    isTablet,
    isMobile,
    isCompact: !isDesktop,
  };
}
