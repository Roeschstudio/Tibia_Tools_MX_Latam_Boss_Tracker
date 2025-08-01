'use client';

import { useState, useEffect } from 'react';
import { useBosses } from '@/hooks/useBosses';
import { useDebounce } from '@/hooks/useDebounce';

interface BossSelectorProps {
  onSelect: (bossName: string) => void;
  selectedBoss?: string;
  className?: string;
}

export default function BossSelector({ onSelect, selectedBoss, className = '' }: BossSelectorProps) {
  const { bosses, loading, error } = useBosses();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBosses, setFilteredBosses] = useState<Array<{ name: string; rarity: string }>>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  // Usar debouncing para optimizar el filtrado
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filtrar bosses cuando cambia el término de búsqueda debounced o se cargan los bosses
  useEffect(() => {
    if (loading || error || !bosses.length) return;
    
    if (!debouncedSearchTerm) {
      setFilteredBosses(bosses.map(boss => ({ name: boss.name, rarity: boss.rarity })));
      return;
    }
    
    const filtered = bosses
      .filter(boss => boss.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      .map(boss => ({ name: boss.name, rarity: boss.rarity }));
    
    setFilteredBosses(filtered);
  }, [debouncedSearchTerm, bosses, loading, error]);

  // Manejar la selección de un boss
  const handleSelectBoss = (bossName: string) => {
    onSelect(bossName);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Obtener el color de la rareza para el texto
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary':
        return 'text-purple-400';
      case 'rare':
        return 'text-blue-400';
      case 'uncommon':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full bg-gray-900/70 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-indigo-500 hover:border-indigo-400 transition-colors"
        >
          <span>{selectedBoss || 'Seleccionar boss'}</span>
          <span className="ml-2">{isOpen ? '▲' : '▼'}</span>
        </button>
        
        {selectedBoss && (
          <button
            type="button"
            onClick={() => onSelect('')}
            className="ml-2 px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            aria-label="Limpiar selección"
          >
            ✕
          </button>
        )}
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="sticky top-0 bg-gray-900 p-2 border-b border-gray-700">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar boss..."
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-white focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>
          
          {loading ? (
            <div className="p-4 text-center">
              <div className="loading-spinner"></div>
              <p className="mt-2 text-gray-400">Cargando bosses...</p>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-400">
              Error: {error}
            </div>
          ) : filteredBosses.length > 0 ? (
            <ul className="py-1">
              {filteredBosses.map((boss, index) => (
                <li key={`${boss.name}-${boss.rarity}-${index}`}>
                  <button
                    type="button"
                    onClick={() => handleSelectBoss(boss.name)}
                    className={`w-full text-left px-4 py-2 hover:bg-indigo-600 transition-colors ${selectedBoss === boss.name ? 'bg-indigo-700 text-white' : 'text-gray-300'}`}
                  >
                    <span>{boss.name}</span>
                    <span className={`ml-2 text-xs ${getRarityColor(boss.rarity)}`}>
                      {boss.rarity}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-400">
              No se encontraron bosses
            </div>
          )}
        </div>
      )}
    </div>
  );
}