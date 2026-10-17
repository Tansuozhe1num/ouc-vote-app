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
