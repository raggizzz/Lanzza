import { json, type MetaFunction, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Link, useLoaderData, useSearchParams, useNavigate } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { SidebarNavigation } from '~/components/ui/sidebar-navigation';
import BackgroundRays from '~/components/ui/BackgroundRays';
import { supabaseHelpers } from '~/lib/supabase/client';
import { DatabaseService } from '~/lib/services/database';
import type { Project, AIAnalysis, ProjectMetric } from '~/types/database';
import type { User } from '@supabase/supabase-js';

export const meta: MetaFunction = () => {
  return [
    { title: 'Dashboard Final - LANZZA' },
    { name: 'description', content: 'Acesse métricas e insights do seu plano de negócios' }
  ];
};

// Helper function to get user
async function getUser() {
  const { data: { user }, error } = await supabaseHelpers.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const user = await getUser();
    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');
    
    // Permitir carregamento mesmo sem usuário para autenticação do lado do cliente
    if (!user) {
      return json({
        user: null,
        project: null,
        analyses: [],
        metrics: [],
        allProjects: []
      });
    }

    // Buscar todos os projetos do usuário
    const projectsResult = await DatabaseService.getProjects(user.id, {});
    const allProjects = projectsResult?.data || [];

    let project: Project | null = null;
    let analyses: AIAnalysis[] = [];
    let metrics: ProjectMetric[] = [];

    if (projectId) {
      // Buscar projeto específico
      project = await DatabaseService.getProject(projectId, user.id);
      
      if (project) {
        // Buscar análises e métricas do projeto
        analyses = await DatabaseService.getProjectAnalyses(projectId, user.id);
        metrics = await DatabaseService.getProjectMetrics(projectId, user.id);
      }
    } else {
      // Buscar último projeto do usuário
      project = allProjects[0] || null;
      
      if (project) {
        analyses = await DatabaseService.getProjectAnalyses(project.id, user.id);
        metrics = await DatabaseService.getProjectMetrics(project.id, user.id);
      }
    }

    return json({ user, project, analyses, metrics, allProjects });
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    console.error('Erro no loader do Dashboard Final:', error);
    return json({ user: null, project: null, analyses: [], metrics: [], allProjects: [] });
  }
};

interface Metric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: string;
}

interface Insight {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export default function DashboardFinal() {
  const loaderData = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(loaderData.user);
  const [project, setProject] = useState(loaderData.project);
  const [analyses, setAnalyses] = useState(loaderData.analyses);
  const [metrics, setMetrics] = useState(loaderData.metrics);
  const [allProjects, setAllProjects] = useState(loaderData.allProjects);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const [aiAnalysis, setAiAnalysis] = useState<{
    market?: string;
    viability?: string;
    risks?: string;
    opportunities?: string;
    recommendations?: string;
  }>({});
  const [loadingAnalysis, setLoadingAnalysis] = useState<string | null>(null);
  const [showAiInsights, setShowAiInsights] = useState(false);

  // Verificar autenticação do lado do cliente
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabaseHelpers.auth.getUser();
        if (error || !user) {
          navigate('/auth');
          return;
        }
        
        setUser(user);
        
