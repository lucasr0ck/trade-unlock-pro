import { API_URLS } from '@/config/auth';

export interface AssetItem {
  market_name: string;
  symbol: string;
  name: string;
  is_active: boolean;
  min_trade_value: number;
  max_trade_value: number;
  profit_payout: number;
  bet_time_seconds_options: number[];
  limit: number;
  interval: number;
}

export interface AssetsResponse {
  count: number;
  results: AssetItem[];
}

export interface ChartValue {
  time_stamp: string;
  symbol: string;
  open: number;
  close: number;
  low: number;
  high: number;
  volume: number;
  count: number;
}

export interface ChartResponse {
  values: ChartValue[];
}

export interface UserDataResponse {
  cognito_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  country: string;
  currency: string;
  verified: boolean;
  active: boolean;
  mfa_enabled: boolean;
}

export interface BalanceWallet {
  id: number;
  balance: number;
  currency: string;
}

export interface BalanceResponse {
  demo: BalanceWallet;
  real: BalanceWallet;
}

export interface CreateOperationRequest {
  id: string;
  direction: "up" | "down";
  bet_value_usd_cents: number;
  duration_milliseconds: number;
  start_time_utc: string;
  ticker_symbol: string;
  account_type: "demo" | "real";
  currency: string;
}

export interface CreateOperationResponse {
  id: string;
}

export interface OperationDataResponse {
  id: string;
  direction: "up" | "down";
  bet_value_usd_cents: number;
  ticker_symbol: string;
  status: string;
  profit_usd_cents: number;
  result: string;
  start_price: number;
  end_price: number;
  created_at: string;
}

function buildAuthHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchAssets(token: string): Promise<AssetsResponse> {
  const res = await fetch(`${API_URLS.config}/api/assets/`, {
    headers: {
      ...buildAuthHeaders(token),
    },
  });
  if (!res.ok) throw new Error(`fetchAssets failed: ${res.status}`);
  return res.json();
}

export interface ReadValuesQuery {
  symbol: string;
  start: string;
  end: string;
  timespan: "seconds" | "hour" | "minutes" | "week";
  multiple: number;
}

export async function fetchChartData(token: string, query: ReadValuesQuery): Promise<ChartResponse> {
  const params = new URLSearchParams(query as unknown as Record<string, string>);
  const res = await fetch(`${API_URLS.market}/assets/read_values?${params.toString()}`, {
    headers: {
      ...buildAuthHeaders(token),
    },
  });
  if (!res.ok) throw new Error(`fetchChartData failed: ${res.status}`);
  return res.json();
}

export async function fetchUserData(token: string): Promise<UserDataResponse> {
  const res = await fetch(`${API_URLS.user}/users/read-user`, {
    headers: {
      ...buildAuthHeaders(token),
    },
  });
  if (!res.ok) throw new Error(`fetchUserData failed: ${res.status}`);
  return res.json();
}

export async function fetchBalance(token: string): Promise<BalanceResponse> {
  const res = await fetch(`${API_URLS.wallet}/balance/`, {
    headers: {
      ...buildAuthHeaders(token),
    },
  });
  if (!res.ok) throw new Error(`fetchBalance failed: ${res.status}`);
  return res.json();
}

export async function createOperation(token: string, payload: CreateOperationRequest): Promise<CreateOperationResponse> {
  const res = await fetch(`${API_URLS.tradeEdge}/op/`, {
    method: "POST",
    headers: {
      ...buildAuthHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`createOperation failed: ${res.status}`);
  return res.json();
}

export async function getOperation(token: string, opId: string): Promise<OperationDataResponse> {
  const res = await fetch(`${API_URLS.trade}/op/get/${encodeURIComponent(opId)}`, {
    headers: {
      ...buildAuthHeaders(token),
    },
  });
  if (!res.ok) throw new Error(`getOperation failed: ${res.status}`);
  return res.json();
}


