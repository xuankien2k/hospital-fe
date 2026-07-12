import React, { useMemo } from 'react';
import { Line } from '@ant-design/plots';
import { BRAND_COLOR } from '../../../utils/brandColors';
import { getPartDisplayLabel } from '@/utils/reportParts';

const PART_COLORS = [BRAND_COLOR, '#16a34a', '#ca8a04', '#E61515', '#7c3aed'];

const parseTooltipScore = (item) => {
  if (typeof item?.avgScore === 'number') {
    return item.avgScore;
  }
  const match = String(item?.value ?? '').match(/^([\d.]+)/);
  return match ? Number(match[1]) : 0;
};

const formatPartTooltipValue = (datum) => `${datum.avgScore.toFixed(2)} · ${datum.count} TC`;

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
      interaction: {
        tooltip: {
          shared: true,
          enterable: false,
          sort: (item) => -parseTooltipScore(item),
        },
      },
      tooltip: {
        title: (datum) => datum.label,
        css: {
          '.g2-tooltip': {
            'max-width': '320px',
            'max-height': '280px',
            overflow: 'auto',
            padding: '8px 10px',
            'font-size': '12px',
          },
          '.g2-tooltip-title': {
            'margin-bottom': '6px',
            'font-size': '12px',
            'font-weight': '700',
          },
          '.g2-tooltip-list-item': {
            'margin-top': '3px',
            gap: '6px',
          },
          '.g2-tooltip-list-item-name': {
            'max-width': '180px',
            overflow: 'hidden',
            'text-overflow': 'ellipsis',
            'white-space': 'nowrap',
          },
          '.g2-tooltip-list-item-value': {
            'font-weight': '600',
            'white-space': 'nowrap',
          },
        },
        items: [
          (datum) => ({
            name: datum.part,
            value: formatPartTooltipValue(datum),
            avgScore: datum.avgScore,
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
