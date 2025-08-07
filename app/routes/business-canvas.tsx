import { json, type MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { Navigation } from '~/components/landing/Navigation';
import BackgroundRays from '~/components/ui/BackgroundRays';

export const meta: MetaFunction = () => {
  return [
    { title: 'Business Model Canvas - LANZZA' },
    { name: 'description', content: 'Visualize e edite seu modelo de negócios interativo' }
  ];
};

export const loader = () => json({});

interface CanvasSection {
  id: string;
  title: string;
  content: string[];
  color: string;
  description: string;
}

export default function BusinessCanvas() {
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [canvasSections, setCanvasSections] = useState<CanvasSection[]>([
    {
      id: 'key-partners',
      title: 'Parceiros-Chave',
      content: [
        'Provedores de IA (OpenAI, Anthropic)',
        'Integradores de e-commerce',
        'Consultores de CX',
        'Parceiros de implementação'
      ],
      color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
      description: 'Quem são seus parceiros estratégicos?'
    },
    {
      id: 'key-activities',
      title: 'Atividades-Chave',
      content: [
        'Desenvolvimento de IA',
        'Integração com plataformas',
        'Suporte ao cliente',
        'Marketing digital',
        'Vendas B2B'
      ],
      color: 'from-green-500/20 to-green-600/20 border-green-500/30',
      description: 'Principais atividades do seu negócio'
    },
    {
      id: 'key-resources',
      title: 'Recursos-Chave',
      content: [
        'Equipe de desenvolvimento',
        'Infraestrutura cloud',
        'Base de dados de treinamento',
        'Propriedade intelectual',
        'Capital de giro'
      ],
      color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
      description: 'Recursos essenciais para operar'
    },
    {
      id: 'value-propositions',
      title: 'Proposta de Valor',
      content: [
        'Atendimento 24/7 automatizado',
        'Redução de 70% no tempo de resposta',
        'Setup em menos de 5 minutos',
        'ROI positivo em 30 dias',
        'Integração nativa com e-commerce'
      ],
      color: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
      description: 'O que você oferece de único?'
    },
    {
      id: 'customer-relationships',
      title: 'Relacionamento com Clientes',
      content: [
        'Onboarding assistido',
        'Suporte técnico dedicado',
        'Community de usuários',
        'Webinars e treinamentos',
        'Account management'
      ],
      color: 'from-pink-500/20 to-pink-600/20 border-pink-500/30',
      description: 'Como você se relaciona com clientes?'
    },
    {
      id: 'channels',
      title: 'Canais',
      content: [
        'Website e SEO',
        'LinkedIn e redes sociais',
        'Parcerias com integradores',
        'Eventos de e-commerce',
        'Indicações de clientes'
      ],
      color: 'from-teal-500/20 to-teal-600/20 border-teal-500/30',
      description: 'Como você alcança seus clientes?'
    },
    {
      id: 'customer-segments',
      title: 'Segmentos de Clientes',
      content: [
        'E-commerces de médio porte',
        'Marketplaces regionais',
        'Lojas omnichannel',
        'Empresas SaaS B2C',
        'Startups em crescimento'
      ],
      color: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30',
      description: 'Quem são seus clientes ideais?'
    },
    {
      id: 'cost-structure',
      title: 'Estrutura de Custos',
      content: [
        'Desenvolvimento e P&D (40%)',
        'Infraestrutura cloud (25%)',
        'Vendas e marketing (20%)',
        'Operações e suporte (10%)',
        'Administrativo (5%)'
      ],
      color: 'from-red-500/20 to-red-600/20 border-red-500/30',
      description: 'Principais custos do negócio'
    },
    {
      id: 'revenue-streams',
      title: 'Fontes de Receita',
      content: [
        'Assinatura mensal SaaS',
        'Setup e implementação',
        'Treinamento e consultoria',
        'Integrações customizadas',
        'Suporte premium'
      ],
      color: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
      description: 'Como você gera receita?'
    }
  ]);

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newItem, setNewItem] = useState('');

  // Carregar mensagens do chat especialista do localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('chat-especialista-messages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setChatMessages(parsedMessages);
      } catch (error) {
        console.error('Erro ao carregar mensagens do chat:', error);
      }
    }
  }, []);

  // Função para gerar canvas automaticamente com IA
  const generateCanvasWithAI = async () => {
    if (!chatMessages.length || isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-canvas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatMessages })
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const generatedCanvas = await response.json() as { sections?: typeof canvasSections };
      if (generatedCanvas.sections) {
        setCanvasSections(generatedCanvas.sections);
        setHasGenerated(true);
      }
    } catch (error) {
      console.error('Erro ao gerar canvas:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const [completionProgress, setCompletionProgress] = useState(85);

  const addItemToSection = (sectionId: string, item: string) => {
    if (!item.trim()) return;
    
    setCanvasSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, content: [...section.content, item.trim()] }
          : section
      )
    );
    setNewItem('');
    setEditingSection(null);
  };

  const removeItemFromSection = (sectionId: string, itemIndex: number) => {
    setCanvasSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, content: section.content.filter((_, index) => index !== itemIndex) }
          : section
      )
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <BackgroundRays />
      <Navigation />
      
      {/* Separator */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
      
      <div className="relative z-10 px-6 py-12 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Business Model Canvas
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Visualize e edite seu modelo de negócios interativo
            </p>
            
            {/* AI Generation Button */}
            {chatMessages.length > 0 && !hasGenerated && (
              <div className="mb-8">
                <button
                  onClick={generateCanvasWithAI}
                  disabled={isGenerating}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    isGenerating
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transform hover:scale-105'
                  }`}
                >
                  {isGenerating ? 'Gerando Canvas com IA...' : '🤖 Gerar Canvas Automaticamente com IA'}
                </button>
                <p className="text-sm text-gray-400 mt-2">
                  A IA irá preencher todos os blocos baseado na conversa com o especialista
                </p>
              </div>
            )}
            
            {hasGenerated && (
              <div className="mb-8 p-4 bg-green-900/30 border border-green-500/30 rounded-lg">
                <p className="text-green-400 text-center">
                  ✅ Canvas gerado automaticamente! Você pode editar qualquer seção clicando nela.
                </p>
              </div>
            )}
            
            {/* Progress */}
            <div className="max-w-md mx-auto mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Progresso do Canvas</span>
                <span className="text-sm text-purple-400">{completionProgress}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Canvas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            {/* Row 1 */}
            <div className="md:col-span-1">
              <CanvasSection 
                section={canvasSections.find(s => s.id === 'key-partners')!}
                isEditing={editingSection === 'key-partners'}
                onEdit={() => setEditingSection('key-partners')}
                onAddItem={(item) => addItemToSection('key-partners', item)}
                onRemoveItem={(index) => removeItemFromSection('key-partners', index)}
                newItem={newItem}
                setNewItem={setNewItem}
              />
            </div>
            
            <div className="md:col-span-1">
              <CanvasSection 
                section={canvasSections.find(s => s.id === 'key-activities')!}
                isEditing={editingSection === 'key-activities'}
                onEdit={() => setEditingSection('key-activities')}
                onAddItem={(item) => addItemToSection('key-activities', item)}
                onRemoveItem={(index) => removeItemFromSection('key-activities', index)}
                newItem={newItem}
                setNewItem={setNewItem}
              />
            </div>
            
            <div className="md:col-span-1">
              <CanvasSection 
                section={canvasSections.find(s => s.id === 'value-propositions')!}
                isEditing={editingSection === 'value-propositions'}
                onEdit={() => setEditingSection('value-propositions')}
                onAddItem={(item) => addItemToSection('value-propositions', item)}
                onRemoveItem={(index) => removeItemFromSection('value-propositions', index)}
                newItem={newItem}
                setNewItem={setNewItem}
              />
            </div>
            
            <div className="md:col-span-1">
              <CanvasSection 
                section={canvasSections.find(s => s.id === 'customer-relationships')!}
                isEditing={editingSection === 'customer-relationships'}
                onEdit={() => setEditingSection('customer-relationships')}
                onAddItem={(item) => addItemToSection('customer-relationships', item)}
                onRemoveItem={(index) => removeItemFromSection('customer-relationships', index)}
                newItem={newItem}
                setNewItem={setNewItem}
              />
            </div>
            
            <div className="md:col-span-1">
              <CanvasSection 
                section={canvasSections.find(s => s.id === 'customer-segments')!}
                isEditing={editingSection === 'customer-segments'}
                onEdit={() => setEditingSection('customer-segments')}
                onAddItem={(item) => addItemToSection('customer-segments', item)}
                onRemoveItem={(index) => removeItemFromSection('customer-segments', index)}
                newItem={newItem}
                setNewItem={setNewItem}
              />
            </div>

            {/* Row 2 */}
            <div className="md:col-span-1">
              <CanvasSection 
                section={canvasSections.find(s => s.id === 'key-resources')!}
                isEditing={editingSection === 'key-resources'}
                onEdit={() => setEditingSection('key-resources')}
                onAddItem={(item) => addItemToSection('key-resources', item)}
                onRemoveItem={(index) => removeItemFromSection('key-resources', index)}
                newItem={newItem}
                setNewItem={setNewItem}
              />
            </div>
            
            <div className="md:col-span-3">
              <CanvasSection 
                section={canvasSections.find(s => s.id === 'channels')!}
                isEditing={editingSection === 'channels'}
                onEdit={() => setEditingSection('channels')}
                onAddItem={(item) => addItemToSection('channels', item)}
                onRemoveItem={(index) => removeItemFromSection('channels', index)}
                newItem={newItem}
                setNewItem={setNewItem}
              />
            </div>
            
            <div className="md:col-span-1"></div>

            {/* Row 3 */}
            <div className="md:col-span-2">
              <CanvasSection 
                section={canvasSections.find(s => s.id === 'cost-structure')!}
                isEditing={editingSection === 'cost-structure'}
                onEdit={() => setEditingSection('cost-structure')}
                onAddItem={(item) => addItemToSection('cost-structure', item)}
                onRemoveItem={(index) => removeItemFromSection('cost-structure', index)}
                newItem={newItem}
                setNewItem={setNewItem}
              />
            </div>
            
            <div className="md:col-span-1"></div>
            
            <div className="md:col-span-2">
              <CanvasSection 
                section={canvasSections.find(s => s.id === 'revenue-streams')!}
                isEditing={editingSection === 'revenue-streams'}
                onEdit={() => setEditingSection('revenue-streams')}
                onAddItem={(item) => addItemToSection('revenue-streams', item)}
                onRemoveItem={(index) => removeItemFromSection('revenue-streams', index)}
                newItem={newItem}
                setNewItem={setNewItem}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors">
              Salvar Canvas
            </button>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Exportar PDF
            </button>
            <Link
              to="/mvp-builder"
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              Continuar para MVP Builder
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CanvasSectionProps {
  section: CanvasSection;
  isEditing: boolean;
  onEdit: () => void;
  onAddItem: (item: string) => void;
  onRemoveItem: (index: number) => void;
  newItem: string;
  setNewItem: (value: string) => void;
}

function CanvasSection({ 
  section, 
  isEditing, 
  onEdit, 
  onAddItem, 
  onRemoveItem, 
  newItem, 
  setNewItem 
}: CanvasSectionProps) {
  return (
    <div className={`bg-gradient-to-br ${section.color} backdrop-blur-sm border rounded-2xl p-4 h-64 flex flex-col`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{section.title}</h3>
        <button
          onClick={onEdit}
          className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors"
        >
          ✏️
        </button>
      </div>
      
      <p className="text-xs text-gray-400 mb-3">{section.description}</p>
      
      <div className="flex-1 overflow-y-auto space-y-2">
        {section.content.map((item, index) => (
          <div key={index} className="flex items-center justify-between bg-black/20 p-2 rounded text-xs">
            <span className="flex-1">{item}</span>
            <button
              onClick={() => onRemoveItem(index)}
              className="text-red-400 hover:text-red-300 ml-2"
            >
              ×
            </button>
          </div>
        ))}
        
        {isEditing && (
          <div className="flex gap-1">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onAddItem(newItem)}
              placeholder="Novo item..."
              className="flex-1 p-1 bg-black/30 border border-gray-600 rounded text-xs text-white placeholder-gray-400 focus:outline-none focus:border-white/50"
              autoFocus
            />
            <button
              onClick={() => onAddItem(newItem)}
              className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}