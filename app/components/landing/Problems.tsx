import React from 'react';
import { Brain, DollarSign, FileX, Users } from 'lucide-react';

export const Problems = () => {
  const problems = [
    {
      icon: Brain,
      title: "Paralisia por Análise",
      description: "Você tem a ideia na cabeça, mas não sabe por onde começar. Fica travado pensando em mil possibilidades.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: DollarSign,
      title: "Medo do Investimento Errado",
      description: "Quer ter certeza antes de gastar. Precisa validar se a ideia realmente vai funcionar no mercado.",
      color: "from-purple-600 to-purple-700"
    },
    {
      icon: FileX,
      title: "Falta de Estruturação",
      description: "Suas ideias estão todas bagunçadas na mente. Precisa transformar o caos mental em um plano claro.",
      color: "from-purple-700 to-purple-800"
    },
    {
      icon: Users,
      title: "Solidão Empreendedora",
      description: "Está sozinho nessa jornada. Queria ter um especialista experiente sempre ao seu lado.",
      color: "from-purple-800 to-purple-900"
    }
  ];

  return (
    <section id="problemas" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Reconhece Esses
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Desafios?
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Todo empreendedor passa por isso. A diferença está em como você vai resolver.
          </p>
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              {/* Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${problem.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
              
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${problem.color} mb-6`}>
                <problem.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-gray-100 transition-colors">
                {problem.title}
              </h3>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                {problem.description}
              </p>

              {/* Decorative Element */}
              <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-gray-700/20 to-gray-600/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-xl text-gray-300 mb-8">
            <span className="text-purple-400 font-semibold">E se houvesse uma forma</span> de resolver tudo isso de uma vez?
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
        </div>
      </div>
    </section>
  );
};