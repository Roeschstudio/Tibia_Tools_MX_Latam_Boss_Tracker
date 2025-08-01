'use client';

import CharacterSelector from '@/components/CharacterSelector';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

export default function CharacterLookupPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Sidebar */}
      <Sidebar activeTool="characterlookup" />
      
      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        <div className="container mx-auto max-w-6xl">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Buscador de Personajes <span className="text-indigo-400">Tibia Tools LATAM Pro</span></h1>
            <p className="text-gray-400">Busca información detallada sobre personajes de Tibia</p>
          </header>
          
          <main className="flex flex-col items-center justify-center py-8">
            <div className="space-y-6 w-full max-w-4xl">
              <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-6">Buscar Personaje</h2>
                <CharacterSelector onChange={(character) => console.log('Character selected:', character)} />
                
                {/* Aquí se mostraría la información del personaje cuando se implemente */}
                <div className="mt-8 p-6 bg-gray-900/50 rounded-lg text-center">
                  <p className="text-gray-400">Selecciona un personaje para ver su información</p>
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