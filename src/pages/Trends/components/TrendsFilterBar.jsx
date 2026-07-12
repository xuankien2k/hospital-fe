import React, { useMemo } from 'react';
import { FilterOutlined } from '@ant-design/icons';

const PERIOD_OPTIONS = [
  { label: '1 tháng', value: '1m' },
  { label: '1 quý', value: '1q' },
  { label: '6 tháng', value: '6m' },
  { label: '1 năm', value: '1y' },
];

const TrendsFilterBar = ({ periodFilter, onPeriodChange, compact = false }) => {
  const activeSummary = useMemo(() => {
    const periodLabel = PERIOD_OPTIONS.find((item) => item.value === periodFilter)?.label;
    return periodLabel ? [periodLabel] : [];
  }, [periodFilter]);

  return (
    <section className={`trends-filter${compact ? ' trends-filter--mobile' : ''}`}>
      <div className="trends-filter__header">
        <div className="trends-filter__title-wrap">
          <span className="trends-filter__icon">
            <FilterOutlined />
          </span>
          <div>
            <div className="trends-filter__title">Bộ lọc báo cáo</div>
            <div className="trends-filter__summary">
              {activeSummary.map((item) => (
                <span key={item} className="trends-filter__chip">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="trends-filter__body trends-filter__body--period-only">
        <div className="trends-filter__group trends-filter__group--period">
          <div className="trends-filter__label">Mốc thời gian</div>
          <div className="trends-filter__period-grid">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`trends-filter__period-btn${
                  periodFilter === option.value ? ' trends-filter__period-btn--active' : ''
                }`}
                onClick={() => onPeriodChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendsFilterBar;
