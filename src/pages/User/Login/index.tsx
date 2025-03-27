import { Footer } from '@/components';
import axiosInstance from '../../../utils/axiosInstance';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-components';
import { Helmet, history, useIntl, useModel } from '@umijs/max';
import { Alert, message } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import Settings from '../../../../config/defaultSettings';

const useStyles = createStyles(() => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'auto',
    background: '#f0f2f5',
  },
}));

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const { setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await axiosInstance.get('/api/users/profile');
    if (userInfo) {
      localStorage.setItem('currentUser', JSON.stringify(userInfo.data));
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo.data,
        }));
      });
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', values);

      if (response.status === 200) {
        message.success(
          intl.formatMessage({
            id: 'pages.login.success',
            defaultMessage: 'Đăng nhập thành công!',
          }),
        );

        localStorage.setItem('token', response.data.token);
        await fetchUserInfo();

        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
        return;
      }

      setUserLoginState(response);
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'pages.login.failure',
          defaultMessage: 'Đăng nhập thất bại, vui lòng thử lại!',
        }),
      );
    }
  };

  const { status, type: loginType } = userLoginState;

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: 'Đăng nhập',
          })}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>

      <div style={{ flex: '1', padding: '32px 0' }}>
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={
            <img
              alt="logo"
              src="https://bvdktinhbacgiang.vn/upload/2005838/20211221/Logo_BvDkBG_48212fa986.png"
            />
          }
          title="Quản lý Bộ tiêu chí chất lượng bệnh viện"
          subTitle="Đăng nhập"
          initialValues={{
            autoLogin: true,
          }}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          {status === 'error' && loginType === 'account' && (
            <LoginMessage
              content={intl.formatMessage({
                id: 'pages.login.accountLogin.errorMessage',
                defaultMessage: 'Tài khoản hoặc mật khẩu không chính xác',
              })}
            />
          )}

          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined />,
            }}
            placeholder="Tên đăng nhập"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập tên đăng nhập!',
              },
            ]}
          />

          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
            }}
            placeholder="Mật khẩu"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập mật khẩu!',
              },
            ]}
          />

          <div style={{ marginBottom: 24 }}>
            <ProFormCheckbox noStyle name="autoLogin">
              Ghi nhớ đăng nhập
            </ProFormCheckbox>
            <a style={{ float: 'right' }}>Quên mật khẩu</a>
          </div>
        </LoginForm>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
