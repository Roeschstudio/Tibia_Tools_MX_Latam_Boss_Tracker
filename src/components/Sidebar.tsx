'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';

interface SidebarProps {
  activeTool: 'livemap' | 'deathlog' | 'respawntimer' | 'bossgrid' | 'characterlookup' | 'reportsighting' | 'worldselector';
}

export default function Sidebar({ activeTool }: SidebarProps) {
  const { darkMode, toggleDarkMode } = useAppStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
      className={`fixed top-0 left-0 h-full bg-black/40 backdrop-blur-md border-r border-gray-800 transition-all duration-300 z-10 ${isCollapsed ? 'w-16' : 'w-64'}`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-white">Tibia Tools <span className="text-indigo-400">LATAM</span></h1>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-6">
          <ul className="space-y-2">
            <li>
              <Link 
                href="/"
                className={`flex items-center px-4 py-3 ${activeTool === 'livemap' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'} transition-colors`}
              >
                <span className="text-xl mr-3">🗺️</span>
                {!isCollapsed && <span>LiveMap de Bosses</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/boss-grid"
                className={`flex items-center px-4 py-3 ${activeTool === 'bossgrid' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'} transition-colors`}
              >
                <span className="text-xl mr-3">📋</span>
                {!isCollapsed && <span>Explorador de Bosses</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/deathlog"
                className={`flex items-center px-4 py-3 ${activeTool === 'deathlog' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'} transition-colors`}
              >
                <span className="text-xl mr-3">💀</span>
                {!isCollapsed && <span>Historial de Muertes</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/respawn-timer"
                className={`flex items-center px-4 py-3 ${activeTool === 'respawntimer' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'} transition-colors`}
              >
                <span className="text-xl mr-3">⏱️</span>
                {!isCollapsed && <span>Temporizador de Respawn</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/character-lookup"
                className={`flex items-center px-4 py-3 ${activeTool === 'characterlookup' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'} transition-colors`}
              >
                <span className="text-xl mr-3">👤</span>
                {!isCollapsed && <span>Buscador de Personajes</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/report-sighting"
                className={`flex items-center px-4 py-3 ${activeTool === 'reportsighting' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'} transition-colors`}
              >
                <span className="text-xl mr-3">📝</span>
                {!isCollapsed && <span>Reportar Avistamiento</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/world-selector"
                className={`flex items-center px-4 py-3 ${activeTool === 'worldselector' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'} transition-colors`}
              >
                <span className="text-xl mr-3">🌎</span>
                {!isCollapsed && <span>Selector de Mundo</span>}
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <button 
              onClick={toggleDarkMode}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {darkMode ? '🌙' : '☀️'}
            </button>
            
            {!isCollapsed && (
              <a 
                href="https://ko-fi.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
              >
                Apóyanos ☕
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}