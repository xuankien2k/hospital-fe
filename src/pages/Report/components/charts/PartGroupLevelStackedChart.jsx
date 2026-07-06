import React, { useMemo } from 'react';
import { Tooltip, Typography } from 'antd';
import { getLevelColorStyle } from '../../../../utils/criteriaLevelColors';
import LevelLegend from './LevelLegend';

const { Text } = Typography;
const PART_LEVELS = [1, 2, 3, 4, 5];

const PartGroupLevelStackedChart = ({ data, compact = false }) => {
  const rows = useMemo(
    () =>
      (data || []).map((item) => ({
        ...item,
        displayLabel: `${item.part}. ${item.label}`,
        count: Number(item.count) || 0,
        avgScore: Number(item.avgScore) || 0,
        levelCounts: PART_LEVELS.map((level) => ({
          level,
          levelLabel: `Mức ${level}`,
          count: Number(item.byLevel?.[`level${level}`]) || 0,
          ...getLevelColorStyle(level),
        })),
      })),
    [data],
  );

  const maxCount = useMemo(() => Math.max(1, ...rows.map((row) => row.count)), [rows]);

  const renderRowTooltip = (row) => (
    <div>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{row.displayLabel}</div>
      {row.levelCounts
        .filter((segment) => segment.count > 0)
        .map((segment) => (
          <div key={segment.level}>
            {segment.levelLabel}: {segment.count} tiêu chí
          </div>
        ))}
      <div style={{ marginTop: 8, fontWeight: 600 }}>
        Điểm trung bình: {row.avgScore.toFixed(2)}
      </div>
    </div>
  );

  const renderBar = (row) => {
    if (row.count <= 0) {
      return (
        <Text type="secondary" style={{ fontSize: 13 }}>
          Không có tiêu chí
        </Text>
      );
    }

    return (
      <Tooltip title={renderRowTooltip(row)} styles={{ root: { width: '100%' } }}>
        <div
          style={{
            display: 'flex',
            width: compact ? '100%' : `${(row.count / maxCount) * 100}%`,
            minWidth: 28,
            height: compact ? 36 : 50,
            borderRadius: '0 4px 4px 0',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
        >
          {row.levelCounts.map((segment) => {
            if (!segment.count) return null;
            const widthPercent = (segment.count / row.count) * 100;
            return (
              <div
                key={segment.level}
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: segment.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: widthPercent >= 4 ? undefined : 2,
                  height: '100%',
                }}
              >
                {widthPercent >= 14 ? (
                  <span style={{ color: segment.color, fontSize: 12, fontWeight: 600 }}>
                    {segment.count}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </Tooltip>
    );
  };

  if (!rows.length) {
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
        Chưa có dữ liệu theo nhóm tiêu chí
      </div>
    );
  }

  if (compact) {
    return (
      <div style={{ marginBottom: 8 }}>
        {rows.map((row) => (
          <div
            key={row.part}
            style={{
              padding: '12px 0',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#141414',
                lineHeight: 1.35,
                marginBottom: 8,
              }}
            >
              {row.displayLabel}
            </div>
            {renderBar(row)}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 8,
                fontSize: 12,
                color: '#8c8c8c',
              }}
            >
              <span>{row.count} tiêu chí</span>
              <span>ĐTB: {row.avgScore.toFixed(2)}</span>
            </div>
          </div>
        ))}
        <LevelLegend />
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 8 }}>
      {rows.map((row) => (
        <div
          key={row.part}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 220,
              flexShrink: 0,
              fontSize: 13,
              color: '#434343',
              lineHeight: 1.35,
            }}
          >
            {row.displayLabel}
          </div>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{ flex: 1, minWidth: 0, height: 50, display: 'flex', alignItems: 'center' }}
            >
              {renderBar(row)}
            </div>
            <div
              style={{
                width: 40,
                flexShrink: 0,
                textAlign: 'right',
                fontWeight: 600,
                fontSize: 13,
                color: '#141414',
              }}
            >
              {row.count}
            </div>
          </div>
        </div>
      ))}
      <div
        style={{
          marginLeft: 232,
          marginTop: 4,
          paddingTop: 8,
          borderTop: '1px solid #e8e8e8',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: '#8c8c8c',
        }}
      >
        <span>0</span>
        <span>{Math.round(maxCount / 2)}</span>
        <span>{maxCount}</span>
      </div>
      <LevelLegend />
    </div>
  );
};

export default PartGroupLevelStackedChart;
