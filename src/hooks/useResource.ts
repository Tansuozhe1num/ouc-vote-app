import { useCallback, useEffect, useRef, useState } from 'react';
import { useDidHide, useDidShow } from '@tarojs/taro';

const errorText = (error: unknown) => error instanceof Error ? error.message : '加载失败，请重试';

export const useResource = <T,>(loader: () => Promise<T>, key = '') => {
  const current = useRef(loader);
  current.current = loader;
  const sequence = useRef(0);
  const hidden = useRef(false);
  const [data, setData] = useState<T>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const reload = useCallback(async () => {
    const ticket = ++sequence.current;
    setLoading(true); setError('');
    try {
      const value = await current.current();
      if (ticket === sequence.current) setData(value);
    } catch (failure) {
      console.error('[Resource]', errorText(failure));
      if (ticket === sequence.current) setError(errorText(failure));
    } finally {
      if (ticket === sequence.current) setLoading(false);
    }
  }, []);
  useEffect(() => { setData(undefined); void reload(); return () => { sequence.current++; }; }, [key, reload]);
  useDidHide(() => { hidden.current = true; sequence.current++; });
  useDidShow(() => { if (hidden.current) { hidden.current = false; void reload(); } });
  return { data, setData, error, loading, reload };
};

export const usePaged = <T,>(loader: (page: number, size: number) => Promise<T[]>, key = '', size = 12) => {
  const current = useRef(loader);
  current.current = loader;
  const sequence = useRef(0);
  const busy = useRef(false);
  const page = useRef(0);
  const finished = useRef(false);
  const hidden = useRef(false);
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const load = useCallback(async (reset: boolean) => {
    if (!reset && (busy.current || finished.current)) return;
    const ticket = reset ? ++sequence.current : sequence.current;
    const next = reset ? 1 : page.current + 1;
    busy.current = true; setLoading(true); setError('');
    if (reset) { setData([]); page.current = 0; finished.current = false; setHasMore(true); }
    try {
      const items = await current.current(next, size);
      if (ticket !== sequence.current) return;
      setData(previous => reset ? items : [...previous, ...items]);
      page.current = next;
      finished.current = items.length < size;
      setHasMore(!finished.current);
    } catch (failure) {
      console.error('[Paged]', errorText(failure));
      if (ticket === sequence.current) setError(errorText(failure));
    } finally {
      if (ticket === sequence.current) { busy.current = false; setLoading(false); }
    }
  }, [size]);
  const reload = useCallback(() => load(true), [load]);
  const more = useCallback(() => load(false), [load]);
  useEffect(() => { void reload(); return () => { sequence.current++; }; }, [key, reload]);
  useDidHide(() => { hidden.current = true; sequence.current++; busy.current = false; });
  useDidShow(() => { if (hidden.current) { hidden.current = false; void reload(); } });
  return { data, error, loading, hasMore, reload, more };
};
