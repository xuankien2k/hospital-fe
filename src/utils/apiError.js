export function getApiErrorMessage(error, fallback = 'Đã có lỗi xảy ra') {
  if (!error) return fallback;

  const data = error.response?.data;

  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }

  if (data && typeof data === 'object') {
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message.trim();
    }
    if (typeof data.errorMessage === 'string' && data.errorMessage.trim()) {
      return data.errorMessage.trim();
    }
  }

  if (typeof error.message === 'string' && error.message.trim()) {
    const message = error.message.trim();
    if (!/^Request failed with status code \d+$/i.test(message)) {
      return message;
    }
  }

  if (error.response?.status) {
    return `${fallback} (${error.response.status})`;
  }

  return fallback;
}
