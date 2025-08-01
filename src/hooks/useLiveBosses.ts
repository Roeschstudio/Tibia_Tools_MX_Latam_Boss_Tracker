import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { LiveBoss } from '@/types/boss';

// Interface actualizada para la nueva estructura de respuesta
interface LiveBossesResponse {
  bosses: LiveBoss[];
  metadata: {
    source: 'tibiadata_api' | 'fallback';
    totalWorlds: number;
    totalPlayersOnline: number;
    averagePlayersPerWorld: number;
    mostPopularWorld: string | null;
    lastUpdated: string;
    cacheInfo: {
      isValid: boolean;
      lastUpdate: Date | null;
      nextUpdate: Date | null;
      cacheAge: number;
    };
    error?: string;
  };
  refreshed: boolean;
}

export function useLiveBosses() {
  const { liveBosses, setLiveBosses } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLiveBosses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/live-bosses');
      
      if (!response.ok) {
        throw new Error(`Error al cargar los bosses: ${response.status}`);
      }
      
      const data: LiveBossesResponse = await response.json();
      
      // Actualizar los datos con la nueva estructura
      setLiveBosses(data.bosses);
      
      // Usar lastUpdated del metadata y validar que sea una fecha válida
      if (data.metadata.lastUpdated) {
        const updatedDate = new Date(data.metadata.lastUpdated);
        if (!isNaN(updatedDate.getTime())) {
          setLastUpdated(updatedDate);
        } else {
          console.warn('Invalid lastUpdated date received:', data.metadata.lastUpdated);
          setLastUpdated(new Date());
        }
      } else {
        setLastUpdated(new Date());
      }
      
      // Si hay error en los metadatos, mostrarlo
      if (data.metadata.error) {
        setError(`API Warning: ${data.metadata.error}`);
      }
      
    } catch (err) {
      console.error('Error fetching live bosses:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar los bosses');
      
      // Si hay un error, intentamos cargar los datos del store
      if (liveBosses.length > 0) {
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar los datos al montar el componente y cada 5 minutos
  useEffect(() => {
    fetchLiveBosses();
    
    const intervalId = setInterval(() => {
      fetchLiveBosses();
    }, 5 * 60 * 1000); // 5 minutos
    
    return () => clearInterval(intervalId);
  }, []);

  return {
    bosses: liveBosses,
    loading,
    error,
    lastUpdated,
    refetch: fetchLiveBosses
  };
}