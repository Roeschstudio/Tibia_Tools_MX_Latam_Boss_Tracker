import { useState, useEffect } from 'react';
import { LastSighting } from '@/types/boss';

/**
 * Custom hook to fetch and manage all last sightings data
 */
export function useLastSightings() {
  const [lastSightings, setLastSightings] = useState<LastSighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLastSightings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/last-sightings');
        
        if (!response.ok) {
          throw new Error(`Error fetching last sightings: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Convert the object format to array format for easier filtering
        const sightingsArray: LastSighting[] = Object.entries(data).map(([bossName, sighting]: [string, any]) => ({
          bossName,
          world: sighting.world,
          lastSeen: sighting.lastSeen,
          updatedAt: sighting.updatedAt
        }));
        
        setLastSightings(sightingsArray);
      } catch (err) {
        console.error('Error fetching last sightings:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setLastSightings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLastSightings();
  }, []);

  const refreshLastSightings = async () => {
    const fetchLastSightings = async () => {
      try {
        setError(null);
        
        const response = await fetch('/api/last-sightings');
        
        if (!response.ok) {
          throw new Error(`Error fetching last sightings: ${response.status}`);
        }
        
        const data = await response.json();
        
        const sightingsArray: LastSighting[] = Object.entries(data).map(([bossName, sighting]: [string, any]) => ({
          bossName,
          world: sighting.world,
          lastSeen: sighting.lastSeen,
          updatedAt: sighting.updatedAt
        }));
        
        setLastSightings(sightingsArray);
      } catch (err) {
        console.error('Error refreshing last sightings:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    };

    await fetchLastSightings();
  };

  return {
    lastSightings,
    loading,
    error,
    refreshLastSightings
  };
}