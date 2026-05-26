// src/config.js — use relative paths in production so Nginx proxies /api over HTTPS
const config = {
  REACT_APP_LOCAL_SIGNUP_URL: '/api/auth/signup',
  REACT_APP_LOCAL_COLLECTIONS_URL: '/api/collections',
  REACT_APP_LOCAL_LOGIN_URL: '/api/auth/signin',
  REACT_APP_LOCAL_NOTE_EDIT_URL: '/api/collections',
  REACT_APP_LOCAL_COLLECTIONS_SHARED_URL: '/api/collections/shared',
  REACT_APP_LOCAL_COLLECTION_SHARE_URL: '/api/collections',
};

export default config;

