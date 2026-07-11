import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useModel } from '@umijs/max';
import { Alert, Card, message, Spin, Typography } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import axiosInstance from '../../utils/axiosInstance';
import { getApiErrorMessage } from '../../utils/apiError';
import { canFilterByDepartment, getCriteriaDepartmentOptions } from '../../utils/departments';
import { getCurrentUser as getStoredUser } from '../../utils/authStorage';
import { useCompactBreakpoint } from '../../hooks/useCompactBreakpoint';
import TrendsFilterBar from './components/TrendsFilterBar';
import TrendsMobileView from './components/mobile/TrendsMobileView';
import OverallTrendChart from './components/OverallTrendChart';
import PartTrendChart from './components/PartTrendChart';
import DepartmentTrendChart from './components/DepartmentTrendChart';
import CriteriaGroupTrendPanel from './components/CriteriaGroupTrendPanel';
import CriteriaAnalysisPanel from './components/CriteriaAnalysisPanel';
import './styles/trends.less';

const { Title, Text } = Typography;

const Trends = () => {
  const { isDesktop } = useCompactBreakpoint();
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser || getStoredUser();

  const showDepartmentFilter = useMemo(
    () => canFilterByDepartment(currentUser?.role),
    [currentUser?.role],
  );

  const [loading, setLoading] = useState(false);
  const [periodFilter, setPeriodFilter] = useState('1y');
  const [partFilter, setPartFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState(undefined);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [trend, setTrend] = useState(null);
  const [snapshots, setSnapshots] = useState([]);

  const loadDepartments = useCallback(async () => {
    if (!showDepartmentFilter) return;
    try {
      const response = await axiosInstance.get('/api/departments/list');
      setDepartmentOptions(getCriteriaDepartmentOptions(response.data?.data || []));
    } catch {
      // bỏ qua
    }
  }, [showDepartmentFilter]);

  const loadSnapshots = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/report/snapshots');
      setSnapshots(response.data?.periods || []);
    } catch {
      // bỏ qua
    }
  }, []);

  const fetchTrends = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/api/report/trends', {
        period: periodFilter,
        part: partFilter || undefined,
        departmentId: departmentFilter || undefined,
      });
      setTrend(response.data?.trend || null);
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Không tải được báo cáo xu hướng'));
    } finally {
      setLoading(false);
    }
  }, [periodFilter, partFilter, departmentFilter]);

  useEffect(() => {
    loadDepartments();
    loadSnapshots();
  }, [loadDepartments, loadSnapshots]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  const latestSnapshot = snapshots[0];
  const overallTrend = trend?.overallTrend || [];
  const periodLabels = overallTrend.map((item) => item.label);
  const latestPoint = overallTrend[overallTrend.length - 1];
  const firstPoint = overallTrend[0];
  const scoreDelta =
    latestPoint && firstPoint
      ? Number((latestPoint.overallScore - firstPoint.overallScore).toFixed(2))
      : 0;

  if (!isDesktop) {
    return (
      <TrendsMobileView
        loading={loading}
        trend={trend}
        latestSnapshot={latestSnapshot}
        overallTrend={overallTrend}
        periodLabels={periodLabels}
        scoreDelta={scoreDelta}
        periodFilter={periodFilter}
        onPeriodChange={setPeriodFilter}
        partFilter={partFilter}
        onPartChange={setPartFilter}
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        showDepartmentFilter={showDepartmentFilter}
        departmentOptions={departmentOptions}
      />
    );
  }

  return (
    <div className="trends-page">
      <div className="trends-page__header">
        <div>
          <Title level={3} className="trends-page__title">
            <LineChartOutlined style={{ marginRight: 10, color: '#3A4AFF' }} />
            Báo cáo xu hướng
          </Title>
          <Text className="trends-page__subtitle">
            Theo dõi điểm chất lượng theo snapshot hàng tháng. Dữ liệu được chụp tự động mỗi tháng
            từ thời điểm triển khai.
          </Text>
        </div>
      </div>

      <TrendsFilterBar
        periodFilter={periodFilter}
        onPeriodChange={setPeriodFilter}
        partFilter={partFilter}
        onPartChange={setPartFilter}
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        showDepartmentFilter={showDepartmentFilter}
        departmentOptions={departmentOptions}
      />

      {!trend?.hasEnoughData ? (
        <Alert
          className="trends-page__notice"
          type="info"
          showIcon
          message="Chưa đủ dữ liệu để phân tích xu hướng"
          description="Hệ thống cần ít nhất 2 snapshot tháng. Snapshot đầu tiên đã được chụp tự động; các mốc tiếp theo sẽ được ghi nhận mỗi tháng."
        />
      ) : null}

      <Spin spinning={loading}>
        <div className="trends-page__stat-row">
          <div className="trends-page__stat-card">
            <div className="trends-page__stat-label">Số mốc snapshot</div>
            <div className="trends-page__stat-value">{trend?.snapshotCount || 0}</div>
          </div>
          <div className="trends-page__stat-card trends-page__stat-card--highlight">
            <div className="trends-page__stat-label">Điểm TB mới nhất</div>
            <div className="trends-page__stat-value">
              {latestPoint ? latestPoint.overallScore.toFixed(2) : '—'}
            </div>
          </div>
          <div className="trends-page__stat-card">
            <div className="trends-page__stat-label">Biến động trong kỳ</div>
            <div
              className="trends-page__stat-value"
              style={{
                color: scoreDelta > 0 ? '#16a34a' : scoreDelta < 0 ? '#E61515' : '#3A4AFF',
              }}
            >
              {overallTrend.length >= 2
                ? `${scoreDelta > 0 ? '+' : ''}${scoreDelta.toFixed(2)}`
                : '—'}
            </div>
          </div>
          <div className="trends-page__stat-card">
            <div className="trends-page__stat-label">Snapshot gần nhất</div>
            <div className="trends-page__stat-value trends-page__stat-value--compact">
              {latestSnapshot ? `T${latestSnapshot.month}/${latestSnapshot.year}` : '—'}
            </div>
          </div>
        </div>

        <Card bordered={false} className="trends-page__panel" styles={{ body: { padding: 0 } }}>
          <div className="trends-page__panel-inner">
            <div className="trends-page__panel-title">Xu hướng điểm trung bình chung</div>
            <Text className="trends-page__panel-desc">
              Điểm trung bình các tiêu chí được áp dụng theo từng mốc snapshot tháng.
            </Text>
            <OverallTrendChart data={overallTrend} />
          </div>
        </Card>

        <Card bordered={false} className="trends-page__panel" styles={{ body: { padding: 0 } }}>
          <div className="trends-page__panel-inner">
            <div className="trends-page__panel-title">Xu hướng theo nhóm tiêu chí</div>
            <Text className="trends-page__panel-desc">
              Điểm trung bình từng nhóm tiêu chí (Phần A–E) qua các mốc snapshot tháng.
            </Text>
            <PartTrendChart byPartTrend={trend?.byPartTrend || {}} />
          </div>
        </Card>

        <Card bordered={false} className="trends-page__panel" styles={{ body: { padding: 0 } }}>
          <div className="trends-page__panel-inner">
            <div className="trends-page__panel-title">Xu hướng theo khoa/phòng</div>
            <Text className="trends-page__panel-desc">
              So sánh điểm trung bình các tiêu chí phụ trách theo từng khoa/phòng qua thời gian.
            </Text>
            <DepartmentTrendChart byDepartmentTrend={trend?.byDepartmentTrend || []} />
          </div>
        </Card>

        <Card bordered={false} className="trends-page__panel" styles={{ body: { padding: 0 } }}>
          <div className="trends-page__panel-inner">
            <div className="trends-page__panel-title">Xu hướng từng tiêu chí</div>
            <Text className="trends-page__panel-desc">
              Mức độ từng tiêu chí theo thời gian, nhóm theo nhóm tiêu chí hoặc khoa/phòng phụ
              trách.
            </Text>
            <CriteriaGroupTrendPanel
              criteriaTrend={trend?.byCriteriaTrend || []}
              periodLabels={periodLabels}
            />
          </div>
        </Card>

        {trend?.hasEnoughData ? (
          <Card bordered={false} className="trends-page__panel" styles={{ body: { padding: 0 } }}>
            <div className="trends-page__panel-inner">
              <div className="trends-page__panel-title">Phân tích tiêu chí theo kỳ</div>
              <Text className="trends-page__panel-desc">
                So sánh mức độ tiêu chí giữa mốc đầu và mốc cuối trong khoảng thời gian đã chọn.
              </Text>
              <CriteriaAnalysisPanel analysis={trend?.criteriaAnalysis} />
            </div>
          </Card>
        ) : null}
      </Spin>
    </div>
  );
};

export default Trends;
