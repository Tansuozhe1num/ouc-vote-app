import Taro from '@tarojs/taro';
import { normalizeBaseUrl } from './protocol';

// Set to the deployed vote HTTPS origin before production distribution.
export const DEFAULT_API_BASE = '';
export const isDemo = process.env.TARO_ENV === 'h5';
export const getBaseUrl = (): string => Taro.getStorageSync<string>('vote.apiBase') || DEFAULT_API_BASE;
export const setBaseUrl = (input: string) => {
  const value = normalizeBaseUrl(input);
  if (value !== getBaseUrl()) Taro.removeStorageSync('vote.session');
  Taro.setStorageSync('vote.apiBase', value);
  console.info('[Config] API endpoint changed; previous session cleared');
};
