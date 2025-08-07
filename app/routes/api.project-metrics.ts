import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { DatabaseService } from '~/lib/services/database';
import { supabaseHelpers } from '~/lib/supabase/client';
import type { CreateProjectMetricRequest } from '~/types/database';

// GET /api/project-metrics?project_id=xxx - Listar métricas de um projeto
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

    const metrics = await DatabaseService.getProjectMetrics(projectId, user.id);
    
    return json({ metrics });
  } catch (error) {
    console.error('Error in project metrics loader:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/project-metrics - Criar nova métrica
export async function action({ request }: ActionFunctionArgs) {
  try {
    const { data: { user } } = await supabaseHelpers.auth.getUser();
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const method = request.method;

    if (method === 'POST') {
      const metricData: CreateProjectMetricRequest = await request.json();
      
      // Validação básica
      if (!metricData.project_id || !metricData.metric_name) {
        return json({ error: 'Project ID and metric name are required' }, { status: 400 });
      }

      // Verificar se o usuário tem acesso ao projeto
      const project = await DatabaseService.getProject(metricData.project_id, user.id);
      if (!project) {
        return json({ error: 'Project not found or access denied' }, { status: 404 });
      }

      const metric = await DatabaseService.createProjectMetric(user.id, metricData);
      
      if (!metric) {
        return json({ error: 'Failed to create project metric' }, { status: 500 });
      }

      return json({ metric }, { status: 201 });
    }

    return json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    console.error('Error in project metrics action:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}