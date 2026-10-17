// Pure protocol helpers shared by the transport and regression tests.
export const normalizeBaseUrl = (input: string): string => {
  const value = input.trim().replace(/\/+$/, '');
  if (!value) return '';
  // Avoid URL(), which is not available in every mini-program runtime.
  const match = /^(https?):\/\/([^/?#]+)(\/[^?#]*)?$/.exec(value);
  if (!match || match[2].includes('@') || /\s/.test(value)) throw new Error('请输入不含账号、查询参数的完整 HTTPS 地址');
  const host = match[2].toLowerCase();
  if (match[1] === 'http' && !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) {
    throw new Error('正式服务必须使用 HTTPS；仅本机调试允许 HTTP');
  }
  return value;
};
export const extractToken = (cookies: string[]): string | undefined => {
  for (const cookie of cookies) {
    const match = /(?:^|[,;]\s*)campus_token=([^;,\s]*)/i.exec(cookie);
    if (match) return match[1];
  }
  return undefined;
};
export const encodeFields = (fields: Record<string, string | number | undefined>) =>
  Object.entries(fields).filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`).join('&');
export const expiredCode = (code: number) => code === 401 || code === 901;
