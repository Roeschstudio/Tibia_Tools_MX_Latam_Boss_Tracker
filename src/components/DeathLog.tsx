'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import WorldSelector from './WorldSelector';
import CharacterSelector from './CharacterSelector';

interface Death {
  character: string;
  world: string;
  level: number;
  killedBy: string;
  timestamp: string;
  isPlayerKill: boolean;
}

export default function DeathLog() {
  const { selectedWorld } = useAppStore();
  const [deaths, setDeaths] = useState<Death[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [filterPlayerKills, setFilterPlayerKills] = useState<boolean | null>(null);

  // Simular datos de muertes (en una aplicación real, esto vendría de una API)
  useEffect(() => {
    // Simular carga de datos
    setLoading(true);
    
    // Datos de ejemplo
    const mockDeaths: Death[] = [
      {
        character: 'Rook Warrior',
        world: 'Antica',
        level: 120,
        killedBy: 'a dragon lord',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutos atrás
        isPlayerKill: false
      },
      {
        character: 'Magic Knight',
        world: 'Antica',
        level: 85,
        killedBy: 'Deadly Hunter',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hora atrás
        isPlayerKill: true
      },
      {
        character: 'Paladin Master',
        world: 'Monza',
        level: 200,
        killedBy: 'Ferumbras',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 horas atrás
        isPlayerKill: false
      },
      {
        character: 'Druid Healer',
        world: 'Monza',
        level: 150,
        killedBy: 'Shadow Assassin',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 horas atrás
        isPlayerKill: true
      },
      {
        character: 'Elite Knight',
        world: 'Peloria',
        level: 300,
        killedBy: 'Morgaroth',
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 horas atrás
        isPlayerKill: false
      }
    ];
    
    // Simular retraso de red
    setTimeout(() => {
      setDeaths(mockDeaths);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrar muertes según los criterios seleccionados
  const filteredDeaths = deaths.filter(death => {
    // Filtrar por mundo si hay uno seleccionado
    if (selectedWorld && death.world !== selectedWorld) {
      return false;
    }
    
    // Filtrar por personaje si hay uno seleccionado
    if (selectedCharacter && !death.character.toLowerCase().includes(selectedCharacter.toLowerCase())) {
      return false;
    }
    
    // Filtrar por término de búsqueda (nombre de personaje o asesino)
    if (searchTerm && !death.character.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !death.killedBy.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filtrar por tipo de muerte (PK o no PK)
    if (filterPlayerKills !== null) {
      return death.isPlayerKill === filterPlayerKills;
    }
    
    return true;
  });

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6 w-full max-w-4xl">
      <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-white">Historial de Muertes</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <WorldSelector className="w-full sm:w-auto" />
          </div>
        </div>
        
        {/* Filtros */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-400 mb-1">Buscar</label>
            <input
              type="text"
              id="search"
              placeholder="Buscar por personaje o asesino..."
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Personaje</label>
            <CharacterSelector onChange={setSelectedCharacter} />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-1">Tipo de muerte</label>
            <div className="flex gap-4">
              <button 
                className={`px-3 py-1 rounded-md ${filterPlayerKills === null ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                onClick={() => setFilterPlayerKills(null)}
              >
                Todos
              </button>
              <button 
                className={`px-3 py-1 rounded-md ${filterPlayerKills === true ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                onClick={() => setFilterPlayerKills(true)}
              >
                PK (Jugador)
              </button>
              <button 
                className={`px-3 py-1 rounded-md ${filterPlayerKills === false ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                onClick={() => setFilterPlayerKills(false)}
              >
                No PK (Monstruo)
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-md mb-4">
            Error: {error}
          </div>
        )}
        
        {/* Lista de muertes */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="loading-spinner"></div>
          </div>
        ) : filteredDeaths.length > 0 ? (
          <div className="space-y-4">
            {filteredDeaths.map((death, index) => (
              <div 
                key={`${death.character}-${death.timestamp}-${index}`}
                className="bg-gray-900/70 rounded-lg p-4 border border-gray-700 hover:border-indigo-500 transition-colors"
              >
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {death.character} <span className="text-gray-400 text-sm">Nivel {death.level}</span>
                    </h3>
                    <p className="text-gray-300">
                      Murió a manos de <span className={death.isPlayerKill ? 'text-red-400' : 'text-yellow-400'}>
                        {death.killedBy}
                      </span>
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Mundo: {death.world}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0 text-right">
                    <p className="text-gray-400 text-sm">
                      {formatDate(death.timestamp)}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${death.isPlayerKill ? 'bg-red-900/50 text-red-200' : 'bg-yellow-900/50 text-yellow-200'}`}>
                      {death.isPlayerKill ? 'Muerte por Jugador' : 'Muerte por Monstruo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900/50 p-6 rounded-lg text-center">
            <p className="text-gray-400">No se encontraron muertes con los filtros seleccionados.</p>
            <p className="text-gray-500 text-sm mt-2">Intenta con otros filtros o vuelve más tarde.</p>
          </div>
        )}
      </div>
    </div>
  );
}