import RespawnTimer from '@/components/RespawnTimer';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

export default function RespawnTimerPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Sidebar */}
      <Sidebar activeTool="respawntimer" />
      
      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        <div className="container mx-auto max-w-6xl">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Temporizador de Respawn <span className="text-indigo-400">Tibia Tools LATAM Pro</span></h1>
            <p className="text-gray-400">Predicción de respawn para bosses favoritos</p>
          </header>
          
          <main className="flex flex-col items-center justify-center py-8">
            <RespawnTimer />
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