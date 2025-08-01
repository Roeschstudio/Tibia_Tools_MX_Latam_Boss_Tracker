import { useState, useEffect, useCallback } from 'react';

// Interface para el estado del caché
interface CacheStatus {
  isValid: boolean;
  lastUpdate: Date | null;
  nextUpdate: Date | null;
  cacheAge: number;
  isRefreshing: boolean;
  error: string | null;
}

// Interface para la respuesta del endpoint de caché
interface CacheManagementResponse {
  action: 'refresh' | 'status' | 'invalidate';
  success: boolean;
  cacheInfo: {
    isValid: boolean;
    lastUpdate: Date | null;
    nextUpdate: Date | null;
    cacheAge: number;
  };
  apiStatus?: {
    isOnline: boolean;
    responseTime: number;
    error?: string;
  };
  refreshedData?: {
    worldsCount: number;
    totalPlayersOnline: number;
  };
  message: string;
  timestamp: string;
}

// Hook para manejar el caché automático
export function useAutoCache() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({
    isValid: false,
    lastUpdate: null,
    nextUpdate: null,
    cacheAge: 0,
    isRefreshing: false,
    error: null
  });

  // Función para obtener el estado del caché
  const getCacheStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/cache');
      if (!response.ok) {
        throw new Error(`Cache status error: ${response.status}`);
      }
      
      const data: CacheManagementResponse = await response.json();
      
      setCacheStatus(prev => ({
        ...prev,
        isValid: data.cacheInfo.isValid,
        lastUpdate: data.cacheInfo.lastUpdate ? new Date(data.cacheInfo.lastUpdate) : null,
        nextUpdate: data.cacheInfo.nextUpdate ? new Date(data.cacheInfo.nextUpdate) : null,
        cacheAge: data.cacheInfo.cacheAge,
        error: null
      }));
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setCacheStatus(prev => ({
        ...prev,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Función para refrescar el caché manualmente
  const refreshCache = useCallback(async () => {
    setCacheStatus(prev => ({ ...prev, isRefreshing: true, error: null }));
    
    try {
      const response = await fetch('/api/cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'refresh' })
      });
      
      if (!response.ok) {
        throw new Error(`Cache refresh error: ${response.status}`);
      }
      
      const data: CacheManagementResponse = await response.json();
      
      if (data.success) {
        setCacheStatus(prev => ({
          ...prev,
          isValid: data.cacheInfo.isValid,
          lastUpdate: data.cacheInfo.lastUpdate ? new Date(data.cacheInfo.lastUpdate) : null,
          nextUpdate: data.cacheInfo.nextUpdate ? new Date(data.cacheInfo.nextUpdate) : null,
          cacheAge: data.cacheInfo.cacheAge,
          isRefreshing: false,
          error: null
        }));
        
        return data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setCacheStatus(prev => ({
        ...prev,
        isRefreshing: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Función para invalidar el caché
  const invalidateCache = useCallback(async () => {
    try {
      const response = await fetch('/api/cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'invalidate' })
      });
      
      if (!response.ok) {
        throw new Error(`Cache invalidation error: ${response.status}`);
      }
      
      const data: CacheManagementResponse = await response.json();
      
      if (data.success) {
        setCacheStatus(prev => ({
          ...prev,
          isValid: false,
          lastUpdate: null,
          nextUpdate: null,
          cacheAge: 0,
          error: null
        }));
        
        return data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setCacheStatus(prev => ({
        ...prev,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Efecto para verificar el estado del caché al montar el componente
  useEffect(() => {
    getCacheStatus();
  }, [getCacheStatus]);

  // Efecto para configurar la actualización automática cada 30 minutos
  useEffect(() => {
    const THIRTY_MINUTES = 30 * 60 * 1000; // 30 minutos en milisegundos
    
    const interval = setInterval(async () => {
      try {
        console.log('Auto-refreshing cache (30 minute interval)...');
        await refreshCache();
        console.log('Cache auto-refresh completed successfully');
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    }, THIRTY_MINUTES);

    return () => clearInterval(interval);
  }, [refreshCache]);

  // Efecto para verificar si el caché necesita actualización cada minuto
  useEffect(() => {
    const ONE_MINUTE = 60 * 1000; // 1 minuto en milisegundos
    
    const checkInterval = setInterval(async () => {
      if (!cacheStatus.isRefreshing) {
        try {
          await getCacheStatus();
        } catch (error) {
          console.warn('Failed to check cache status:', error);
        }
      }
    }, ONE_MINUTE);

    return () => clearInterval(checkInterval);
  }, [getCacheStatus, cacheStatus.isRefreshing]);

  return {
    cacheStatus,
    refreshCache,
    invalidateCache,
    getCacheStatus
  };
}