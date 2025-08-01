'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import WorldSelector from './WorldSelector';
import BossGrid from './BossGrid';
import { useLiveBosses } from '@/hooks/useLiveBosses';

export default function LiveMapPanel() {
  const { liveBosses, loading, error, refetch, lastUpdated } = useLiveBosses();
  const [showFilters, setShowFilters] = useState(true);

  // Función para formatear la fecha de manera segura
  const formatDate = (date: Date | null) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Fecha no disponible';
    }
    
    try {
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'Fecha no disponible';
    }
  };

  return (
    <div className="space-y-6 w-full max-w-4xl">
      <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-white">LiveMap de Bosses</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <WorldSelector className="w-full sm:w-auto" />
            <button 
              onClick={refetch}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors whitespace-nowrap"
              disabled={loading}
            >
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-md mb-4">
            Error: {error}
          </div>
        )}
        
        {lastUpdated && (
          <p className="text-gray-400 text-sm mb-4">
            Última actualización: {formatDate(lastUpdated)}
          </p>
        )}
        
        {loading && (!liveBosses || liveBosses.length === 0) ? (
          <div className="flex justify-center items-center h-40">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <BossGrid 
            liveBosses={liveBosses || []} 
            isLive={true} 
            showFilters={true} 
          />
        )}
      </div>
    </div>
  );
}