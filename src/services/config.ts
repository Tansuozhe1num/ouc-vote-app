export const DEFAULT_API_BASE = 'http://localhost:5050';
export const isDemo = process.env.TARO_ENV === 'h5';
export const getBaseUrl = (): string => DEFAULT_API_BASE;
