import { Link } from '@remix-run/react';
import { Header } from '~/components/header/Header';

export function LanzzaLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transforme Sua Ideia em <span className="text-blue-600">Startup</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Plataforma completa para encontrar cofounders, validar ideias, 
            criar MVPs e lançar sua startup com inteligência artificial.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link 
              to="/mvp-builder" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Começar MVP Builder
            </Link>
            <Link 
              to="/business-plan" 
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Criar Plano de Negócio
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Funcionalidades</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              title="MVP Builder"
              description="Construa protótipos funcionais com IA"
              link="/jornada"
            />
            <FeatureCard 
              title="Business Plan"
              description="Gere planos de negócio completos"
              link="/business-plan"
            />
            <FeatureCard 
              title="Cofounder Matching"
              description="Encontre o cofounder ideal"
              link="/cofounder-matching"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, description, link }: { title: string; description: string; link: string }) {
  return (
    <Link to={link} className="block p-6 border rounded-lg hover:shadow-lg transition">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
}