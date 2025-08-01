import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { fetchActiveWorlds, TibiaWorld } from '@/lib/tibiaDataService';
import { getCacheInfo } from '@/lib/cache';

// Interfaces para la respuesta
interface Boss {
  name: string;
  respawnTime: {
    min: number;
    max: number;
  };
  rarity: string;
}

interface LiveBoss extends Boss {
  world: string;
  timestamp: string;
}

interface BossesApiResponse {
  bosses: LiveBoss[];
  metadata: {
    source: 'tibiadata_api' | 'static' | 'static_fallback';
    activeWorlds: number;
    totalBosses: number;
    lastUpdated: string;
    cacheInfo?: {
      isValid: boolean;
      lastUpdate: Date | null;
      nextUpdate: Date | null;
      cacheAge: number;
    };
    worlds?: TibiaWorld[];
    error?: string;
  };
}

// Función para obtener datos estáticos de bosses
function getStaticBossData(): Boss[] {
  try {
    const filePath = path.join(process.cwd(), 'src/data/respawns.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    return data.bosses || [];
  } catch (error) {
    console.error('Error reading static boss data:', error);
    return [];
  }
}

// Función para combinar datos estáticos con mundos activos
function combineBossDataWithWorlds(staticBosses: Boss[], activeWorlds: TibiaWorld[]): LiveBoss[] {
  const liveBosses: LiveBoss[] = [];
  
  // Para cada boss estático, crear una entrada para cada mundo activo
  staticBosses.forEach(boss => {
    activeWorlds.forEach(world => {
      liveBosses.push({
        ...boss,
        world: world.name,
        timestamp: new Date().toISOString(), // Timestamp actual como placeholder
      });
    });
  });
  
  return liveBosses;
}

export async function GET(): Promise<NextResponse<BossesApiResponse>> {
  try {
    // Obtener datos estáticos de bosses
    const staticBosses = getStaticBossData();
    
    // Obtener información del caché
    const cacheInfo = getCacheInfo();
    
    try {
      // Obtener mundos activos desde TibiaData API (con caché)
      const activeWorlds = await fetchActiveWorlds();
      
      if (activeWorlds.length === 0) {
        // Si no hay mundos activos disponibles, devolver solo datos estáticos
        console.warn('No active worlds found, returning static data only');
        return NextResponse.json({
          bosses: staticBosses.map(boss => ({
            ...boss,
            world: 'Unknown',
            timestamp: new Date().toISOString()
          })),
          metadata: {
            source: 'static',
            activeWorlds: 0,
            totalBosses: staticBosses.length,
            lastUpdated: new Date().toISOString(),
            cacheInfo
          }
        });
      }
      
      // Combinar datos estáticos con mundos activos
      const liveBosses = combineBossDataWithWorlds(staticBosses, activeWorlds);
      
      return NextResponse.json({
        bosses: liveBosses,
        metadata: {
          source: 'tibiadata_api',
          activeWorlds: activeWorlds.length,
          totalBosses: liveBosses.length,
          lastUpdated: new Date().toISOString(),
          cacheInfo,
          worlds: activeWorlds
        }
      });
      
    } catch (apiError) {
      // Si falla la API, intentar devolver datos estáticos
      console.error('TibiaData API failed, falling back to static data:', apiError);
      
      return NextResponse.json({
        bosses: staticBosses.map(boss => ({
          ...boss,
          world: 'Fallback',
          timestamp: new Date().toISOString()
        })),
        metadata: {
          source: 'static_fallback',
          activeWorlds: 0,
          totalBosses: staticBosses.length,
          lastUpdated: new Date().toISOString(),
          cacheInfo,
          error: apiError instanceof Error ? apiError.message : 'API connection failed'
        }
      });
    }
    
  } catch (error) {
    console.error('Critical error in GET /api/bosses:', error);
    return NextResponse.json(
      { 
        bosses: [],
        metadata: {
          source: 'static_fallback',
          activeWorlds: 0,
          totalBosses: 0,
          lastUpdated: new Date().toISOString(),
          error: 'Critical server error'
        }
      },
      { status: 500 }
    );
  }
}