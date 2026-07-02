import React from 'react';
import { Collapse, Typography } from 'antd';

const { Paragraph, Text } = Typography;

const CriteriaEvaluationGuide = () => (
  <Collapse
    defaultActiveKey={[]}
    style={{ marginBottom: 20, background: '#fff', borderRadius: 12 }}
    items={[
      {
        key: 'guide',
        label: <Text strong>Hướng dẫn đánh giá chất lượng bệnh viện</Text>,
        children: (
          <div style={{ fontSize: 14, lineHeight: 1.7, color: '#434343' }}>
            <Paragraph style={{ marginBottom: 12 }}>
              Lần lượt cho điểm từng tiêu chí bằng cách nhấn vào icon <strong>Hành động</strong> và
              chọn <strong>Chỉnh sửa</strong>. Cửa sổ danh sách chi tiết sẽ hiện ra — đánh dấu các
              tiêu chí con đã đạt, sau đó nhấn <strong>OK</strong>.
            </Paragraph>
            <Paragraph style={{ marginBottom: 8 }}>
              <Text strong>Nguyên tắc tính điểm tự động:</Text>
            </Paragraph>
            <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
              <li>
                Điểm sẽ là <strong>0</strong> nếu không có tiêu chí con nào được chọn.
              </li>
              <li>
                Điểm sẽ là <strong>1</strong> nếu chỉ cần 1 tiêu chí ở mức 1 (không đạt/vi phạm).
              </li>
              <li>
                Điểm sẽ là <strong>2</strong> nếu tất cả tiêu chí ở mức 2 được chọn.
              </li>
              <li>
                Điểm sẽ là <strong>3</strong> nếu tất cả tiêu chí ở mức 2 và 3 được chọn (đạt).
              </li>
              <li>
                Điểm sẽ là <strong>4</strong> nếu tất cả tiêu chí ở mức 2, 3 và 4 được chọn (đạt).
              </li>
              <li>
                Điểm sẽ là <strong>5</strong> nếu tất cả tiêu chí ở mức 2, 3, 4 và 5 được chọn
                (đạt).
              </li>
            </ul>
            <Paragraph style={{ marginBottom: 0 }}>
              <Text type="warning" strong>
                Lưu ý:
              </Text>{' '}
              Bạn phải đánh dấu tất cả các tiêu chí mà bệnh viện đạt. Hệ thống không tự tính điểm
              cao nếu chỉ chọn các tiêu chí ở mức cao nhất mà bỏ qua các mức thấp hơn.
            </Paragraph>
          </div>
        ),
      },
    ]}
  />
);

export default CriteriaEvaluationGuide;
