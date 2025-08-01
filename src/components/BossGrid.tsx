'use client';

import { useState, useEffect, useMemo } from 'react';
import BossCard from './BossCard';
import CacheStatus from './CacheStatus';
import { useAppStore } from '@/lib/store';
import { useBosses } from '@/hooks/useBosses';
import { useDebounce } from '@/hooks/useDebounce';
import { useWorldFilter } from '@/hooks/useWorldFilter';
import { useLastSightings } from '@/hooks/useLastSightings';
import { Boss, LiveBoss } from '@/types/boss';

interface BossGridProps {
  bosses?: Boss[] | LiveBoss[];
  isLive?: boolean;
  showFilters?: boolean;
}

export default function BossGrid({ bosses: propBosses, isLive = false, showFilters = true }: BossGridProps) {
  // Si no se proporcionan bosses como prop, usar el hook useBosses
  const { 
    bosses: hookBosses, 
    loading: bossesLoading, 
    error: bossesError,
    metadata,
    isLiveData,
    activeWorlds,
    lastUpdated
  } = useBosses();
  
  // Hook para filtrado global por mundo
  const { 
    selectedWorld, 
    filterStatus, 
    filterLiveBosses, 
    filterStaticBosses,
    isFilterActive 
  } = useWorldFilter();
  
  // Hook para obtener datos de last-sightings
  const { lastSightings, loading: lastSightingsLoading } = useLastSightings();
  
  // Usar los bosses proporcionados como prop o los del hook, con validación defensiva
  const bosses = useMemo(() => {
    return propBosses || hookBosses || [];
  }, [propBosses, hookBosses]);
  
  // Validar que bosses es un array antes de usarlo usando useMemo
  const validBosses = useMemo(() => {
    return Array.isArray(bosses) ? bosses : [];
  }, [bosses]);
  
  const { favoriteBosses } = useAppStore();
  const [filteredBosses, setFilteredBosses] = useState<(Boss | LiveBoss)[]>(validBosses);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  
  // Usar debouncing para optimizar el filtrado de búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Aplicar filtros cuando cambian los bosses o los filtros
  useEffect(() => {
    // Validación defensiva: asegurar que tenemos un array válido
    if (!Array.isArray(validBosses)) {
      console.warn('Bosses is not an array:', validBosses);
      setFilteredBosses([]);
      return;
    }
    
    let result = [...validBosses];
    
    // Aplicar filtrado global por mundo usando el hook
    if (isLive) {
      // Para datos en vivo, usar el filtro de live bosses
      result = filterLiveBosses(result as LiveBoss[]);
    } else {
      // Para datos estáticos, usar el filtro que considera last-sightings
      result = filterStaticBosses(result as Boss[], lastSightings);
    }
    
    // Filtrar por término de búsqueda (usando debounced)
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      result = result.filter(boss => 
        boss.name.toLowerCase().includes(term) ||
        (boss.world && boss.world.toLowerCase().includes(term))
      );
    }
    
    // Filtrar por favoritos
    if (showOnlyFavorites) {
      result = result.filter(boss => favoriteBosses.includes(boss.name));
    }
    
    // Filtrar por rareza
    if (rarityFilter !== 'all') {
      result = result.filter(boss => 
        boss.rarity?.toLowerCase() === rarityFilter.toLowerCase()
      );
    }
    
    // Ordenar resultados
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rarity':
          const rarityOrder: Record<string, number> = {
            'legendary': 1,
            'rare': 2,
            'uncommon': 3,
            '': 4
          };
          return (rarityOrder[a.rarity?.toLowerCase() || ''] || 4) - 
                 (rarityOrder[b.rarity?.toLowerCase() || ''] || 4);
        case 'world':
          return (a.world || '').localeCompare(b.world || '');
        case 'timestamp':
          const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return bTime - aTime; // Más reciente primero
        default:
          return 0;
      }
    });
    
    setFilteredBosses(result);
  }, [
    validBosses, 
    debouncedSearchTerm, 
    showOnlyFavorites, 
    rarityFilter, 
    sortBy, 
    favoriteBosses, 
    isLive,
    filterLiveBosses,
    filterStaticBosses,
    lastSightings
  ]);

  return (
    <div className="space-y-4">
      {/* Componente de estado del caché */}
      {!propBosses && <CacheStatus />}
      
      {/* Indicador de filtrado por mundo */}
      {isFilterActive && (
        <div className="glass p-3 rounded-lg border-l-4 border-blue-500 bg-blue-900/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-white font-medium">
                  {filterStatus.text}
                </p>
                <p className="text-gray-400 text-sm">
                  {isLive 
                    ? 'Mostrando solo bosses en vivo de este mundo'
                    : 'Mostrando solo bosses con avistamientos en este mundo'
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-400 text-sm">
                {filteredBosses.length} boss{filteredBosses.length !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Información sobre el estado de los datos */}
      {!propBosses && metadata && (
        <div className={`glass p-4 rounded-lg border-l-4 ${
          isLiveData ? 'border-green-500 bg-green-900/10' : 'border-yellow-500 bg-yellow-900/10'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                isLiveData ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
              }`}></div>
              <div>
                <p className="text-white font-medium">
                  {isLiveData ? 'Datos en vivo desde TibiaData API' : 'Datos estáticos'}
                </p>
                <p className="text-gray-400 text-sm">
                  {isLiveData 
                    ? `${activeWorlds} mundos activos • ${validBosses.length} bosses totales`
                    : metadata.error 
                      ? `Error: ${metadata.error}`
                      : 'Usando datos locales'
                  }
                </p>
              </div>
            </div>
            {lastUpdated && (
              <div className="text-right">
                <p className="text-gray-400 text-sm">Actualizado</p>
                <p className="text-white text-sm">
                  {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
          
          {/* Mostrar información de mundos si hay datos en vivo */}
          {isLiveData && metadata.worlds && metadata.worlds.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-gray-400 text-sm mb-2">Mundos activos:</p>
              <div className="flex flex-wrap gap-2">
                {metadata.worlds.slice(0, 10).map((world) => (
                  <span
                    key={world.name}
                    className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300"
                    title={`${world.players_online} jugadores • ${world.location} • ${world.pvp_type}`}
                  >
                    {world.name} ({world.players_online})
                  </span>
                ))}
                {metadata.worlds.length > 10 && (
                  <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-400">
                    +{metadata.worlds.length - 10} más
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {showFilters && (
        <div className="glass p-4 rounded-lg space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-grow">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar boss..."
                className="w-full bg-gray-900/70 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-indigo-500 hover:border-indigo-400 transition-colors"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="favorites-filter"
                checked={showOnlyFavorites}
                onChange={(e) => setShowOnlyFavorites(e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-gray-900 border-gray-700 rounded focus:ring-indigo-500"
              />
              <label htmlFor="favorites-filter" className="text-white">
                Solo favoritos
              </label>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="w-full sm:w-auto">
              <label htmlFor="rarity-filter" className="block text-sm font-medium text-gray-400 mb-1">
                Rareza
              </label>
              <select
                id="rarity-filter"
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value)}
                className="w-full bg-gray-900/70 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-indigo-500 hover:border-indigo-400 transition-colors"
              >
                <option value="all">Todas las rarezas</option>
                <option value="legendary">Legendario</option>
                <option value="rare">Raro</option>
                <option value="uncommon">Poco común</option>
              </select>
            </div>
            
            <div className="w-full sm:w-auto">
              <label htmlFor="sort-by" className="block text-sm font-medium text-gray-400 mb-1">
                Ordenar por
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-900/70 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-indigo-500 hover:border-indigo-400 transition-colors"
              >
                <option value="name">Nombre</option>
                <option value="rarity">Rareza</option>
                {isLive && <option value="world">Mundo</option>}
                {isLive && <option value="timestamp">Más reciente</option>}
              </select>
            </div>
          </div>
        </div>
      )}
      
      {bossesLoading && !propBosses ? (
        <div className="glass p-8 rounded-lg text-center">
          <div className="loading-spinner mx-auto"></div>
          <p className="text-gray-400 mt-4">Cargando bosses...</p>
        </div>
      ) : bossesError && !propBosses ? (
        <div className="glass p-8 rounded-lg text-center bg-red-900/20">
          <p className="text-red-400 text-lg">
            Error al cargar los bosses: {bossesError}
          </p>
        </div>
      ) : filteredBosses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBosses.map((boss, index) => (
            <BossCard 
              key={`${boss.name}-${boss.world || 'no-world'}-${boss.timestamp || Date.now()}-${index}`} 
              boss={boss} 
              isLive={isLive} 
            />
          ))}
        </div>
      ) : (
        <div className="glass p-8 rounded-lg text-center">
          <p className="text-gray-400 text-lg">
            No se encontraron bosses con los filtros actuales
          </p>
        </div>
      )}
    </div>
  );
}