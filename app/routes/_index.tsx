import { json, type MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { HowItWorks } from '~/components/landing/HowItWorks';
import { Hero } from '~/components/landing/Hero';
import { Problems } from '~/components/landing/Problems';
import { Navigation } from '~/components/landing/Navigation';

export const meta: MetaFunction = () => {
  return [{ title: 'LANZZA - Transforme Sua Ideia em Negócio Validado' }, { name: 'description', content: 'A LANZZA é sua inteligência artificial especializada que transforma ideias confusas em negócios estruturados e validados em 3 passos simples.' }];
};



export default function Index() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <div>

      {/* Hero Section */}
      <Hero />

      {/* Problems Section */}
      <Problems />

      {/* How it Works Section */}
      <HowItWorks />

      {/* CTA Section */}
  

      {/* Features Section */}
       <section id="features" className="px-6 py-20 md:px-12 bg-slate-900/50">
         <div className="text-center mb-16">
           <h2 className="text-4xl md:text-5xl font-bold mb-4">
             Recursos que Fazem a<br />
             <span className="text-purple-400">Diferença</span>
           </h2>
           <p className="text-xl text-gray-300">
             Tecnologia avançada combinada com conhecimento especializado para acelerar sua jornada empreendedora
           </p>
         </div>
         
         <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
           <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 hover:border-purple-500/30 hover:bg-gradient-to-br hover:from-purple-900/5 hover:to-gray-800/30 transition-all duration-300 group">
             <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
               <span className="text-xl">⚖️</span>
             </div>
             <h3 className="text-lg font-bold mb-3">IA Contextualizada</h3>
             <p className="text-gray-300 text-sm">
               Inteligência artificial que entende seu nicho e ajuda a tomar decisões com base no segmento específico.
             </p>
           </div>
           
           <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 hover:border-indigo-500/30 hover:bg-gradient-to-br hover:from-indigo-900/5 hover:to-gray-800/30 transition-all duration-300 group">
             <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
               <span className="text-xl">⚡</span>
             </div>
             <h3 className="text-lg font-bold mb-3">Geração Automática</h3>
             <p className="text-gray-300 text-sm">
               Landing pages, formulários e dashboards criados automaticamente com base no seu modelo de negócio.
             </p>
           </div>
           
           <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 hover:border-blue-500/30 hover:bg-gradient-to-br hover:from-blue-900/5 hover:to-gray-800/30 transition-all duration-300 group">
             <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
               <span className="text-xl">🎯</span>
             </div>
             <h3 className="text-lg font-bold mb-3">Validação Real</h3>
             <p className="text-gray-300 text-sm">
               Coleta leads reais, métricas precisas e feedback direto dos seus potenciais clientes.
             </p>
           </div>
           
           <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 hover:border-cyan-500/30 hover:bg-gradient-to-br hover:from-cyan-900/5 hover:to-gray-800/30 transition-all duration-300 group">
             <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
               <span className="text-xl">📊</span>
             </div>
             <h3 className="text-lg font-bold mb-3">Dashboard Intuitivo</h3>
             <p className="text-gray-300 text-sm">
               Acompanhe métricas importantes como conversões, leads, tráfego e engajamento em tempo real.
             </p>
           </div>
         </div>
         
         <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
           <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 hover:border-teal-500/30 hover:bg-gradient-to-br hover:from-teal-900/5 hover:to-gray-800/30 transition-all duration-300 group">
             <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-green-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
               <span className="text-xl">📋</span>
             </div>
             <h3 className="text-lg font-bold mb-3">Relatórios Profissionais</h3>
             <p className="text-gray-300 text-sm">
               PDFs automatizados para apresentar aos investidores com análises completas do seu sistema de negócios.
             </p>
           </div>
           
           <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 hover:border-green-500/30 hover:bg-gradient-to-br hover:from-green-900/5 hover:to-gray-800/30 transition-all duration-300 group">
             <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
               <span className="text-xl">🕐</span>
             </div>
             <h3 className="text-lg font-bold mb-3">Disponível 24/7</h3>
             <p className="text-gray-300 text-sm">
               Seu co-fundador digital nunca dorme. Sempre disponível para ajudar na sua jornada empreendedora.
             </p>
           </div>
           
           <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 hover:border-emerald-500/30 hover:bg-gradient-to-br hover:from-emerald-900/5 hover:to-gray-800/30 transition-all duration-300 group">
             <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
               <span className="text-xl">🔒</span>
             </div>
             <h3 className="text-lg font-bold mb-3">Dados Seguros</h3>
             <p className="text-gray-300 text-sm">
               Suas ideias e informações ficam protegidas com criptografia de ponta a ponta armazenadas.
             </p>
           </div>
           
           <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 hover:border-purple-500/30 hover:bg-gradient-to-br hover:from-purple-900/5 hover:to-gray-800/30 transition-all duration-300 group">
             <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
               <span className="text-xl">👥</span>
             </div>
             <h3 className="text-lg font-bold mb-3">Suporte Especializado</h3>
             <p className="text-gray-300 text-sm">
               Acesso a especialistas quando precisar, com conhecimento específico do mercado brasileiro.
             </p>
           </div>
         </div>
       </section>
       
       {/* Co-founder Section */}
       <section className="px-6 py-20 md:px-12">
         <div className="max-w-6xl mx-auto">
           <div className="bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-indigo-900/20 rounded-3xl border border-gray-700/50 p-8 lg:p-12">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
               <div>
                 <h3 className="text-3xl font-bold text-white mb-6">
                   Mais que uma ferramenta, um <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">co-fundador</span>
                 </h3>
                 <p className="text-gray-300 text-lg leading-relaxed mb-8">
                   A LANZZA não é apenas um software. É como ter um sócio experiente que já validou centenas de negócios,
                   disponível 24/7 para te guiar do caos mental até o primeiro cliente pagante.
                 </p>
                 <div className="space-y-4">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-blue-400"></div>
                     <span className="text-gray-300">Conhecimento especializado do mercado brasileiro</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400"></div>
                     <span className="text-gray-300">Metodologia testada com centenas de empreendedores</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400"></div>
                     <span className="text-gray-300">Resultado: da ideia ao primeiro cliente em semanas</span>
                   </div>
                 </div>
               </div>
               
               <div className="relative">
                 <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-600/30">
                   <div className="space-y-4">
                     <div className="flex items-center gap-3">
                       <div className="w-3 h-3 rounded-full bg-green-400"></div>
                       <span className="text-sm text-gray-400">LANZZA está online</span>
                     </div>
                     <div className="bg-purple-500/10 rounded-lg p-4 border-l-4 border-purple-500">
                       <p className="text-sm text-gray-300">
                         "Olá! Vi que você tem interesse em salão de beleza. Vamos descobrir qual seu diferencial no mercado?"
                       </p>
                     </div>
                     <div className="bg-blue-500/10 rounded-lg p-4 border-l-4 border-blue-500">
                       <p className="text-sm text-gray-300">
                         "Baseado no seu perfil, criei uma landing page otimizada para seu nicho. Que tal vermos os primeiros resultados?"
                       </p>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </section>

       {/* Results Section */}
       <section id="depoimentos" className="px-6 py-20 md:px-12 bg-slate-900/50">
         <div className="max-w-6xl mx-auto">
           <div className="text-center mb-16">
             <h2 className="text-4xl md:text-5xl font-bold mb-4">
               Resultados que<br />
               <span className="text-purple-400">Comprovam</span>
             </h2>
             <p className="text-xl text-gray-300">
               Números reais de empreendedores que transformaram ideias em negócios validados
             </p>
           </div>
           
           {/* Statistics */}
           <div className="grid md:grid-cols-4 gap-8 mb-16">
             <div className="text-center">
               <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent mb-2">87%</div>
               <p className="text-slate-300">Conseguiram validar a ideia em até 30 dias</p>
             </div>
             <div className="text-center">
               <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent mb-2">3.2x</div>
               <p className="text-slate-300">Mais rápido que métodos tradicionais</p>
             </div>
             <div className="text-center">
               <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-2">R$ 2.1M</div>
               <p className="text-slate-300">Em investimentos captados pelos usuários</p>
             </div>
             <div className="text-center">
               <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent mb-2">94%</div>
               <p className="text-slate-300">Recomendam para outros empreendedores</p>
             </div>
           </div>
           
           {/* Testimonials */}
           <div className="grid md:grid-cols-2 gap-8">
             <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 hover:border-purple-500/30 hover:bg-gradient-to-br hover:from-purple-900/5 hover:to-gray-800/30 transition-all duration-300">
               <div className="flex items-center mb-4">
                 <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                   <span className="text-white font-bold">MC</span>
                 </div>
                 <div>
                   <h4 className="font-bold text-white">Marina Costa</h4>
                   <p className="text-gray-400 text-sm">Fundadora da EcoBeauty</p>
                 </div>
               </div>
               <p className="text-gray-300 italic">
                 "Em 3 semanas consegui validar minha ideia de cosméticos sustentáveis e captar os primeiros R$ 50k. A LANZZA me ajudou a estruturar tudo de forma profissional."
               </p>
               <div className="flex text-yellow-400 mt-4">
                 ⭐⭐⭐⭐⭐
               </div>
             </div>
             
             <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 hover:border-blue-500/30 hover:bg-gradient-to-br hover:from-blue-900/5 hover:to-gray-800/30 transition-all duration-300">
               <div className="flex items-center mb-4">
                 <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-4">
                   <span className="text-white font-bold">RS</span>
                 </div>
                 <div>
                   <h4 className="font-bold text-white">Rafael Santos</h4>
                   <p className="text-gray-400 text-sm">CEO da TechEdu</p>
                 </div>
               </div>
               <p className="text-gray-300 italic">
                 "Estava há meses tentando validar minha plataforma de educação. Com a LANZZA, em 2 semanas já tinha 200 leads qualificados e feedback valioso dos usuários."
               </p>
               <div className="flex text-yellow-400 mt-4">
                 ⭐⭐⭐⭐⭐
               </div>
             </div>
           </div>
         </div>
       </section>
       
       {/* Final CTA Section */}
       <section className="px-6 py-20 md:px-12 bg-gradient-to-br from-purple-900/30 via-black to-blue-900/30">
         <div className="max-w-4xl mx-auto text-center">
           <h2 className="text-4xl md:text-6xl font-bold mb-6">
             <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
               Pronto para transformar sua ideia em
             </span>
             <br />
             <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> realidade?</span>
           </h2>
           <p className="text-xl text-gray-300 mb-8">
             Junte-se a centenas de empreendedores que já validaram suas ideias e estão construindo o futuro.
           </p>
           
           <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-8 mb-8">
             <div className="text-center">
               <div className="text-sm text-green-400 font-semibold mb-2">🎉 OFERTA DE LANÇAMENTO</div>
               <div className="text-3xl font-bold text-white mb-2">
                 <span className="line-through text-gray-500 text-xl mr-2">R$ 497</span>
                 <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">R$ 97</span>
               </div>
               <div className="text-green-400 text-sm">Economia de 80% • Apenas primeiros 100 usuários</div>
             </div>
           </div>
           
           <Link 
             to="/jornada" 
             className="group relative overflow-hidden inline-block px-12 py-4 rounded-xl text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white border border-purple-500/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 hover:border-purple-400/50"
           >
             <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
             <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
             <span className="relative z-10">
               🚀 Começar Minha Jornada Agora
             </span>
           </Link>
           
           <p className="text-gray-400 text-sm mt-6">
             ✅ Sem compromisso • ✅ Resultados em 24h • ✅ Suporte especializado
           </p>
         </div>
       </section>

       {/* Footer */}
      <footer className="bg-gradient-to-t from-gray-900 to-black border-t border-gray-800 px-6 py-12 md:px-12">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400 mb-4">LANZZA</div>
          <p className="text-gray-400 mb-6">Transformando ideias em negócios validados</p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Termos</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Contato</a>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
