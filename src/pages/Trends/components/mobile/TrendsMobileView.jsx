import React from 'react';
import { Alert, Card, Col, Row, Spin, Typography } from 'antd';
import { InfoCircleOutlined, LineChartOutlined } from '@ant-design/icons';
import TrendsFilterBar from '../TrendsFilterBar';
import TrendsDemoNotice from '../TrendsDemoNotice';
import OverallTrendChart from '../OverallTrendChart';
import PartTrendChart from '../PartTrendChart';
import DepartmentTrendChart from '../DepartmentTrendChart';
import CriteriaGroupTrendPanel from '../CriteriaGroupTrendPanel';
import CriteriaAnalysisPanel from '../CriteriaAnalysisPanel';

const { Text, Title } = Typography;

const SECTION_NAV = [
  { id: 'trends-summary', label: 'Tóm tắt' },
  { id: 'trends-overall', label: 'Chung' },
  { id: 'trends-part', label: 'Nhóm TC' },
  { id: 'trends-dept', label: 'Khoa' },
  { id: 'trends-criteria', label: 'Tiêu chí' },
  { id: 'trends-analysis', label: 'Phân tích' },
];

const MobileStatBlock = ({ label, value, accent = '#3A4AFF', highlight = false }) => (
  <div className={`trends-mobile-stat${highlight ? ' trends-mobile-stat--highlight' : ''}`}>
    <div className="trends-mobile-stat__label">{label}</div>
    <div className="trends-mobile-stat__value" style={{ color: accent }}>
      {value}
    </div>
  </div>
);

const MobileChartPanel = ({ title, description, children }) => (
  <div className="trends-mobile-chart-panel">
    <div className="trends-mobile-chart-panel__title">{title}</div>
    {description ? <div className="trends-mobile-chart-panel__desc">{description}</div> : null}
    {children}
  </div>
);

const TrendsMobileView = ({
  loading,
  trend,
  latestSnapshot,
  overallTrend,
  periodLabels,
  scoreDelta,
  filterBarProps,
  useDemo = false,
  pageTitle = 'Báo cáo xu hướng',
  pageSubtitle = 'Theo dõi điểm chất lượng theo snapshot hàng tháng.',
}) => {
  const latestPoint = overallTrend[overallTrend.length - 1];

  return (
    <div className="trends-page trends-page--mobile">
      <div className="trends-page__header">
        <Title level={4} className="trends-page__title">
          <LineChartOutlined style={{ marginRight: 8, color: '#3A4AFF' }} />
          {pageTitle}
        </Title>
        <Text className="trends-page__subtitle">{pageSubtitle}</Text>
      </div>

      <TrendsFilterBar {...filterBarProps} compact />

      <TrendsDemoNotice demoMode={useDemo} />

      {!trend?.hasEnoughData ? (
        <Alert
          className="trends-page__notice"
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          message="Chưa đủ dữ liệu xu hướng"
          description="Cần ít nhất 2 snapshot tháng để thấy biến động."
        />
      ) : null}

      <nav className="trends-mobile-nav" aria-label="Điều hướng xu hướng">
        {SECTION_NAV.map((item) => (
          <a key={item.id} href={`#${item.id}`}>
            {item.label}
          </a>
        ))}
      </nav>

      <Spin spinning={loading}>
        <Card id="trends-summary" className="trends-mobile-section" bordered={false}>
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <MobileStatBlock label="Mốc snapshot" value={trend?.snapshotCount || 0} />
            </Col>
            <Col span={12}>
              <MobileStatBlock
                label="Điểm TB mới nhất"
                value={latestPoint ? latestPoint.overallScore.toFixed(2) : '—'}
                highlight
              />
            </Col>
            <Col span={12}>
              <MobileStatBlock
                label="Biến động kỳ"
                value={
                  overallTrend.length >= 2
                    ? `${scoreDelta > 0 ? '+' : ''}${scoreDelta.toFixed(2)}`
                    : '—'
                }
                accent={scoreDelta > 0 ? '#16a34a' : scoreDelta < 0 ? '#E61515' : '#3A4AFF'}
              />
            </Col>
            <Col span={12}>
              <MobileStatBlock
                label="Snapshot gần nhất"
                value={latestSnapshot ? `T${latestSnapshot.month}/${latestSnapshot.year}` : '—'}
                accent="#595959"
              />
            </Col>
          </Row>
        </Card>

        <Card id="trends-overall" className="trends-mobile-section" bordered={false}>
          <MobileChartPanel
            title="Xu hướng điểm TB chung"
            description="Điểm trung bình các tiêu chí theo từng mốc tháng."
          >
            <OverallTrendChart data={overallTrend} compact />
          </MobileChartPanel>
        </Card>

        <Card id="trends-part" className="trends-mobile-section" bordered={false}>
          <MobileChartPanel
            title="Theo nhóm tiêu chí"
            description="Điểm TB Phần A–E qua các mốc snapshot."
          >
            <PartTrendChart byPartTrend={trend?.byPartTrend || {}} compact />
          </MobileChartPanel>
        </Card>

        <Card id="trends-dept" className="trends-mobile-section" bordered={false}>
          <MobileChartPanel
            title="Theo khoa/phòng"
            description="So sánh điểm TB từng khoa/phòng phụ trách."
          >
            <DepartmentTrendChart byDepartmentTrend={trend?.byDepartmentTrend || []} compact />
          </MobileChartPanel>
        </Card>

        <Card id="trends-criteria" className="trends-mobile-section" bordered={false}>
          <MobileChartPanel
            title="Xu hướng từng tiêu chí"
            description="Mức độ từng tiêu chí theo nhóm hoặc khoa/phòng."
          >
            <CriteriaGroupTrendPanel
              criteriaTrend={trend?.byCriteriaTrend || []}
              periodLabels={periodLabels}
              compact
            />
          </MobileChartPanel>
        </Card>

        {trend?.hasEnoughData ? (
          <Card id="trends-analysis" className="trends-mobile-section" bordered={false}>
            <MobileChartPanel
              title="Phân tích tiêu chí theo kỳ"
              description="Tiêu chí cải thiện, giảm mức hoặc trì trệ."
            >
              <CriteriaAnalysisPanel analysis={trend?.criteriaAnalysis} compact />
            </MobileChartPanel>
          </Card>
        ) : null}
      </Spin>
    </div>
  );
};

export default TrendsMobileView;
