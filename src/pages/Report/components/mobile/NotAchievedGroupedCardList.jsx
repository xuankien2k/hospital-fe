import { List, Pagination } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { groupNotAchievedByCriteria } from '../../utils/groupNotAchievedByCriteria';
import ReportCriteriaCard from './ReportCriteriaCard';

const PAGE_SIZE = 8;

const NotAchievedGroupedCardList = ({ data = [] }) => {
  const [page, setPage] = useState(1);
  const groups = useMemo(() => groupNotAchievedByCriteria(data), [data]);
  const start = (page - 1) * PAGE_SIZE;
  const pageData = groups.slice(start, start + PAGE_SIZE);

  if (!groups.length) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#8c8c8c' }}>Không có dữ liệu</div>
    );
  }

  return (
    <>
      <List
        dataSource={pageData}
        renderItem={(group) => {
          const deadline = group.expectedLevelCompletionDate
            ? dayjs(group.expectedLevelCompletionDate).format('DD/MM/YYYY')
            : '-';

          return (
            <List.Item style={{ padding: '6px 0', border: 'none' }}>
              <div style={{ width: '100%' }}>
                <ReportCriteriaCard
                  code={group.code}
                  name={group.criteriaName}
                  fields={[
                    {
                      label: 'Mức',
                      value: `${group.currentLevel} → ${group.expectedLevel}`,
                    },
                    { label: 'Hạn', value: deadline },
                    { label: 'Khoa', value: group.departmentName },
                  ]}
                >
                  <ul className="report-mobile-subcriteria">
                    {group.subItems.map((sub, index) => {
                      const orderPrefix =
                        sub.subOrderNumber !== null && sub.subOrderNumber !== undefined
                          ? `${sub.subOrderNumber}.`
                          : '';
                      const label = sub.levelNumber
                        ? `Mức ${sub.levelNumber}: ${orderPrefix}${sub.subcriteriaText}`
                        : `${orderPrefix}${sub.subcriteriaText}`;
                      const content = sub.isDone ? `${label} (đã đạt)` : label;
                      const className = [
                        sub.isDone ? 'report-mobile-subcriteria--done' : '',
                        sub.highlightRed ? 'report-mobile-subcriteria--danger' : '',
                      ]
                        .filter(Boolean)
                        .join(' ');

                      return (
                        <li key={`${sub.levelNumber}-${index}`} className={className || undefined}>
                          {content}
                        </li>
                      );
                    })}
                  </ul>
                </ReportCriteriaCard>
              </div>
            </List.Item>
          );
        }}
      />
      {groups.length > PAGE_SIZE ? (
        <Pagination
          current={page}
          pageSize={PAGE_SIZE}
          total={groups.length}
          onChange={setPage}
          size="small"
          style={{ marginTop: 8, textAlign: 'center' }}
          showSizeChanger={false}
        />
      ) : null}
    </>
  );
};

export default NotAchievedGroupedCardList;
