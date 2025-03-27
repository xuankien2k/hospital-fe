import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Select, message } from 'antd';
import { Pie } from '@ant-design/plots';
import axiosInstance from '../../utils/axiosInstance';
import dayjs from 'dayjs';

const { Option } = Select;

const Report = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [partFilter, setPartFilter] = useState('');
  const [chapterFilter, setChapterFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [partOptions, setPartOptions] = useState([]);
  const [chapterOptions, setChapterOptions] = useState([]);
  const [completedOnTimeCount, setCompletedOnTimeCount] = useState(0);

  useEffect(() => {
    fetchReport();
  }, [partFilter, chapterFilter, keyword]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = { part: partFilter, chapter: chapterFilter, keyword };
      const response = await axiosInstance.post('/api/report/quality', params);
      const criteriaList = response.data.report.details;

      setData(criteriaList);
      extractFilterOptions(criteriaList);
      calculateCompletionStats(criteriaList);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const extractFilterOptions = (criteriaList) => {
    const parts = [];
    const chapters = [];

    criteriaList.forEach((item) => {
      if (item.part) parts.push(item.part);
      if (item.chapter) chapters.push(item.chapter);
    });

    setPartOptions(Array.from(new Set(parts)));
    setChapterOptions(Array.from(new Set(chapters)));
  };

  const calculateCompletionStats = (criteriaList) => {
    const onTimeCount = criteriaList.reduce((count, item) => {
      const isOnTime =
        item.currentLevel >= item.expectedLevel &&
        item.updatedAt &&
        item.expectedLevelCompletionDate &&
        dayjs(item.updatedAt).isBefore(dayjs(item.expectedLevelCompletionDate).endOf('day'));

      return isOnTime ? count + 1 : count;
    }, 0);

    setCompletedOnTimeCount(onTimeCount);
  };

  const columns = [
    { title: 'Mã', dataIndex: 'code', key: 'code' },
    { title: 'Tên tiêu chí', dataIndex: 'name', key: 'name' },
    { title: 'Mức độ hiện tại', dataIndex: 'currentLevel', key: 'currentLevel' },
    { title: 'Mức dự kiến', dataIndex: 'expectedLevel', key: 'expectedLevel' },
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

  const chartData = data.reduce((acc, item) => {
    const level = `Mức ${item.currentLevel}`;
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(chartData).map((key) => ({
    type: key,
    value: chartData[key],
  }));

  const totalCriteria = data.length;
  const completedLateCount = totalCriteria - completedOnTimeCount;

  const pieDataCompleted = [
    { type: 'Hoàn thành đúng hạn', value: completedOnTimeCount },
    { type: 'Hoàn thành trễ hoặc chưa đạt', value: completedLateCount },
  ];

  return (
    <div>
      <Card title="Bộ lọc">
        <Input
          placeholder="Tìm kiếm theo từ khóa"
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 200, marginRight: 10 }}
        />
        <Select
          placeholder="Chọn phần"
          onChange={setPartFilter}
          style={{ width: 150, marginRight: 10 }}
          allowClear
        >
          {partOptions.map((part) => (
            <Option key={part} value={part}>
              {part}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="Chọn chương"
          onChange={setChapterFilter}
          style={{ width: 150 }}
          allowClear
        >
          {chapterOptions.map((chapter) => (
            <Option key={chapter} value={chapter}>
              {chapter}
            </Option>
          ))}
        </Select>
      </Card>

      <div style={{ display: 'flex', gap: 24, width: '100%' }}>
        <Card title="Thống kê mức độ hoàn thành" style={{ marginTop: 20, width: '100%' }}>
          <Pie data={pieData} angleField="value" colorField="type" height={300} />
        </Card>

        <Card title="Thống kê hoàn thành đúng hạn" style={{ marginTop: 20, width: '100%' }}>
          <Pie data={pieDataCompleted} angleField="value" colorField="type" height={300} />
        </Card>
      </div>

      <Card title="Báo cáo chi tiết" style={{ marginTop: 20 }}>
        <Table columns={columns} dataSource={data} loading={loading} rowKey="code" />
      </Card>
    </div>
  );
};

export default Report;
