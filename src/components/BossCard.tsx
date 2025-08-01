'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { predictNextSpawn, getLastSighting } from '@/lib/respawnPredictor';
import { useWorldFilter } from '@/hooks/useWorldFilter';
import Link from 'next/link';

interface BossCardProps {
  boss: {
    name: string;
    world?: string;
    timestamp?: string;
    rarity?: string;
    respawnTime?: {
      min: number;
      max: number;
    };
  };
  isLive?: boolean;
  isStatic?: boolean;
  showDetails?: boolean;
  linkToDetail?: boolean;
}

export default function BossCard({ boss, isLive = false, isStatic = false, showDetails: initialShowDetails = false, linkToDetail = true }: BossCardProps) {
  const { favoriteBosses, addFavoriteBoss, removeFavoriteBoss } = useAppStore();
  const { selectedWorld, getWorldSpecificSighting } = useWorldFilter();
  const [showDetails, setShowDetails] = useState(initialShowDetails);
  
  const isFavorite = favoriteBosses.some(favBoss => favBoss === boss.name);
  
  // Estados para almacenar información de respawn y último avistamiento
  const [respawnInfo, setRespawnInfo] = useState<any>(null);
  const [lastSighting, setLastSighting] = useState<any>(null);
  const [loading, setLoading] = useState(!isLive);
  
  // Efecto para cargar datos de respawn cuando no es live
  useEffect(() => {
    if (!isLive && !isStatic) {
      setLoading(true);
      
      const fetchRespawnData = async () => {
        try {
          // Use world-filtered last sighting
          const sighting = await getLastSighting(boss.name, selectedWorld);
          setLastSighting(sighting);
          
          if (sighting) {
            const prediction = predictNextSpawn(sighting);
            setRespawnInfo(prediction);
          }
        } catch (error) {
          console.error('Error fetching respawn data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchRespawnData();
    }
  }, [boss.name, isLive, isStatic, selectedWorld]); // Added selectedWorld to dependencies
  
  // Determinar el color de fondo según la rareza
  const getRarityColor = () => {
    switch (boss.rarity?.toLowerCase()) {
      case 'legendary':
        return 'from-purple-900/70 to-purple-800/50 border-purple-500';
      case 'rare':
        return 'from-blue-900/70 to-blue-800/50 border-blue-500';
      case 'uncommon':
        return 'from-green-900/70 to-green-800/50 border-green-500';
      default:
        return 'from-gray-900/70 to-gray-800/50 border-gray-700';
    }
  };
  
  // Formatear la fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Desconocido';
    
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Manejar el toggle de favorito
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) {
      removeFavoriteBoss(boss.name);
    } else {
      addFavoriteBoss(boss.name);
    }
  };
  
  // Componente base que puede ser un enlace o un div
  const CardComponent = ({ children }: { children: React.ReactNode }) => {
    if (linkToDetail) {
      return (
        <Link 
          href={`/boss/${encodeURIComponent(boss.name)}`}
          className={`block glass-card rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-neon border ${getRarityColor()} ${showDetails ? 'shadow-neon' : ''}`}
        >
          {children}
        </Link>
      );
    }
    
    return (
      <div 
        className={`glass-card rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-neon border ${getRarityColor()} ${showDetails ? 'shadow-neon' : ''}`}
        onClick={() => !isStatic && setShowDetails(!showDetails)}
      >
        {children}
      </div>
    );
  };
  
  // Función para obtener la imagen del boss
  const getBossImage = () => {
    const bossNameLower = boss.name.toLowerCase();
    const availableImages = ['ferumbras', 'morgaroth', 'ghazbaran', 'necropharus'];
    
    if (availableImages.includes(bossNameLower)) {
      return `/bosses/${bossNameLower}.svg`;
    }
    return '/bosses/default.svg';
  };

  return (
    <CardComponent>
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          {/* Imagen del boss */}
          <div className="w-12 h-12 flex-shrink-0">
            <img 
              src={getBossImage()} 
              alt={boss.name}
              className="w-full h-full object-contain rounded-lg"
              onError={(e) => {
                // Fallback a imagen por defecto si hay error
                const target = e.target as HTMLImageElement;
                target.src = '/bosses/default.svg';
              }}
            />
          </div>
          <div>
            <h3 className="text-xl font-bold neon-text">{boss.name}</h3>
            {boss.world && (
              <p className="text-sm text-gray-300">Mundo: {boss.world}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Botón para expandir detalles cuando es un link */}
          {linkToDetail && !isStatic && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDetails(!showDetails);
              }}
              className="text-gray-400 hover:text-indigo-400 transition-colors"
              aria-label={showDetails ? 'Ocultar detalles' : 'Mostrar detalles'}
            >
              {showDetails ? '▲' : '▼'}
            </button>
          )}
          
          <button
            onClick={handleToggleFavorite}
            className={`text-2xl transition-transform duration-300 ${isFavorite ? 'text-yellow-400 scale-110' : 'text-gray-400 hover:text-yellow-400'}`}
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </div>
      </div>
      
      {isLive ? (
        <div className="mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200 border border-red-500 animate-pulse-slow">
            <span className="w-2 h-2 mr-1 bg-red-500 rounded-full"></span>
            Activo ahora
          </span>
          <p className="mt-1 text-sm text-gray-300">
            Visto: {formatDate(boss.timestamp)}
          </p>
        </div>
      ) : (
        <div className="mt-2">
          {loading ? (
            <div className="flex justify-center py-2">
              <div className="loading-spinner"></div>
            </div>
          ) : respawnInfo ? (
            <div className="text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Probabilidad:</span>
                <span className={`font-medium ${respawnInfo.probabilityPercentage > 75 ? 'text-green-400' : respawnInfo.probabilityPercentage > 25 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {respawnInfo.probabilityPercentage}%
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400">Sin datos de respawn</div>
          )}
        </div>
      )}
      
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-700 text-sm">
          {loading && !isLive ? (
            <div className="flex justify-center py-4">
              <div className="loading-spinner"></div>
            </div>
          ) : isLive ? (
            <div>
              <p className="text-gray-300 mb-2">
                <span className="font-medium text-indigo-400">Rareza:</span> {boss.rarity || 'Desconocida'}
              </p>
              <p className="text-gray-300">
                <span className="font-medium text-indigo-400">Activo desde:</span> {formatDate(boss.timestamp)}
              </p>
            </div>
          ) : (
            <div>
              {respawnInfo && (
                <>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-indigo-400">Respawn más temprano:</span>
                    <span>{formatDate(respawnInfo.earliestRespawn.toISOString())}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-indigo-400">Respawn más tardío:</span>
                    <span>{formatDate(respawnInfo.latestRespawn.toISOString())}</span>
                  </div>
                </>
              )}
              
              {lastSighting && (
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-indigo-400">Último avistamiento:</span>
                  <span>{formatDate(lastSighting.lastSeen.toISOString())} en {lastSighting.world}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="font-medium text-indigo-400">Rareza:</span>
                <span>{boss.rarity || 'Desconocida'}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </CardComponent>
  );
}