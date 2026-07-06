import { Card } from 'antd';

const ReportCriteriaCard = ({ code, name, fields = [], highlight = false, children }) => (
  <Card
    size="small"
    className={`report-mobile-card${highlight ? ' report-mobile-card--danger' : ''}`}
    style={highlight ? undefined : { borderLeft: '4px solid #3A4AFF' }}
  >
    {code ? <div className="report-mobile-card__code">{code}</div> : null}
    {name ? <div className="report-mobile-card__name">{name}</div> : null}
    {fields.length > 0 ? (
      <div className="report-mobile-card__meta">
        {fields.map(({ label, value, danger }) => (
          <span key={label} className="report-mobile-card__meta-item">
            <span className="report-mobile-card__meta-label">{label}:</span>
            <span style={danger ? { color: '#cf1322', fontWeight: 600 } : undefined}>{value}</span>
          </span>
        ))}
      </div>
    ) : null}
    {children}
  </Card>
);

export default ReportCriteriaCard;
