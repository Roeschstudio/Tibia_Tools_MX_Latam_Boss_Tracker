import { useState, useEffect } from 'react';

// Tipos para los datos de muertes
interface Death {
  time: string;
  killedby: string;
  name: string;
  level: number;
  isPvP: boolean;
}

interface KillStatistics {
  world: string;
  entries: Death[];
  lastUpdated: string;
  error?: string;
}

/**
 * Hook personalizado para obtener el registro de muertes de un mundo específico
 * @param world Nombre del mundo (servidor) de Tibia
 * @returns Objeto con los datos de muertes, estado de carga y errores
 */
export function useDeathLog(world: string) {
  const [data, setData] = useState<KillStatistics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reiniciar estados cuando cambia el mundo
    setIsLoading(true);
    setError(null);
    
    // Función para obtener los datos
    const fetchData = async () => {
      try {
        if (!world) {
          setData(null);
          setIsLoading(false);
          return;
        }
        
        // Llamar a la API de TibiaData
        const response = await fetch(`https://api.tibiadata.com/v4/killstatistics/${world}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching death log: ${response.status}`);
        }
        
        const jsonData = await response.json();
        
        // Transformar los datos para nuestro formato
        const entries = jsonData.killstatistics?.entries?.map((entry: any) => ({
          time: entry.time,
          killedby: entry.killed_by,
          name: entry.name,
          level: entry.level,
          isPvP: entry.killed_by.includes('by') && !entry.killed_by.includes('monster')
        })) || [];
        
        setData({
          world,
          entries,
          lastUpdated: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error in useDeathLog:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Actualizar cada 5 minutos
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [world]);

  return { data, isLoading, error };
}