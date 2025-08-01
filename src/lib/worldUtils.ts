import { Boss, LiveBoss, LastSighting } from '@/types/boss';

/**
 * Utility functions for world-based filtering and operations
 */

/**
 * Filters live bosses by selected world
 */
export function filterLiveBossesByWorld(
  liveBosses: LiveBoss[],
  selectedWorld: string | null
): LiveBoss[] {
  if (!selectedWorld) return liveBosses;
  return liveBosses.filter(boss => boss.world === selectedWorld);
}

/**
 * Filters last sightings by selected world
 */
export function filterLastSightingsByWorld(
  lastSightings: LastSighting[],
  selectedWorld: string | null
): LastSighting[] {
  if (!selectedWorld) return lastSightings;
  return lastSightings.filter(sighting => sighting.world === selectedWorld);
}

/**
 * Gets the most relevant world for a boss based on recent sightings
 */
export function getMostRelevantWorld(
  bossName: string,
  lastSightings: LastSighting[]
): string | null {
  const bosseSightings = lastSightings.filter(
    sighting => sighting.bossName?.toLowerCase() === bossName.toLowerCase()
  );

  if (bosseSightings.length === 0) return null;

  // Sort by most recent and return the world
  const mostRecent = bosseSightings.sort(
    (a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
  )[0];

  return mostRecent.world;
}

/**
 * Checks if a boss has data for the selected world
 */
export function hasBossDataForWorld(
  bossName: string,
  selectedWorld: string | null,
  lastSightings: LastSighting[]
): boolean {
  if (!selectedWorld) return true;
  
  return lastSightings.some(
    sighting => 
      sighting.bossName?.toLowerCase() === bossName.toLowerCase() &&
      sighting.world === selectedWorld
  );
}

/**
 * Gets world-specific last sighting for a boss
 */
export function getWorldSpecificLastSighting(
  bossName: string,
  selectedWorld: string | null,
  lastSightings: LastSighting[]
): LastSighting | null {
  const bosseSightings = lastSightings.filter(
    sighting => sighting.bossName?.toLowerCase() === bossName.toLowerCase()
  );

  if (!selectedWorld) {
    // Return most recent if no world selected
    return bosseSightings.sort(
      (a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
    )[0] || null;
  }

  // Return world-specific sighting
  return bosseSightings.find(sighting => sighting.world === selectedWorld) || null;
}

/**
 * Filters static bosses based on whether they have data for the selected world
 */
export function filterStaticBossesByWorld(
  bosses: Boss[],
  selectedWorld: string | null,
  lastSightings: LastSighting[]
): Boss[] {
  if (!selectedWorld) return bosses;

  return bosses.filter(boss => 
    hasBossDataForWorld(boss.name, selectedWorld, lastSightings)
  );
}

/**
 * Gets display text for current world filter status
 */
export function getWorldFilterStatus(selectedWorld: string | null): {
  isActive: boolean;
  text: string;
} {
  if (!selectedWorld) {
    return {
      isActive: false,
      text: 'Todos los mundos'
    };
  }

  return {
    isActive: true,
    text: `Filtrando por: ${selectedWorld}`
  };
}