'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import BossCard from '@/components/BossCard';
import LastSightingForm from '@/components/LastSightingForm';
import { useAppStore } from '@/lib/store';
import { Boss } from '@/types/boss';
import Link from 'next/link';

export default function BossDetailPage() {
  const params = useParams();
  const bossName = decodeURIComponent(params.name as string);
  const [boss, setBoss] = useState<Boss | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { favoriteBosses, addFavoriteBoss, removeFavoriteBoss } = useAppStore();

  useEffect(() => {
    const fetchBossData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/bosses');
        
        if (!response.ok) {
          throw new Error(`Error fetching boss data: ${response.status}`);
        }
        
        const data = await response.json();
        
        // La API devuelve un objeto con estructura {bosses: [...], metadata: {...}}
        const bosses = data.bosses || data;
        const foundBoss = Array.isArray(bosses) 
          ? bosses.find((b: Boss) => b.name === bossName)
          : null;
        
        if (foundBoss) {
          setBoss(foundBoss);
        } else {
          setError(`No se encontró información para el boss: ${bossName}`);
        }
      } catch (err) {
        console.error('Error fetching boss data:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBossData();
  }, [bossName]);

  const handleFavoriteClick = () => {
    if (!boss) return;
    
    if (favoriteBosses.includes(boss.name)) {
      removeFavoriteBoss(boss.name);
    } else {
      addFavoriteBoss(boss.name);
    }
  };

  // Función para determinar el color según la rareza
  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'Legendary':
        return 'text-purple-500';
      case 'Rare':
        return 'text-blue-500';
      case 'Uncommon':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  // Función para obtener la imagen del boss
  const getBossImage = (bossName: string) => {
    const bossNameLower = bossName.toLowerCase();
    const availableImages = ['ferumbras', 'morgaroth', 'ghazbaran', 'necropharus'];
    
    if (availableImages.includes(bossNameLower)) {
      return `/bosses/${bossNameLower}.svg`;
    }
    return '/bosses/default.svg';
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sidebar */}
      <Sidebar activeTool="bossgrid" />
      
      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        <div className="container mx-auto max-w-6xl">
          <header className="mb-8">
            <div className="flex items-center gap-2">
              <Link 
                href="/boss-grid"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                ← Volver a la lista
              </Link>
            </div>
            <div className="flex items-center gap-4 mt-4">
              {/* Imagen del boss en el header */}
              {!loading && !error && boss && (
                <div className="w-16 h-16 flex-shrink-0">
                  <img 
                    src={getBossImage(boss.name)} 
                    alt={boss.name}
                    className="w-full h-full object-contain rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/bosses/default.svg';
                    }}
                  />
                </div>
              )}
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {loading ? 'Cargando...' : error ? 'Error' : boss?.name}
                  {boss && <span className={`ml-2 ${getRarityColor(boss.rarity)}`}>({boss.rarity})</span>}
                </h1>
                <p className="text-gray-400">Información detallada del boss</p>
              </div>
            </div>
          </header>
          
          <main className="flex flex-col md:flex-row gap-8 py-8">
            {/* Columna principal */}
            <div className="flex-1 space-y-6">
              {loading ? (
                <div className="flex justify-center items-center h-40 bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-800">
                  <div className="loading-spinner"></div>
                </div>
              ) : error ? (
                <div className="bg-red-900/50 text-red-200 p-6 rounded-xl mb-6">
                  <h2 className="text-xl font-bold mb-2">Error</h2>
                  <p>{error}</p>
                </div>
              ) : boss ? (
                <>
                  <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-800">
                    <div className="flex justify-between items-start">
                      <h2 className="text-2xl font-bold text-white mb-4">Información del Boss</h2>
                      <button 
                        onClick={handleFavoriteClick}
                        className="text-2xl focus:outline-none"
                      >
                        {favoriteBosses.includes(boss.name) ? '★' : '☆'}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-indigo-400 mb-2">Detalles</h3>
                        <ul className="space-y-2">
                          <li className="flex justify-between">
                            <span className="text-gray-400">Nombre:</span>
                            <span className="text-white font-medium">{boss.name}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-400">Rareza:</span>
                            <span className={`font-medium ${getRarityColor(boss.rarity)}`}>{boss.rarity}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-400">Tiempo mínimo de respawn:</span>
                            <span className="text-white font-medium">{boss.respawnTime.min} horas</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-400">Tiempo máximo de respawn:</span>
                            <span className="text-white font-medium">{boss.respawnTime.max} horas</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-indigo-400 mb-2">Predicción de Respawn</h3>
                        <BossCard 
                          boss={boss} 
                          showDetails={true} 
                          isStatic={true}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-800">
                    <h2 className="text-2xl font-bold text-white mb-4">Reportar Avistamiento</h2>
                    <LastSightingForm preselectedBoss={boss.name} />
                  </div>
                </>
              ) : null}
            </div>
            
            {/* Columna lateral */}
            <div className="w-full md:w-80 space-y-6">
              {!loading && !error && boss && (
                <>
                  {/* Imagen grande del boss */}
                  <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-800">
                    <h2 className="text-xl font-bold text-white mb-4 text-center">{boss.name}</h2>
                    <div className="flex justify-center">
                      <div className="w-32 h-32">
                        <img 
                          src={getBossImage(boss.name)} 
                          alt={boss.name}
                          className="w-full h-full object-contain rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/bosses/default.svg';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-800">
                    <h2 className="text-xl font-bold text-white mb-4">Consejos</h2>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-400">•</span>
                        <span>Revisa regularmente el LiveMap para ver si el boss está activo.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-400">•</span>
                        <span>Reporta avistamientos para ayudar a la comunidad a predecir respawns.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-400">•</span>
                        <span>Añade este boss a favoritos para seguirlo más fácilmente.</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-800">
                    <h2 className="text-xl font-bold text-white mb-4">Estadísticas</h2>
                    <p className="text-gray-400 text-sm italic">Próximamente: Estadísticas detalladas de avistamientos y drops.</p>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
      
      {/* Footer */}
      <div className="ml-64">
        <Footer />
      </div>
    </div>
  );
}