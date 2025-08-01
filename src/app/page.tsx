import LiveMapPanel from '@/components/LiveMapPanel';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Sidebar */}
      <Sidebar activeTool="livemap" />
      
      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        <div className="container mx-auto max-w-6xl">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard <span className="text-indigo-400">Tibia Tools LATAM Pro</span></h1>
            <p className="text-gray-400">Herramientas para jugadores de Tibia en LATAM</p>
          </header>
          
          <main className="flex flex-col items-center justify-center py-8">
            <LiveMapPanel />
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
