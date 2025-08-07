import { ArrowRight, Zap, Target, Rocket } from 'lucide-react';
import { Link } from '@remix-run/react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 z-10">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold leading-relaxed mb-8">
            <span className="block bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent animate-fade-in mb-2">
              Transforme Sua
            </span>
            <span className="block bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent animate-fade-in delay-300 mb-2">
              Ideia em Negócio
            </span>
            <span className="block text-white animate-fade-in delay-600">
              Validado
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed animate-fade-in delay-900 mb-8">
            A LANZZA é sua <span className="text-purple-400 font-semibold">inteligência artificial especializada</span>
            {' '}que transforma ideias confusas em negócios estruturados e validados em <span className="text-blue-400 font-semibold">3 passos simples</span>.
          </p>

          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 backdrop-blur-sm mb-12 animate-fade-in delay-1000">
            <Zap className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm font-medium text-purple-300">Especializada no mercado brasileiro</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in delay-1200">
            <Link
              to="/jornada"
              className="group relative overflow-hidden px-8 py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white border border-purple-500/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 hover:border-purple-400/50 whitespace-nowrap">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                Começar Minha Validação
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <button className="px-8 py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white border border-gray-600/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-gray-500/20 hover:border-gray-500/70 hover:bg-gradient-to-r hover:from-gray-700 hover:via-gray-600 hover:to-gray-700 whitespace-nowrap">
              Ver Demonstração
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                2.847+
              </div>
              <div className="text-gray-400 mt-2">Negócios validados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                3 Passos
              </div>
              <div className="text-gray-400 mt-2">Do caos ao plano</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                24/7
              </div>
              <div className="text-gray-400 mt-2">Sempre disponível</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
    </section>
  );
}