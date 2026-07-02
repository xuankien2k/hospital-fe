const REMEMBER_LOGIN_KEY = 'login_remember';
const SAVED_USERNAME_KEY = 'login_username';
const TOKEN_KEY = 'token';
const CURRENT_USER_KEY = 'currentUser';

export function getRememberLogin() {
  const saved = localStorage.getItem(REMEMBER_LOGIN_KEY);
  if (saved === null) {
    return true;
  }
  return saved === 'true';
}

export function getSavedUsername() {
  if (!getRememberLogin()) {
    return '';
  }
  return localStorage.getItem(SAVED_USERNAME_KEY) || '';
}

export function saveLoginPreferences(remember, username) {
  localStorage.setItem(REMEMBER_LOGIN_KEY, remember ? 'true' : 'false');
  if (remember && username) {
    localStorage.setItem(SAVED_USERNAME_KEY, username);
  } else {
    localStorage.removeItem(SAVED_USERNAME_KEY);
  }
}

function getPersistentStorage(remember) {
  return remember ? localStorage : sessionStorage;
}

export function setAuthToken(token, remember) {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  getPersistentStorage(remember).setItem(TOKEN_KEY, token);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function removeAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export function setCurrentUser(user, remember = getRememberLogin()) {
  localStorage.removeItem(CURRENT_USER_KEY);
  sessionStorage.removeItem(CURRENT_USER_KEY);
  getPersistentStorage(remember).setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function getCurrentUser() {
  const raw = localStorage.getItem(CURRENT_USER_KEY) || sessionStorage.getItem(CURRENT_USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function removeCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
  sessionStorage.removeItem(CURRENT_USER_KEY);
}

export function clearAuthSession() {
  removeAuthToken();
  removeCurrentUser();
}
