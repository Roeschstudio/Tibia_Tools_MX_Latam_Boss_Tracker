'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useDeathLog } from '@/hooks/useDeathLog';
import { useCharacterDeath } from '@/hooks/useCharacterDeath';

type DeathLogMode = 'world' | 'character';

export default function DeathLogPanel() {
  const { selectedWorld, setSelectedWorld, selectedCharacter, setSelectedCharacter } = useAppStore();
  const [mode, setMode] = useState<DeathLogMode>('world');
  const [inputValue, setInputValue] = useState<string>('');
  
  // Obtener datos según el modo
  const worldDeathLog = useDeathLog(selectedWorld);
  const characterDeathLog = useCharacterDeath(selectedCharacter);
  
  // Determinar qué datos mostrar según el modo
  const isLoading = mode === 'world' ? worldDeathLog.isLoading : characterDeathLog.isLoading;
  const error = mode === 'world' ? worldDeathLog.error : characterDeathLog.error;
  
  // Función para manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    if (mode === 'world') {
      setSelectedWorld(inputValue.trim());
    } else {
      setSelectedCharacter(inputValue.trim());
    }
    
    setInputValue('');
  };
  
  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-800 w-full max-w-3xl">
      <h2 className="text-2xl font-bold text-white mb-6">Historial de Muertes</h2>
      
      {/* Selector de modo */}
      <div className="flex mb-6 bg-gray-900/50 rounded-lg p-1">
        <button
          className={`flex-1 py-2 rounded-md transition-colors ${mode === 'world' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setMode('world')}
        >
          Por Mundo
        </button>
        <button
          className={`flex-1 py-2 rounded-md transition-colors ${mode === 'character' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setMode('character')}
        >
          Por Personaje
        </button>
      </div>
      
      {/* Formulario de búsqueda */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={mode === 'world' ? 'Nombre del mundo...' : 'Nombre del personaje...'}
            className="flex-1 bg-gray-900/70 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
            disabled={isLoading}
          >
            Buscar
          </button>
        </div>
      </form>
      
      {/* Mostrar selección actual */}
      {mode === 'world' && selectedWorld && (
        <div className="mb-4 p-3 bg-indigo-900/30 rounded-md">
          <p className="text-indigo-200">Mundo seleccionado: <span className="font-bold">{selectedWorld}</span></p>
        </div>
      )}
      
      {mode === 'character' && selectedCharacter && (
        <div className="mb-4 p-3 bg-indigo-900/30 rounded-md">
          <p className="text-indigo-200">Personaje seleccionado: <span className="font-bold">{selectedCharacter}</span></p>
        </div>
      )}
      
      {/* Mostrar error si existe */}
      {error && (
        <div className="bg-red-900/50 text-red-200 p-4 rounded-md mb-4">
          Error: {error}
        </div>
      )}
      
      {/* Mostrar cargando */}
      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
      
      {/* Mostrar resultados para mundo */}
      {!isLoading && mode === 'world' && worldDeathLog.data && (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Última actualización: {worldDeathLog.data.lastUpdated ? formatDate(worldDeathLog.data.lastUpdated) : 'N/A'}
          </p>
          
          {worldDeathLog.data.entries && worldDeathLog.data.entries.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {worldDeathLog.data.entries.map((death, index) => (
                <div 
                  key={`world-${death.name}-${death.time}-${index}`}
                  className={`p-3 rounded-md ${death.isPvP ? 'bg-red-900/30 border border-red-800/50' : 'bg-gray-900/70 border border-gray-700'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-white">{death.name} <span className="text-gray-400">(Nivel {death.level})</span></p>
                      <p className="text-gray-300 text-sm">{death.killedby}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300">
                      {formatDate(death.time)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-900/50 p-6 rounded-lg text-center">
              <p className="text-gray-400">No hay registros de muertes para este mundo.</p>
            </div>
          )}
        </div>
      )}
      
      {/* Mostrar resultados para personaje */}
      {!isLoading && mode === 'character' && characterDeathLog.data && (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Última actualización: {characterDeathLog.data.lastUpdated ? formatDate(characterDeathLog.data.lastUpdated) : 'N/A'}
          </p>
          
          {characterDeathLog.data.deaths && characterDeathLog.data.deaths.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {characterDeathLog.data.deaths.map((death, index) => (
                <div 
                  key={`character-${death.level}-${death.time}-${index}`}
                  className={`p-3 rounded-md ${death.isPvP ? 'bg-red-900/30 border border-red-800/50' : 'bg-gray-900/70 border border-gray-700'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-white">Nivel {death.level}</p>
                      <p className="text-gray-300 text-sm">{death.killedby}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300">
                      {formatDate(death.time)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-900/50 p-6 rounded-lg text-center">
              <p className="text-gray-400">No hay registros de muertes para este personaje.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}