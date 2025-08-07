import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { DatabaseService } from '~/lib/services/database';
import { supabaseHelpers } from '~/lib/supabase/client';
import type { CreateAIAnalysisRequest } from '~/types/database';

// GET /api/ai-analyses?project_id=xxx - Listar análises de um projeto
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { data: { user } } = await supabaseHelpers.auth.getUser();
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const projectId = searchParams.get('project_id');
    if (!projectId) {
      return json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Verificar se o usuário tem acesso ao projeto
    const project = await DatabaseService.getProject(projectId, user.id);
    if (!project) {
      return json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    const analyses = await DatabaseService.getProjectAnalyses(projectId, user.id);
    
    return json({ analyses });
  } catch (error) {
    console.error('Error in AI analyses loader:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/ai-analyses - Criar nova análise de IA
export async function action({ request }: ActionFunctionArgs) {
  try {
    const { data: { user } } = await supabaseHelpers.auth.getUser();
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const method = request.method;

    if (method === 'POST') {
      const analysisData: CreateAIAnalysisRequest = await request.json();
      
      // Validação básica
      if (!analysisData.project_id || !analysisData.analysis_type || !analysisData.prompt || !analysisData.result) {
        return json({ error: 'Project ID, analysis type, prompt, and result are required' }, { status: 400 });
      }

      // Verificar se o usuário tem acesso ao projeto
      const project = await DatabaseService.getProject(analysisData.project_id, user.id);
      if (!project) {
        return json({ error: 'Project not found or access denied' }, { status: 404 });
      }

      const analysis = await DatabaseService.createAIAnalysis(user.id, analysisData);
      
      if (!analysis) {
        return json({ error: 'Failed to create AI analysis' }, { status: 500 });
      }

      return json({ analysis }, { status: 201 });
    }

    return json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    console.error('Error in AI analyses action:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}