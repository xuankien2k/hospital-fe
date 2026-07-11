import React, { useMemo } from 'react';
import { Line } from '@ant-design/plots';
import { BRAND_COLOR } from '../../../utils/brandColors';
import { getPartDisplayLabel } from '@/utils/reportParts';

const PART_COLORS = [BRAND_COLOR, '#16a34a', '#ca8a04', '#E61515', '#7c3aed'];

const PartTrendChart = ({ byPartTrend = {}, compact = false }) => {
  const chartData = useMemo(() => {
    const rows = [];
    Object.entries(byPartTrend || {}).forEach(([part, points]) => {
      (points || []).forEach((point) => {
        rows.push({
          part: getPartDisplayLabel(part),
          label: point.label,
          avgScore: Number(point.avgScore) || 0,
          count: Number(point.count) || 0,
        });
      });
    });
    return rows;
  }, [byPartTrend]);

  const parts = useMemo(() => [...new Set(chartData.map((item) => item.part))], [chartData]);

  const config = useMemo(
    () => ({
      data: chartData,
      xField: 'label',
      yField: 'avgScore',
      colorField: 'part',
      height: compact ? 260 : 320,
      smooth: true,
      scale: {
        y: { domain: [0, 5] },
        color: {
          domain: parts,
          range: PART_COLORS.slice(0, parts.length),
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
      legend: {
        position: compact ? 'bottom' : 'top',
      },
      tooltip: {
        title: (datum) => datum.label,
        items: [
          (datum) => ({
            name: datum.part,
            value: datum.avgScore.toFixed(2),
          }),
          (datum) => ({
            name: 'Số tiêu chí',
            value: datum.count,
          }),
        ],
      },
    }),
    [chartData, parts, compact],
  );

  if (!chartData.length) {
    return <div className="trends-empty-chart">Chưa có dữ liệu theo nhóm tiêu chí</div>;
  }

  return <Line {...config} />;
};

export default PartTrendChart;
