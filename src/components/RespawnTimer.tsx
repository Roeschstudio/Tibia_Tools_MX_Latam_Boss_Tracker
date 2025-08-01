'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { predictNextSpawn, getLastSighting } from '@/lib/respawnPredictor';
import { useWorldFilter } from '@/hooks/useWorldFilter';
import BossSelector from './BossSelector';
import LastSightingForm from './LastSightingForm';

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
}

export default function RespawnTimer() {
  const { favoriteBosses } = useAppStore();
  const { selectedWorld } = useWorldFilter();
  const [selectedBoss, setSelectedBoss] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<{
    earliest: TimeRemaining | null;
    latest: TimeRemaining | null;
  }>({ earliest: null, latest: null });
  const [probability, setProbability] = useState<number>(0);
  const [lastSeen, setLastSeen] = useState<{ world: string; date: Date } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Efecto para actualizar el temporizador cada segundo
  useEffect(() => {
    if (!selectedBoss) return;

    const updateTimer = async () => {
      try {
        // Use world-filtered last sighting
        const sighting = await getLastSighting(selectedBoss, selectedWorld);

        if (!sighting) {
          const worldText = selectedWorld ? ` en ${selectedWorld}` : '';
          setError(`No hay registros de avistamientos para ${selectedBoss}${worldText}`);
          setTimeRemaining({ earliest: null, latest: null });
          setProbability(0);
          setLastSeen(null);
          return;
        }

        setLastSeen({ world: sighting.world, date: sighting.lastSeen });
        const prediction = predictNextSpawn(sighting);

        if (!prediction) {
          setError(`No se pudo predecir el respawn para ${selectedBoss}`);
          setTimeRemaining({ earliest: null, latest: null });
          setProbability(0);
          return;
        }
        setError(null);
        setProbability(prediction.probabilityPercentage);

        const now = new Date();
        
        // Calcular tiempo restante para el respawn más temprano
        const earliestDiff = Math.max(0, prediction.earliestRespawn.getTime() - now.getTime());
        const earliestHours = Math.floor(earliestDiff / (1000 * 60 * 60));
        const earliestMinutes = Math.floor((earliestDiff % (1000 * 60 * 60)) / (1000 * 60));
        const earliestSeconds = Math.floor((earliestDiff % (1000 * 60)) / 1000);

        // Calcular tiempo restante para el respawn más tardío
        const latestDiff = Math.max(0, prediction.latestRespawn.getTime() - now.getTime());
        const latestHours = Math.floor(latestDiff / (1000 * 60 * 60));
        const latestMinutes = Math.floor((latestDiff % (1000 * 60 * 60)) / (1000 * 60));
        const latestSeconds = Math.floor((latestDiff % (1000 * 60)) / 1000);

        setTimeRemaining({
          earliest: earliestDiff > 0 ? { hours: earliestHours, minutes: earliestMinutes, seconds: earliestSeconds } : null,
          latest: latestDiff > 0 ? { hours: latestHours, minutes: latestMinutes, seconds: latestSeconds } : null,
        });
      } catch (err) {
        console.error('Error updating timer:', err);
        setError('Error al actualizar el temporizador');
        setTimeRemaining({ earliest: null, latest: null });
        setProbability(0);
        setLastSeen(null);
      }
    };

    // Actualizar inmediatamente
    updateTimer();

    // Actualizar cada segundo
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [selectedBoss, selectedWorld]); // Added selectedWorld to dependencies

  // Función para formatear el tiempo
  const formatTime = (time: TimeRemaining | null) => {
    if (!time) return 'Respawn disponible';
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
  };

  // Función para formatear la fecha
  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6 w-full max-w-4xl">
      <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Temporizador de Respawn</h2>
          {selectedWorld && (
            <div className="text-sm bg-indigo-900/50 text-indigo-200 px-3 py-1 rounded-full border border-indigo-500/30">
              Filtrado por: {selectedWorld}
            </div>
          )}
        </div>

      {/* Selector de boss */}
      <div className="mb-6">
        <label className="block text-gray-300 mb-2">
          Selecciona un boss:
        </label>
        <BossSelector 
          onSelect={setSelectedBoss} 
          selectedBoss={selectedBoss} 
        />
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="bg-red-900/50 text-red-200 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Mostrar información del temporizador */}
      {selectedBoss && !error && (
        <div className="bg-gray-900/70 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">{selectedBoss}</h3>

          {lastSeen && (
            <div className="mb-4">
              <p className="text-gray-300">
                Último avistamiento: <span className="text-indigo-300">{formatDate(lastSeen.date)}</span>
              </p>
              <p className="text-gray-300">
                Mundo: <span className="text-indigo-300">{lastSeen.world}</span>
              </p>
            </div>
          )}

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Probabilidad de respawn:</span>
              <span className="text-white font-bold">{probability}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{ width: `${probability}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-2">Respawn más temprano:</p>
              <p className="text-2xl font-mono text-indigo-400">
                {formatTime(timeRemaining.earliest)}
              </p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-2">Respawn más tardío:</p>
              <p className="text-2xl font-mono text-indigo-400">
                {formatTime(timeRemaining.latest)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay boss seleccionado */}
      {!selectedBoss && (
        <div className="bg-gray-900/50 p-6 rounded-lg text-center">
          <p className="text-gray-400">Selecciona un boss para ver su temporizador de respawn.</p>
          {favoriteBosses.length === 0 && (
            <p className="text-gray-500 text-sm mt-2">
              Puedes marcar bosses como favoritos en el panel de LiveMap.
            </p>
          )}
        </div>
      )}
      </div>
      
      {/* Formulario para registrar avistamientos */}
      <LastSightingForm />
    </div>
  );
}