import { json, type MetaFunction, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { Link, useActionData, Form } from '@remix-run/react';
import { useState } from 'react';
import { SidebarNavigation } from '~/components/ui/sidebar-navigation';
import BackgroundRays from '~/components/ui/BackgroundRays';

export const meta: MetaFunction = () => {
  return [
    { title: 'Formulário Estratégico - LANZZA' },
    { name: 'description', content: 'Complete o questionário estratégico sobre seu negócio' }
  ];
};

export const loader = () => json({});

interface FormData {
  businessIdea: string;
  targetMarket: string;
  problemSolving: string;
  competitiveDifferential: string;
  businessModel: string;
  initialInvestment: string;
  timeline: string;
  experience: string;
}

export default function FormularioEstrategico() {
  const [formData, setFormData] = useState<FormData>({
    businessIdea: '',
    targetMarket: '',
    problemSolving: '',
    competitiveDifferential: '',
    businessModel: '',
    initialInvestment: '',
    timeline: '',
    experience: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinish = () => {
    // Salvar dados no localStorage antes de ir para o chat
    localStorage.setItem('formulario-estrategico', JSON.stringify(formData));
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1: return formData.businessIdea.length > 10;
      case 2: return formData.targetMarket.length > 10;
      case 3: return formData.problemSolving.length > 10;
      case 4: return formData.competitiveDifferential.length > 10;
      case 5: return formData.businessModel !== '';
      case 6: return formData.initialInvestment !== '';
      case 7: return formData.timeline !== '';
      case 8: return formData.experience !== '';
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Qual é a sua ideia de negócio?</h2>
              <p className="text-gray-300">Descreva sua ideia de forma clara e detalhada</p>
            </div>
            <textarea
              value={formData.businessIdea}
              onChange={(e) => handleInputChange('businessIdea', e.target.value)}
              placeholder="Ex: Uma plataforma SaaS que ajuda pequenas empresas a automatizar seu atendimento ao cliente usando IA..."
              className="w-full h-40 p-4 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
            />
            <div className="text-sm text-gray-400">
              {formData.businessIdea.length}/500 caracteres
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Quem é seu público-alvo?</h2>
              <p className="text-gray-300">Defina claramente quem são seus clientes ideais</p>
            </div>
            <textarea
              value={formData.targetMarket}
              onChange={(e) => handleInputChange('targetMarket', e.target.value)}
              placeholder="Ex: Pequenas e médias empresas do setor de e-commerce com 10-100 funcionários que enfrentam dificuldades no atendimento ao cliente..."
              className="w-full h-40 p-4 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
            />
            <div className="text-sm text-gray-400">
              {formData.targetMarket.length}/500 caracteres
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Que problema você resolve?</h2>
              <p className="text-gray-300">Explique o problema específico que sua solução aborda</p>
            </div>
            <textarea
              value={formData.problemSolving}
              onChange={(e) => handleInputChange('problemSolving', e.target.value)}
              placeholder="Ex: Empresas perdem clientes devido ao tempo de resposta lento no atendimento, falta de disponibilidade 24/7 e respostas inconsistentes..."
              className="w-full h-40 p-4 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
            />
            <div className="text-sm text-gray-400">
              {formData.problemSolving.length}/500 caracteres
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Qual seu diferencial competitivo?</h2>
              <p className="text-gray-300">O que torna sua solução única no mercado?</p>
            </div>
            <textarea
              value={formData.competitiveDifferential}
              onChange={(e) => handleInputChange('competitiveDifferential', e.target.value)}
              placeholder="Ex: Nossa IA é treinada especificamente para e-commerce, oferece integração nativa com principais plataformas e tem setup em menos de 5 minutos..."
              className="w-full h-40 p-4 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
            />
            <div className="text-sm text-gray-400">
              {formData.competitiveDifferential.length}/500 caracteres
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Qual será seu modelo de negócio?</h2>
              <p className="text-gray-300">Como você pretende monetizar sua solução?</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { value: 'subscription', label: 'Assinatura Mensal/Anual', desc: 'Cobrança recorrente por uso da plataforma' },
                { value: 'freemium', label: 'Freemium', desc: 'Versão gratuita + recursos premium pagos' },
                { value: 'transaction', label: 'Venda Única', desc: 'Pagamento único por produto ou serviço' },
                { value: 'license', label: 'Licenciamento', desc: 'Venda de licenças de software' }
              ].map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleInputChange('businessModel', option.value)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                    formData.businessModel === option.value
                      ? 'border-purple-500 bg-purple-900/20'
                      : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                  }`}
                >
                  <h3 className="font-semibold mb-2">{option.label}</h3>
                  <p className="text-sm text-gray-400">{option.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Qual seu investimento inicial disponível?</h2>
              <p className="text-gray-300">Isso nos ajuda a dimensionar o plano adequado</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { value: 'bootstrap', label: 'Bootstrap (R$ 0 - 10k)', desc: 'Recursos próprios limitados' },
                { value: 'small', label: 'Pequeno (R$ 10k - 50k)', desc: 'Investimento inicial moderado' },
                { value: 'medium', label: 'Médio (R$ 50k - 200k)', desc: 'Capital para crescimento acelerado' },
                { value: 'large', label: 'Grande (R$ 200k+)', desc: 'Recursos substanciais disponíveis' }
              ].map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleInputChange('initialInvestment', option.value)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                    formData.initialInvestment === option.value
                      ? 'border-purple-500 bg-purple-900/20'
                      : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                  }`}
                >
                  <h3 className="font-semibold mb-2">{option.label}</h3>
                  <p className="text-sm text-gray-400">{option.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Qual seu prazo para lançamento?</h2>
              <p className="text-gray-300">Quando você gostaria de ter seu MVP no mercado?</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { value: '1-3months', label: '1-3 meses', desc: 'Lançamento rápido com MVP básico' },
                { value: '3-6months', label: '3-6 meses', desc: 'Desenvolvimento mais robusto' },
                { value: '6-12months', label: '6-12 meses', desc: 'Produto mais completo e testado' },
                { value: '12months+', label: '12+ meses', desc: 'Desenvolvimento extensivo e validação' }
              ].map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleInputChange('timeline', option.value)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                    formData.timeline === option.value
                      ? 'border-purple-500 bg-purple-900/20'
                      : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                  }`}
                >
                  <h3 className="font-semibold mb-2">{option.label}</h3>
                  <p className="text-sm text-gray-400">{option.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Qual sua experiência empreendedora?</h2>
              <p className="text-gray-300">Isso nos ajuda a personalizar as recomendações</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { value: 'first-time', label: 'Primeiro Negócio', desc: 'Esta é minha primeira empreitada' },
                { value: 'some-experience', label: 'Alguma Experiência', desc: 'Já tentei alguns projetos antes' },
                { value: 'experienced', label: 'Experiente', desc: 'Já criei negócios com sucesso' },
                { value: 'serial', label: 'Empreendedor Serial', desc: 'Múltiplos negócios e exits' }
              ].map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleInputChange('experience', option.value)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                    formData.experience === option.value
                      ? 'border-purple-500 bg-purple-900/20'
                      : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                  }`}
                >
                  <h3 className="font-semibold mb-2">{option.label}</h3>
                  <p className="text-sm text-gray-400">{option.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <BackgroundRays />
      
      <div className="relative z-10 flex">
        {/* Sidebar com Menu Vertical */}
        <SidebarNavigation />
        
        {/* Conteúdo Principal */}
        <div className="flex-1 px-6 py-12 md:px-12">
          <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Formulário Estratégico</h1>
              <span className="text-gray-400">Passo {currentStep} de {totalSteps}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 mb-8">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    i + 1 === currentStep
                      ? 'bg-purple-500'
                      : i + 1 < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            {currentStep === totalSteps ? (
              <Link
                to="/chat-especialista"
                onClick={handleFinish}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 ${
                  isStepComplete()
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transform hover:scale-105'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Finalizar e Continuar
              </Link>
            ) : (
              <button
                onClick={nextStep}
                disabled={!isStepComplete()}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  isStepComplete()
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Próximo
              </button>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}