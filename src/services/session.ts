import Taro from '@tarojs/taro';
import type { User } from '@/types/domain';
import { getBaseUrl, isDemo } from './config';

interface Session { base: string; token: string; user?: User }
const readSession = (): Session | undefined => {
  const value = Taro.getStorageSync<Session>('vote.session');
  return value && value.base === getBaseUrl() ? value : undefined;
};
export const getToken = () => readSession()?.token || '';
export const getUser = () => readSession()?.user;
export const clearSession = () => Taro.removeStorageSync('vote.session');
export const saveToken = (token: string, base: string) => {
  if (base !== getBaseUrl()) return;
  if (!token) return clearSession();
  Taro.setStorageSync('vote.session', { base, token } satisfies Session);
};
export const saveUser = (user: User) => {
  const session = readSession();
  if (session) Taro.setStorageSync('vote.session', { ...session, user });
};
export const hasSession = () => !isDemo && Boolean(getToken());
export const requireLogin = () => {
  if (hasSession()) return true;
  Taro.navigateTo({ url: '/pages/auth/index' });
  return false;
};
export const showError = (error: unknown) => {
  const message = error instanceof Error ? error.message : '操作失败，请稍后重试';
  console.error('[UI] Operation failed:', message);
  Taro.showToast({ title: message, icon: 'none', duration: 2500 });
};
