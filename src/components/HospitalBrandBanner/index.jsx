import React from 'react';
import { HOSPITAL_BRAND } from '../../utils/hospitalBrand';

const bannerStyle = {
  background: `linear-gradient(180deg, ${HOSPITAL_BRAND.bannerBg} 0%, #59b4de 100%)`,
  color: HOSPITAL_BRAND.bannerText,
  borderRadius: 12,
  padding: '18px 24px',
  marginBottom: 20,
  boxShadow: '0 4px 14px rgba(30, 120, 170, 0.18)',
};

const labelStyle = {
  fontWeight: 600,
  marginRight: 4,
};

const HospitalBrandBanner = ({ variant = 'full', style }) => {
  if (variant === 'footer') {
    return (
      <div style={{ ...bannerStyle, fontSize: 13, lineHeight: 1.6, ...style }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
          {HOSPITAL_BRAND.hospitalName}
        </div>
        <div>
          <span style={labelStyle}>Địa chỉ:</span>
          {HOSPITAL_BRAND.address}
        </div>
        <div>
          <span style={labelStyle}>Điện thoại:</span>
          {HOSPITAL_BRAND.phone}
        </div>
        <div>
          <span style={labelStyle}>Email:</span>
          {HOSPITAL_BRAND.email}
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...bannerStyle, ...style }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 1fr) minmax(280px, 1.4fr) minmax(200px, 0.9fr)',
          gap: 20,
          alignItems: 'center',
        }}
        className="hospital-brand-banner-grid"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <img
            src={HOSPITAL_BRAND.logo}
            alt={HOSPITAL_BRAND.hospitalName}
            style={{
              height: 68,
              width: 68,
              objectFit: 'contain',
              background: '#fff',
              borderRadius: 10,
              padding: 4,
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          />
          <div style={{ minWidth: 0, lineHeight: 1.5 }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: 15,
                letterSpacing: 0.2,
                lineHeight: 1.3,
                marginBottom: 4,
              }}
            >
              {HOSPITAL_BRAND.hospitalName}
            </div>
            <div style={{ fontSize: 12, opacity: 0.96 }}>
              <span style={labelStyle}>Địa chỉ:</span>
              {HOSPITAL_BRAND.address}
            </div>
            <div style={{ fontSize: 12, marginTop: 2, opacity: 0.96 }}>
              <span style={labelStyle}>Điện thoại:</span>
              {HOSPITAL_BRAND.phone}
            </div>
          </div>
        </div>

        <div
          style={{
            textAlign: 'center',
            padding: '4px 8px',
            borderLeft: '1px solid rgba(255,255,255,0.35)',
            borderRight: '1px solid rgba(255,255,255,0.35)',
          }}
          className="hospital-brand-banner-center"
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 'clamp(16px, 2vw, 22px)',
              lineHeight: 1.35,
              letterSpacing: 0.5,
            }}
          >
            <div style={{ whiteSpace: 'nowrap' }}>{HOSPITAL_BRAND.appTitleLine1}</div>
            <div style={{ whiteSpace: 'nowrap', marginTop: 4 }}>{HOSPITAL_BRAND.appTitleLine2}</div>
          </div>
          <div
            style={{
              fontSize: 13,
              marginTop: 6,
              fontWeight: 600,
              letterSpacing: 0.3,
              opacity: 0.95,
            }}
          >
            {HOSPITAL_BRAND.appVersion}
          </div>
        </div>

        <div
          style={{
            fontSize: 12,
            lineHeight: 1.55,
            textAlign: 'right',
            justifySelf: 'end',
          }}
          className="hospital-brand-banner-contact"
        >
          <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 13 }}>Liên hệ hỗ trợ</div>
          <div>Phòng Quản lý chất lượng bệnh viện</div>
          <div style={{ fontWeight: 700, fontSize: 15, marginTop: 4, letterSpacing: 0.3 }}>
            {HOSPITAL_BRAND.qlContactPhone}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .hospital-brand-banner-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .hospital-brand-banner-center {
            border-left: none !important;
            border-right: none !important;
            border-top: 1px solid rgba(255,255,255,0.3);
            border-bottom: 1px solid rgba(255,255,255,0.3);
            padding-top: 14px !important;
            padding-bottom: 14px !important;
          }
          .hospital-brand-banner-contact {
            text-align: center !important;
            justify-self: center !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HospitalBrandBanner;
