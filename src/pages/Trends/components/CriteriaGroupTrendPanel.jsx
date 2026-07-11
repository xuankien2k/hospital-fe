import React, { useMemo, useState } from 'react';
import { Collapse, Segmented, Table, Tag } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, MinusOutlined } from '@ant-design/icons';
import { getPartDisplayLabel, PART_ORDER } from '@/utils/reportParts';
import { getLevelColorStyle } from '@/utils/criteriaLevelColors';

const VIEW_MODES = [
  { label: 'Theo nhóm tiêu chí', value: 'part' },
  { label: 'Theo khoa/phòng', value: 'department' },
];

const LevelBadge = ({ level }) => {
  const style = getLevelColorStyle(level);
  return (
    <Tag
      style={{
        margin: 0,
        color: style.color,
        background: style.bg,
        border: `1px solid ${style.bg}`,
        fontWeight: 600,
      }}
    >
      Mức {level}
    </Tag>
  );
};

const DeltaBadge = ({ delta }) => {
  if (delta > 0) {
    return (
      <Tag color="success" icon={<ArrowUpOutlined />}>
        +{delta}
      </Tag>
    );
  }
  if (delta < 0) {
    return (
      <Tag color="error" icon={<ArrowDownOutlined />}>
        {delta}
      </Tag>
    );
  }
  return <Tag icon={<MinusOutlined />}>0</Tag>;
};

const groupCriteriaByPart = (criteriaTrend = []) => {
  const map = {};

  criteriaTrend.forEach((item) => {
    const key = item.part || 'other';
    if (!map[key]) {
      map[key] = {
        key,
        title: getPartDisplayLabel(item.part, item.partLabel),
        criteria: [],
      };
    }
    map[key].criteria.push(item);
  });

  const ordered = PART_ORDER.filter((part) => map[part]).map((part) => map[part]);
  const extra = Object.keys(map)
    .filter((part) => !PART_ORDER.includes(part))
    .sort((a, b) => a.localeCompare(b, 'vi'))
    .map((part) => map[part]);

  return [...ordered, ...extra];
};

const groupCriteriaByDepartment = (criteriaTrend = []) => {
  const map = {};

  criteriaTrend.forEach((item) => {
    const key = item.departmentId || item.departmentName || 'unassigned';
    if (!map[key]) {
      map[key] = {
        key,
        title: item.departmentName || 'Chưa gán',
        criteria: [],
      };
    }
    map[key].criteria.push(item);
  });

  return Object.values(map).sort((a, b) => a.title.localeCompare(b.title, 'vi'));
};

const CriteriaGroupTrendPanel = ({ criteriaTrend = [], periodLabels = [], compact = false }) => {
  const [viewMode, setViewMode] = useState('part');

  const groups = useMemo(() => {
    if (viewMode === 'department') {
      return groupCriteriaByDepartment(criteriaTrend);
    }
    return groupCriteriaByPart(criteriaTrend);
  }, [criteriaTrend, viewMode]);

  const columns = useMemo(() => {
    const periodColumns = (periodLabels || []).map((label) => ({
      title: label,
      dataIndex: label,
      key: label,
      width: compact ? 88 : 96,
      align: 'center',
      render: (value) =>
        value === null || value === undefined ? '—' : <LevelBadge level={value} />,
    }));

    return [
      {
        title: 'Mã',
        dataIndex: 'code',
        key: 'code',
        width: 72,
        fixed: compact ? undefined : 'left',
      },
      {
        title: 'Tiêu chí',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        width: compact ? 180 : 260,
      },
      ...periodColumns,
      {
        title: 'Biến động',
        dataIndex: 'delta',
        key: 'delta',
        width: 96,
        align: 'center',
        fixed: compact ? undefined : 'right',
        render: (value) => <DeltaBadge delta={value} />,
      },
    ];
  }, [periodLabels, compact]);

  const collapseItems = groups.map((group) => {
    const dataSource = group.criteria.map((item) => {
      const points = item.points || [];
      const firstLevel = points[0]?.currentLevel ?? 0;
      const lastLevel = points[points.length - 1]?.currentLevel ?? firstLevel;
      const row = {
        key: item.code,
        code: item.code,
        name: item.name,
        delta: lastLevel - firstLevel,
      };

      (periodLabels || []).forEach((label) => {
        const point = points.find((entry) => entry.label === label);
        row[label] = point ? point.currentLevel : null;
      });

      return row;
    });

    const improvedCount = dataSource.filter((row) => row.delta > 0).length;
    const declinedCount = dataSource.filter((row) => row.delta < 0).length;

    return {
      key: group.key,
      label: (
        <div className="trends-criteria-group__header">
          <span className="trends-criteria-group__title">{group.title}</span>
          <span className="trends-criteria-group__meta">
            {group.criteria.length} tiêu chí
            {periodLabels.length >= 2 ? (
              <>
                {' · '}
                <span style={{ color: '#16a34a' }}>+{improvedCount}</span>
                {' / '}
                <span style={{ color: '#E61515' }}>-{declinedCount}</span>
              </>
            ) : null}
          </span>
        </div>
      ),
      children: (
        <Table
          size={compact ? 'small' : 'middle'}
          columns={columns}
          dataSource={dataSource}
          pagination={dataSource.length > 10 ? { pageSize: 10, size: 'small' } : false}
          scroll={{ x: compact ? 640 : 900 }}
        />
      ),
    };
  });

  if (!criteriaTrend.length) {
    return <div className="trends-empty-chart">Chưa có dữ liệu xu hướng tiêu chí</div>;
  }

  return (
    <div className="trends-criteria-group">
      <div className="trends-criteria-group__toolbar">
        <Segmented
          value={viewMode}
          options={VIEW_MODES}
          onChange={setViewMode}
          size={compact ? 'small' : 'middle'}
        />
      </div>
      <Collapse
        items={collapseItems}
        defaultActiveKey={collapseItems.length === 1 ? [collapseItems[0].key] : []}
        className="trends-criteria-group__collapse"
      />
    </div>
  );
};

export default CriteriaGroupTrendPanel;
