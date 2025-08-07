import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Link } from '@remix-run/react';

export const Navigation = () => {
  const handleStartClick = () => {
    window.location.hash = '#start';
  };
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/90 backdrop-blur-xl border-b border-gray-800/50' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="transition-all duration-300 cursor-pointer bg-transparent border-none outline-none hover:scale-105"
            >
              <img 
                src="/logo-dark.png" 
                alt="LANZZA" 
                className="h-33 w-auto"
              />
            </button>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => document.getElementById('problemas')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-300 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:bg-clip-text hover:text-transparent transition-all duration-300 font-medium text-lg transform hover:scale-105 bg-transparent border-none outline-none">
                Problemas
              </button>
              <button onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-300 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:bg-clip-text hover:text-transparent transition-all duration-300 font-medium text-lg transform hover:scale-105 bg-transparent border-none outline-none">
                Como Funciona
              </button>
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-300 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 hover:bg-clip-text hover:text-transparent transition-all duration-300 font-medium text-lg transform hover:scale-105 bg-transparent border-none outline-none">
                Recursos
              </button>
              <button onClick={() => document.getElementById('depoimentos')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-300 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:bg-clip-text hover:text-transparent transition-all duration-300 font-medium text-lg transform hover:scale-105 bg-transparent border-none outline-none">
                Depoimentos
              </button>

          </div>

          <div className="hidden md:flex items-center space-x-3">
            <Link to="/auth" className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200 font-medium text-lg hover:bg-gray-800/30 rounded-lg">
              Entrar
            </Link>
            <Link
              to="/jornada"
              className="group relative overflow-hidden px-6 py-3 rounded-xl font-medium text-lg bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white border border-purple-500/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 hover:border-purple-400/50 flex items-center gap-2">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                Começar Grátis
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-gray-800/50">
          <div className="px-4 pt-4 pb-6 space-y-3">
            <button onClick={() => { document.getElementById('problemas')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-gray-300 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:bg-clip-text hover:text-transparent transition-all duration-300 font-medium transform hover:scale-105 bg-transparent border-none outline-none">
                Problemas
              </button>
              <button onClick={() => { document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-gray-300 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:bg-clip-text hover:text-transparent transition-all duration-300 font-medium transform hover:scale-105 bg-transparent border-none outline-none">
                Como Funciona
              </button>
              <button onClick={() => { document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-gray-300 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 hover:bg-clip-text hover:text-transparent transition-all duration-300 font-medium transform hover:scale-105 bg-transparent border-none outline-none">
                Recursos
              </button>
              <button onClick={() => { document.getElementById('depoimentos')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-gray-300 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:bg-clip-text hover:text-transparent transition-all duration-300 font-medium transform hover:scale-105 bg-transparent border-none outline-none">
                Depoimentos
              </button>
            <div className="pt-4 space-y-3">
              <Link to="/auth" className="block w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors font-medium text-lg text-center">
                Entrar
              </Link>
              <Link
                to="/jornada"
                className="group relative overflow-hidden w-full px-6 py-3 rounded-xl font-medium text-lg bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white border border-purple-500/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 hover:border-purple-400/50 flex items-center justify-center gap-2">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  Começar Grátis
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};