import { json, type MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { useState } from 'react';
import { Navigation } from '~/components/landing/Navigation';
import BackgroundRays from '~/components/ui/BackgroundRays';

export const meta: MetaFunction = () => {
  return [
    { title: 'Jornada Estratégica - LANZZA' },
    { name: 'description', content: 'Planejamento estratégico para uma startup de software B2B' }
  ];
};

export const loader = () => json({});

interface JourneyStep {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'locked';
  icon: string;
  estimatedTime: string;
}

export default function Jornada() {
  const [currentStep] = useState(1);
  
  const journeySteps: JourneyStep[] = [
    {
      id: 1,
      title: 'Responder Formulário',
      description: 'Complete o questionário estratégico sobre seu negócio',
      status: 'current',
      icon: '📋',
      estimatedTime: '5-10 min'
    },
    {
      id: 2,
      title: 'Chat com IA Especialista',
      description: 'Converse com nosso agente de negócios para refinar sua estratégia',
      status: 'locked',
      icon: '🤖',
      estimatedTime: '15-20 min'
    },
    {
      id: 3,
      title: 'Business Model Canvas',
      description: 'Visualize e edite seu modelo de negócios interativo',
      status: 'locked',
      icon: '📊',
      estimatedTime: '10-15 min'
    },
    {
      id: 4,
      title: 'Criação da Landing Page',
      description: 'Gere automaticamente uma landing page para validar sua ideia',
      status: 'locked',
      icon: '🚀',
      estimatedTime: '5-10 min'
    },
    {
      id: 5,
      title: 'Dashboard Final',
      description: 'Acesse métricas e insights do seu plano de negócios',
      status: 'locked',
      icon: '📈',
      estimatedTime: '5 min'
    }
  ];

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'locked';
  };

  const getStepClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'current':
        return 'bg-purple-500/20 border-purple-500/50 text-purple-400';
      case 'locked':
        return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
    }
  };

  const totalEstimatedTime = '30-45 min restantes';
  const currentProgress = '0% concluído';

  return (
    <div className="min-h-screen bg-black text-white">
      <BackgroundRays />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <div className="relative z-10 px-6 py-12 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Visão Geral do Projeto
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Planejamento estratégico para uma startup de software B2B
            </p>
            
            {/* Next Step Card */}
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Próximo Passo</h3>
              <p className="text-gray-300 mb-4">
                Complete o formulário estratégico para começar a construir seu plano de negócios personalizado.
              </p>
              <Link
                to="/formulario-estrategico"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
              >
                <span>🚀</span>
                Começar
              </Link>
            </div>
          </div>

          {/* Journey Steps */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-8 text-center">Jornada do Seu Projeto</h2>
            
            <div className="space-y-6">
              {journeySteps.map((step, index) => {
                const status = getStepStatus(step.id);
                const isClickable = status === 'current';
                
                return (
                  <div key={step.id} className="flex items-start gap-4">
                    {/* Step Number */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-lg ${getStepClasses(status)}`}>
                      {status === 'completed' ? '✓' : step.id}
                    </div>
                    
                    {/* Step Content */}
                    <div className={`flex-1 p-6 rounded-2xl border transition-all duration-300 ${
                      status === 'current' 
                        ? 'bg-purple-900/20 border-purple-500/50 hover:bg-purple-900/30' 
                        : status === 'completed'
                        ? 'bg-green-900/20 border-green-500/50'
                        : 'bg-gray-900/20 border-gray-500/30'
                    } ${isClickable ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-not-allowed opacity-60'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{step.icon}</span>
                          <h3 className="text-xl font-semibold">{step.title}</h3>
                          {status === 'current' && (
                            <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              Atual
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-400">{step.estimatedTime}</span>
                      </div>
                      <p className="text-gray-300">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Summary */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Tempo Estimado</h3>
              <p className="text-gray-300 mb-2">
                Complete todo o processo em aproximadamente 30-45 minutos.
              </p>
              <div className="flex items-center gap-2 text-blue-400">
                <span className="text-xl">⏱️</span>
                <span className="font-medium">{totalEstimatedTime}</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Progresso Atual</h3>
              <p className="text-gray-300 mb-2">
                Você está no início da jornada. Vamos construir algo incrível!
              </p>
              <div className="flex items-center gap-2 text-purple-400">
                <span className="text-xl">📊</span>
                <span className="font-medium">{currentProgress}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}