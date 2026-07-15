import React, { useMemo } from 'react';
import { Line } from '@ant-design/plots';
import { BRAND_COLOR } from '../../../utils/brandColors';
import TrendChartScroll from './TrendChartScroll';
import {
  buildTrendLineStyle,
  buildTrendXAxis,
  countUniqueLabels,
  getTrendChartLayout,
  TREND_POINT_SIZE,
} from '../utils/trendsChartHelpers';

const OverallTrendChart = ({ data = [], compact = false }) => {
  const chartData = useMemo(
    () =>
      (data || []).map((item) => ({
        label: item.label,
        periodKey: item.periodKey,
        overallScore: Number(item.overallScore) || 0,
        appliedPercent: Number(item.appliedPercent) || 0,
      })),
    [data],
  );

  const pointCount = useMemo(() => countUniqueLabels(chartData, 'label'), [chartData]);
  const layout = useMemo(() => getTrendChartLayout(pointCount, compact), [pointCount, compact]);

  const config = useMemo(
    () => ({
      data: chartData,
      xField: 'label',
      yField: 'overallScore',
      height: layout.height,
      paddingBottom: layout.paddingBottom,
      smooth: true,
      color: BRAND_COLOR,
      style: buildTrendLineStyle(),
      point: {
        size: compact ? TREND_POINT_SIZE.compact : TREND_POINT_SIZE.desktop,
        shape: 'circle',
        style: {
          fill: '#fff',
          stroke: BRAND_COLOR,
          lineWidth: 2,
        },
      },
      axis: {
        y: {
          title: 'Điểm TB',
          min: 0,
          max: 5,
        },
        x: buildTrendXAxis(pointCount),
      },
      scale: {
        y: { domain: [0, 5] },
      },
      tooltip: {
        title: (datum) => datum.label,
        items: [
          (datum) => ({
            name: 'Điểm trung bình',
            value: datum.overallScore.toFixed(2),
          }),
          (datum) => ({
            name: 'Tỷ lệ áp dụng',
            value: `${datum.appliedPercent.toFixed(1)}%`,
          }),
        ],
      },
      annotations:
        chartData.length === 1
          ? [
              {
                type: 'text',
                style: {
                  text: 'Cần ít nhất 2 mốc snapshot để thấy xu hướng',
                  x: '50%',
                  y: '20%',
                  textAlign: 'center',
                  fontSize: 12,
                  fill: '#8c8c8c',
                },
              },
            ]
          : [],
    }),
    [chartData, compact, layout.height, layout.paddingBottom, pointCount],
  );

  if (!chartData.length) {
    return (
      <div className="trends-empty-chart">
        Chưa có dữ liệu snapshot. Hệ thống sẽ tự chụp mỗi tháng.
      </div>
    );
  }

  return (
    <TrendChartScroll pointCount={pointCount} compact={compact}>
      {({ width }) => (
        <>
          <Line {...config} width={width} />
          {layout.dense ? (
            <div className="trends-chart-wrap__hint">
              Kéo ngang để xem đầy đủ các mốc thời gian.
            </div>
          ) : null}
        </>
      )}
    </TrendChartScroll>
  );
};

export default OverallTrendChart;
