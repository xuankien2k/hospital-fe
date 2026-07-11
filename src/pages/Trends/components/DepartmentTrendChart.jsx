import React, { useEffect, useMemo, useState } from 'react';
import { Line } from '@ant-design/plots';
import { Segmented, Select, Table, Typography } from 'antd';
import { BRAND_COLOR } from '@/utils/brandColors';

const MAX_CHART_DEPARTMENTS = 8;
const MAX_CHART_DEPARTMENTS_COMPACT = 5;

const VIEW_MODES = [
  { label: 'Top cao nhất', value: 'top' },
  { label: 'Top thấp nhất', value: 'bottom' },
  { label: 'Chọn khoa/phòng', value: 'custom' },
];

const DEPT_COLORS = [
  BRAND_COLOR,
  '#16a34a',
  '#ca8a04',
  '#E61515',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#ea580c',
  '#4f46e5',
  '#0d9488',
];

const buildDepartmentMeta = (byDepartmentTrend = []) =>
  (byDepartmentTrend || [])
    .map((dept) => {
      const points = dept.points || [];
      const latest = points[points.length - 1];
      return {
        id: String(dept.departmentId || dept.name || 'unassigned'),
        name: dept.name || 'Chưa gán',
        points,
        latestScore: Number(latest?.avgScore) || 0,
        latestRank: latest?.rank,
        latestCount: Number(latest?.count) || 0,
        latestLabel: latest?.label,
      };
    })
    .sort((a, b) => b.latestScore - a.latestScore);

const pickVisibleDepartments = (meta, viewMode, customSelected, maxVisible) => {
  if (viewMode === 'custom') {
    const fallbackIds = meta.slice(0, maxVisible).map((item) => item.id);
    const selectedIds = (customSelected.length ? customSelected : fallbackIds).slice(0, maxVisible);
    return meta.filter((item) => selectedIds.includes(item.id));
  }

  if (viewMode === 'bottom') {
    return [...meta].sort((a, b) => a.latestScore - b.latestScore).slice(0, maxVisible);
  }

  return meta.slice(0, maxVisible);
};

const formatDeptTooltipValue = (datum) => {
  const rank = datum.rank ? ` · #${datum.rank}` : '';
  return `${datum.avgScore.toFixed(2)} · ${datum.count} TC${rank}`;
};

