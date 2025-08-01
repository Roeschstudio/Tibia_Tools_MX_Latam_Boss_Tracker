import { useState, useEffect } from 'react';
import { Boss, LiveBoss, BossesApiResponse } from '@/types/boss';

// Type guard para validar la respuesta de la API
function isBossesApiResponse(data: unknown): data is BossesApiResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'bosses' in data &&
    'metadata' in data &&
    Array.isArray((data as BossesApiResponse).bosses) &&
    typeof (data as BossesApiResponse).metadata === 'object'
  );
}

export function useBosses() {
  const [bosses, setBosses] = useState<(Boss | LiveBoss)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<BossesApiResponse['metadata'] | null>(null);

  useEffect(() => {
    const fetchBosses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/bosses');
        
        if (!response.ok) {
          throw new Error(`Error al cargar los bosses: ${response.status}`);
        }
        
        const data: unknown = await response.json();
        
        // Validar que la respuesta tiene la estructura esperada
        if (!isBossesApiResponse(data)) {
          throw new Error('La respuesta de la API no tiene la estructura esperada');
        }
        
        // Extraer el array de bosses y metadata del objeto de respuesta
        setBosses(data.bosses);
        setMetadata(data.metadata);
        
        // Si hay un error en los metadata, mostrarlo como warning
        if (data.metadata.error) {
          console.warn('API Warning:', data.metadata.error);
        }
        
      } catch (err) {
        console.error('Error fetching bosses:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar los bosses');
        setBosses([]); // Asegurar que bosses sea un array vacío en caso de error
        setMetadata(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBosses();
  }, []);

  return { 
    bosses, 
    loading, 
    error, 
    metadata,
    // Información adicional derivada de metadata
    isLiveData: metadata?.source === 'tibiadata_api',
    activeWorlds: metadata?.activeWorlds || 0,
    lastUpdated: metadata?.lastUpdated ? new Date(metadata.lastUpdated) : null
  };
}