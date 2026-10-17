export interface Envelope<T> { status: string; code: number; info?: string; data: T }
export interface User {
  id?: string; userId: string; name: string; loginName?: string; description?: string; major?: string; sex?: number;
}
export interface Snap {
  snapId: number; userId: string; snapImage?: string; type: number; ctime: string;
  status: number; score?: number; desc: string; userName: string; major?: string;
}
export interface Comment {
  commentId: number; userId: string; userName: string; text: string; ctime: string;
}
export interface Conversation {
  peerId: string; peerName: string; peerMajor?: string; lastContent: string; lastCtime: number;
}
export interface Message {
  id: string; senderId: string; receiverId: string; content: string; ctime: number;
}
export interface Captcha { key: string; image: string }
export type Fields = Record<string, string | number | undefined>;
export const categories = [
  { value: '', label: '全部' }, { value: '0', label: '学习' }, { value: '1', label: '旅游' },
  { value: '2', label: '恋爱' }, { value: '4', label: '游戏' }, { value: '3', label: '其他' }
];
export const categoryName = (type: number) => categories.find(item => item.value === String(type))?.label || '其他';
export const userId = (user: User) => String(user.userId || user.id || '');
export const formatTime = (value?: number | string) => {
  if (!value) return '';
  const numeric = Number(value);
  const date = Number.isFinite(numeric)
    ? new Date(numeric < 1e12 ? numeric * 1000 : numeric)
    : new Date(String(value).replace(/-/g, '/'));
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};
