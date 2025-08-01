export default function Footer() {
  return (
    <footer className="w-full bg-black/30 backdrop-blur-md border-t border-gray-800 py-4 px-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Tibia Tools LATAM Pro. No afiliado oficialmente con CipSoft GmbH.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <a 
            href="https://ko-fi.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#FF5E5B] hover:bg-[#FF7A77] text-white rounded-md transition-colors text-sm flex items-center"
          >
            <span className="mr-2">☕</span>
            Apóyanos en Ko-fi
          </a>
          
          <a 
            href="https://stripe.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#6772E5] hover:bg-[#7795f8] text-white rounded-md transition-colors text-sm flex items-center"
          >
            <span className="mr-2">💳</span>
            Donar vía Stripe
          </a>
        </div>
      </div>
    </footer>
  );
}