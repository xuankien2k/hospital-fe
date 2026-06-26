import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useModel } from '@umijs/max';
import { Table, Card, message, Tag, Progress, Typography, Row, Col, Tooltip, Button } from 'antd';
import { Column } from '@ant-design/plots';
import { InfoCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import axiosInstance from '../../utils/axiosInstance';
import dayjs from 'dayjs';
import {
  getCriteriaProgressPercent,
  getCriteriaProgressStatus,
  getCriteriaCurrentLevel,
  getCriteriaExpectedLevel,
  isCriteriaBelowExpectedLevel,
} from '../../utils/criteriaProgress';
import { canFilterByDepartment } from '../../utils/departments';
import { isContentAdmin } from '../../utils/roles';

const { Title, Text } = Typography;

const CHART_COLOR_3 = '#8879DF';
const SECTION_GAP = 32;
const SECTION_TITLE_STYLE = {
  margin: 0,
  marginBottom: 24,
  fontSize: 18,
  fontWeight: 600,
  color: '#141414',
  lineHeight: 1.4,
};
const CHART_TITLE_STYLE = {
  margin: '8px 0 16px',
  fontSize: 15,
  fontWeight: 600,
  color: '#434343',
  lineHeight: 1.4,
};
const REPORT_CARD_STYLE = {
  marginBottom: SECTION_GAP,
  borderRadius: 12,
  border: '1px solid #e8e8e8',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
};
const REPORT_TABLE_CLASS = 'report-quality-table';

const columnChartStyle = {
  fill: CHART_COLOR_3,
  radiusTopLeft: 14,
  radiusTopRight: 14,
  inset: 8,
};

const ReportSectionTitle = ({ children }) => (
  <Title level={4} style={SECTION_TITLE_STYLE}>
    {children}
  </Title>
);

const ReportChartTitle = ({ children }) => (
  <Title level={5} style={CHART_TITLE_STYLE}>
    {children}
  </Title>
);

const SummaryStatBlock = ({ label, value, tooltip }) => (
  <div
    style={{
      background: '#fff',
      border: '1px solid #e8e8e8',
      borderRadius: 12,
      padding: '22px 24px',
      minHeight: 108,
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
      <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.4 }}>
        {label}
      </Text>
      <Tooltip title={tooltip}>
        <InfoCircleOutlined style={{ color: '#8c8c8c', fontSize: 14, cursor: 'help' }} />
      </Tooltip>
    </div>
    <div style={{ fontSize: 32, fontWeight: 700, color: '#141414', lineHeight: 1.2 }}>{value}</div>
  </div>
);

const parseStoredUser = () => {
  try {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const Report = () => {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser || parseStoredUser();

  const canFilterByAssignee = useMemo(() => {
    return isContentAdmin(currentUser?.role) || currentUser?.role === 'director';
  }, [currentUser?.role]);

  const showDepartmentFilter = useMemo(() => {
    return canFilterByDepartment(currentUser?.role);
  }, [currentUser?.role]);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  // const [loadingOptions, setLoadingOptions] = useState(false);
  const [partFilter, setPartFilter] = useState(undefined);
  const [chapterFilter, setChapterFilter] = useState(undefined);
  const [assignedUserFilter, setAssignedUserFilter] = useState(undefined);
  const [departmentFilter, setDepartmentFilter] = useState(undefined);
  const [notAchievedFilter, setNotAchievedFilter] = useState(undefined);
  // const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  // const [partOptions, setPartOptions] = useState([]);
  // const [chapterOptions, setChapterOptions] = useState([]);
  // const [userOptions, setUserOptions] = useState([]);
  // const [departmentOptions, setDepartmentOptions] = useState([]);

  const [summary, setSummary] = useState(null);
  const [details, setDetails] = useState([]);
  const [belowLevel3, setBelowLevel3] = useState([]);
  const [matrix, setMatrix] = useState([]);

  /*
  useEffect(() => {
    const t = setTimeout(() => setKeyword(keywordInput.trim()), 400);
    return () => clearTimeout(t);
  }, [keywordInput]);

  const loadFilterOptions = useCallback(async () => {
    try {
      setLoadingOptions(true);
      const [listRes, usersRes, deptRes] = await Promise.all([
        axiosInstance.post('/api/criteria/list', { page: 1, limit: 500 }),
        axiosInstance.post('/api/users/list', { page: 1, limit: 200 }),
        axiosInstance.get('/api/departments/list'),
      ]);
      const criteria = listRes.data?.data || [];
      setPartOptions([...new Set(criteria.map((c) => c.part).filter(Boolean))].sort());
      setChapterOptions([...new Set(criteria.map((c) => c.chapter).filter(Boolean))].sort());
      setUserOptions(usersRes.data?.data || []);
      setDepartmentOptions(deptRes.data?.data || []);
    } catch {
      // bỏ qua
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);
  */

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        part: partFilter || undefined,
        chapter: chapterFilter || undefined,
        keyword: keyword || undefined,
        assignedUser: canFilterByAssignee ? assignedUserFilter || undefined : undefined,
        departmentId: departmentFilter || undefined,
        notAchieved: notAchievedFilter === 'not_achieved' ? true : undefined,
      };
      const response = await axiosInstance.post('/api/report/quality', params);
      const report = response.data.report;

      setSummary(report.summary || null);
      setDetails(report.details || []);
      setBelowLevel3(report.belowLevel3 || []);
      setMatrix(report.matrix || report.details || []);
    } catch (err) {
      message.error(err.message || 'Không tải được báo cáo');
    } finally {
      setLoading(false);
    }
  }, [
    partFilter,
    chapterFilter,
    assignedUserFilter,
    departmentFilter,
    keyword,
    notAchievedFilter,
    canFilterByAssignee,
  ]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExportReport = async () => {
    try {
      setExporting(true);
      const response = await axiosInstance.post(
        '/api/report/quality/export',
        {},
        { responseType: 'blob', timeout: 60000 },
      );
      const contentType = response.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        const text = await response.data.text();
        const err = JSON.parse(text);
        throw new Error(err.message || 'Không xuất được báo cáo');
      }
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Bao-cao-CTCL-${dayjs().format('YYYYMMDD')}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('Đã xuất báo cáo Word');
    } catch (err) {
      const data = err.response?.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text);
          message.error(parsed.message || 'Không xuất được báo cáo');
          return;
        } catch {
          /* fall through */
        }
      }
      message.error(err.message || 'Không xuất được báo cáo');
    } finally {
      setExporting(false);
    }
  };

  /*
  const handleClearFilters = () => {
    setPartFilter(undefined);
    setChapterFilter(undefined);
    setAssignedUserFilter(undefined);
    setDepartmentFilter(undefined);
    setNotAchievedFilter(undefined);
    setKeywordInput('');
    setKeyword('');
  };
  */

  const byLevel = summary?.byLevel || {
    level1: 0,
    level2: 0,
    level3: 0,
    level4: 0,
    level5: 0,
  };
  const totalApplied = summary?.totalApplied || 0;
  const totalStandard = summary?.totalStandard || 83;

  const levelChartData = [
    { level: 'Mức 1', count: byLevel.level1 },
    { level: 'Mức 2', count: byLevel.level2 },
    { level: 'Mức 3', count: byLevel.level3 },
    { level: 'Mức 4', count: byLevel.level4 },
    { level: 'Mức 5', count: byLevel.level5 },
  ];

  const partChartData = (summary?.byPart || []).map((p) => ({
    label: `${p.part}. ${p.label}`,
    avgScore: Number(Number(p.avgScore).toFixed(2)),
  }));

  const notAchievedCriteriaList = useMemo(() => {
    const source = matrix.length ? matrix : details;
    return source.filter(isCriteriaBelowExpectedLevel).map((c) => ({
      _id: c._id,
      code: c.code,
      name: c.name,
      currentLevel: getCriteriaCurrentLevel(c),
      expectedLevel: getCriteriaExpectedLevel(c),
      departmentName: c.departmentName,
    }));
  }, [matrix, details]);

  const excludedCodesText = summary?.excludedCodes?.length
    ? summary.excludedCodes.join(', ')
    : 'C4.5, C4.6, C5.1';

  const summaryStatBlocks = [
    {
      label: 'Tiêu chí áp dụng',
      value: `${totalApplied}/${totalStandard}`,
      tooltip: `Tổng số tiêu chí được áp dụng đánh giá trên bộ chuẩn ${totalStandard} tiêu chí. Không đánh giá ${excludedCodesText}.`,
    },
    {
      label: 'Tỷ lệ áp dụng',
      value: `${summary?.appliedPercent?.toFixed(0) || 0}%`,
      tooltip: `Tỷ lệ tiêu chí áp dụng = ${totalApplied}/${totalStandard} tiêu chí chuẩn.`,
    },
    {
      label: 'Tổng điểm',
      value: summary?.totalWeightedScore || 0,
      tooltip: `Tổng điểm có hệ số chương (C3/C5 nhân 2). Hệ số: ${summary?.totalWeight || 0}.`,
    },
    {
      label: 'Điểm trung bình',
      value: summary?.overallScore?.toFixed(2) || '0.00',
      tooltip: 'Điểm trung bình chung các tiêu chí được áp dụng đánh giá.',
    },
  ];

  const percentageByLevel = {
    level1: totalApplied ? ((byLevel.level1 / totalApplied) * 100).toFixed(2) : '0',
    level2: totalApplied ? ((byLevel.level2 / totalApplied) * 100).toFixed(2) : '0',
    level3: totalApplied ? ((byLevel.level3 / totalApplied) * 100).toFixed(2) : '0',
    level4: totalApplied ? ((byLevel.level4 / totalApplied) * 100).toFixed(2) : '0',
    level5: totalApplied ? ((byLevel.level5 / totalApplied) * 100).toFixed(2) : '0',
  };

  const summaryLevelColumns = [
    { title: 'KẾT QUẢ CHUNG CHIA THEO MỨC', dataIndex: 'label', key: 'label', width: 280 },
    { title: 'Mức 1', dataIndex: 'level1', key: 'level1', width: 90 },
    { title: 'Mức 2', dataIndex: 'level2', key: 'level2', width: 90 },
    { title: 'Mức 3', dataIndex: 'level3', key: 'level3', width: 90 },
    { title: 'Mức 4', dataIndex: 'level4', key: 'level4', width: 90 },
    { title: 'Mức 5', dataIndex: 'level5', key: 'level5', width: 90 },
    { title: 'Tổng số tiêu chí', dataIndex: 'total', key: 'total', width: 140 },
  ];

  const summaryLevelData = [
    {
      key: 'count',
      label: '5. SỐ LƯỢNG TIÊU CHÍ ĐẠT:',
      level1: byLevel.level1,
      level2: byLevel.level2,
      level3: byLevel.level3,
      level4: byLevel.level4,
      level5: byLevel.level5,
      total: totalApplied,
    },
    {
      key: 'percent',
      label: '6. % TIÊU CHÍ ĐẠT:',
      level1: percentageByLevel.level1,
      level2: percentageByLevel.level2,
      level3: percentageByLevel.level3,
      level4: percentageByLevel.level4,
      level5: percentageByLevel.level5,
      total: totalApplied,
    },
  ];

  const partColumns = [
    { title: 'Nhóm tiêu chí', dataIndex: 'label', key: 'label' },
    { title: 'Phần', dataIndex: 'part', key: 'part', width: 80 },
    { title: 'Số tiêu chí', dataIndex: 'count', key: 'count', width: 100 },
    {
      title: 'Điểm trung bình',
      dataIndex: 'avgScore',
      key: 'avgScore',
      width: 120,
      render: (v) => Number(v).toFixed(2),
    },
  ];

  const departmentColumns = [
    { title: 'STT', dataIndex: 'rank', key: 'rank', width: 60 },
    { title: 'Khoa/Phòng', dataIndex: 'name', key: 'name' },
    { title: 'Số tiêu chí phụ trách', dataIndex: 'count', key: 'count', width: 140 },
    {
      title: 'Điểm trung bình',
      dataIndex: 'avgScore',
      key: 'avgScore',
      width: 120,
      render: (v) => Number(v).toFixed(2),
    },
    { title: 'Xếp hạng', dataIndex: 'rank', key: 'rankCol', width: 90 },
  ];

  const belowLevel3Columns = [
    { title: 'STT', key: 'stt', width: 60, render: (_, __, i) => i + 1 },
    { title: 'Mã', dataIndex: 'code', key: 'code', width: 100 },
    { title: 'Tên tiêu chí', dataIndex: 'name', key: 'name' },
    { title: 'Mức đạt', dataIndex: 'currentLevel', key: 'currentLevel', width: 90 },
    { title: 'Mức dự kiến', dataIndex: 'expectedLevel', key: 'expectedLevel', width: 100 },
    { title: 'Khoa/Phòng', dataIndex: 'departmentName', key: 'departmentName', width: 160 },
  ];

  const matrixColumns = [
    { title: 'Mã số', dataIndex: 'code', key: 'code', width: 90 },
    { title: 'Chỉ tiêu', dataIndex: 'name', key: 'name' },
    {
      title: 'Điểm đánh giá hiện tại',
      dataIndex: 'currentLevel',
      key: 'currentLevel',
      width: 120,
      render: (_, record) => getCriteriaCurrentLevel(record),
    },
    {
      title: 'Kế hoạch',
      dataIndex: 'expectedLevel',
      key: 'expectedLevel',
      width: 90,
      render: (_, record) => getCriteriaExpectedLevel(record),
    },
    {
      title: 'Khoa/Phòng phụ trách',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 160,
    },
  ];

  const detailColumns = [
    { title: 'Mã', dataIndex: 'code', key: 'code' },
    { title: 'Tên tiêu chí', dataIndex: 'name', key: 'name' },
    {
      title: 'Mức hiện tại',
      dataIndex: 'currentLevel',
      key: 'currentLevel',
      render: (val) => (val === undefined || val === null || val === 0 ? 1 : val),
    },
    { title: 'Mức dự kiến', dataIndex: 'expectedLevel', key: 'expectedLevel' },
    {
      title: 'Trạng thái / Tiến độ',
      key: 'progress',
      width: 220,
      render: (_, record) => {
        const inactive = record.status === false;
        const p = getCriteriaProgressPercent(record);
        const { label, tagColor } = getCriteriaProgressStatus(p);
        return (
          <div style={{ minWidth: 180 }}>
            <Tag color={inactive ? 'default' : tagColor}>{inactive ? 'Vô hiệu' : label}</Tag>
            {!inactive && (
              <Progress percent={p} size="small" style={{ marginTop: 8 }} format={(n) => `${n}%`} />
            )}
          </div>
        );
      },
    },
    {
      title: 'Ngày hạn chót',
      dataIndex: 'expectedLevelCompletionDate',
      key: 'expectedLevelCompletionDate',
      render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
    },
    { title: 'Khoa/Phòng', dataIndex: 'departmentName', key: 'departmentName' },
  ];

  const reportTableProps = {
    className: REPORT_TABLE_CLASS,
    bordered: true,
    size: 'middle',
  };

  return (
    <div className="report-quality-page">
      <style>
        {`
          .report-quality-page .${REPORT_TABLE_CLASS} .ant-table-thead > tr > th {
            background: #f3f4f5 !important;
            color: #141414 !important;
            font-weight: 600 !important;
            border-color: #e8e8e8 !important;
          }
          .report-quality-page .${REPORT_TABLE_CLASS} .ant-table-tbody > tr > td {
            border-color: #f0f0f0;
          }
          .report-quality-page .${REPORT_TABLE_CLASS} .ant-table-tbody > tr:nth-child(even) > td {
            background: #fafcff;
          }
          .report-quality-page .${REPORT_TABLE_CLASS} .ant-table-tbody > tr.report-matrix-below-plan > td {
            background: #fff1f0 !important;
            color: #cf1322;
          }
          .report-quality-page .${REPORT_TABLE_CLASS} .ant-table-tbody > tr.report-matrix-below-plan:hover > td {
            background: #ffccc7 !important;
          }
        `}
      </style>
      {/*
      <Card title="Bộ lọc báo cáo" style={{ marginBottom: 16 }} loading={loadingOptions}>
        <Space wrap align="start" size="middle">
          <Input
            placeholder="Tìm kiếm theo mã / tên tiêu chí"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            style={{ width: 260 }}
            allowClear
            suffix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          />
          <Select
            placeholder="Phần"
            value={partFilter}
            onChange={setPartFilter}
            style={{ width: 120 }}
            allowClear
          >
            {partOptions.map((part) => (
              <Option key={part} value={part}>
                {part}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Chương"
            value={chapterFilter}
            onChange={setChapterFilter}
            style={{ width: 140 }}
            allowClear
          >
            {chapterOptions.map((chapter) => (
              <Option key={chapter} value={chapter}>
                {chapter}
              </Option>
            ))}
          </Select>
          {showDepartmentFilter && (
            <Select
              placeholder="Khoa/Phòng"
              value={departmentFilter}
              onChange={setDepartmentFilter}
              style={{ width: 200 }}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {departmentOptions.map((dept) => (
                <Option key={dept._id} value={dept._id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          )}
          {canFilterByAssignee && (
            <Select
              placeholder="Người phụ trách"
              value={assignedUserFilter}
              onChange={setAssignedUserFilter}
              style={{ width: 200 }}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {userOptions.map((u) => (
                <Option key={u._id} value={u._id}>
                  {u.username}
                </Option>
              ))}
            </Select>
          )}
          <Select
            placeholder="Tiêu đạt"
            value={notAchievedFilter}
            onChange={setNotAchievedFilter}
            style={{ width: 220 }}
            allowClear
          >
            <Option value="not_achieved">Chưa đạt mức dự kiến</Option>
          </Select>
          <Button onClick={() => fetchReport()} loading={loading}>
            Làm mới dữ liệu
          </Button>
          <Button onClick={handleClearFilters}>Xóa bộ lọc</Button>
        </Space>
      </Card>
      */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 16,
        }}
      >
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          loading={exporting}
          onClick={handleExportReport}
        >
          Xuất báo cáo Word
        </Button>
      </div>

      <Card style={REPORT_CARD_STYLE} styles={{ body: { padding: 28 } }} loading={loading}>
        <ReportSectionTitle>I. TÓM TẮT KẾT QUẢ BỘ TIÊU CHÍ CHẤT LƯỢNG BỆNH VIỆN</ReportSectionTitle>
        <Row gutter={[24, 24]} style={{ marginBottom: 28 }}>
          {summaryStatBlocks.map((block) => (
            <Col key={block.label} xs={24} sm={12}>
              <SummaryStatBlock label={block.label} value={block.value} tooltip={block.tooltip} />
            </Col>
          ))}
        </Row>

        <Table
          {...reportTableProps}
          columns={summaryLevelColumns}
          dataSource={summaryLevelData}
          pagination={false}
          rowKey="key"
          style={{ marginBottom: 28 }}
        />

        <ReportChartTitle>Biểu đồ 1. Phân bố tiêu chí theo mức</ReportChartTitle>
        <Column
          data={levelChartData}
          xField="level"
          yField="count"
          height={300}
          scale={{ x: { padding: 0.35 } }}
          label={{ position: 'top', style: { fill: '#434343', fontWeight: 500 } }}
          color={CHART_COLOR_3}
          style={columnChartStyle}
          axis={{
            x: { title: false, line: true, tick: true },
            y: { title: false, grid: true, gridLineDash: [4, 4] },
          }}
        />
      </Card>

      <Card style={REPORT_CARD_STYLE} styles={{ body: { padding: 28 } }} loading={loading}>
        <ReportSectionTitle>II. KẾT QUẢ THEO NHÓM TIÊU CHÍ</ReportSectionTitle>
        <Table
          {...reportTableProps}
          columns={partColumns}
          dataSource={summary?.byPart || []}
          rowKey="part"
          pagination={false}
          style={{ marginBottom: 28 }}
        />
        <ReportChartTitle>Biểu đồ 2. Điểm trung bình theo nhóm tiêu chí</ReportChartTitle>
        <Column
          data={partChartData}
          xField="label"
          yField="avgScore"
          height={320}
          scale={{ y: { domain: [0, 5], nice: false }, x: { padding: 0.35 } }}
          label={{
            text: (d) => Number(d.avgScore).toFixed(2),
            position: 'top',
            style: { fill: '#434343', fontWeight: 500 },
          }}
          color={CHART_COLOR_3}
          style={columnChartStyle}
          axis={{
            x: { title: false, line: true, tick: true, labelAutoRotate: true },
            y: { title: false, grid: true, gridLineDash: [4, 4] },
          }}
        />
      </Card>

      <Card style={REPORT_CARD_STYLE} styles={{ body: { padding: 28 } }} loading={loading}>
        <ReportSectionTitle>III. KẾT QUẢ THEO KHOA/PHÒNG PHỤ TRÁCH</ReportSectionTitle>
        <Table
          {...reportTableProps}
          columns={departmentColumns}
          dataSource={summary?.byDepartment || []}
          rowKey={(r) => r.departmentId || r.name}
          pagination={false}
        />
      </Card>

      <Card style={REPORT_CARD_STYLE} styles={{ body: { padding: 28 } }} loading={loading}>
        <ReportSectionTitle>IV. DANH SÁCH TIÊU CHÍ DƯỚI MỨC 3</ReportSectionTitle>
        <Table
          {...reportTableProps}
          columns={belowLevel3Columns}
          dataSource={belowLevel3}
          rowKey="_id"
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Card style={REPORT_CARD_STYLE} styles={{ body: { padding: 28 } }} loading={loading}>
        <ReportSectionTitle>V. CÁC TIÊU CHÍ CHƯA ĐẠT KẾ HOẠCH</ReportSectionTitle>
        <Table
          {...reportTableProps}
          columns={belowLevel3Columns}
          dataSource={notAchievedCriteriaList}
          rowKey="_id"
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Card style={REPORT_CARD_STYLE} styles={{ body: { padding: 28 } }} loading={loading}>
        <ReportSectionTitle>VI. KẾT QUẢ ĐÁNH GIÁ THEO BỘ TIÊU CHÍ</ReportSectionTitle>
        <Table
          {...reportTableProps}
          columns={matrixColumns}
          dataSource={matrix}
          rowKey="_id"
          pagination={{ pageSize: 50 }}
          rowClassName={(record) =>
            isCriteriaBelowExpectedLevel(record) ? 'report-matrix-below-plan' : ''
          }
        />
      </Card>

      <Card style={REPORT_CARD_STYLE} styles={{ body: { padding: 28 } }} loading={loading}>
        <ReportSectionTitle>Báo cáo chi tiết</ReportSectionTitle>
        <Table
          {...reportTableProps}
          columns={detailColumns}
          dataSource={details}
          rowKey={(r) => r._id || r.code}
          pagination={{ pageSize: 50 }}
        />
      </Card>
    </div>
  );
};

export default Report;
