import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useModel } from '@umijs/max';
import { Table, Card, Input, Select, message, Tag, Progress, Button, Space } from 'antd';
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
const TOTAL_CRITERIA_STANDARD = 83;

const Report = () => {
  const { initialState } = useModel('@@initialState');
  const currentUser =
    initialState?.currentUser || JSON.parse(localStorage.getItem('currentUser') || 'null');

  const canFilterByAssignee = useMemo(() => {
    return isContentAdmin(currentUser?.role) || currentUser?.role === 'director';
  }, [currentUser?.role]);

  const showDepartmentFilter = useMemo(() => {
    return canFilterByDepartment(currentUser?.role);
  }, [currentUser?.role]);

  const [data, setData] = useState([]);
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
  const [reportMeta, setReportMeta] = useState({
    totalCriteria: 0,
    totalWeightedScore: 0,
    totalWeight: 0,
    overallScore: 0,
  });

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
      const parts = [...new Set(criteria.map((c) => c.part).filter(Boolean))].sort();
      const chapters = [...new Set(criteria.map((c) => c.chapter).filter(Boolean))].sort();
      setPartOptions(parts);
      setChapterOptions(chapters);
      setUserOptions(usersRes.data?.data || []);
      setDepartmentOptions(deptRes.data?.data || []);
    } catch {
      /* bỏ qua: vẫn dùng được báo cáo */
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
      const criteriaList = report.details;

      setReportMeta({
        totalCriteria: report.totalCriteria || 0,
        totalWeightedScore: report.totalWeightedScore || 0,
        totalWeight: report.totalWeight || 0,
        overallScore:
          typeof report.overallScore === 'number'
            ? report.overallScore
            : (report.overallAverage ?? 0),
      });
      setData(criteriaList);
    } catch (err) {
      message.error(err.message);
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
    showDepartmentFilter,
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

  const columns = [
    { title: 'Mã', dataIndex: 'code', key: 'code' },
    { title: 'Tên tiêu chí', dataIndex: 'name', key: 'name' },
    {
      title: 'Mức độ hiện tại',
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
      title: 'Ngày hoàn thành thực tế',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
    },
    {
      title: 'Ngày hạn chót',
      dataIndex: 'expectedLevelCompletionDate',
      key: 'expectedLevelCompletionDate',
      render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
    },
    {
      title: 'Người phụ trách',
      dataIndex: ['assignedUser', 'username'],
      key: 'assignedUser',
    },
  ];

  const levelStats = data.reduce(
    (acc, item) => {
      const lv =
        item.currentLevel === undefined || item.currentLevel === null || item.currentLevel === 0
          ? 1
          : item.currentLevel;
      if (lv >= 1 && lv <= 5) {
        acc.counts[`level${lv}`] += 1;
      }
      return acc;
    },
    {
      counts: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0 },
    },
  );

  const totalApplied = reportMeta.totalCriteria || data.length;
  const appliedPercent = TOTAL_CRITERIA_STANDARD
    ? (totalApplied / TOTAL_CRITERIA_STANDARD) * 100
    : 0;
  const percentageByLevel = {
    level1: totalApplied ? (levelStats.counts.level1 / totalApplied) * 100 : 0,
    level2: totalApplied ? (levelStats.counts.level2 / totalApplied) * 100 : 0,
    level3: totalApplied ? (levelStats.counts.level3 / totalApplied) * 100 : 0,
    level4: totalApplied ? (levelStats.counts.level4 / totalApplied) * 100 : 0,
    level5: totalApplied ? (levelStats.counts.level5 / totalApplied) * 100 : 0,
  };

  const summaryColumns = [
    { title: 'KẾT QUẢ CHUNG CHIA THEO MỨC', dataIndex: 'label', key: 'label', width: 280 },
    { title: 'Mức 1', dataIndex: 'level1', key: 'level1', width: 90 },
    { title: 'Mức 2', dataIndex: 'level2', key: 'level2', width: 90 },
    { title: 'Mức 3', dataIndex: 'level3', key: 'level3', width: 90 },
    { title: 'Mức 4', dataIndex: 'level4', key: 'level4', width: 90 },
    { title: 'Mức 5', dataIndex: 'level5', key: 'level5', width: 90 },
    { title: 'Tổng số tiêu chí', dataIndex: 'total', key: 'total', width: 140 },
  ];

  const summaryData = [
    {
      key: 'count',
      label: '5. SỐ LƯỢNG TIÊU CHÍ ĐẠT:',
      level1: levelStats.counts.level1,
      level2: levelStats.counts.level2,
      level3: levelStats.counts.level3,
      level4: levelStats.counts.level4,
      level5: levelStats.counts.level5,
      total: totalApplied,
    },
    {
      key: 'percent',
      label: '6. % TIÊU CHÍ ĐẠT:',
      level1: percentageByLevel.level1.toFixed(2),
      level2: percentageByLevel.level2.toFixed(2),
      level3: percentageByLevel.level3.toFixed(2),
      level4: percentageByLevel.level4.toFixed(2),
      level5: percentageByLevel.level5.toFixed(2),
      total: totalApplied,
    },
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

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 32, marginBottom: 16 }}>
          TÓM TẮT KẾT QUẢ TỰ KIỂM TRA CHẤT LƯỢNG BỆNH VIỆN
        </div>
        <div style={{ fontWeight: 600, fontSize: 24, marginBottom: 10 }}>
          1. TỔNG SỐ CÁC TIÊU CHÍ ĐƯỢC ÁP DỤNG ĐÁNH GIÁ: {totalApplied}/{TOTAL_CRITERIA_STANDARD}{' '}
          TIÊU CHÍ
        </div>
        <div style={{ fontWeight: 600, fontSize: 24, marginBottom: 10 }}>
          2. TỶ LỆ TIÊU CHÍ ÁP DỤNG SO VỚI {TOTAL_CRITERIA_STANDARD} TIÊU CHÍ:{' '}
          {appliedPercent.toFixed(0)}%
        </div>
        <div style={{ fontWeight: 600, fontSize: 24, marginBottom: 10 }}>
          3. TỔNG SỐ ĐIỂM CỦA CÁC TIÊU CHÍ ÁP DỤNG: {reportMeta.totalWeightedScore} (Có hệ số:{' '}
          {reportMeta.totalWeight})
        </div>
        <div style={{ fontWeight: 600, fontSize: 24, marginBottom: 10 }}>
          4. ĐIỂM TRUNG BÌNH CHUNG CỦA CÁC TIÊU CHÍ: {reportMeta.overallScore.toFixed(2)}
        </div>
        <div style={{ fontStyle: 'italic', fontSize: 20, marginBottom: 16 }}>
          (Tiêu chí C3 và C5 có hệ số 2 — các chỉ số trên theo đúng bộ lọc đang chọn)
        </div>
        <Table
          columns={summaryColumns}
          dataSource={summaryData}
          pagination={false}
          rowKey="key"
          bordered
        />
      </Card>

      <Card title="Báo cáo chi tiết">
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey={(r) => r._id || r.code}
        />
      </Card>
    </div>
  );
};

export default Report;
