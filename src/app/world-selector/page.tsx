import WorldSelector from '@/components/WorldSelector';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useAppStore } from '@/lib/store';

export default function WorldSelectorPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Sidebar */}
      <Sidebar activeTool="worldselector" />
      
      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        <div className="container mx-auto max-w-6xl">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Selector de Mundo <span className="text-indigo-400">Tibia Tools LATAM Pro</span></h1>
            <p className="text-gray-400">Selecciona tu mundo de Tibia para personalizar la experiencia</p>
          </header>
          
          <main className="flex flex-col items-center justify-center py-8">
            <div className="space-y-6 w-full max-w-4xl">
              <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-6">Selecciona tu Mundo</h2>
                <div className="max-w-md mx-auto">
                  <WorldSelector className="w-full" />
                  
                  <div className="mt-8 p-6 bg-gray-900/50 rounded-lg">
                    <h3 className="text-xl font-bold text-white mb-4">¿Por qué seleccionar un mundo?</h3>
                    <p className="text-gray-300 mb-4">
                      Seleccionar tu mundo de Tibia te permite personalizar la experiencia en Tibia Tools LATAM Pro:
                    </p>
                    <ul className="list-disc list-inside text-gray-400 space-y-2">
                      <li>Ver bosses activos específicos de tu mundo</li>
                      <li>Recibir notificaciones relevantes para tu servidor</li>
                      <li>Filtrar información de respawn por mundo</li>
                      <li>Conectar con jugadores de tu mismo servidor</li>
                    </ul>
                  </div>
                </div>
              </div>
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