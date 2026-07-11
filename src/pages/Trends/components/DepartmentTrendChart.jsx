import React, { useMemo } from 'react';
import { Line } from '@ant-design/plots';
import { BRAND_COLOR } from '../../../utils/brandColors';

const DEPT_COLORS = [BRAND_COLOR, '#16a34a', '#ca8a04', '#E61515', '#7c3aed', '#0891b2', '#db2777'];

const DepartmentTrendChart = ({ byDepartmentTrend = [], compact = false }) => {
  const chartData = useMemo(() => {
    const rows = [];
    (byDepartmentTrend || []).forEach((dept) => {
      (dept.points || []).forEach((point) => {
        rows.push({
          department: dept.name || 'Chưa gán',
          label: point.label,
          avgScore: Number(point.avgScore) || 0,
          count: Number(point.count) || 0,
          rank: point.rank,
        });
      });
    });
    return rows;
  }, [byDepartmentTrend]);

  const departments = useMemo(
    () => [...new Set(chartData.map((item) => item.department))],
    [chartData],
  );

  const config = useMemo(
    () => ({
      data: chartData,
      xField: 'label',
      yField: 'avgScore',
      colorField: 'department',
      height: compact ? 280 : 340,
      smooth: true,
      scale: {
        y: { domain: [0, 5] },
        color: {
          domain: departments,
          range: DEPT_COLORS.slice(0, departments.length),
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
            name: datum.department,
            value: datum.avgScore.toFixed(2),
          }),
          (datum) => ({
            name: 'Số tiêu chí',
            value: datum.count,
          }),
          (datum) =>
            datum.rank
              ? {
                  name: 'Xếp hạng',
                  value: datum.rank,
                }
              : null,
        ].filter(Boolean),
      },
    }),
    [chartData, departments, compact],
  );

  if (!chartData.length) {
    return <div className="trends-empty-chart">Chưa có dữ liệu theo khoa/phòng</div>;
  }

  return <Line {...config} />;
};

export default DepartmentTrendChart;
