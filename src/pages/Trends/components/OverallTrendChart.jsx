import React, { useMemo } from 'react';
import { Line } from '@ant-design/plots';
import { BRAND_COLOR } from '../../../utils/brandColors';

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

  const config = useMemo(
    () => ({
      data: chartData,
      xField: 'label',
      yField: 'overallScore',
      height: compact ? 240 : 300,
      smooth: true,
      color: BRAND_COLOR,
      point: {
        size: compact ? 4 : 5,
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
        x: {
          title: false,
        },
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
    [chartData, compact],
  );

  if (!chartData.length) {
    return (
      <div className="trends-empty-chart">
        Chưa có dữ liệu snapshot. Hệ thống sẽ tự chụp mỗi tháng.
      </div>
    );
  }

  return <Line {...config} />;
};

export default OverallTrendChart;
