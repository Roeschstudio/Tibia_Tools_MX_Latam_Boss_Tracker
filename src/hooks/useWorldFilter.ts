import { useAppStore } from '@/lib/store';
import { useMemo } from 'react';
import { Boss, LiveBoss, LastSighting } from '@/types/boss';
import {
  filterLiveBossesByWorld,
  filterLastSightingsByWorld,
  filterStaticBossesByWorld,
  getWorldFilterStatus,
  getMostRelevantWorld,
  hasBossDataForWorld,
  getWorldSpecificLastSighting
} from '@/lib/worldUtils';

/**
 * Custom hook for world-based filtering functionality
 * Provides centralized world filtering logic for all components
 */
export function useWorldFilter() {
  const { selectedWorld } = useAppStore();

  const filterStatus = useMemo(() => 
    getWorldFilterStatus(selectedWorld), 
    [selectedWorld]
  );

  const filterLiveBosses = useMemo(() => 
    (liveBosses: LiveBoss[]) => filterLiveBossesByWorld(liveBosses, selectedWorld),
    [selectedWorld]
  );

  const filterLastSightings = useMemo(() => 
    (lastSightings: LastSighting[]) => filterLastSightingsByWorld(lastSightings, selectedWorld),
    [selectedWorld]
  );

  const filterStaticBosses = useMemo(() => 
    (bosses: Boss[], lastSightings: LastSighting[]) => 
      filterStaticBossesByWorld(bosses, selectedWorld, lastSightings),
    [selectedWorld]
  );

  const getRelevantWorld = useMemo(() => 
    (bossName: string, lastSightings: LastSighting[]) => 
      getMostRelevantWorld(bossName, lastSightings),
    []
  );

  const hasDataForWorld = useMemo(() => 
    (bossName: string, lastSightings: LastSighting[]) => 
      hasBossDataForWorld(bossName, selectedWorld, lastSightings),
    [selectedWorld]
  );

  const getWorldSpecificSighting = useMemo(() => 
    (bossName: string, lastSightings: LastSighting[]) => 
      getWorldSpecificLastSighting(bossName, selectedWorld, lastSightings),
    [selectedWorld]
  );

  return {
    selectedWorld,
    filterStatus,
    filterLiveBosses,
    filterLastSightings,
    filterStaticBosses,
    getRelevantWorld,
    hasDataForWorld,
    getWorldSpecificSighting,
    isFilterActive: filterStatus.isActive
  };
}