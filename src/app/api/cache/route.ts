import { NextResponse } from 'next/server';
import { fetchActiveWorlds, checkTibiaDataApiStatus } from '@/lib/tibiaDataService';
import { invalidateCache, getCacheInfo } from '@/lib/cache';

// Interface para la respuesta del endpoint de caché
interface CacheManagementResponse {
  action: 'refresh' | 'status' | 'invalidate' | 'unknown';
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

// GET: Obtener estado del caché
export async function GET(): Promise<NextResponse<CacheManagementResponse>> {
  try {
    const cacheInfo = getCacheInfo();
    const apiStatus = await checkTibiaDataApiStatus();
    
    return NextResponse.json({
      action: 'status',
      success: true,
      cacheInfo,
      apiStatus,
      message: `Cache is ${cacheInfo.isValid ? 'valid' : 'expired'}. API is ${apiStatus.isOnline ? 'online' : 'offline'}.`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting cache status:', error);
    return NextResponse.json(
      {
        action: 'status',
        success: false,
        cacheInfo: {
          isValid: false,
          lastUpdate: null,
          nextUpdate: null,
          cacheAge: 0
        },
        message: 'Error retrieving cache status',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST: Refrescar caché manualmente
export async function POST(request: Request): Promise<NextResponse<CacheManagementResponse>> {
  try {
    const body = await request.json();
    const { action } = body;
    
    if (action === 'refresh') {
      // Forzar actualización del caché
      console.log('Manual cache refresh requested');
      
      try {
        // Obtener datos frescos (esto invalidará el caché automáticamente)
        const activeWorlds = await fetchActiveWorlds();
        const totalPlayersOnline = activeWorlds.reduce((sum, world) => sum + world.players_online, 0);
        
        const cacheInfo = getCacheInfo();
        
        return NextResponse.json({
          action: 'refresh',
          success: true,
          cacheInfo,
          refreshedData: {
            worldsCount: activeWorlds.length,
            totalPlayersOnline
          },
          message: `Cache refreshed successfully. ${activeWorlds.length} worlds loaded.`,
          timestamp: new Date().toISOString()
        });
        
      } catch (apiError) {
        return NextResponse.json({
          action: 'refresh',
          success: false,
          cacheInfo: getCacheInfo(),
          message: `Failed to refresh cache: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`,
          timestamp: new Date().toISOString()
        });
      }
      
    } else if (action === 'invalidate') {
      // Invalidar caché completamente
      invalidateCache();
      
      return NextResponse.json({
        action: 'invalidate',
        success: true,
        cacheInfo: getCacheInfo(),
        message: 'Cache invalidated successfully',
        timestamp: new Date().toISOString()
      });
      
    } else {
      return NextResponse.json(
        {
          action: action || 'unknown',
          success: false,
          cacheInfo: getCacheInfo(),
          message: 'Invalid action. Use "refresh" or "invalidate".',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Error in cache management:', error);
    return NextResponse.json(
      {
        action: 'unknown',
        success: false,
        cacheInfo: {
          isValid: false,
          lastUpdate: null,
          nextUpdate: null,
          cacheAge: 0
        },
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}