export const TREND_LINE_WIDTH = 2;

export const TREND_SCROLL_THRESHOLD = 12;

export const TREND_POINT_SIZE = {
  compact: 5,
  desktop: 6,
};

export const countUniqueLabels = (data = [], field = 'label') =>
  new Set(data.map((item) => item?.[field]).filter(Boolean)).size;

export const isDenseTrendChart = (pointCount) => pointCount > TREND_SCROLL_THRESHOLD;

export const getTrendChartLayout = (pointCount, compact = false) => {
  const dense = isDenseTrendChart(pointCount);

  return {
    dense,
    height: compact ? (dense ? 420 : 340) : dense ? 520 : 480,
    paddingBottom: dense ? 48 : 28,
  };
};

export const buildTrendLineStyle = () => ({
  lineWidth: TREND_LINE_WIDTH,
});

export const buildTrendXAxis = (pointCount) => {
  const dense = isDenseTrendChart(pointCount);

  return {
    title: false,
    labelAutoRotate: false,
    labelAutoHide: dense
      ? { type: 'equidistance', keep: Math.min(12, Math.ceil(pointCount / 2)) }
      : false,
    labelSpacing: dense ? 10 : 6,
    size: dense ? 52 : 36,
    style: {
      labelFontSize: 11,
      labelFill: '#595959',
    },
  };
};
