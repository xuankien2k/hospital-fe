import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useModel } from '@umijs/max';
import {
  Table,
  Card,
  Input,
  Select,
  message,
  Tag,
  Progress,
  Button,
  Space,
  Typography,
} from 'antd';
import { Column } from '@ant-design/plots';
import { SearchOutlined } from '@ant-design/icons';
import axiosInstance from '../../utils/axiosInstance';
import dayjs from 'dayjs';
import {
  getCriteriaProgressPercent,
  getCriteriaProgressStatus,
} from '../../utils/criteriaProgress';
import { canFilterByDepartment } from '../../utils/departments';
import { isContentAdmin } from '../../utils/roles';

const { Option } = Select;
const { Title, Text } = Typography;

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
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [partFilter, setPartFilter] = useState(undefined);
  const [chapterFilter, setChapterFilter] = useState(undefined);
  const [assignedUserFilter, setAssignedUserFilter] = useState(undefined);
  const [departmentFilter, setDepartmentFilter] = useState(undefined);
  const [notAchievedFilter, setNotAchievedFilter] = useState(undefined);
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [partOptions, setPartOptions] = useState([]);
  const [chapterOptions, setChapterOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  const [summary, setSummary] = useState(null);
  const [details, setDetails] = useState([]);
  const [belowLevel3, setBelowLevel3] = useState([]);
  const [notAchievedSubcriteria, setNotAchievedSubcriteria] = useState([]);
  const [matrix, setMatrix] = useState([]);

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
      /* bỏ qua */
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

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
      setNotAchievedSubcriteria(report.notAchievedSubcriteria || []);
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

  const handleClearFilters = () => {
    setPartFilter(undefined);
    setChapterFilter(undefined);
    setAssignedUserFilter(undefined);
    setDepartmentFilter(undefined);
    setNotAchievedFilter(undefined);
    setKeywordInput('');
    setKeyword('');
  };

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

  const subcriteriaColumns = [
    { title: 'STT', key: 'stt', width: 60, render: (_, __, i) => i + 1 },
    { title: 'Tiêu chí', dataIndex: 'code', key: 'code', width: 90 },
    { title: 'Tiểu mục chưa đạt', dataIndex: 'subcriteriaText', key: 'subcriteriaText' },
    { title: 'Mức đạt hiện tại', dataIndex: 'currentLevel', key: 'currentLevel', width: 110 },
    { title: 'Kế hoạch', dataIndex: 'expectedLevel', key: 'expectedLevel', width: 90 },
    { title: 'Khoa/Phòng', dataIndex: 'departmentName', key: 'departmentName', width: 140 },
  ];

  const matrixColumns = [
    { title: 'Mã số', dataIndex: 'code', key: 'code', width: 90 },
    { title: 'Chỉ tiêu', dataIndex: 'name', key: 'name' },
    {
      title: 'Điểm đánh giá hiện tại',
      dataIndex: 'currentLevel',
      key: 'currentLevel',
      width: 120,
      render: (val) => (val === undefined || val === null || val === 0 ? 1 : val),
    },
    { title: 'Kế hoạch', dataIndex: 'expectedLevel', key: 'expectedLevel', width: 90 },
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

  return (
    <div>
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

      <Card style={{ marginBottom: 16 }} loading={loading}>
        <Title level={3}>I. TÓM TẮT KẾT QUẢ BỘ TIÊU CHÍ CHẤT LƯỢNG BỆNH VIỆN</Title>
        <Text strong style={{ fontSize: 18, display: 'block', marginBottom: 8 }}>
          1. TỔNG SỐ CÁC TIÊU CHÍ ĐƯỢC ÁP DỤNG ĐÁNH GIÁ: {totalApplied}/{totalStandard} tiêu chí
          {summary?.excludedCodes?.length
            ? ` (không đánh giá ${summary.excludedCodes.join(', ')})`
            : ''}
        </Text>
        <Text strong style={{ fontSize: 18, display: 'block', marginBottom: 8 }}>
          2. TỶ LỆ TIÊU CHÍ ÁP DỤNG: {summary?.appliedPercent?.toFixed(0) || 0}%
        </Text>
        <Text strong style={{ fontSize: 18, display: 'block', marginBottom: 8 }}>
          3. TỔNG SỐ ĐIỂM (hệ số C3/C5 ×2): {summary?.totalWeightedScore || 0} (hệ số:{' '}
          {summary?.totalWeight || 0})
        </Text>
        <Text strong style={{ fontSize: 18, display: 'block', marginBottom: 16 }}>
          4. ĐIỂM TRUNG BÌNH CHUNG: {summary?.overallScore?.toFixed(2) || '0.00'}
        </Text>

        <Table
          columns={summaryLevelColumns}
          dataSource={summaryLevelData}
          pagination={false}
          rowKey="key"
          bordered
          style={{ marginBottom: 24 }}
        />

        <Title level={5}>Biểu đồ 1. Phân bố tiêu chí theo mức</Title>
        <Column
          data={levelChartData}
          xField="level"
          yField="count"
          height={280}
          label={{ position: 'top' }}
          color="#461901"
          style={{ marginBottom: 24 }}
        />
      </Card>

      <Card title="II. KẾT QUẢ THEO NHÓM TIÊU CHÍ" style={{ marginBottom: 16 }} loading={loading}>
        <Table
          columns={partColumns}
          dataSource={summary?.byPart || []}
          rowKey="part"
          pagination={false}
          style={{ marginBottom: 24 }}
        />
        <Title level={5}>Biểu đồ 2. Điểm trung bình theo nhóm tiêu chí</Title>
        <Column
          data={partChartData}
          xField="label"
          yField="avgScore"
          height={300}
          scale={{ y: { domain: [0, 5], nice: false } }}
          label={{
            text: (d) => Number(d.avgScore).toFixed(2),
            position: 'top',
          }}
          style={{ fill: '#953d00' }}
        />
      </Card>

      <Card
        title="III. KẾT QUẢ THEO KHOA/PHÒNG PHỤ TRÁCH"
        style={{ marginBottom: 16 }}
        loading={loading}
      >
        <Table
          columns={departmentColumns}
          dataSource={summary?.byDepartment || []}
          rowKey={(r) => r.departmentId || r.name}
          pagination={false}
        />
      </Card>

      <Card
        title="IV. DANH SÁCH TIÊU CHÍ DƯỚI MỨC 3"
        style={{ marginBottom: 16 }}
        loading={loading}
      >
        <Table
          columns={belowLevel3Columns}
          dataSource={belowLevel3}
          rowKey="_id"
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Card
        title="V. CÁC TIÊU CHÍ / TIỂU MỤC CHƯA ĐẠT KẾ HOẠCH"
        style={{ marginBottom: 16 }}
        loading={loading}
      >
        <Table
          columns={subcriteriaColumns}
          dataSource={notAchievedSubcriteria}
          rowKey={(r) => `${r.criteriaId}-${r.levelNumber}-${r.subIndex}`}
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Card
        title="VI. KẾT QUẢ ĐÁNH GIÁ THEO BỘ TIÊU CHÍ"
        style={{ marginBottom: 16 }}
        loading={loading}
      >
        <Table
          columns={matrixColumns}
          dataSource={matrix}
          rowKey="_id"
          pagination={{ pageSize: 50 }}
        />
      </Card>

      <Card title="Báo cáo chi tiết (theo bộ lọc)" loading={loading}>
        <Table
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
