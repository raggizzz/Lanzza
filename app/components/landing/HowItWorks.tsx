import React from 'react';
import { Link } from '@remix-run/react';
import { MessageCircle, Layout, Rocket, ArrowRight } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [{
      number: "01",
      icon: MessageCircle,
      title: "Clarear Sua Visão",
      subtitle: "IA Conversacional Inteligente",
      description: "Nossa IA faz as perguntas certas para extrair sua ideia da mente e transformar em conceito claro. Sem julgamentos, só clareza.",
      features: ["Onboarding inteligente", "Contexto personalizado", "Guia por nicho específico"],
      color: "from-purple-500 to-indigo-500"
    },
    {
      number: "02",
      icon: Layout,
      title: "Estruturar Seu Plano",
      subtitle: "Canvas Interativo Guiado",
      description: "Transformamos sua ideia em um modelo de negócio estruturado com canvas visual interativo e orientação especializada.",
      features: ["Canvas visual interativo", "Perguntas direcionadas", "Salvamento automático"],
      color: "from-indigo-500 to-blue-500"
    },
    {
      number: "03",
      icon: Rocket,
      title: "Validar Rapidamente",
      subtitle: "Landing Page + Dashboard",
      description: "Geramos automaticamente sua landing page profissional e dashboard de métricas para validar com clientes reais.",
      features: ["Landing page automática", "Dashboard de métricas", "Gestão de leads"],
      color: "from-blue-500 to-cyan-500"
    }
  ];

  return (
    <section id="como-funciona" className="py-24 relative bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Como a LANZZA
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Funciona
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            3 passos simples para transformar sua ideia confusa em negócio validado
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-24">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-12 hidden lg:block">
                  <div className="w-px h-12 bg-gradient-to-b from-gray-600 to-transparent"></div>
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center mt-4 transform -translate-x-1/2`}>
                    <ArrowRight className="w-4 h-4 text-white rotate-90" />
                  </div>
                </div>
              )}

              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                {/* Content */}
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="flex items-center gap-4">
                    <span className={`text-6xl font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                      {step.number}
                    </span>
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${step.color}`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className={`text-lg font-semibold bg-gradient-to-r ${step.color} bg-clip-text text-transparent mb-4`}>
                      {step.subtitle}
                    </p>
                    <p className="text-gray-400 text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {step.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${step.color}`}></div>
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual */}
                <div className={`relative ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  <div className="relative bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-gray-600/50 transition-all duration-300">
                    {/* Background Glow */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-5 rounded-2xl`}></div>
                    
                    {/* Step Content - Conteúdo específico para cada passo */}
                    {index === 0 && (
                      <div className="relative z-10 space-y-4">
                        <div className="bg-purple-900/50 p-4 rounded-lg border border-purple-600/30">
                          <p className="text-sm text-purple-300 font-medium mb-2">💬 LANZZA</p>
                          <p className="text-sm text-purple-200">"Qual o principal problema que seu negócio resolve?"</p>
                        </div>
                        <div className="bg-blue-900/50 p-4 rounded-lg border border-blue-600/30">
                          <p className="text-sm text-blue-300 font-medium mb-2">💬 LANZZA</p>
                          <p className="text-sm text-blue-200">"Como você se diferencia da concorrência atual?"</p>
                        </div>
                        <div className="bg-indigo-900/50 p-4 rounded-lg border border-indigo-600/30">
                          <p className="text-sm text-indigo-300 font-medium mb-2">💬 LANZZA</p>
                          <p className="text-sm text-indigo-200">"Quem é seu cliente ideal e onde ele está?"</p>
                        </div>
                      </div>
                    )}
                    
                    {index === 1 && (
                      <div className="relative z-10">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-600/30">
                            <p className="text-xs text-purple-300 font-semibold mb-2">Proposta de Valor</p>
                            <div className="space-y-1">
                              <div className="h-2 bg-purple-500/30 rounded"></div>
                              <div className="h-2 bg-purple-500/20 rounded w-3/4"></div>
                            </div>
                          </div>
                          <div className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-600/30">
                            <p className="text-xs text-indigo-300 font-semibold mb-2">Segmento</p>
                            <div className="space-y-1">
                              <div className="h-2 bg-indigo-500/30 rounded"></div>
                              <div className="h-2 bg-indigo-500/20 rounded w-2/3"></div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-600/30">
                            <p className="text-xs text-blue-300 font-semibold mb-2">Canais</p>
                            <div className="space-y-1">
                              <div className="h-2 bg-blue-500/30 rounded w-5/6"></div>
                              <div className="h-2 bg-blue-500/20 rounded w-1/2"></div>
                            </div>
                          </div>
                          <div className="bg-cyan-900/30 p-4 rounded-lg border border-cyan-600/30">
                            <p className="text-xs text-cyan-300 font-semibold mb-2">Receitas</p>
                            <div className="space-y-1">
                              <div className="h-2 bg-cyan-500/30 rounded w-4/5"></div>
                              <div className="h-2 bg-cyan-500/20 rounded w-3/5"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {index === 2 && (
                      <div className="relative z-10 space-y-4">
                        <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-600/30">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-blue-300 font-medium">Conversões</span>
                            <span className="text-lg font-bold text-blue-400">12.5%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-blue-400 h-2 rounded-full" style={{width: '12.5%'}}></div>
                          </div>
                        </div>
                        <div className="bg-cyan-900/30 p-4 rounded-lg border border-cyan-600/30">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-cyan-300 font-medium">Engajamento</span>
                            <span className="text-lg font-bold text-cyan-400">68.2%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-cyan-400 h-2 rounded-full" style={{width: '68.2%'}}></div>
                          </div>
                        </div>
                        <div className="bg-teal-900/30 p-4 rounded-lg border border-teal-600/30">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-teal-300 font-medium">Leads Qualificados</span>
                            <span className="text-lg font-bold text-teal-400">247</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-teal-300">+12 hoje</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>



        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <p className="text-2xl text-gray-300 mb-8">
            Pronto para <span className="text-purple-400 font-semibold">transformar sua ideia</span> em realidade?
          </p>
          <Link to="/auth" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 flex items-center gap-2 mx-auto">
            Começar Agora
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};