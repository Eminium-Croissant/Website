import { useCallback, useEffect, useState } from 'react';

interface CacheData {
  data: any;
  timestamp: number;
  expiresAt: number;
}

const ENCRYPTION_KEY = 'croissant-cache-key-2024';

function encrypt(text: string, key: string): string {
  try {

    const base64Text = btoa(unescape(encodeURIComponent(text)));

    let encrypted = '';
    for (let i = 0; i < base64Text.length; i++) {
      encrypted += String.fromCharCode(
        base64Text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return btoa(encrypted);
  } catch (error) {
    console.error('Erreur de chiffrement:', error);
    return text;
  }
}

function decrypt(encryptedText: string, key: string): string {
  try {

    const decrypted = atob(encryptedText);

    let text = '';
    for (let i = 0; i < decrypted.length; i++) {
      text += String.fromCharCode(
        decrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }

    return decodeURIComponent(escape(atob(text)));
  } catch (error) {
    console.error('Erreur de déchiffrement:', error);
    return encryptedText;
  }
}

export function useClientCache() {
  const [cache, setCache] = useState<Map<string, CacheData>>(new Map());

  useEffect(() => {
    try {
      const cachedData = localStorage.getItem('croissant-cache');
      if (cachedData) {
        const decryptedData = decrypt(cachedData, ENCRYPTION_KEY);

        if (decryptedData && decryptedData !== cachedData) {
          const parsedCache = JSON.parse(decryptedData);

          const now = Date.now();
          const validCache = new Map();

          for (const [key, value] of Object.entries(parsedCache)) {
            if (
              value &&
              typeof value === 'object' &&
              (value as CacheData).expiresAt > now
            ) {
              validCache.set(key, value as CacheData);
            }
          }

          setCache(validCache);
        } else {

          localStorage.removeItem('croissant-cache');
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du cache:', error);

      localStorage.removeItem('croissant-cache');
    }
  }, []);

  const saveCache = useCallback((newCache: Map<string, CacheData>) => {
    try {

      if (newCache.size === 0) {
        localStorage.removeItem('croissant-cache');
        return;
      }

      const cacheObject = Object.fromEntries(newCache);
      const jsonString = JSON.stringify(cacheObject);

      if (jsonString && jsonString !== '{}') {
        const encryptedData = encrypt(jsonString, ENCRYPTION_KEY);

        if (encryptedData && encryptedData !== jsonString) {
          localStorage.setItem('croissant-cache', encryptedData);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du cache:', error);

      localStorage.removeItem('croissant-cache');
    }
  }, []);

  const setCacheData = useCallback((key: string, data: any, ttl: number = 3600000) => {
    const now = Date.now();
    const cacheData: CacheData = {
      data,
      timestamp: now,
      expiresAt: now + ttl
    };

    const newCache = new Map(cache);
    newCache.set(key, cacheData);
    setCache(newCache);
    saveCache(newCache);
  }, [cache, saveCache]);

  const getCacheData = useCallback((key: string) => {
    const cachedItem = cache.get(key);
    if (!cachedItem) return null;

    const now = Date.now();
    if (cachedItem.expiresAt <= now) {

      const newCache = new Map(cache);
      newCache.delete(key);
      setCache(newCache);
      saveCache(newCache);
      return null;
    }

    return cachedItem.data;
  }, [cache, saveCache]);

  const hasCacheData = useCallback((key: string) => {
    const cachedItem = cache.get(key);
    if (!cachedItem) return false;

    const now = Date.now();
    if (cachedItem.expiresAt <= now) {
      const newCache = new Map(cache);
      newCache.delete(key);
      setCache(newCache);
      saveCache(newCache);
      return false;
    }

    return true;
  }, [cache, saveCache]);

  const removeCacheData = useCallback((key: string) => {
    const newCache = new Map(cache);
    newCache.delete(key);
    setCache(newCache);
    saveCache(newCache);
  }, [cache, saveCache]);

  const clearCache = useCallback(() => {
    setCache(new Map());
    localStorage.removeItem('croissant-cache');
  }, []);

  const cleanExpiredData = useCallback(() => {
    const now = Date.now();
    const newCache = new Map();

    for (const [key, value] of cache) {
      if (value.expiresAt > now) {
        newCache.set(key, value);
      }
    }

    if (newCache.size !== cache.size) {
      setCache(newCache);
      saveCache(newCache);
    }
  }, [cache, saveCache]);

  const getCacheStats = useCallback(() => {
    const now = Date.now();
    let totalItems = 0;
    let expiredItems = 0;
    let totalSize = 0;

    for (const [key, value] of cache) {
      totalItems++;
      totalSize += JSON.stringify(value).length;
      if (value.expiresAt <= now) {
        expiredItems++;
      }
    }

    return {
      totalItems,
      expiredItems,
      totalSize,
      cacheSize: cache.size
    };
  }, [cache]);

  return {
    setCacheData,
    getCacheData,
    hasCacheData,
    removeCacheData,
    clearCache,
    cleanExpiredData,
    getCacheStats
  };
}

export function useApiCache() {
  const cache = useClientCache();

  const cacheApiResponse = useCallback((endpoint: string, data: any, ttl: number = 1800000) => {
    const cacheKey = `api_${endpoint}`;
    cache.setCacheData(cacheKey, data, ttl);
  }, [cache]);

  const getCachedApiResponse = useCallback((endpoint: string) => {
    const cacheKey = `api_${endpoint}`;
    return cache.getCacheData(cacheKey);
  }, [cache]);

  const hasCachedApiResponse = useCallback((endpoint: string) => {
    const cacheKey = `api_${endpoint}`;
    return cache.hasCacheData(cacheKey);
  }, [cache]);

  return {
    cacheApiResponse,
    getCachedApiResponse,
    hasCachedApiResponse,
    clearCache: cache.clearCache,
    getCacheStats: cache.getCacheStats
  };
}


