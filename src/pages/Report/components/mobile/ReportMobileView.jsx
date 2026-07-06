import { InfoCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Tooltip, Typography } from 'antd';
import DepartmentRankingChart from '../charts/DepartmentRankingChart';
import LevelDistributionDonutChart from '../charts/LevelDistributionDonutChart';
import PartGroupLevelStackedChart from '../charts/PartGroupLevelStackedChart';
import BelowLevel4CardList from './BelowLevel4CardList';
import DetailCardList from './DetailCardList';
import MatrixCardList from './MatrixCardList';
import NotAchievedGroupedCardList from './NotAchievedGroupedCardList';
import '../../styles/report.less';

const { Text, Title } = Typography;

const SECTION_NAV = [
  { id: 'section-i', label: 'I' },
  { id: 'section-ii', label: 'II' },
  { id: 'section-iii', label: 'III' },
  { id: 'section-iv', label: 'IV' },
  { id: 'section-v', label: 'V' },
  { id: 'section-vi', label: 'VI' },
  { id: 'section-detail', label: 'Chi tiết' },
];

const MobileStatBlock = ({ label, value, tooltip, accent, background, highlight = false }) => (
  <div
    className={
      highlight ? 'report-mobile-stat report-mobile-stat--highlight' : 'report-mobile-stat'
    }
    style={{
      background: background || '#fff',
      border: highlight ? `2px solid ${accent}` : `1px solid ${accent}33`,
      borderRadius: 12,
      padding: highlight ? '14px 12px' : '12px',
      minHeight: highlight ? 96 : 88,
      boxShadow: highlight ? `0 8px 20px ${accent}33` : `0 4px 12px ${accent}1f`,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <Text style={{ fontSize: 12, fontWeight: 600, color: '#595959' }}>{label}</Text>
      <Tooltip title={tooltip}>
        <InfoCircleOutlined style={{ color: accent, fontSize: 13 }} />
      </Tooltip>
    </div>
    <div
      className="report-mobile-stat-value"
      style={{
        fontSize: highlight ? 34 : 28,
        fontWeight: 800,
        color: accent,
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
      }}
    >
      {value}
    </div>
  </div>
);

const MobileChartPanel = ({ title, description, children }) => (
  <div className="report-mobile-chart-panel">
    <div className="report-mobile-chart-title">{title}</div>
    {description ? <div className="report-mobile-chart-desc">{description}</div> : null}
    {children}
  </div>
);

const ReportMobileView = ({
  loading,
  exporting,
  onExport,
  summaryStatBlocks,
  goalStatusStatBlocks,
  levelChartData,
  totalApplied,
  partStackedChartData,
  departmentChartData,
  belowLevel4,
  notAchievedSubcriteria,
  matrix,
  details,
}) => (
  <div className="report-quality-page report-quality-page--mobile">
    <nav className="report-mobile-nav" aria-label="Điều hướng báo cáo">
      {SECTION_NAV.map((item) => (
        <a key={item.id} href={`#${item.id}`}>
          {item.label}
        </a>
      ))}
    </nav>

    <Card id="section-i" className="report-mobile-section" loading={loading}>
      <div className="report-mobile-header">
        <Title level={4} className="report-mobile-section-title">
          I. TÓM TẮT KẾT QUẢ
        </Title>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          loading={exporting}
          onClick={onExport}
          className="report-mobile-export-btn"
        >
          Xuất báo cáo Word
        </Button>
      </div>

      <Row gutter={[8, 8]} style={{ marginBottom: 10 }}>
        {summaryStatBlocks.map((block) => (
          <Col key={block.label} span={block.highlight ? 24 : 12}>
            <MobileStatBlock {...block} />
          </Col>
        ))}
      </Row>

      <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
        {goalStatusStatBlocks.map((block) => (
          <Col key={block.label} xs={24} sm={8}>
            <MobileStatBlock {...block} />
          </Col>
        ))}
      </Row>

      <MobileChartPanel
        title="Biểu đồ 1. Phân bố tiêu chí theo mức"
        description="Tỷ lệ và số lượng tiêu chí đạt từng mức"
      >
        <LevelDistributionDonutChart data={levelChartData} total={totalApplied} compact />
      </MobileChartPanel>
    </Card>

    <Card id="section-ii" className="report-mobile-section" loading={loading}>
      <Title level={4} className="report-mobile-section-title">
        II. KẾT QUẢ THEO NHÓM TIÊU CHÍ
      </Title>
      <MobileChartPanel
        title="Biểu đồ 2. Điểm trung bình theo nhóm"
        description="Số tiêu chí theo từng mức và điểm trung bình mỗi nhóm"
      >
        <PartGroupLevelStackedChart data={partStackedChartData} compact />
      </MobileChartPanel>
    </Card>

    <Card id="section-iii" className="report-mobile-section" loading={loading}>
      <Title level={4} className="report-mobile-section-title">
        III. KẾT QUẢ THEO KHOA/PHÒNG
      </Title>
      <MobileChartPanel
        title="Biểu đồ 3. Xếp hạng khoa/phòng"
        description="Thứ tự xếp hạng và điểm trung bình theo đơn vị"
      >
        <DepartmentRankingChart data={departmentChartData} compact />
      </MobileChartPanel>
    </Card>

    <Card id="section-iv" className="report-mobile-section" loading={loading}>
      <Title level={4} className="report-mobile-section-title">
        IV. TIÊU CHÍ DƯỚI MỨC 4
      </Title>
      <BelowLevel4CardList data={belowLevel4} />
    </Card>

    <Card id="section-v" className="report-mobile-section" loading={loading}>
      <Title level={4} className="report-mobile-section-title">
        V. CHƯA ĐẠT KẾ HOẠCH
      </Title>
      <NotAchievedGroupedCardList data={notAchievedSubcriteria} />
    </Card>

    <Card id="section-vi" className="report-mobile-section" loading={loading}>
      <Title level={4} className="report-mobile-section-title">
        VI. KẾT QUẢ ĐÁNH GIÁ
      </Title>
      <MatrixCardList data={matrix} />
    </Card>

    <Card id="section-detail" className="report-mobile-section" loading={loading}>
      <Title level={4} className="report-mobile-section-title">
        Báo cáo chi tiết
      </Title>
      <DetailCardList data={details} />
    </Card>
  </div>
);

export default ReportMobileView;
