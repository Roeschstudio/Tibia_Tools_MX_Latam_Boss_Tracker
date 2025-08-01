'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';

interface CharacterSelectorProps {
  onChange?: (character: string) => void;
  className?: string;
}

export default function CharacterSelector({ onChange, className = '' }: CharacterSelectorProps) {
  const { selectedCharacter, setSelectedCharacter } = useAppStore();
  const [inputValue, setInputValue] = useState(selectedCharacter || '');
  const [recentCharacters, setRecentCharacters] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Cargar personajes recientes del localStorage al montar el componente
  useEffect(() => {
    const storedCharacters = localStorage.getItem('recentCharacters');
    if (storedCharacters) {
      try {
        const parsed = JSON.parse(storedCharacters);
        if (Array.isArray(parsed)) {
          setRecentCharacters(parsed);
        }
      } catch (e) {
        console.error('Error parsing recent characters:', e);
      }
    }
  }, []);

  // Actualizar el input cuando cambia el personaje seleccionado
  useEffect(() => {
    setInputValue(selectedCharacter || '');
  }, [selectedCharacter]);

  // Manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const character = inputValue.trim();
    setSelectedCharacter(character);
    
    // Guardar en personajes recientes
    const updatedRecent = [
      character,
      ...recentCharacters.filter(c => c !== character)
    ].slice(0, 5); // Mantener solo los 5 más recientes
    
    setRecentCharacters(updatedRecent);
    localStorage.setItem('recentCharacters', JSON.stringify(updatedRecent));
    
    if (onChange) {
      onChange(character);
    }
    
    setShowDropdown(false);
  };

  // Manejar la selección de un personaje reciente
  const handleSelectRecent = (character: string) => {
    setInputValue(character);
    setSelectedCharacter(character);
    
    // Reordenar personajes recientes
    const updatedRecent = [
      character,
      ...recentCharacters.filter(c => c !== character)
    ].slice(0, 5);
    
    setRecentCharacters(updatedRecent);
    localStorage.setItem('recentCharacters', JSON.stringify(updatedRecent));
    
    if (onChange) {
      onChange(character);
    }
    
    setShowDropdown(false);
  };

  // Limpiar la selección
  const handleClear = () => {
    setInputValue('');
    setSelectedCharacter('');
    
    if (onChange) {
      onChange('');
    }
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex items-center">
        <div className="relative flex-grow">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="Nombre del personaje"
            className="w-full bg-gray-900/70 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-indigo-500 hover:border-indigo-400 transition-colors"
          />
          
          {showDropdown && recentCharacters.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
              <ul className="py-1">
                {recentCharacters.map((character) => (
                  <li key={character}>
                    <button
                      type="button"
                      onClick={() => handleSelectRecent(character)}
                      className="w-full text-left px-4 py-2 hover:bg-indigo-600 transition-colors text-gray-300"
                    >
                      {character}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
        >
          Buscar
        </button>
        
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-2 px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            aria-label="Limpiar selección"
          >
            ✕
          </button>
        )}
      </form>
    </div>
  );
}