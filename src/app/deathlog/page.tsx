import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import DeathLog from '@/components/DeathLog';

export default function DeathLogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Sidebar */}
      <Sidebar activeTool="deathlog" />
      
      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        <div className="container mx-auto max-w-6xl">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Historial de Muertes <span className="text-indigo-400">Tibia Tools LATAM Pro</span></h1>
            <p className="text-gray-400">Seguimiento de muertes de jugadores en Tibia</p>
          </header>
          
          <main className="flex flex-col items-center justify-center py-8">
            <DeathLog />
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