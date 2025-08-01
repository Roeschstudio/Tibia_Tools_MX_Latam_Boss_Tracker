// Utilizamos fetch para obtener datos en lugar de fs y path que son módulos de Node.js

import { RespawnTime, BossData, RespawnPrediction } from '@/types/boss';

/**
 * Obtiene los datos de respawn de un boss desde el archivo JSON
 * @param bossName Nombre del boss
 * @returns Datos del boss o null si no se encuentra
 */
export async function getBossData(bossName: string): Promise<BossData | null> {
  try {
    const response = await fetch('/api/bosses');
    if (!response.ok) {
      throw new Error(`Error fetching boss data: ${response.status}`);
    }
    
    const data = await response.json();
    
    const boss = data.bosses.find((b: BossData) => 
      b.name.toLowerCase() === bossName.toLowerCase()
    );
    
    return boss || null;
  } catch (error) {
    console.error('Error getting boss data:', error);
    return null;
  }
}

/**
 * Predice el próximo spawn de un boss basado en su último avistamiento
 * @param bossName Nombre del boss
 * @param lastSeen Fecha del último avistamiento
 * @returns Predicción de respawn o null si no se puede predecir
 */
export async function predictNextSpawn(bossName: string, lastSeen: Date): Promise<RespawnPrediction | null> {
  const bossData = await getBossData(bossName);
  
  if (!bossData) {
    return null;
  }
  
  const now = new Date();
  const lastSeenTime = lastSeen.getTime();
  
  // Calcular el tiempo mínimo y máximo de respawn en milisegundos
  const minRespawnTime = bossData.respawnTime.min * 60 * 60 * 1000;
  const maxRespawnTime = bossData.respawnTime.max * 60 * 60 * 1000;
  
  // Calcular las fechas de respawn más temprana y más tardía
  const earliestRespawn = new Date(lastSeenTime + minRespawnTime);
  const latestRespawn = new Date(lastSeenTime + maxRespawnTime);
  
  // Calcular el tiempo restante
  const timeToEarliest = Math.max(0, earliestRespawn.getTime() - now.getTime());
  const timeToLatest = Math.max(0, latestRespawn.getTime() - now.getTime());
  
  // Convertir a horas y minutos
  const earliestHours = Math.floor(timeToEarliest / (60 * 60 * 1000));
  const earliestMinutes = Math.floor((timeToEarliest % (60 * 60 * 1000)) / (60 * 1000));
  
  const latestHours = Math.floor(timeToLatest / (60 * 60 * 1000));
  const latestMinutes = Math.floor((timeToLatest % (60 * 60 * 1000)) / (60 * 1000));
  
  // Calcular la probabilidad de respawn
  let probabilityPercentage = 0;
  
  if (now > latestRespawn) {
    // Si ya pasó el tiempo máximo, la probabilidad es 100%
    probabilityPercentage = 100;
  } else if (now < earliestRespawn) {
    // Si aún no llega el tiempo mínimo, la probabilidad es 0%
    probabilityPercentage = 0;
  } else {
    // Si estamos entre el tiempo mínimo y máximo, calcular la probabilidad
    const totalWindow = maxRespawnTime - minRespawnTime;
    const timeElapsed = now.getTime() - (lastSeenTime + minRespawnTime);
    probabilityPercentage = Math.min(100, Math.round((timeElapsed / totalWindow) * 100));
  }
  
  return {
    earliestRespawn,
    latestRespawn,
    probabilityPercentage,
    timeRemaining: {
      earliest: {
        hours: earliestHours,
        minutes: earliestMinutes
      },
      latest: {
        hours: latestHours,
        minutes: latestMinutes
      }
    }
  };
}

/**
 * Guarda el último avistamiento de un boss
 * @param bossName Nombre del boss
 * @param world Mundo donde se vio
 * @param timestamp Fecha y hora del avistamiento
 * @returns Promise que se resuelve cuando se completa la operación
 */
export async function saveLastSighting(bossName: string, world: string, timestamp: Date): Promise<boolean> {
  try {
    // Enviar los datos a la API
    const response = await fetch('/api/last-sightings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bossName,
        world,
        timestamp: timestamp.toISOString(),
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error saving last sighting: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving last sighting:', error);
    return false; // Agregar return statement para el caso de error
  }
}

/**
 * Obtiene el último avistamiento de un boss
 * @param bossName Nombre del boss
 * @param world Mundo específico (opcional) - si se proporciona, filtra por ese mundo
 * @returns Datos del último avistamiento o null si no hay registros
 */
export async function getLastSighting(bossName: string, world?: string): Promise<{ world: string; lastSeen: Date } | null> {
  try {
    const response = await fetch('/api/last-sightings');
    
    if (!response.ok) {
      throw new Error(`Error fetching last sightings: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Si se especifica un mundo, buscar avistamiento específico para ese mundo
    if (world) {
      // Buscar en todos los avistamientos el que coincida con boss y mundo
      const allSightings = Object.values(data) as Array<{ world: string; lastSeen: string; bossName?: string }>;
      const worldSpecificSighting = allSightings.find(sighting => 
        (sighting.bossName?.toLowerCase() === bossName.toLowerCase() || 
         Object.keys(data).find(key => key.toLowerCase() === bossName.toLowerCase())) &&
        sighting.world === world
      );
      
      if (!worldSpecificSighting) {
        return null;
      }
      
      return {
        world: worldSpecificSighting.world,
        lastSeen: new Date(worldSpecificSighting.lastSeen)
      };
    }
    
    // Comportamiento original: buscar por nombre de boss sin filtro de mundo
    const sighting = data[bossName];
    
    if (!sighting) {
      return null;
    }
    
    return {
      world: sighting.world,
      lastSeen: new Date(sighting.lastSeen)
    };
  } catch (error) {
    console.error('Error getting last sighting:', error);
    return null;
  }
}