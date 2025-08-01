import { useState, useEffect } from 'react';

// Tipos para los datos de muertes de personajes
interface CharacterDeath {
  time: string;
  level: number;
  killedby: string;
  isPvP: boolean;
}

interface CharacterDeathData {
  name: string;
  deaths: CharacterDeath[];
  lastUpdated: string;
}

/**
 * Hook personalizado para obtener el historial de muertes de un personaje específico
 * @param name Nombre del personaje de Tibia
 * @returns Objeto con los datos de muertes del personaje, estado de carga y errores
 */
export function useCharacterDeath(name: string) {
  const [data, setData] = useState<CharacterDeathData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reiniciar estados cuando cambia el nombre del personaje
    setIsLoading(true);
    setError(null);
    
    // Función para obtener los datos
    const fetchData = async () => {
      try {
        if (!name) {
          setData(null);
          setIsLoading(false);
          return;
        }
        
        // Llamar a la API de TibiaData para obtener información del personaje
        const response = await fetch(`https://api.tibiadata.com/v4/character/${encodeURIComponent(name)}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching character data: ${response.status}`);
        }
        
        const jsonData = await response.json();
        
        // Extraer las muertes del personaje
        const characterDeaths = jsonData.character?.deaths?.map((death: any) => ({
          time: death.time,
          level: death.level,
          killedby: death.reason,
          isPvP: death.reason.includes('by') && !death.reason.includes('monster')
        })) || [];
        
        setData({
          name,
          deaths: characterDeaths,
          lastUpdated: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error in useCharacterDeath:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // No necesitamos actualizar tan frecuentemente como el death log general
    // ya que los datos de personajes cambian con menos frecuencia
    const intervalId = setInterval(fetchData, 15 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [name]);

  return { data, isLoading, error };
}