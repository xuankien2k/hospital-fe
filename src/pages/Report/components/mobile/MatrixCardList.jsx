import { List, Pagination } from 'antd';
import { useState } from 'react';
import {
  getCriteriaCurrentLevel,
  getCriteriaExpectedLevel,
  isCriteriaBelowExpectedLevel,
} from '../../../../utils/criteriaProgress';
import ReportCriteriaCard from './ReportCriteriaCard';

const PAGE_SIZE = 15;

const MatrixCardList = ({ data = [] }) => {
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
          const belowPlan = isCriteriaBelowExpectedLevel(record);
          return (
            <List.Item style={{ padding: '6px 0', border: 'none' }}>
              <div style={{ width: '100%' }}>
                <ReportCriteriaCard
                  code={record.code}
                  name={record.name}
                  highlight={belowPlan}
                  fields={[
                    { label: 'Điểm hiện tại', value: getCriteriaCurrentLevel(record) },
                    { label: 'Kế hoạch', value: getCriteriaExpectedLevel(record) },
                    { label: 'Khoa/Phòng', value: record.departmentName },
                  ]}
                />
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

export default MatrixCardList;
