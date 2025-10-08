import { useCallback, useEffect, useState } from 'react';

// Interface pour les données en cache
interface CacheData {
  data: any;
  timestamp: number;
  expiresAt: number;
}

// Clé de chiffrement (en production, utiliser une clé sécurisée)
const ENCRYPTION_KEY = 'croissant-cache-key-2024';

// Fonction de chiffrement simple (Base64 + XOR)
function encrypt(text: string, key: string): string {
  try {
    // Encoder d'abord en base64 pour éviter les problèmes de caractères
    const base64Text = btoa(unescape(encodeURIComponent(text)));
    
    // Puis appliquer XOR
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

// Fonction de déchiffrement
function decrypt(encryptedText: string, key: string): string {
  try {
    // Décoder la base64
    const decrypted = atob(encryptedText);
    
    // Appliquer XOR inverse
    let text = '';
    for (let i = 0; i < decrypted.length; i++) {
      text += String.fromCharCode(
        decrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    
    // Décoder la base64 finale
    return decodeURIComponent(escape(atob(text)));
  } catch (error) {
    console.error('Erreur de déchiffrement:', error);
    return encryptedText;
  }
}

// Hook pour la gestion du cache côté client
export function useClientCache() {
  const [cache, setCache] = useState<Map<string, CacheData>>(new Map());

  // Charger le cache depuis localStorage au montage
  useEffect(() => {
    try {
      const cachedData = localStorage.getItem('croissant-cache');
      if (cachedData) {
        const decryptedData = decrypt(cachedData, ENCRYPTION_KEY);
        
        // Vérifier si les données déchiffrées sont valides
        if (decryptedData && decryptedData !== cachedData) {
          const parsedCache = JSON.parse(decryptedData);
          
          // Vérifier l'expiration des données
          const now = Date.now();
          const validCache = new Map();
          
          for (const [key, value] of Object.entries(parsedCache)) {
            if (value && typeof value === 'object' && value.expiresAt > now) {
              validCache.set(key, value);
            }
          }
          
          setCache(validCache);
        } else {
          // Données corrompues, nettoyer le cache
          localStorage.removeItem('croissant-cache');
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du cache:', error);
      // Nettoyer le cache corrompu
      localStorage.removeItem('croissant-cache');
    }
  }, []);

  // Sauvegarder le cache dans localStorage
  const saveCache = useCallback((newCache: Map<string, CacheData>) => {
    try {
      // Vérifier que le cache n'est pas vide
      if (newCache.size === 0) {
        localStorage.removeItem('croissant-cache');
        return;
      }

      const cacheObject = Object.fromEntries(newCache);
      const jsonString = JSON.stringify(cacheObject);
      
      // Vérifier que la chaîne JSON est valide
      if (jsonString && jsonString !== '{}') {
        const encryptedData = encrypt(jsonString, ENCRYPTION_KEY);
        
        // Vérifier que le chiffrement a réussi
        if (encryptedData && encryptedData !== jsonString) {
          localStorage.setItem('croissant-cache', encryptedData);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du cache:', error);
      // En cas d'erreur, nettoyer le cache
      localStorage.removeItem('croissant-cache');
    }
  }, []);

  // Mettre en cache des données
  const setCacheData = useCallback((key: string, data: any, ttl: number = 3600000) => { // TTL par défaut: 1 heure
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

  // Récupérer des données du cache
  const getCacheData = useCallback((key: string) => {
    const cachedItem = cache.get(key);
    if (!cachedItem) return null;

    const now = Date.now();
    if (cachedItem.expiresAt <= now) {
      // Supprimer l'élément expiré
      const newCache = new Map(cache);
      newCache.delete(key);
      setCache(newCache);
      saveCache(newCache);
      return null;
    }

    return cachedItem.data;
  }, [cache, saveCache]);

  // Vérifier si des données sont en cache
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

  // Supprimer des données du cache
  const removeCacheData = useCallback((key: string) => {
    const newCache = new Map(cache);
    newCache.delete(key);
    setCache(newCache);
    saveCache(newCache);
  }, [cache, saveCache]);

  // Nettoyer tout le cache
  const clearCache = useCallback(() => {
    setCache(new Map());
    localStorage.removeItem('croissant-cache');
  }, []);

  // Nettoyer les données expirées
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

  // Obtenir les statistiques du cache
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

// Hook spécialisé pour les données de l'API
export function useApiCache() {
  const cache = useClientCache();

  // Mettre en cache une réponse API
  const cacheApiResponse = useCallback((endpoint: string, data: any, ttl: number = 1800000) => { // 30 minutes par défaut
    const cacheKey = `api_${endpoint}`;
    cache.setCacheData(cacheKey, data, ttl);
  }, [cache]);

  // Récupérer une réponse API du cache
  const getCachedApiResponse = useCallback((endpoint: string) => {
    const cacheKey = `api_${endpoint}`;
    return cache.getCacheData(cacheKey);
  }, [cache]);

  // Vérifier si une réponse API est en cache
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
