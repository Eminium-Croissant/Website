import { useCallback, useEffect, useRef, useState } from 'react';
import { useApiCache as useBaseApiCache } from './useClientCache';

interface ApiCacheOptions {
  ttl?: number;
  forceRefresh?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

interface ApiCacheState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  fromCache: boolean;
}

const globalFetchingMap: Record<string, boolean> = {};

export function useApiCache<T = any>(endpoint: string, options: ApiCacheOptions = {}) {
  const { ttl = 1800000, forceRefresh = false, onError, onSuccess } = options;

  const cache = useBaseApiCache();
  const [state, setState] = useState<ApiCacheState<T>>({
    data: null,
    loading: false,
    error: null,
    fromCache: false,
  });
  const [fetching, setFetching] = useState(false);

  const fetchData = useCallback(async () => {
    if (state.loading || fetching || globalFetchingMap[endpoint]) return;

    setFetching(true);
    globalFetchingMap[endpoint] = true;

    if (!forceRefresh && cache.hasCachedApiResponse(endpoint)) {
      const cachedData = cache.getCachedApiResponse(endpoint);
      setState({
        data: cachedData,
        loading: false,
        error: null,
        fromCache: true,
      });
      onSuccess?.(cachedData);
      setFetching(false);
      globalFetchingMap[endpoint] = false;
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      cache.cacheApiResponse(endpoint, data, ttl);

      setState({
        data,
        loading: false,
        error: null,
        fromCache: false,
      });

      onSuccess?.(data);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Erreur inconnue');
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorObj,
        fromCache: false,
      }));
      onError?.(errorObj);
    } finally {
      setFetching(false);
      globalFetchingMap[endpoint] = false;
    }
  }, [endpoint, ttl, forceRefresh, cache, onSuccess, onError, state.loading, fetching]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const clearCache = useCallback(() => {
    cache.clearCache();
    setState(prev => ({ ...prev, data: null, fromCache: false }));
  }, [cache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refresh,
    clearCache,
  };
}

export function useGamesCache() {
  const hasFetchedRef = useRef(false);
  const apiCache = useApiCache('/api/games', {
    ttl: 300000,
    onError: error => console.error('Erreur lors du chargement des jeux:', error),
  });

  useEffect(() => {
    if (hasFetchedRef.current || apiCache.data || apiCache.loading) return;
    hasFetchedRef.current = true;
    apiCache.refresh();
  }, []);

  return apiCache;
}

export function useUsersCache() {
  return useApiCache('/api/users', {
    ttl: 600000,
    onError: error => console.error('Erreur lors du chargement des utilisateurs:', error),
  });
}

export function useSearchCache(query: string) {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const cache = useBaseApiCache();

  const search = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults(null);
        return;
      }

      const cacheKey = `search_${searchQuery}`;

      if (cache.hasCachedApiResponse(cacheKey)) {
        setResults(cache.getCachedApiResponse(cacheKey));
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();

        cache.cacheApiResponse(cacheKey, data, 300000);
        setResults(data);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
      } finally {
        setLoading(false);
      }
    },
    [cache]
  );

  useEffect(() => {
    if (query) {
      search(query);
    }
  }, [query, search]);

  return { results, loading, search };
}
