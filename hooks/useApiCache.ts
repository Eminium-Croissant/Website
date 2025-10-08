import { useCallback, useEffect, useRef, useState } from 'react';
import { useApiCache as useBaseApiCache } from './useClientCache';

interface ApiCacheOptions {
  ttl?: number; // Time to live en millisecondes
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

// Variable globale pour suivre les requêtes en cours par endpoint
const globalFetchingMap: Record<string, boolean> = {};

export function useApiCache<T = any>(
  endpoint: string,
  options: ApiCacheOptions = {}
) {
  const {
    ttl = 1800000, // 30 minutes par défaut
    forceRefresh = false,
    onError,
    onSuccess
  } = options;

  const cache = useBaseApiCache();
  const [state, setState] = useState<ApiCacheState<T>>({
    data: null,
    loading: false,
    error: null,
    fromCache: false
  });
  const [fetching, setFetching] = useState(false); // Ajout d'un flag pour suivre la requête en cours

  const fetchData = useCallback(async () => {
    // Empêche le refetch globalement pour cet endpoint
    if (state.loading || fetching || globalFetchingMap[endpoint]) return;

    setFetching(true);
    globalFetchingMap[endpoint] = true;

    // Vérifier le cache si pas de force refresh
    if (!forceRefresh && cache.hasCachedApiResponse(endpoint)) {
      const cachedData = cache.getCachedApiResponse(endpoint);
      setState({
        data: cachedData,
        loading: false,
        error: null,
        fromCache: true
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

      // Mettre en cache la réponse
      cache.cacheApiResponse(endpoint, data, ttl);

      setState({
        data,
        loading: false,
        error: null,
        fromCache: false
      });

      onSuccess?.(data);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Erreur inconnue');
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorObj,
        fromCache: false
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
    clearCache
  };
}

// Hook spécialisé pour les jeux
export function useGamesCache() {
  // Utilise un ref pour éviter de refetch plusieurs fois
  const hasFetchedRef = useRef(false);
  const apiCache = useApiCache('/api/games', {
    ttl: 300000, // 5 minutes
    onError: (error) => console.error('Erreur lors du chargement des jeux:', error)
  });

  useEffect(() => {
    // Si déjà fetch, ne rien faire
    if (hasFetchedRef.current || apiCache.data || apiCache.loading) return;
    hasFetchedRef.current = true;
    apiCache.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return apiCache;
}

// Hook spécialisé pour les utilisateurs
export function useUsersCache() {
  return useApiCache('/api/users', {
    ttl: 600000, // 10 minutes
    onError: (error) => console.error('Erreur lors du chargement des utilisateurs:', error)
  });
}

// Hook pour la recherche avec cache
export function useSearchCache(query: string) {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const cache = useBaseApiCache();

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    const cacheKey = `search_${searchQuery}`;
    
    // Vérifier le cache
    if (cache.hasCachedApiResponse(cacheKey)) {
      setResults(cache.getCachedApiResponse(cacheKey));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      // Mettre en cache les résultats de recherche (TTL: 5 minutes)
      cache.cacheApiResponse(cacheKey, data, 300000);
      setResults(data);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setLoading(false);
    }
  }, [cache]);

  useEffect(() => {
    if (query) {
      search(query);
    }
  }, [query, search]);

  return { results, loading, search };
}
