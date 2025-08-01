'use client';

import { useState, useEffect } from 'react';
import BossSelector from './BossSelector';
import WorldSelector from './WorldSelector';
import { saveLastSighting } from '@/lib/respawnPredictor';

interface LastSightingFormProps {
  preselectedBoss?: string;
}

export default function LastSightingForm({ preselectedBoss }: LastSightingFormProps) {
  const [selectedBoss, setSelectedBoss] = useState('');
  const [selectedWorld, setSelectedWorld] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Establecer la fecha y hora actuales al cargar el componente
  useEffect(() => {
    const now = new Date();
    setDate(now.toISOString().split('T')[0]);
    setTime(now.toTimeString().split(' ')[0].substring(0, 5));
  }, []);

  // Establecer el boss preseleccionado si se proporciona
  useEffect(() => {
    if (preselectedBoss) {
      setSelectedBoss(preselectedBoss);
    }
  }, [preselectedBoss]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar los datos
    if (!selectedBoss) {
      setError('Debes seleccionar un boss');
      return;
    }
    
    if (!selectedWorld) {
      setError('Debes seleccionar un mundo');
      return;
    }
    
    if (!date || !time) {
      setError('Debes especificar la fecha y hora del avistamiento');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Crear el objeto de fecha
      const timestamp = new Date(`${date}T${time}:00`);
      
      // Guardar el avistamiento localmente
      await saveLastSighting(selectedBoss, selectedWorld, timestamp);
      
      // Enviar los datos a la API
      const response = await fetch('/api/last-sightings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bossName: selectedBoss,
          world: selectedWorld,
          timestamp: timestamp.toISOString(),
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error al guardar el avistamiento: ${response.status}`);
      }
      
      // Mostrar mensaje de éxito
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Limpiar el formulario
      setSelectedBoss('');
      setSelectedWorld('');
      
      // Restablecer la fecha y hora actuales
      const now = new Date();
      setDate(now.toISOString().split('T')[0]);
      setTime(now.toTimeString().split(' ')[0].substring(0, 5));
    } catch (err) {
      console.error('Error saving last sighting:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al guardar el avistamiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4 neon-text">Registrar avistamiento de boss</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="boss" className="block text-sm font-medium text-gray-400 mb-1">
            Boss
          </label>
          <BossSelector 
            onSelect={setSelectedBoss} 
            selectedBoss={selectedBoss} 
          />
        </div>
        
        <div>
          <label htmlFor="world" className="block text-sm font-medium text-gray-400 mb-1">
            Mundo
          </label>
          <WorldSelector 
            onChange={setSelectedWorld} 
            className="w-full"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-400 mb-1">
              Fecha
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-900/70 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-indigo-500 hover:border-indigo-400 transition-colors"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-400 mb-1">
              Hora
            </label>
            <input
              type="time"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-gray-900/70 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-indigo-500 hover:border-indigo-400 transition-colors"
            />
          </div>
        </div>
        
        {error && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded-md text-red-200">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-green-900/50 border border-green-700 rounded-md text-green-200">
            Avistamiento guardado correctamente
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <span className="loading-spinner w-4 h-4 mr-2"></span>
                Guardando...
              </span>
            ) : 'Guardar avistamiento'}
          </button>
        </div>
      </form>
    </div>
  );
}