const DepartmentTrendChart = ({ byDepartmentTrend = [], compact = false }) => {
  const maxVisible = compact ? MAX_CHART_DEPARTMENTS_COMPACT : MAX_CHART_DEPARTMENTS;
  const departmentMeta = useMemo(() => buildDepartmentMeta(byDepartmentTrend), [byDepartmentTrend]);
  const [viewMode, setViewMode] = useState('top');
  const [customSelected, setCustomSelected] = useState([]);

  useEffect(() => {
    if (viewMode !== 'custom' || customSelected.length) return;
    setCustomSelected(departmentMeta.slice(0, maxVisible).map((item) => item.id));
  }, [viewMode, customSelected.length, departmentMeta, maxVisible]);

  const visibleDepartments = useMemo(
    () => pickVisibleDepartments(departmentMeta, viewMode, customSelected, maxVisible),
    [departmentMeta, viewMode, customSelected, maxVisible],
  );

  const visibleDepartmentNames = useMemo(
    () => new Set(visibleDepartments.map((item) => item.name)),
    [visibleDepartments],
  );

  const chartData = useMemo(() => {
    const rows = [];
    visibleDepartments.forEach((dept) => {
      (dept.points || []).forEach((point) => {
        rows.push({
          department: dept.name,
          label: point.label,
          avgScore: Number(point.avgScore) || 0,
          count: Number(point.count) || 0,
          rank: point.rank,
        });
      });
    });
    return rows;
  }, [visibleDepartments]);

  const departments = useMemo(
    () => visibleDepartments.map((item) => item.name),
    [visibleDepartments],
  );

  const latestRanking = useMemo(
    () =>
      departmentMeta.map((item, index) => ({
        key: item.id,
        rank: item.latestRank || index + 1,
        name: item.name,
        avgScore: item.latestScore,
        count: item.latestCount,
        highlighted: visibleDepartmentNames.has(item.name),
      })),
    [departmentMeta, visibleDepartmentNames],
  );

  const config = useMemo(
    () => ({
      data: chartData,
      xField: 'label',
      yField: 'avgScore',
      colorField: 'department',
      height: compact ? 260 : 320,
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
      legend: false,
      interaction: {
        tooltip: {
          shared: true,
          enterable: false,
        },
      },
      tooltip: {
        title: (datum) => datum.label,
        css: {
          '.g2-tooltip': {
            'max-width': '280px',
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
            'max-width': '150px',
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
            name: datum.department,
            value: formatDeptTooltipValue(datum),
          }),
        ],
      },
    }),
    [chartData, departments, compact],
  );

  if (!departmentMeta.length) {
    return <div className="trends-empty-chart">Chưa có dữ liệu theo khoa/phòng</div>;
  }

  const departmentOptions = departmentMeta.map((item) => ({
    label: `${item.name} (${item.latestScore.toFixed(2)})`,
    value: item.id,
  }));

  return (
    <div className="trends-dept-chart">
      <div className="trends-dept-chart__toolbar">
        <Segmented
          size={compact ? 'small' : 'middle'}
          value={viewMode}
          options={VIEW_MODES}
          onChange={setViewMode}
        />
        {viewMode === 'custom' ? (
          <Select
            mode="multiple"
            allowClear
            showSearch
            maxCount={maxVisible}
            className="trends-dept-chart__select"
            placeholder={`Chọn tối đa ${maxVisible} khoa/phòng`}
            value={customSelected}
            options={departmentOptions}
            optionFilterProp="label"
            onChange={setCustomSelected}
          />
        ) : null}
      </div>

      <Typography.Text type="secondary" className="trends-dept-chart__hint">
        Hiển thị {visibleDepartments.length}/{departmentMeta.length} khoa/phòng trên biểu đồ. Xem
        đầy đủ ở bảng xếp hạng bên dưới.
      </Typography.Text>

      <div className="trends-dept-chart__chips">
        {visibleDepartments.map((dept, index) => (
          <span
            key={dept.id}
            className="trends-dept-chart__chip"
            style={{ borderColor: DEPT_COLORS[index % DEPT_COLORS.length] }}
          >
            <span
              className="trends-dept-chart__chip-dot"
              style={{ background: DEPT_COLORS[index % DEPT_COLORS.length] }}
            />
            {dept.name}
          </span>
        ))}
      </div>

      {chartData.length ? <Line {...config} /> : null}

      <div className="trends-dept-chart__ranking">
        <div className="trends-dept-chart__ranking-title">
          Xếp hạng mới nhất
          {departmentMeta[0]?.latestLabel ? ` (${departmentMeta[0].latestLabel})` : ''}
        </div>
        <Table
          size="small"
          pagination={
            departmentMeta.length > (compact ? 6 : 10)
              ? { pageSize: compact ? 6 : 10, size: 'small' }
              : false
          }
          dataSource={latestRanking}
          scroll={compact ? { x: 360 } : undefined}
          rowClassName={(record) =>
            record.highlighted ? 'trends-dept-chart__row--active' : undefined
          }
          columns={[
            {
              title: 'Hạng',
              dataIndex: 'rank',
              width: 64,
              align: 'center',
            },
            {
              title: 'Khoa/phòng',
              dataIndex: 'name',
              ellipsis: true,
            },
            {
              title: 'Điểm TB',
              dataIndex: 'avgScore',
              width: 88,
              align: 'right',
              render: (value) => value.toFixed(2),
            },
            {
              title: 'Số TC',
              dataIndex: 'count',
              width: 72,
              align: 'center',
            },
          ]}
        />
      </div>
    </div>
  );
};

export default DepartmentTrendChart;
