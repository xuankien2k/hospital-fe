import React from 'react';
import { Alert } from 'antd';

const TrendsDemoNotice = ({ demoMode = false }) => {
  if (!demoMode) {
    return null;
  }

  return (
    <Alert
      className="trends-page__notice trends-page__notice--demo"
      type="warning"
      showIcon
      message="Đang hiển thị dữ liệu snapshot DEMO"
      description="Dữ liệu production vẫn được giữ nguyên. Tắt TRENDS_DEMO_MODE trên server để quay lại snapshot thật."
    />
  );
};

export default TrendsDemoNotice;
