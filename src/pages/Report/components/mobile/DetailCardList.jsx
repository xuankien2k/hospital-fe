import { List, Pagination, Progress, Tag } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import {
  getCriteriaProgressPercent,
  getCriteriaProgressStatus,
} from '../../../../utils/criteriaProgress';
import ReportCriteriaCard from './ReportCriteriaCard';

const PAGE_SIZE = 15;

const DetailCardList = ({ data = [] }) => {
  const [page, setPage] = useState(1);
  const start = (page - 1) * PAGE_SIZE;
  const pageData = data.slice(start, start + PAGE_SIZE);

  if (!data.length) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#8c8c8c' }}>Không có dữ liệu</div>
    );
  }

  return (
    <>
      <List
        dataSource={pageData}
        renderItem={(record) => {
          const inactive = record.status === false;
          const progress = getCriteriaProgressPercent(record);
          const { label, tagColor } = getCriteriaProgressStatus(progress);
          const deadline = record.expectedLevelCompletionDate
            ? dayjs(record.expectedLevelCompletionDate).format('DD/MM/YYYY')
            : '-';
          const deadlineDate = record.expectedLevelCompletionDate
            ? new Date(record.expectedLevelCompletionDate)
            : null;
          const deadlineDanger = deadlineDate && deadlineDate < new Date() ? { danger: true } : {};

          return (
            <List.Item style={{ padding: '6px 0', border: 'none' }}>
              <div style={{ width: '100%' }}>
                <ReportCriteriaCard
                  code={record.code}
                  name={record.name}
                  fields={[
                    {
                      label: 'Mức hiện tại',
                      value:
                        record.currentLevel === undefined ||
                        record.currentLevel === null ||
                        record.currentLevel === 0
                          ? 1
                          : record.currentLevel,
                    },
                    { label: 'Mức dự kiến', value: record.expectedLevel },
                    { label: 'Hạn chót', value: deadline, ...deadlineDanger },
                    { label: 'Khoa/Phòng', value: record.departmentName },
                  ]}
                >
                  <div style={{ marginTop: 4 }}>
                    <Tag color={inactive ? 'default' : tagColor}>
                      {inactive ? 'Vô hiệu' : label}
                    </Tag>
                    {!inactive ? (
                      <Progress
                        percent={progress}
                        size="small"
                        style={{ marginTop: 8 }}
                        format={(n) => `${n}%`}
                      />
                    ) : null}
                  </div>
                </ReportCriteriaCard>
              </div>
            </List.Item>
          );
        }}
      />
      {data.length > PAGE_SIZE ? (
        <Pagination
          current={page}
          pageSize={PAGE_SIZE}
          total={data.length}
          onChange={setPage}
          size="small"
          style={{ marginTop: 8, textAlign: 'center' }}
          showSizeChanger={false}
        />
      ) : null}
    </>
  );
};

export default DetailCardList;
