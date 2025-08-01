import { NextResponse } from 'next/server';
import { fetchActiveWorlds, getWorldsStats } from '@/lib/tibiaDataService';
import { getCacheInfo } from '@/lib/cache';

// Interface para la respuesta de live bosses
interface LiveBossesResponse {
  bosses: Array<{
    name: string;
    world: string;
    players_online: number;
    location: string;
    pvp_type: string;
    lastUpdated: string;
  }>;
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

// Endpoint GET para obtener los mundos activos con información de jugadores
export async function GET(): Promise<NextResponse<LiveBossesResponse>> {
  try {
    // Obtener información del caché
    const cacheInfo = getCacheInfo();
    
    try {
      // Obtener mundos activos desde TibiaData API (con caché)
      const activeWorlds = await fetchActiveWorlds();
      
      // Obtener estadísticas de los mundos
      const worldsStats = await getWorldsStats();
      
      // Transformar los datos para el formato de respuesta
      const liveBossesData = activeWorlds.map(world => ({
        name: world.name,
        world: world.name,
        players_online: world.players_online,
        location: world.location,
        pvp_type: world.pvp_type,
        lastUpdated: new Date().toISOString()
      }));
      
      return NextResponse.json({
        bosses: liveBossesData,
        metadata: {
          source: 'tibiadata_api',
          totalWorlds: worldsStats.totalWorlds,
          totalPlayersOnline: worldsStats.totalPlayersOnline,
          averagePlayersPerWorld: worldsStats.averagePlayersPerWorld,
          mostPopularWorld: worldsStats.mostPopularWorld?.name || null,
          lastUpdated: new Date().toISOString(),
          cacheInfo
        },
        refreshed: !cacheInfo.isValid // Si el caché no era válido, se refrescó
      });
      
    } catch (apiError) {
      console.error('TibiaData API failed in live-bosses:', apiError);
      
      // Fallback: devolver datos mínimos
      return NextResponse.json({
        bosses: [],
        metadata: {
          source: 'fallback',
          totalWorlds: 0,
          totalPlayersOnline: 0,
          averagePlayersPerWorld: 0,
          mostPopularWorld: null,
          lastUpdated: new Date().toISOString(),
          cacheInfo,
          error: apiError instanceof Error ? apiError.message : 'API connection failed'
        },
        refreshed: false
      });
    }
    
  } catch (error) {
    console.error('Critical error in GET /api/live-bosses:', error);
    return NextResponse.json(
      {
        bosses: [],
        metadata: {
          source: 'fallback',
          totalWorlds: 0,
          totalPlayersOnline: 0,
          averagePlayersPerWorld: 0,
          mostPopularWorld: null,
          lastUpdated: new Date().toISOString(),
          cacheInfo: {
            isValid: false,
            lastUpdate: null,
            nextUpdate: null,
            cacheAge: 0
          },
          error: 'Critical server error'
        },
        refreshed: false
      },
      { status: 500 }
    );
  }
}