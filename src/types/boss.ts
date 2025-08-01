// Tipos relacionados con bosses

export interface Boss {
  name: string;
  respawnTime: {
    min: number;
    max: number;
  };
  rarity: string;
  world?: string;
  timestamp?: string;
}

export interface LiveBoss extends Boss {
  world: string;
  timestamp: string;
}

export interface RespawnTime {
  min: number;
  max: number;
}

export interface BossData {
  name: string;
  respawnTime: RespawnTime;
  rarity: string;
}

export interface RespawnPrediction {
  earliestRespawn: Date;
  latestRespawn: Date;
  probabilityPercentage: number;
  timeRemaining: {
    earliest: {
      hours: number;
      minutes: number;
    };
    latest: {
      hours: number;
      minutes: number;
    };
  };
}

// Tipos para TibiaData API
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

// Tipos para la respuesta de la API de bosses
export interface BossesApiResponse {
  bosses: Boss[] | LiveBoss[];
  metadata: {
    source: 'static' | 'tibiadata_api' | 'static_fallback';
    activeWorlds?: number;
    totalBosses?: number;
    lastUpdated: string;
    error?: string;
    worlds?: Array<{
      name: string;
      players_online: number;
      location: string;
      pvp_type: string;
    }>;
  };
}