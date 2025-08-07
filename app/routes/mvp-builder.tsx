import { json, type MetaFunction, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Link, useLoaderData } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';
import { supabaseHelpers } from '~/lib/supabase/client';
import { DatabaseService } from '~/lib/services/database';
import { useProjects } from '~/lib/hooks/useProjects';
import { useState, useEffect } from 'react';

export const meta: MetaFunction = () => {
  return [{ title: 'Construtor MVP - Lanzza' }, { name: 'description', content: 'Construa seu MVP com assistência de IA' }];
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
    
    if (!user) {
      return json({ user: null, currentProject: null });
    }

    // Buscar projeto ativo do usuário (último projeto ou criar um novo)
    const projects = await DatabaseService.getProjects(user.id, {});
    let currentProject = projects?.data?.[0] || null;

    // Se não há projeto, criar um novo projeto MVP
    if (!currentProject) {
      currentProject = await DatabaseService.createProject(user.id, {
        name: `MVP ${new Date().toLocaleDateString()}`,
        description: 'Projeto MVP criado automaticamente',
        type: 'mvp'
      });
    }

    return json({ user, currentProject });
  } catch (error) {
    console.error('Erro no loader do MVP Builder:', error);
    return json({ user: null, currentProject: null });
  }
};

export default function MVPBuilder() {
  const { user, currentProject } = useLoaderData<typeof loader>();
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Criar sessão de chat quando componente carrega
  useEffect(() => {
    if (user && currentProject && !sessionId) {
      // A sessão será criada automaticamente na primeira mensagem
      // através do sistema de chat integrado
    }
  }, [user, currentProject, sessionId]);

  return (
    <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1 relative">
      <BackgroundRays />
      <Header />
      
      {/* Informações do projeto atual */}
      {currentProject && (
        <div className="fixed top-20 right-6 z-40">
          <div className="bg-black/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 text-white max-w-xs">
            <div className="text-sm text-gray-400 mb-2">Projeto Atual</div>
            <div className="text-sm font-medium">{currentProject.name}</div>
            <div className="text-xs text-gray-500 mt-1">
              Criado em {new Date(currentProject.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
      
      <ClientOnly fallback={<BaseChat />}>
        {() => (
          <Chat 
            initialContext={{
              projectId: currentProject?.id || '',
              chatMode: 'build'
            }}
          />
        )}
      </ClientOnly>
      
      {/* Botão para avançar para próxima fase */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          to={currentProject ? `/dashboard-final?projectId=${currentProject.id}` : "/dashboard-final"}
          className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full font-medium shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          <span className="text-lg">✅</span>
          <span>Finalizar MVP</span>
          <span className="text-lg group-hover:translate-x-1 transition-transform duration-300">→</span>
        </Link>
      </div>
      
      {/* Indicador de progresso da jornada */}
      <div className="fixed top-20 left-6 z-40">
        <div className="bg-black/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 text-white">
          <div className="text-sm text-gray-400 mb-2">Progresso da Jornada</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="text-sm">Fase 4/5 - MVP Builder</div>
          </div>
          <div className="text-xs text-gray-500 mt-1">80% concluído</div>
          {user && (
            <div className="text-xs text-blue-400 mt-2">
              Logado como {user.email || 'Usuário'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}