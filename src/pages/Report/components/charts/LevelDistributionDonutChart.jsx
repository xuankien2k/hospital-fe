import React, { useMemo } from 'react';
import { Pie } from '@ant-design/plots';
import { getLevelColorStyle } from '../../../../utils/criteriaLevelColors';

const PART_LEVELS = [1, 2, 3, 4, 5];
const LEVEL_COLOR_RANGE = PART_LEVELS.map((level) => getLevelColorStyle(level).bg);
const LEVEL_LABELS = PART_LEVELS.map((level) => `Mức ${level}`);

const LevelDistributionDonutChart = ({ data, total, compact = false }) => {
  const totalApplied = Number(total) || 0;

  const chartData = useMemo(() => {
    const safeTotal = totalApplied || 0;
    return (data || [])
      .map((item) => {
        const count = Number(item.count) || 0;
        const percent = safeTotal ? (count / safeTotal) * 100 : 0;
        return {
          level: item.level,
          count,
          percent,
        };
      })
      .filter((item) => item.count > 0);
  }, [data, totalApplied]);

  const legendItems = useMemo(
    () =>
      PART_LEVELS.map((levelNum) => {
        const levelLabel = `Mức ${levelNum}`;
        const found = (data || []).find((item) => item.level === levelLabel);
        const count = Number(found?.count) || 0;
        const percent = totalApplied ? (count / totalApplied) * 100 : 0;
        return {
          level: levelLabel,
          count,
          percent,
          ...getLevelColorStyle(levelNum),
        };
      }),
    [data, totalApplied],
  );

  const pieConfig = useMemo(
    () => ({
      data: chartData,
      angleField: 'count',
      colorField: 'level',
      innerRadius: 0.62,
      radius: 0.88,
      height: compact ? 260 : 320,
      legend: false,
      scale: {
        color: {
          domain: LEVEL_LABELS,
          range: LEVEL_COLOR_RANGE,
        },
      },
      label: {
        position: 'outside',
        text: (datum) => `${Math.round(datum.percent)}%`,
        style: {
          fontSize: compact ? 11 : 12,
          fontWeight: 500,
          fill: '#595959',
        },
      },
      tooltip: {
        title: (datum) => datum.level,
        items: [
          (datum) => ({
            name: 'Số tiêu chí đang đạt',
            value: datum.count,
          }),
          (datum) => ({
            name: 'Tỷ lệ',
            value: `${Math.round(datum.percent)}%`,
          }),
        ],
      },
      annotations: [
        {
          type: 'text',
          style: {
            text: String(totalApplied),
            x: '50%',
            y: '46%',
            textAlign: 'center',
            fontSize: compact ? 24 : 28,
            fontWeight: 700,
            fill: '#141414',
          },
        },
        {
          type: 'text',
          style: {
            text: 'Tiêu chí áp dụng',
            x: '50%',
            y: '56%',
            textAlign: 'center',
            fontSize: 12,
            fill: '#8c8c8c',
          },
        },
      ],
    }),
    [chartData, totalApplied, compact],
  );

  if (!chartData.length) {
    return (
      <div
        style={{
          padding: '32px 16px',
          textAlign: 'center',
          color: '#8c8c8c',
          background: '#fafafa',
          borderRadius: 8,
        }}
      >
        Chưa có dữ liệu phân bố theo mức
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: compact ? 'stretch' : 'center',
        justifyContent: 'center',
        gap: compact ? 24 : 96,
        flexDirection: compact ? 'column' : 'row',
        flexWrap: 'wrap',
        padding: compact ? '0' : '8px 16px',
      }}
    >
      <div
        style={{
          width: compact ? '100%' : 320,
          maxWidth: compact ? 320 : undefined,
          margin: compact ? '0 auto' : undefined,
          flexShrink: 0,
        }}
      >
        <Pie {...pieConfig} />
      </div>
      <div
        style={{
          flex: compact ? '1 1 auto' : '0 1 360px',
          minWidth: compact ? 0 : 260,
          width: compact ? '100%' : undefined,
        }}
      >
        {legendItems.map((item) => (
          <div
            key={item.level}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: compact ? 12 : 16,
              padding: compact ? '10px 0' : '14px 0',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                backgroundColor: item.bg,
                flexShrink: 0,
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: compact ? 14 : 16,
                  fontWeight: 600,
                  color: '#141414',
                  lineHeight: 1.3,
                }}
              >
                {item.level}
              </div>
              <div
                style={{
                  fontSize: compact ? 13 : 14,
                  color: '#8c8c8c',
                  marginTop: 4,
                  lineHeight: 1.4,
                }}
              >
                {item.count} tiêu chí · {Math.round(item.percent)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LevelDistributionDonutChart;
