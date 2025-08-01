'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useDebounce } from '@/hooks/useDebounce';

const TIBIA_WORLDS = [
  'Antica',
  'Astera',
  'Belobra',
  'Calmera',
  'Castela',
  'Celebra',
  'Celesta',
  'Collabra',
  'Damora',
  'Descubra',
  'Dia',
  'Famosa',
  'Fera',
  'Firmera',
  'Harmonia',
  'Havera',
  'Impulsa',
  'Inabra',
  'Juva',
  'Kalibra',
  'Kardera',
  'Libertabra',
  'Luminera',
  'Lutabra',
  'Menera',
  'Monza',
  'Mudabra',
  'Nadora',
  'Nefera',
  'Nossobra',
  'Ocebra',
  'Olima',
  'Ombra',
  'Pacembra',
  'Peloria',
  'Premia',
  'Quelibra',
  'Quintera',
  'Refugia',
  'Secura',
  'Serdebra',
  'Solidera',
  'Suna',
  'Syrena',
  'Talera',
  'Thyria',
  'Tornabra',
  'Ustebra',
  'Utobra',
  'Venebra',
  'Versa',
  'Visabra',
  'Vunira',
  'Wintera',
  'Wizera',
  'Xandebra',
  'Yonabra',
  'Zenobra',
  'Zuna',
  'Zunera'
];

interface WorldSelectorProps {
  onChange?: (world: string) => void;
  className?: string;
}

export default function WorldSelector({ onChange, className = '' }: WorldSelectorProps) {
  const { selectedWorld, setSelectedWorld } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWorlds, setFilteredWorlds] = useState(TIBIA_WORLDS);
  const [isOpen, setIsOpen] = useState(false);
  
  // Usar debouncing para optimizar el filtrado
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filtrar mundos cuando cambia el término de búsqueda debounced
  useEffect(() => {
    if (!debouncedSearchTerm) {
      setFilteredWorlds(TIBIA_WORLDS);
      return;
    }
    
    const filtered = TIBIA_WORLDS.filter(world => 
      world.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
    setFilteredWorlds(filtered);
  }, [debouncedSearchTerm]);

  // Manejar la selección de un mundo
  const handleSelectWorld = (world: string) => {
    setSelectedWorld(world);
    setIsOpen(false);
    setSearchTerm('');
    if (onChange) {
      onChange(world);
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
          <span>{selectedWorld || 'Seleccionar mundo'}</span>
          <span className="ml-2">{isOpen ? '▲' : '▼'}</span>
        </button>
        
        {selectedWorld && (
          <button
            type="button"
            onClick={() => {
              setSelectedWorld('');
              if (onChange) {
                onChange('');
              }
            }}
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
              placeholder="Buscar mundo..."
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-white focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>
          
          {filteredWorlds.length > 0 ? (
            <ul className="py-1">
              {filteredWorlds.map((world) => (
                <li key={world}>
                  <button
                    type="button"
                    onClick={() => handleSelectWorld(world)}
                    className={`w-full text-left px-4 py-2 hover:bg-indigo-600 transition-colors ${selectedWorld === world ? 'bg-indigo-700 text-white' : 'text-gray-300'}`}
                  >
                    {world}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-400">
              No se encontraron mundos
            </div>
          )}
        </div>
      )}
    </div>
  );
}