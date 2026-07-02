import type { ArgsProps } from 'antd/es/message';
import { message } from 'antd';

export const ERROR_MESSAGE_DURATION = 5;

const isArgsProps = (value: unknown): value is ArgsProps =>
  typeof value === 'object' && value !== null && 'content' in value;

export function configureMessageDefaults() {
  const showError = message.error.bind(message);

  message.error = ((content: unknown, duration?: number | (() => void), onClose?: () => void) => {
    if (isArgsProps(content)) {
      return showError({
        ...content,
        duration: content.duration ?? ERROR_MESSAGE_DURATION,
      });
    }

    if (typeof duration === 'function') {
      return showError(content as ArgsProps['content'], ERROR_MESSAGE_DURATION, duration);
    }

    if (typeof duration !== 'number') {
      return showError(content as ArgsProps['content'], ERROR_MESSAGE_DURATION, onClose);
    }

    return showError(content as ArgsProps['content'], duration, onClose);
  }) as typeof message.error;
}
