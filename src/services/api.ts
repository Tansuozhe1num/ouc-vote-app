import Taro from '@tarojs/taro';
import type { Captcha, Comment, Conversation, Envelope, Fields, Message, Snap, User } from '@/types/domain';
import { demoSnaps } from '@/data/snaps';
import { getBaseUrl, isDemo } from './config';
import { clearSession, getToken, getUser, saveToken, saveUser } from './session';
import { encodeFields, expiredCode, extractToken } from './protocol';

const demoOnly = () => { throw new Error('网页为只读演示，请在小程序中连接服务后操作'); };
const decode = <T,>(body: Envelope<T>, status: number): T => {
  if (expiredCode(status) || expiredCode(body?.code)) clearSession();
  if (status < 200 || status >= 300 || body?.status !== 'success' || body.code !== 200) {
    throw new Error(body?.info || (status === 401 ? '请重新登录' : '服务暂时不可用，请重试'));
  }
  return body.data;
};
const request = async <T,>(path: string, fields: Fields = {}, method: 'GET' | 'POST' = 'GET', headers: Record<string, string> = {}): Promise<T> => {
  if (isDemo) return demoOnly();
  const base = getBaseUrl();
  const token = getToken();
  console.info('[API]', method, path);
  try {
    const result = await Taro.request<Envelope<T>>({
      url: base + path + (method === 'GET' && Object.keys(fields).length ? `?${encodeFields(fields)}` : ''),
      method,
      data: method === 'POST' ? encodeFields(fields) : undefined,
      timeout: 15000,
      header: { 'Content-Type': 'application/x-www-form-urlencoded', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers }
    });
    const data = decode(result.data, result.statusCode);
    if (path === '/auth/login' || path === '/auth/register') {
      const rawCookies: string[] = [...(result.cookies || [])];
      for (const [key, value] of Object.entries(result.header)) {
        if (key.toLowerCase() === 'set-cookie') rawCookies.push(...(Array.isArray(value) ? value.map(String) : [String(value)]));
      }
      const issued = extractToken(rawCookies);
      if (!issued) throw new Error('登录响应缺少会话凭证，请检查后端 Set-Cookie 配置');
      saveToken(issued, base);
    }
    return data;
  } catch (error) {
    // Transport errors may contain request headers. Log only a sanitized message.
    const message = error instanceof Error ? error.message : '网络连接失败，请检查服务地址和小程序域名配置';
    console.error('[API]', method, path, message);
    throw new Error(message);
  }
};
export const api = {
  async list(page: number, size: number, type = ''): Promise<Snap[]> {
    if (isDemo) return demoSnaps.filter(snap => !type || String(snap.type) === type).slice((page - 1) * size, page * size);
    return request('/snap/list', { page, size, type: type || undefined });
  },
  async detail(snapId: number): Promise<Snap> {
    if (isDemo) {
      const snap = demoSnaps.find(item => item.snapId === snapId);
      if (!snap) throw new Error('动态不存在');
      return snap;
    }
    return request('/snap/detail', { snapId });
  },
  async ranks(): Promise<Snap[]> { return isDemo ? [...demoSnaps].sort((a, b) => (b.score || 0) - (a.score || 0)) : request('/snap/ranks'); },
  async draw(): Promise<Snap> { return isDemo ? demoSnaps[Math.floor(Math.random() * demoSnaps.length)] : request('/snap/draw'); },
  mine: (page: number, size: number): Promise<Snap[]> => request('/snap/mine', { page, size }),
  status: (snapId: number, status: number) => request<boolean>('/snap/status', { snapId, status }, 'POST'),
  captcha: (): Promise<Captcha> => request('/auth/captcha'),
  async login(fields: Fields, register: boolean): Promise<User> {
    const user = await request<User>(register ? '/auth/register' : '/auth/login', fields, 'POST');
    const loginName = typeof fields.loginName === 'string' ? fields.loginName.trim() : user.loginName;
    const signedInUser = loginName ? { ...user, loginName } : user;
    saveUser(signedInUser);
    return signedInUser;
  },
  async me(): Promise<User> {
    const user = await request<User>('/auth/me');
    const loginName = user.loginName || getUser()?.loginName;
    const currentUser = loginName ? { ...user, loginName } : user;
    saveUser(currentUser);
    return currentUser;
  },
  async logout() {
    try { await request('/auth/logout', {}, 'POST'); } finally { clearSession(); }
  },
  async profile(id: string): Promise<User> {
    if (isDemo) {
      const snap = demoSnaps.find(item => item.userId === id);
      if (!snap) throw new Error('用户不存在');
      return { userId: id, name: snap.userName, major: snap.major, description: '一起去做点喜欢的事。' };
    }
    return request('/user/profile', { userId: id });
  },
  async updateProfile(fields: Fields): Promise<User> {
    const user = await request<User>('/user/profile', fields, 'POST');
    const loginName = getUser()?.loginName;
    const updatedUser = loginName ? { ...user, loginName } : user;
    saveUser(updatedUser);
    return updatedUser;
  },
  following: (): Promise<User[]> => request('/follow/following'),
  followers: (): Promise<User[]> => request('/follow/followers'),
  followStatus: (id: string): Promise<boolean> => request('/follow/status', { userId: id }),
  follow: (id: string): Promise<boolean> => request('/follow/toggle', { userId: id }, 'POST'),
  async comments(snapId: number, page: number, size: number): Promise<Comment[]> {
    return isDemo ? [] : request('/comment/list', { snapId, page, size });
  },
  comment: (snapId: number, content: string): Promise<Comment> => request('/comment/save', { snapId, content }, 'POST'),
  inbox: (): Promise<Conversation[]> => request('/message/inbox'),
  conversation: (peerId: string): Promise<Message[]> => request('/message/conversation', { peerId }),
  send: (receiverId: string, content: string, snapId?: number): Promise<Message> => request('/message/send', { receiverId, content, snapId }, 'POST'),
  async publish(desc: string, type: number, filePath: string, key: string): Promise<Snap> {
    if (!filePath) return request('/snap/save', { desc, type }, 'POST', { 'Idempotency-Key': key });
    if (isDemo) return demoOnly();
    const base = getBaseUrl();
    console.info('[Upload] Publishing image');
    try {
      const result = await Taro.uploadFile({
        url: base + '/snap/save', filePath, name: 'avatar', formData: { desc, type: String(type) },
        header: { Authorization: `Bearer ${getToken()}`, 'Idempotency-Key': key }, timeout: 60000
      });
      if (expiredCode(result.statusCode)) clearSession();
      let body: Envelope<Snap>;
      try { body = JSON.parse(result.data) as Envelope<Snap>; }
      catch { throw new Error('上传响应无效，请检查文件大小或稍后重试'); }
      return decode(body, result.statusCode);
    } catch (error) {
      const message = error instanceof Error ? error.message : '图片上传失败，请重试';
      console.error('[Upload]', message);
      throw new Error(message);
    }
  }
};