        // Carregar dados do usuário se não vieram do loader
        if (!loaderData.user) {
          const projectsResult = await DatabaseService.getProjects(user.id, {});
          setAllProjects(projectsResult?.data || []);
        }
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, loaderData.user]);

  // Carregar análises existentes do banco de dados
  useEffect(() => {
    if (analyses && analyses.length > 0) {
      const analysisMap: any = {};
      analyses.forEach(analysis => {
        if (analysis) {
          analysisMap[analysis.analysis_type] = analysis.result;
        }
      });
      setAiAnalysis(analysisMap);
    }
  }, [analyses]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  // Se não há usuário após verificação, não renderizar nada (redirecionamento em andamento)
  if (!user) {
    return null;
  }

  // Dados do negócio para análise com IA
  const businessData = {
    idea: 'Plataforma SaaS de automação de atendimento ao cliente para e-commerces',
    target: 'E-commerces de médio porte (10-100 funcionários)',
    problem: 'Dificuldades no atendimento ao cliente e necessidade de automação inteligente',
    solution: 'Setup em 5 minutos, atendimento 24/7 e ROI positivo em 30 dias',
    market: 'Automação de atendimento - R$ 2.5B no Brasil',
    revenue: 'SaaS com freemium',
    investment: 'R$ 150K',
    timeline: '18 meses para break-even',
    team: 'Fundador com experiência em tech',
    competitors: 'Zendesk, Intercom, Freshworks'
  };

  // Função para gerar análise com IA
  const generateAiAnalysis = async (type: string) => {
    if (!project) {
      console.error('Nenhum projeto encontrado para salvar análise');
      return;
    }

    setLoadingAnalysis(type);
    try {
      const response = await fetch('/api/dashboard-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessData,
          analysisType: type,
          projectId: project.id
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar análise');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Erro ao ler resposta');

      let analysisText = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const data = JSON.parse(line.slice(2));
              if (data.type === 'text-delta') {
                analysisText += data.textDelta;
                setAiAnalysis(prev => ({
                  ...prev,
                  [type]: analysisText
                }));
              }
            } catch (e) {
              // Ignorar erros de parsing
            }
          }
        }
      }

      // Salvar análise completa no banco de dados
      if (analysisText && user) {
        try {
          await fetch('/api/ai-analyses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              project_id: project.id,
              analysis_type: type,
              content: analysisText,
              metadata: {
                businessData,
                timestamp: new Date().toISOString()
              }
            })
          });
        } catch (saveError) {
          console.error('Erro ao salvar análise no banco:', saveError);
        }
      }
    } catch (error) {
      console.error('Erro ao gerar análise:', error);
      setAiAnalysis(prev => ({
        ...prev,
        [type]: 'Erro ao gerar análise. Tente novamente.'
      }));
    } finally {
      setLoadingAnalysis(null);
    }
  };
  
  const mockMetrics: Metric[] = [
    {
      title: 'Potencial de Mercado',
      value: 'R$ 2.5B',
      change: '+15%',
      trend: 'up',
      icon: '📊'
    },
    {
      title: 'Score de Viabilidade',
      value: '8.7/10',
      change: '+0.3',
      trend: 'up',
      icon: '⭐'
    },
    {
      title: 'Tempo para Break-even',
      value: '18 meses',
      change: '-2 meses',
      trend: 'up',
      icon: '⏱️'
    },
    {
      title: 'Investimento Necessário',
      value: 'R$ 150K',
      change: '-R$ 25K',
      trend: 'up',
      icon: '💰'
    }
  ];

  const insights: Insight[] = [
    {
      title: 'Oportunidade de Mercado Forte',
      description: 'O mercado de automação de atendimento está crescendo 25% ao ano. Sua solução está bem posicionada.',
      priority: 'high',
      category: 'Mercado'
    },
    {
      title: 'Diferencial Competitivo Claro',
      description: 'A integração nativa com e-commerce e setup rápido são vantagens significativas sobre concorrentes.',
      priority: 'high',
      category: 'Produto'
    },
    {
      title: 'Modelo de Receita Validado',
      description: 'SaaS com freemium é ideal para seu segmento. Considere adicionar tiers enterprise.',
      priority: 'medium',
      category: 'Monetização'
    },
    {
      title: 'Canais de Aquisição Diversificados',
      description: 'Parcerias com integradores podem acelerar o crescimento. Priorize LinkedIn para B2B.',
      priority: 'medium',
      category: 'Marketing'
    },
    {
      title: 'Estrutura de Custos Otimizada',
      description: 'Foco em P&D está correto. Considere terceirizar operações não-core inicialmente.',
      priority: 'low',
      category: 'Operações'
    }
  ];

  const nextSteps = [
    {
      title: 'Validar MVP com 10 clientes beta',
      deadline: '30 dias',
      status: 'pending'
    },
    {
      title: 'Desenvolver integrações principais',
      deadline: '45 dias',
      status: 'pending'
    },
    {
      title: 'Estruturar round de investimento',
      deadline: '60 dias',
      status: 'pending'
    },
    {
      title: 'Contratar primeiro desenvolvedor',
      deadline: '90 dias',
      status: 'pending'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/50 bg-red-900/20';
      case 'medium': return 'border-yellow-500/50 bg-yellow-900/20';
      case 'low': return 'border-green-500/50 bg-green-900/20';
      default: return 'border-gray-500/50 bg-gray-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <BackgroundRays />
      
      {/* Sidebar Navigation */}
      <SidebarNavigation 
        userName={user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário'}
        userEmail={user.email || ''}
      />
      
      {/* Main Content */}
      <div className="flex-1 relative z-10 px-6 py-12 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Dashboard Final
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Métricas e insights do seu plano de negócios
            </p>
            
            {/* Project Info */}
            {project && (
              <div className="mb-6">
                <div className="inline-flex items-center gap-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl px-6 py-3">
                  <span className="text-lg">📁</span>
                  <div className="text-left">
                    <div className="font-semibold text-white">{project.name}</div>
                    <div className="text-sm text-gray-400">
                      Criado em {new Date(project.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  {user && (
                    <div className="ml-4 text-xs text-blue-400">
                      {user.email}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Completion Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-full px-6 py-3 mb-8">
              <span className="text-2xl">🎉</span>
              <span className="font-semibold text-green-400">Jornada Completa!</span>
              <span className="text-green-300">Seu plano está pronto</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-2 flex flex-wrap gap-2">
              {[
                { id: 'projects', label: 'Meus Projetos', icon: '📁', gradient: 'from-orange-500 to-red-600' },
                { id: 'overview', label: 'Visão Geral', icon: '📊', gradient: 'from-emerald-500 to-teal-600' },
                { id: 'metrics', label: 'Métricas', icon: '📈', gradient: 'from-blue-500 to-indigo-600' },
                { id: 'insights', label: 'Insights', icon: '💡', gradient: 'from-yellow-500 to-orange-600' },
                { id: 'ai-analysis', label: 'Análise IA', icon: '🤖', gradient: 'from-purple-500 to-violet-600' },
                { id: 'action-plan', label: 'Plano de Ação', icon: '📋', gradient: 'from-cyan-500 to-blue-600' },
                { id: 'pitch', label: 'Pitch', icon: '🎤', gradient: 'from-pink-500 to-rose-600' },
                { id: 'sales', label: 'Vendas', icon: '💰', gradient: 'from-green-500 to-emerald-600' },
                { id: 'mvp-access', label: 'Meu MVP', icon: '🚀', gradient: 'from-red-500 to-pink-600' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 overflow-hidden group text-xs sm:text-sm whitespace-nowrap ${
                     activeTab === tab.id
                       ? `bg-gradient-to-r ${tab.gradient} text-white shadow-xl scale-105 transform`
                       : 'bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 text-gray-300 hover:bg-gray-700/60 hover:text-white hover:border-gray-600/50 hover:scale-102 transform'
                   }`}
                >
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20"></div>
                  )}
                  <span className={`text-xl transition-transform duration-300 ${
                    activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'
                  }`}>{tab.icon}</span>
                  <span className="relative z-10">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'projects' && (
            <div className="space-y-8">
              {/* Header da seção de projetos */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                  <span className="text-4xl">📁</span>
                  Meus Projetos
                </h2>
                <p className="text-xl text-gray-300">
                  Gerencie todos os seus projetos MVP em um só lugar
                </p>
              </div>

              {/* Lista de projetos */}
              <div className="grid gap-6">
                {allProjects && allProjects.length > 0 ? (
                  allProjects.map((proj) => {
                    if (!proj) return null;
                    
                    return (
                      <div key={proj.id} className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">
                                {proj.type === 'mvp' ? '🚀' : 
                                 proj.type === 'business_plan' ? '📋' : 
                                 proj.type === 'canvas' ? '🎨' : 
                                 proj.type === 'pitch_deck' ? '📊' : 
                                 proj.type === 'market_analysis' ? '📈' : '💼'}
                              </span>
                              <h3 className="text-xl font-semibold text-white">{proj.name}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                proj.status === 'completed' ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
                                proj.status === 'active' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' :
                                proj.status === 'paused' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' :
                                'bg-gray-900/30 text-gray-400 border border-gray-500/30'
                              }`}>
                                {proj.status === 'completed' ? 'Completo' :
                                 proj.status === 'active' ? 'Ativo' : 
                                 proj.status === 'paused' ? 'Pausado' : 'Arquivado'}
                              </span>
                            </div>
                            {proj.description && (
                              <p className="text-gray-300 mb-4">{proj.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>Criado em {new Date(proj.created_at).toLocaleDateString('pt-BR')}</span>
                              <span>•</span>
                              <span>Atualizado em {new Date(proj.updated_at).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <Link
                            to={`/dashboard-final?projectId=${proj.id}`}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2"
                          >
                            <span>📊</span>
                            Ver Dashboard
                          </Link>
                          <Link
                            to={`/mvp-builder?projectId=${proj.id}`}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2"
                          >
                            <span>🔧</span>
                            Editar MVP
                          </Link>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📁</div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-300">Nenhum projeto encontrado</h3>
                    <p className="text-gray-400 mb-6">Comece criando seu primeiro projeto MVP</p>
                    <Link
                      to="/jornada"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                    >
                      <span>🚀</span>
                      Criar Primeiro Projeto
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Metrics Grid */}
              <div className="grid md:grid-cols-4 gap-6">
                {mockMetrics.map((metric, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl">{metric.icon}</span>
                      <span className="text-lg">{getTrendIcon(metric.trend)}</span>
                    </div>
                    <h3 className="text-sm text-gray-400 mb-2">{metric.title}</h3>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-bold">{metric.value}</span>
                      <span className={`text-sm font-medium ${
                        metric.trend === 'up' ? 'text-green-400' : 
                        metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Business Summary */}
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-3xl">📋</span>
                  Resumo do Seu Negócio
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-purple-400">Proposta de Valor</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Plataforma SaaS de automação de atendimento ao cliente para e-commerces, 
                      oferecendo setup em 5 minutos, atendimento 24/7 e ROI positivo em 30 dias.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-blue-400">Mercado-Alvo</h3>
                    <p className="text-gray-300 leading-relaxed">
                      E-commerces de médio porte (10-100 funcionários) que enfrentam dificuldades 
                      no atendimento ao cliente e buscam soluções de automação inteligente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              {insights.map((insight, index) => (
                <div key={index} className={`border rounded-2xl p-6 ${getPriorityColor(insight.priority)}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{insight.title}</h3>
                      <span className="inline-block bg-gray-800/50 text-gray-300 text-xs px-3 py-1 rounded-full">
                        {insight.category}
                      </span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      insight.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      insight.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {insight.priority === 'high' ? 'Alta' : insight.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{insight.description}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ai-analysis' && (
            <div className="space-y-6">
              {/* Header da Análise IA */}
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <span className="text-3xl">🤖</span>
                  Análises Inteligentes com IA
                </h2>
                <p className="text-gray-300 mb-6">
                  Nossa IA analisa seu plano de negócios e gera insights personalizados para maximizar suas chances de sucesso.
                </p>
                
                {/* Botões de Análise */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { type: 'market', label: 'Análise de Mercado', icon: '📈', color: 'from-green-600 to-emerald-600' },
                    { type: 'viability', label: 'Viabilidade', icon: '⭐', color: 'from-blue-600 to-cyan-600' },
                    { type: 'risks', label: 'Análise de Riscos', icon: '⚠️', color: 'from-red-600 to-pink-600' },
                    { type: 'opportunities', label: 'Oportunidades', icon: '🎯', color: 'from-purple-600 to-violet-600' },
                    { type: 'recommendations', label: 'Recomendações', icon: '💡', color: 'from-yellow-600 to-orange-600' }
                  ].map((analysis) => (
                    <button
                      key={analysis.type}
                      onClick={() => generateAiAnalysis(analysis.type)}
                      disabled={loadingAnalysis === analysis.type}
                      className={`p-4 rounded-xl border border-gray-600/50 bg-gradient-to-r ${analysis.color} hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{analysis.icon}</span>
                        <div className="text-left">
                          <h3 className="font-semibold text-white">{analysis.label}</h3>
                          {loadingAnalysis === analysis.type && (
                            <p className="text-xs text-gray-200">Gerando análise...</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resultados das Análises */}
              {Object.entries(aiAnalysis).map(([type, content]) => (
                <div key={type} className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                    <span className="text-2xl">
                      {type === 'market' && '📈'}
                      {type === 'viability' && '⭐'}
                      {type === 'risks' && '⚠️'}
                      {type === 'opportunities' && '🎯'}
                      {type === 'recommendations' && '💡'}
                    </span>
                    {type === 'market' && 'Análise de Mercado'}
                    {type === 'viability' && 'Análise de Viabilidade'}
                    {type === 'risks' && 'Análise de Riscos'}
                    {type === 'opportunities' && 'Oportunidades Identificadas'}
                    {type === 'recommendations' && 'Recomendações Estratégicas'}
                  </h3>
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                      {content}
                    </div>
                  </div>
                </div>
              ))}

              {Object.keys(aiAnalysis).length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-xl font-semibold mb-2">Pronto para análises inteligentes</h3>
                  <p className="text-gray-400">Clique nos botões acima para gerar análises personalizadas com IA</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-8">
              {/* Métricas Principais */}
              <div className="grid md:grid-cols-4 gap-6">
                {mockMetrics.map((metric, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl">{metric.icon}</span>
                      <span className="text-lg">{getTrendIcon(metric.trend)}</span>
                    </div>
                    <h3 className="text-sm text-gray-400 mb-2">{metric.title}</h3>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-bold">{metric.value}</span>
                      <span className={`text-sm font-medium ${
                        metric.trend === 'up' ? 'text-green-400' : 
                        metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Métricas Financeiras */}
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-3xl">💰</span>
                  Projeções Financeiras
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-green-400 mb-4">Receita Projetada</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Ano 1:</span>
                        <span className="font-bold text-green-400">R$ 240K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Ano 2:</span>
                        <span className="font-bold text-green-400">R$ 720K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Ano 3:</span>
                        <span className="font-bold text-green-400">R$ 1.8M</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-400 mb-4">Custos Operacionais</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Pessoal:</span>
                        <span className="font-bold">R$ 120K/ano</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Infraestrutura:</span>
                        <span className="font-bold">R$ 24K/ano</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Marketing:</span>
                        <span className="font-bold">R$ 36K/ano</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-purple-400 mb-4">KPIs de Crescimento</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">CAC:</span>
                        <span className="font-bold text-purple-400">R$ 150</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">LTV:</span>
                        <span className="font-bold text-purple-400">R$ 2.400</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Churn:</span>
                        <span className="font-bold text-purple-400">5%/mês</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Métricas de Produto */}
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-3xl">📊</span>
                  Métricas de Produto
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Usuários Ativos', value: '2.5K', change: '+25%', icon: '👥' },
                    { label: 'Taxa de Conversão', value: '12%', change: '+3%', icon: '🎯' },
                    { label: 'NPS Score', value: '72', change: '+8', icon: '⭐' },
                    { label: 'Tempo de Setup', value: '4.2min', change: '-0.8min', icon: '⚡' }
                  ].map((metric, index) => (
                    <div key={index} className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{metric.icon}</span>
                        <span className="text-sm text-gray-400">{metric.label}</span>
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-xl font-bold">{metric.value}</span>
                        <span className="text-sm text-green-400">{metric.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'action-plan' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-3xl">📋</span>
                  Plano de Ação Estratégico
                </h2>
                
                {/* Próximos 30 dias */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-green-400">🎯 Próximos 30 dias</h3>
                  <div className="space-y-3">
                    {[
                      'Validar MVP com 10 clientes beta',
                      'Implementar sistema de feedback',
                      'Definir pricing strategy final',
                      'Criar landing page de conversão',
                      'Estruturar processo de onboarding'
                    ].map((task, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                        <div className="w-6 h-6 border-2 border-green-500 rounded-full"></div>
                        <span className="text-gray-300">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Próximos 60 dias */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-blue-400">🚀 Próximos 60 dias</h3>
                  <div className="space-y-3">
                    {[
                      'Desenvolver integrações principais (Shopify, WooCommerce)',
                      'Contratar primeiro desenvolvedor',
                      'Implementar sistema de analytics',
                      'Criar programa de parcerias',
                      'Lançar campanha de marketing digital'
                    ].map((task, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        <div className="w-6 h-6 border-2 border-blue-500 rounded-full"></div>
                        <span className="text-gray-300">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Próximos 90 dias */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-purple-400">💰 Próximos 90 dias</h3>
                  <div className="space-y-3">
                    {[
                      'Estruturar round de investimento Seed',
                      'Expandir equipe (2 devs + 1 marketing)',
                      'Implementar funcionalidades avançadas de IA',
                      'Estabelecer parcerias estratégicas',
                      'Preparar para escala (100+ clientes)'
                    ].map((task, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                        <div className="w-6 h-6 border-2 border-purple-500 rounded-full"></div>
                        <span className="text-gray-300">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pitch' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-3xl">🎤</span>
                  Pitch Deck Completo
                </h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: '1. Problema',
                      content: 'E-commerces perdem 67% dos clientes por atendimento inadequado. Custos operacionais altos e baixa satisfação.',
                      icon: '❗',
                      color: 'from-red-600 to-pink-600'
                    },
                    {
                      title: '2. Solução',
                      content: 'Plataforma SaaS de automação inteligente: setup em 5min, atendimento 24/7, ROI em 30 dias.',
                      icon: '💡',
                      color: 'from-yellow-600 to-orange-600'
                    },
                    {
                      title: '3. Mercado',
                      content: 'TAM: R$ 2.5B no Brasil. Crescimento de 25% ao ano. 180K e-commerces no segmento-alvo.',
                      icon: '📊',
                      color: 'from-green-600 to-emerald-600'
                    },
                    {
                      title: '4. Produto',
                      content: 'IA conversacional, integrações nativas, dashboard analytics, automação de workflows.',
                      icon: '🚀',
                      color: 'from-blue-600 to-cyan-600'
                    },
                    {
                      title: '5. Modelo de Negócio',
                      content: 'SaaS B2B: Freemium + Premium (R$ 99-499/mês). LTV: R$ 2.400, CAC: R$ 150.',
                      icon: '💰',
                      color: 'from-purple-600 to-violet-600'
                    },
                    {
                      title: '6. Tração',
                      content: '10 clientes beta, NPS 72, 12% conversão. Parcerias com 3 integradores.',
                      icon: '📈',
                      color: 'from-indigo-600 to-purple-600'
                    }
                  ].map((slide, index) => (
                    <div key={index} className={`bg-gradient-to-br ${slide.color} p-6 rounded-xl text-white`}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{slide.icon}</span>
                        <h3 className="text-lg font-bold">{slide.title}</h3>
                      </div>
                      <p className="text-sm leading-relaxed opacity-90">{slide.content}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 bg-gray-800/30 border border-gray-700/30 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Pedido de Investimento
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400 mb-2">R$ 150K</div>
                      <div className="text-gray-400">Investimento Seed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400 mb-2">18 meses</div>
                      <div className="text-gray-400">Para Break-even</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400 mb-2">10x</div>
                      <div className="text-gray-400">ROI Projetado</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-3xl">💰</span>
                  Estratégia de Vendas
                </h2>
                
                {/* Canais de Venda */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-green-400">🎯 Onde Vender</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      {
                        channel: 'LinkedIn B2B',
                        description: 'Prospecção ativa para tomadores de decisão em e-commerces',
                        potential: 'Alto',
                        cost: 'Baixo',
                        timeline: '30 dias'
                      },
                      {
                        channel: 'Parcerias com Integradores',
                        description: 'Agências e consultores especializados em e-commerce',
                        potential: 'Muito Alto',
                        cost: 'Médio',
                        timeline: '60 dias'
                      },
                      {
                        channel: 'Eventos de E-commerce',
                        description: 'Feiras, conferências e meetups do setor',
                        potential: 'Alto',
                        cost: 'Alto',
                        timeline: '90 dias'
                      },
                      {
                        channel: 'Marketing de Conteúdo',
                        description: 'Blog, webinars e cases de sucesso',
                        potential: 'Médio',
                        cost: 'Baixo',
                        timeline: '45 dias'
                      }
                    ].map((channel, index) => (
                      <div key={index} className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-6">
                        <h4 className="font-semibold text-lg mb-3 text-blue-400">{channel.channel}</h4>
                        <p className="text-gray-300 mb-4 text-sm">{channel.description}</p>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-gray-400">Potencial:</span>
                            <div className={`font-medium ${
                              channel.potential === 'Muito Alto' ? 'text-green-400' :
                              channel.potential === 'Alto' ? 'text-yellow-400' : 'text-blue-400'
                            }`}>{channel.potential}</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Custo:</span>
                            <div className="font-medium text-gray-300">{channel.cost}</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Timeline:</span>
                            <div className="font-medium text-gray-300">{channel.timeline}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Como Vender */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-blue-400">🚀 Como Vender</h3>
                  <div className="space-y-4">
                    {[
                      {
                        step: '1. Qualificação',
                        description: 'Identificar e-commerces com 10-100 funcionários, alto volume de atendimento',
                        tools: 'LinkedIn Sales Navigator, Apollo.io'
                      },
                      {
                        step: '2. Primeiro Contato',
                        description: 'Abordagem consultiva focando em dores específicas do atendimento',
                        tools: 'Email personalizado, LinkedIn InMail'
                      },
                      {
                        step: '3. Demo Personalizada',
                        description: 'Demonstração focada nos casos de uso específicos do prospect',
                        tools: 'Calendly, Zoom, ambiente de demo'
                      },
                      {
                        step: '4. Trial Gratuito',
                        description: 'Período de teste de 14 dias com suporte dedicado',
                        tools: 'Plataforma própria, Intercom'
                      },
                      {
                        step: '5. Fechamento',
                        description: 'Proposta comercial baseada em ROI demonstrado no trial',
                        tools: 'PandaDoc, análise de ROI'
                      }
                    ].map((step, index) => (
                      <div key={index} className="flex gap-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-400 mb-2">{step.step}</h4>
                          <p className="text-gray-300 text-sm mb-2">{step.description}</p>
                          <p className="text-xs text-gray-400">Ferramentas: {step.tools}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metas de Vendas */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-purple-400">📊 Metas de Vendas</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6 text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-2">20 clientes</div>
                      <div className="text-gray-400 text-sm">Primeiros 3 meses</div>
                    </div>
                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6 text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-2">R$ 50K MRR</div>
                      <div className="text-gray-400 text-sm">Até mês 6</div>
                    </div>
                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6 text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-2">100 clientes</div>
                      <div className="text-gray-400 text-sm">Final do ano 1</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mvp-access' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-3xl">🚀</span>
                  Acesso ao Seu MVP
                </h2>
                
                {/* Status do MVP */}
                <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">✅</span>
                    <h3 className="text-xl font-semibold text-green-400">MVP Criado com Sucesso!</h3>
                  </div>
                  <p className="text-gray-300 mb-4">
                    Seu MVP de automação de atendimento foi criado e está pronto para uso. 
                    Todas as funcionalidades principais foram implementadas.
                  </p>
                  <div className="flex gap-4">
                    <Link
                      to="/mvp-builder"
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2"
                    >
                      <span>🔧</span>
                      Acessar MVP Builder
                    </Link>
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                      <span>👁️</span>
                      Preview do MVP
                    </button>
                  </div>
                </div>

                {/* Funcionalidades Implementadas */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-blue-400">🎯 Funcionalidades Implementadas</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { feature: 'Chat Bot Inteligente', status: 'Completo', icon: '🤖' },
                      { feature: 'Dashboard Analytics', status: 'Completo', icon: '📊' },
                      { feature: 'Integração E-commerce', status: 'Completo', icon: '🛒' },
                      { feature: 'Sistema de Tickets', status: 'Completo', icon: '🎫' },
                      { feature: 'Automação de Workflows', status: 'Completo', icon: '⚡' },
                      { feature: 'Relatórios de Performance', status: 'Completo', icon: '📈' },
                      { feature: 'API para Integrações', status: 'Completo', icon: '🔌' },
                      { feature: 'Sistema de Notificações', status: 'Completo', icon: '🔔' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/30 border border-gray-700/30 rounded-lg">
                        <span className="text-xl">{item.icon}</span>
                        <div className="flex-1">
                          <span className="text-gray-300">{item.feature}</span>
                        </div>
                        <span className="text-green-400 text-sm font-medium">{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Próximos Passos para o MVP */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-purple-400">🔮 Próximas Evoluções</h3>
                  <div className="space-y-3">
                    {[
                      'Implementar IA mais avançada com GPT-4',
                      'Adicionar suporte a múltiplos idiomas',
                      'Criar app mobile para gestores',
                      'Integrar com mais plataformas de e-commerce',
                      'Desenvolver marketplace de templates'
                    ].map((evolution, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                        <div className="w-6 h-6 border-2 border-purple-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        </div>
                        <span className="text-gray-300">{evolution}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IA Quick Insights */}
          {Object.keys(aiAnalysis).length > 0 && (
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 mt-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-xl">🤖</span>
                Insights da IA
                <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full">Novo</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(aiAnalysis).slice(0, 2).map(([type, content]) => (
                  <div key={type} className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-4">
                    <h4 className="font-medium mb-2 text-purple-300">
                      {type === 'market' && '📈 Mercado'}
                      {type === 'viability' && '⭐ Viabilidade'}
                      {type === 'risks' && '⚠️ Riscos'}
                      {type === 'opportunities' && '🎯 Oportunidades'}
                      {type === 'recommendations' && '💡 Recomendações'}
                    </h4>
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {content?.substring(0, 150)}...
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab('ai-analysis')}
                className="mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
              >
                Ver todas as análises →
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-12">
            <button 
              onClick={() => generateAiAnalysis('recommendations')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-2"
            >
              <span>🤖</span>
              Gerar Relatório IA
            </button>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              📤 Exportar Plano Completo
            </button>
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
              📧 Compartilhar com Investidores
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}