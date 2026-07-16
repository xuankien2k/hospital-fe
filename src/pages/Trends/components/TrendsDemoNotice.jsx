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
      description="Dữ liệu mẫu để trình diễn biểu đồ. Tab Xu hướng chính vẫn dùng snapshot production."
    />
  );
};

export default TrendsDemoNotice;
