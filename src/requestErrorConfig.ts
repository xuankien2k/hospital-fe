import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { message, notification } from 'antd';
import { ERROR_MESSAGE_DURATION } from './utils/configureMessage';
import { getApiErrorMessage } from './utils/apiError';

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error({ content: errorMessage, duration: ERROR_MESSAGE_DURATION });
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
                duration: ERROR_MESSAGE_DURATION,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error({ content: errorMessage, duration: ERROR_MESSAGE_DURATION });
          }
        }
      } else if (error.response) {
        const errorMessage = getApiErrorMessage(error, `Lỗi máy chủ (${error.response.status})`);
        message.error({
          content: errorMessage,
          duration: ERROR_MESSAGE_DURATION,
        });
      } else if (error.request) {
        message.error({
          content: 'Không nhận được phản hồi từ máy chủ. Vui lòng thử lại.',
          duration: ERROR_MESSAGE_DURATION,
        });
      } else {
        message.error({
          content: getApiErrorMessage(error, 'Lỗi gửi yêu cầu. Vui lòng thử lại.'),
          duration: ERROR_MESSAGE_DURATION,
        });
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [
    (config: RequestOptions) => {
      // 拦截请求配置，进行个性化处理。
      const url = config?.url?.concat('?token = 123');
      return { ...config, url };
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const { data } = response as unknown as ResponseStructure;

      if (data?.success === false) {
        message.error({
          content: getApiErrorMessage({ response: { data } }, 'Yêu cầu thất bại'),
          duration: ERROR_MESSAGE_DURATION,
        });
      }
      return response;
    },
  ],
};
