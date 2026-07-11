import axiosInstance from '../../../utils/axiosInstance';
import {
  getRememberLogin,
  getSavedUsername,
  saveLoginPreferences,
  setAuthToken,
  setCurrentUser,
} from '../../../utils/authStorage';
import { HOSPITAL_BRAND } from '../../../utils/hospitalBrand';
import { getApiErrorMessage } from '../../../utils/apiError';
import { BRAND_COLOR } from '../../../utils/brandColors';
import { Helmet, history, useIntl, useModel } from '@umijs/max';
import { Alert, Button, Checkbox, Form, Input, Modal, message } from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import Settings from '../../../../config/defaultSettings';

const useStyles = createStyles(() => ({
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: '#ffffff',
    '@media (max-width: 992px)': {
      flexDirection: 'column',
    },
  },
  left: {
    flex: '0 0 45%',
    maxWidth: '45%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 32px',
    background: '#ffffff',
    '@media (max-width: 992px)': {
      flex: '1 1 auto',
      maxWidth: 'none',
      padding: '32px 24px',
    },
  },
  formWrapper: {
    width: '100%',
    maxWidth: 360,
  },
  welcomeTitle: {
    margin: 0,
    fontSize: 32,
    fontWeight: 700,
    color: '#1f1f1f',
    lineHeight: 1.25,
  },
  welcomeSubtitle: {
    margin: '10px 0 32px',
    fontSize: 15,
    color: '#8c8c8c',
    lineHeight: 1.5,
  },
  fieldLabel: {
    display: 'block',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 600,
    color: '#434343',
  },
  input: {
    height: 48,
    borderRadius: 24,
    '&&': {
      borderRadius: 24,
    },
    '& .ant-input': {
      borderRadius: 24,
    },
  },
  forgotRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: -8,
    marginBottom: 20,
  },
  forgotLink: {
    fontSize: 13,
    color: BRAND_COLOR,
    cursor: 'pointer',
    '&:hover': {
      color: '#2a38cc',
    },
  },
  rememberRow: {
    marginBottom: 24,
  },
  submitButton: {
    height: 48,
    borderRadius: 24,
    fontSize: 16,
    fontWeight: 600,
    background: BRAND_COLOR,
    borderColor: BRAND_COLOR,
    boxShadow: 'none',
    '&:hover, &:focus': {
      background: '#2a38cc !important',
      borderColor: '#2a38cc !important',
    },
  },
  right: {
    flex: '0 0 55%',
    maxWidth: '55%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
    background: '#f5f7ff',
    '@media (max-width: 992px)': {
      flex: '1 1 auto',
      maxWidth: 'none',
      minHeight: 360,
      padding: '24px 16px',
    },
  },
  brandPanel: {
    width: '100%',
    height: '100%',
    minHeight: 520,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 32,
    overflow: 'hidden',
    background: '#ffffff',
    boxShadow: '0 16px 48px rgba(58, 74, 255, 0.12)',
    border: '1px solid rgba(58, 74, 255, 0.08)',
    '@media (max-width: 992px)': {
      minHeight: 340,
      borderRadius: 24,
    },
  },
  brandBannerWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 16px 12px',
    background: 'linear-gradient(180deg, #eef3ff 0%, #f8faff 100%)',
    minHeight: 0,
  },
  brandBanner: {
    width: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    borderRadius: 12,
    display: 'block',
  },
  brandCaption: {
    padding: '20px 24px 16px',
    textAlign: 'center',
    background: '#ffffff',
    borderBottom: '1px solid rgba(58, 74, 255, 0.08)',
  },
  brandCaptionAccent: {
    width: 48,
    height: 4,
    margin: '0 auto 12px',
    borderRadius: 2,
    background: BRAND_COLOR,
  },
  brandTitle: {
    margin: 0,
    textAlign: 'center',
    fontSize: 'clamp(14px, 1.15vw, 18px)',
    fontWeight: 700,
    lineHeight: 1.4,
    color: '#1f1f1f',
    letterSpacing: 0.2,
    whiteSpace: 'nowrap',
  },
}));

