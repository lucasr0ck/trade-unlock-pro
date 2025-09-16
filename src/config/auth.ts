// API Credentials
export const API_CREDENTIALS = {
  LOGIN_ENDPOINT: '/v3/login',
  ROLE: 'hbb'
};

// App credentials for API authentication (Basic Auth)
export const APP_CREDENTIALS = {
  username: 'login_app',
  password: 'password_app'
};

// Basic auth token (base64 encoded from APP_CREDENTIALS)
export const BASIC_AUTH = btoa(`${APP_CREDENTIALS.username}:${APP_CREDENTIALS.password}`);

// Default user credentials for auto-login
export const DEFAULT_CREDENTIALS = {
  username: 'trading_user@example.com', // Substitua pelo usuário real
  password: 'trading_password', // Substitua pela senha real
};

// API Base URLs
export const API_URLS = {
  auth: 'https://bot-account-manager-api.homebroker.com',
  wallet: 'https://bot-wallet-api.homebroker.com',
  config: 'https://bot-configuration-api.homebroker.com',
  market: 'https://bot-market-historic-api.homebroker.com',
  user: 'https://bot-user-api.homebroker.com',
  tradeEdge: 'https://trade-api-edge.homebroker.com',
  trade: 'https://bot-trade-api.homebroker.com'
};