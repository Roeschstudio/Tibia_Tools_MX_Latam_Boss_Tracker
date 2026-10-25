import { getCachedData } from './cache';

// Interfaces para TibiaData API
export interface TibiaWorld {
  name: string;
  status: 'online' | 'offline';
  players_online: number;
  location: string;
  pvp_type: string;
  premium_only: boolean;
  transfer_type: string;
  battleye_protected: boolean;
  battleye_date: string;
  game_world_type: string;
  tournament_world_type: string;
}

export interface TibiaWorldsResponse {
  worlds: {
    players_online: number;
    record_players: number;
    record_date: string;
    regular_worlds: TibiaWorld[];
  };
}

export interface TibiaCharacter {
  name: string;
  level: number;
  vocation: string;
  world: string;
  residence: string;
  last_login: string;
  account_status: string;
}

export interface TibiaCharacterResponse {
  character: TibiaCharacter;
}

// Configuración de la API
const TIBIADATA_BASE_URL = 'https://api.tibiadata.com/v5';
const REQUEST_HEADERS = {
  'User-Agent': 'TibiaBossTracker/1.0',
  'Accept': 'application/json',
};

// Función para hacer requests a TibiaData API con manejo de errores
async function tibiaDataRequest<T>(endpoint: string): Promise<T> {
  const url = `${TIBIADATA_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: REQUEST_HEADERS,
      // No usar Next.js cache aquí, usamos nuestro propio sistema
    });

    if (!response.ok) {
      throw new Error(`TibiaData API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching from TibiaData API (${endpoint}):`, error);
    throw error;
  }
}

// Función para obtener todos los mundos activos
export async function fetchActiveWorlds(): Promise<TibiaWorld[]> {
  return getCachedData('worlds', async () => {
    const response = await tibiaDataRequest<TibiaWorldsResponse>('/worlds');
    
    // Filtrar solo mundos online y regulares
    const activeWorlds = response.worlds.regular_worlds.filter(
      world => world.status === 'online'
    );
    
    console.log(`Fetched ${activeWorlds.length} active worlds from TibiaData API`);
    return activeWorlds;
  });
}

// Función para obtener información de un personaje específico
export async function fetchCharacterInfo(characterName: string): Promise<TibiaCharacter | null> {
  try {
    const response = await tibiaDataRequest<TibiaCharacterResponse>(`/character/${encodeURIComponent(characterName)}`);
    return response.character;
  } catch (error) {
    console.warn(`Could not fetch character info for ${characterName}:`, error);
    return null;
  }
}

// Función para obtener estadísticas generales de los mundos
export async function getWorldsStats(): Promise<{
  totalWorlds: number;
  totalPlayersOnline: number;
  averagePlayersPerWorld: number;
  mostPopularWorld: TibiaWorld | null;
}> {
  const worlds = await fetchActiveWorlds();
  
  const totalWorlds = worlds.length;
  const totalPlayersOnline = worlds.reduce((sum, world) => sum + world.players_online, 0);
  const averagePlayersPerWorld = totalWorlds > 0 ? Math.round(totalPlayersOnline / totalWorlds) : 0;
  const mostPopularWorld = worlds.reduce((prev, current) => 
    (prev.players_online > current.players_online) ? prev : current, worlds[0] || null
  );

  return {
    totalWorlds,
    totalPlayersOnline,
    averagePlayersPerWorld,
    mostPopularWorld
  };
}

// Función para verificar el estado de la API de TibiaData
export async function checkTibiaDataApiStatus(): Promise<{
  isOnline: boolean;
  responseTime: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    await tibiaDataRequest('/worlds');
    const responseTime = Date.now() - startTime;
    
    return {
      isOnline: true,
      responseTime
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      isOnline: false,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}