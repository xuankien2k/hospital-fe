import React from 'react';
import HospitalBrandBanner from '../HospitalBrandBanner';

const Footer: React.FC = () => {
  return (
    <div style={{ padding: '24px 24px 16px' }}>
      <HospitalBrandBanner variant="footer" />
      <div style={{ textAlign: 'center', color: '#8c8c8c', fontSize: 12, marginTop: 12 }}>
        {new Date().getFullYear()} · Quản lý Bộ tiêu chí chất lượng bệnh viện
      </div>
    </div>
  );
};

export default Footer;
