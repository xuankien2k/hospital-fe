import { Grid } from 'antd';

/** Desktop giữ layout bảng/chart hiện tại từ breakpoint lg (≥992px). */
export function useReportBreakpoint() {
  const screens = Grid.useBreakpoint();
  // Khi chưa đo viewport (SSR / first paint), mặc định desktop để tránh flash mobile.
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
