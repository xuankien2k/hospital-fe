import React from 'react';
import { Table, Tag } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, MinusOutlined } from '@ant-design/icons';

const levelTag = (from, to) => (
  <span>
    Mức {from} <span style={{ color: '#8c8c8c' }}>→</span> Mức {to}
  </span>
);

const CriteriaAnalysisPanel = ({ analysis, compact = false }) => {
  const improved = analysis?.improved || [];
  const declined = analysis?.declined || [];
  const stagnant = analysis?.stagnant || [];

  const improvedColumns = [
    { title: 'Mã', dataIndex: 'code', key: 'code', width: 72 },
    {
      title: 'Tiêu chí',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Thay đổi',
      key: 'change',
      width: compact ? 120 : 140,
      render: (_, row) => levelTag(row.from, row.to),
    },
    {
      title: 'Khoa/phòng',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: compact ? 100 : 140,
      ellipsis: true,
    },
  ];

  const declinedColumns = [
    { title: 'Mã', dataIndex: 'code', key: 'code', width: 72 },
    {
      title: 'Tiêu chí',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Thay đổi',
      key: 'change',
      width: compact ? 120 : 140,
      render: (_, row) => levelTag(row.from, row.to),
    },
    {
      title: 'Khoa/phòng',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: compact ? 100 : 140,
      ellipsis: true,
    },
  ];

  const stagnantColumns = [
    { title: 'Mã', dataIndex: 'code', key: 'code', width: 72 },
    {
      title: 'Tiêu chí',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Mức',
      dataIndex: 'level',
      key: 'level',
      width: 72,
      render: (value) => `Mức ${value}`,
    },
    {
      title: 'Tháng không đổi',
      dataIndex: 'monthsUnchanged',
      key: 'monthsUnchanged',
      width: compact ? 110 : 130,
      render: (value) => `${value} tháng`,
    },
    {
      title: 'Khoa/phòng',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: compact ? 100 : 140,
      ellipsis: true,
    },
  ];

  const sections = [
    {
      key: 'improved',
      title: 'Tiêu chí cải thiện',
      icon: <ArrowUpOutlined />,
      color: 'success',
      data: improved,
      columns: improvedColumns,
    },
    {
      key: 'declined',
      title: 'Tiêu chí giảm mức',
      icon: <ArrowDownOutlined />,
      color: 'error',
      data: declined,
      columns: declinedColumns,
    },
    {
      key: 'stagnant',
      title: 'Tiêu chí trì trệ',
      icon: <MinusOutlined />,
      color: 'default',
      data: stagnant,
      columns: stagnantColumns,
    },
  ];

  return (
    <div className="trends-analysis">
      {sections.map((section) => (
        <div key={section.key} className="trends-analysis__section">
          <div className="trends-analysis__header">
            <Tag color={section.color} icon={section.icon}>
              {section.title}
            </Tag>
            <span className="trends-analysis__count">{section.data.length} tiêu chí</span>
          </div>
          <Table
            size={compact ? 'small' : 'middle'}
            columns={section.columns}
            dataSource={section.data.map((row) => ({ ...row, key: row.code }))}
            pagination={section.data.length > 8 ? { pageSize: 8, size: 'small' } : false}
            locale={{ emptyText: 'Không có tiêu chí trong nhóm này' }}
            scroll={compact ? { x: 520 } : undefined}
          />
        </div>
      ))}
    </div>
  );
};

export default CriteriaAnalysisPanel;
