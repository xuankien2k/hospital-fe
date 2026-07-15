import React from 'react';
import { TREND_SCROLL_THRESHOLD } from '../utils/trendsChartHelpers';

const TrendChartScroll = ({ pointCount, compact = false, children }) => {
  const dense = pointCount > TREND_SCROLL_THRESHOLD;
  const minPointWidth = compact ? 44 : 56;
  const minContentWidth = pointCount * minPointWidth;

  return (
    <div className={`trends-chart-wrap${dense ? ' trends-chart-wrap--scroll' : ''}`}>
      <div
        className="trends-chart-wrap__inner"
        style={dense ? { width: `max(100%, ${minContentWidth}px)` } : { width: '100%' }}
      >
        {children({ width: undefined })}
      </div>
    </div>
  );
};

export default TrendChartScroll;
