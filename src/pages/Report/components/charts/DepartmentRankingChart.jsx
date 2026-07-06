import React, { useMemo } from 'react';
import { Tooltip } from 'antd';
import { BRAND_COLOR, BRAND_COLOR_LIGHT_BG } from '../../../../utils/brandColors';

const DEPT_SCORE_MAX = 5;
const DEPT_ROW_HEIGHT = 28;

const DepartmentRankingChart = ({ data, compact = false }) => {
  const rows = useMemo(
    () =>
      [...(data || [])]
        .map((item) => ({
          name: item.name,
          rank: Number(item.rank) || 0,
          avgScore: Number(Number(item.avgScore).toFixed(2)),
          count: Number(item.count) || 0,
        }))
        .sort((a, b) => a.rank - b.rank),
    [data],
  );

  const getBarColor = (rank, total) => {
    if (total <= 1) return BRAND_COLOR;
    const opacity = Math.max(0.35, 1 - ((rank - 1) / (total - 1)) * 0.65);
    return `rgba(58, 74, 255, ${opacity.toFixed(2)})`;
  };

  const renderRowTooltip = (row) => (
    <div>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{row.name}</div>
      <div>Xếp hạng: {row.rank}</div>
      <div>Điểm trung bình: {row.avgScore.toFixed(2)}</div>
      <div style={{ marginTop: 4, color: '#8c8c8c' }}>Số tiêu chí phụ trách: {row.count}</div>
    </div>
  );

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
        Chưa có dữ liệu theo khoa/phòng
      </div>
    );
  }

  if (compact) {
    return (
      <div style={{ marginBottom: 8 }}>
        {rows.map((row) => (
          <div
            key={`${row.rank}-${row.name}`}
            style={{
              padding: '12px 0',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: row.rank <= 3 ? BRAND_COLOR : BRAND_COLOR_LIGHT_BG,
                  color: row.rank <= 3 ? '#ffffff' : BRAND_COLOR,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 11,
                  flexShrink: 0,
                }}
              >
                {row.rank}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#141414', lineHeight: 1.35 }}>
                {row.name}
              </div>
            </div>
            <Tooltip title={renderRowTooltip(row)}>
              <div
                style={{
                  width: '100%',
                  height: DEPT_ROW_HEIGHT,
                  background: '#f5f5f5',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${(row.avgScore / DEPT_SCORE_MAX) * 100}%`,
                    minWidth: row.avgScore > 0 ? 20 : 0,
                    height: '100%',
                    borderRadius: 4,
                    backgroundColor: getBarColor(row.rank, rows.length),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: 6,
                  }}
                >
                  {(row.avgScore / DEPT_SCORE_MAX) * 100 >= 15 ? (
                    <span style={{ color: '#ffffff', fontSize: 11, fontWeight: 700 }}>
                      {row.avgScore.toFixed(2)}
                    </span>
                  ) : null}
                </div>
              </div>
            </Tooltip>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 6,
                fontSize: 12,
                color: '#8c8c8c',
              }}
            >
              <span>
                Điểm TB: <strong style={{ color: BRAND_COLOR }}>{row.avgScore.toFixed(2)}</strong>
              </span>
              <span>{row.count} tiêu chí</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 8 }}>
      {rows.map((row) => (
        <div
          key={`${row.rank}-${row.name}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 28,
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: row.rank <= 3 ? BRAND_COLOR : BRAND_COLOR_LIGHT_BG,
                color: row.rank <= 3 ? '#ffffff' : BRAND_COLOR,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 11,
              }}
            >
              {row.rank}
            </div>
          </div>
          <div
            style={{
              width: 120,
              flexShrink: 0,
              fontSize: 12,
              fontWeight: 600,
              color: '#434343',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={row.name}
          >
            {row.name}
          </div>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: 0,
                height: DEPT_ROW_HEIGHT,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Tooltip title={renderRowTooltip(row)} styles={{ root: { width: '100%' } }}>
                <div
                  style={{
                    width: `${(row.avgScore / DEPT_SCORE_MAX) * 100}%`,
                    minWidth: row.avgScore > 0 ? 20 : 0,
                    height: '100%',
                    borderRadius: '0 4px 4px 0',
                    backgroundColor: getBarColor(row.rank, rows.length),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: 6,
                    cursor: 'pointer',
                  }}
                >
                  {(row.avgScore / DEPT_SCORE_MAX) * 100 >= 12 ? (
                    <span style={{ color: '#ffffff', fontSize: 11, fontWeight: 700 }}>
                      {row.avgScore.toFixed(2)}
                    </span>
                  ) : null}
                </div>
              </Tooltip>
            </div>
            <div
              style={{
                width: 44,
                flexShrink: 0,
                textAlign: 'right',
                fontWeight: 700,
                fontSize: 12,
                color: BRAND_COLOR,
              }}
            >
              {row.avgScore.toFixed(2)}
            </div>
            <div
              style={{
                width: 56,
                flexShrink: 0,
                textAlign: 'right',
                fontSize: 11,
                color: '#8c8c8c',
              }}
            >
              {row.count} TC
            </div>
          </div>
        </div>
      ))}
      <div
        style={{
          marginLeft: 156,
          marginTop: 2,
          paddingTop: 6,
          borderTop: '1px solid #e8e8e8',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 10,
          color: '#8c8c8c',
        }}
      >
        <span>0</span>
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 20,
          marginTop: 10,
          fontSize: 12,
          color: '#595959',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 14,
              height: 8,
              backgroundColor: BRAND_COLOR,
              borderRadius: 2,
              display: 'inline-block',
            }}
          />
          Điểm trung bình (0–5)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#8c8c8c' }}>3 TC</span>
          Số tiêu chí phụ trách
        </span>
      </div>
    </div>
  );
};

export default DepartmentRankingChart;
