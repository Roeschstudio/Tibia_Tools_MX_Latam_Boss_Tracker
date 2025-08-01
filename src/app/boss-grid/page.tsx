import BossGrid from '@/components/BossGrid';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useBosses } from '@/hooks/useBosses';

export default function BossGridPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Sidebar */}
      <Sidebar activeTool="bossgrid" />
      
      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        <div className="container mx-auto max-w-6xl">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Explorador de Bosses <span className="text-indigo-400">Tibia Tools LATAM Pro</span></h1>
            <p className="text-gray-400">Explora todos los bosses de Tibia y sus características</p>
          </header>
          
          <main className="flex flex-col items-center justify-center py-8">
            <div className="space-y-6 w-full max-w-4xl">
              <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-800">
                <BossGrid showFilters={true} />
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