const LoginMessage: React.FC<{ content: string }> = ({ content }) => (
  <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
);

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const [submitting, setSubmitting] = useState(false);
  const { setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const intl = useIntl();
  const [form] = Form.useForm<API.LoginParams>();

  useEffect(() => {
    form.setFieldsValue({
      autoLogin: getRememberLogin(),
      username: getSavedUsername() || undefined,
    });
  }, [form]);

  const fetchUserInfo = async (remember: boolean) => {
    const userInfo = await axiosInstance.get('/api/users/profile');
    if (userInfo) {
      setCurrentUser(userInfo.data, remember);
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo.data,
        }));
      });
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    const remember = !!values.autoLogin;
    setSubmitting(true);
    try {
      const response = await axiosInstance.post('/api/auth/login', {
        username: values.username,
        password: values.password,
      });

      if (response.status === 200) {
        saveLoginPreferences(remember, values.username || '');
        setAuthToken(response.data.token, remember);

        message.success(
          intl.formatMessage({
            id: 'pages.login.success',
            defaultMessage: 'Đăng nhập thành công!',
          }),
        );

        await fetchUserInfo(remember);

        history.push('/Category');
        return;
      }

      setUserLoginState(response);
    } catch (error) {
      message.error(
        getApiErrorMessage(
          error,
          intl.formatMessage({
            id: 'pages.login.failure',
            defaultMessage: 'Đăng nhập thất bại, vui lòng thử lại!',
          }),
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    Modal.info({
      title: 'Quên mật khẩu',
      content: 'Liên hệ với Admin hoặc khoa/phòng QLCLBV để xin cấp lại mật khẩu',
      okText: 'Đã hiểu',
      centered: true,
    });
  };

  const { status, type: loginType } = userLoginState;

  return (
    <div className={styles.page}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: 'Đăng nhập',
          })}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>

      <div className={styles.left}>
        <div className={styles.formWrapper}>
          <h1 className={styles.welcomeTitle}>Chào mừng trở lại!</h1>
          <p className={styles.welcomeSubtitle}>
            Đăng nhập để tiếp tục sử dụng hệ thống quản lý tiêu chí chất lượng.
          </p>

          {status === 'error' && loginType === 'account' && (
            <LoginMessage
              content={intl.formatMessage({
                id: 'pages.login.accountLogin.errorMessage',
                defaultMessage: 'Tài khoản hoặc mật khẩu không chính xác',
              })}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            initialValues={{
              autoLogin: getRememberLogin(),
              username: getSavedUsername() || undefined,
            }}
            onFinish={handleSubmit}
          >
            <Form.Item
              name="username"
              label={<span className={styles.fieldLabel}>Tên đăng nhập</span>}
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input className={styles.input} placeholder="Nhập tên đăng nhập" size="large" />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className={styles.fieldLabel}>Mật khẩu</span>}
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password className={styles.input} placeholder="Nhập mật khẩu" size="large" />
            </Form.Item>

            <div className={styles.forgotRow}>
              <a className={styles.forgotLink} onClick={handleForgotPassword}>
                Quên mật khẩu?
              </a>
            </div>

            <Form.Item name="autoLogin" valuePropName="checked" className={styles.rememberRow}>
              <Checkbox>Ghi nhớ đăng nhập</Checkbox>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={submitting}
                className={styles.submitButton}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.brandPanel}>
          <div className={styles.brandCaption}>
            <div className={styles.brandCaptionAccent} />
            <h2 className={styles.brandTitle}>Quản lý Bộ tiêu chí chất lượng bệnh viện</h2>
          </div>
          <div className={styles.brandBannerWrap}>
            <img
              src={HOSPITAL_BRAND.loginBanner}
              alt={HOSPITAL_BRAND.hospitalName}
              className={styles.brandBanner}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
