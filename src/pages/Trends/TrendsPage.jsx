import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Card, message, Spin, Typography } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import axiosInstance from '../../utils/axiosInstance';
import { getApiErrorMessage } from '../../utils/apiError';
import { useCompactBreakpoint } from '@/hooks/useCompactBreakpoint';
import TrendsFilterBar from './components/TrendsFilterBar';
import TrendsDemoNotice from './components/TrendsDemoNotice';
import TrendsMobileView from './components/mobile/TrendsMobileView';
import OverallTrendChart from './components/OverallTrendChart';
import PartTrendChart from './components/PartTrendChart';
import DepartmentTrendChart from './components/DepartmentTrendChart';
import CriteriaGroupTrendPanel from './components/CriteriaGroupTrendPanel';
import CriteriaAnalysisPanel from './components/CriteriaAnalysisPanel';
import { downloadTrendSnapshot } from './utils/exportTrendSnapshot';
import './styles/trends.less';

const { Title, Text } = Typography;

const PAGE_COPY = {
  production: {
    title: 'Báo cáo xu hướng',
    subtitle:
      'Theo dõi điểm chất lượng theo snapshot hàng tháng. Dữ liệu được chụp tự động mỗi tháng từ thời điểm triển khai.',
    mobileSubtitle: 'Theo dõi điểm chất lượng theo snapshot hàng tháng.',
  },
  demo: {
    title: 'Báo cáo xu hướng demo',
    subtitle: 'Dữ liệu mẫu 24 tháng để trình diễn biểu đồ. Không ảnh hưởng snapshot production.',
    mobileSubtitle: 'Dữ liệu mẫu để trình diễn biểu đồ xu hướng.',
  },
};

const TrendsPage = ({ useDemo = false }) => {
  const { isDesktop } = useCompactBreakpoint();
  const copy = useDemo ? PAGE_COPY.demo : PAGE_COPY.production;

  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [periodFilter, setPeriodFilter] = useState('1m');
  const [trend, setTrend] = useState(null);
  const [snapshots, setSnapshots] = useState([]);

  const loadSnapshots = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/report/snapshots', {
        params: { demo: useDemo },
      });
      setSnapshots(response.data?.periods || []);
    } catch {
      // bỏ qua
    }
  }, [useDemo]);

  const fetchTrends = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/api/report/trends', {
        period: periodFilter,
        demo: useDemo,
      });
      setTrend(response.data?.trend || null);
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Không tải được báo cáo xu hướng'));
    } finally {
      setLoading(false);
    }
  }, [periodFilter, useDemo]);

  useEffect(() => {
    loadSnapshots();
  }, [loadSnapshots]);

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

  const handleDownloadSnapshot = () => {
    if (!trend?.snapshotCount) {
      message.warning('Chưa có dữ liệu snapshot để tải về');
      return;
    }

    try {
      setDownloading(true);
      const downloaded = downloadTrendSnapshot(trend, periodFilter, { useDemo });
      if (downloaded) {
        message.success('Đã tải dữ liệu snapshot');
      } else {
        message.warning('Chưa có dữ liệu snapshot để tải về');
      }
    } catch {
      message.error('Không tải được dữ liệu snapshot');
    } finally {
      setDownloading(false);
    }
  };

  const filterBarProps = {
    periodFilter,
    onPeriodChange: setPeriodFilter,
    onDownload: handleDownloadSnapshot,
    downloading,
    downloadDisabled: loading || !trend?.snapshotCount,
    snapshotCount: trend?.snapshotCount || 0,
  };

  if (!isDesktop) {
    return (
      <TrendsMobileView
        loading={loading}
        trend={trend}
        latestSnapshot={latestSnapshot}
        overallTrend={overallTrend}
        periodLabels={periodLabels}
        scoreDelta={scoreDelta}
        filterBarProps={filterBarProps}
        useDemo={useDemo}
        pageTitle={copy.title}
        pageSubtitle={copy.mobileSubtitle}
      />
    );
  }

  return (
    <div className="trends-page">
      <div className="trends-page__header">
        <div>
          <Title level={3} className="trends-page__title">
            <LineChartOutlined style={{ marginRight: 10, color: '#3A4AFF' }} />
            {copy.title}
          </Title>
          <Text className="trends-page__subtitle">{copy.subtitle}</Text>
        </div>
      </div>

      <TrendsFilterBar {...filterBarProps} />

      <TrendsDemoNotice demoMode={useDemo} />

      {!trend?.hasEnoughData ? (
        <Alert
          className="trends-page__notice"
          type="info"
          showIcon
          message={
            useDemo
              ? 'Chưa có dữ liệu demo để phân tích xu hướng'
              : 'Chưa đủ dữ liệu để phân tích xu hướng'
          }
          description={
            useDemo
              ? 'Chạy script seed demo trên server để tạo 24 tháng snapshot mẫu.'
              : 'Hệ thống cần ít nhất 2 snapshot tháng. Snapshot đầu tiên đã được chụp tự động; các mốc tiếp theo sẽ được ghi nhận mỗi tháng.'
          }
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

export default TrendsPage;
