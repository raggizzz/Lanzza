import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { DatabaseService } from '~/lib/services/database';
import { supabaseHelpers } from '~/lib/supabase/client';
import type { UpdateProjectRequest } from '~/types/database';

// GET /api/projects/:id - Obter projeto específico
export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const { data: { user } } = await supabaseHelpers.auth.getUser();
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    if (!projectId) {
      return json({ error: 'Project ID is required' }, { status: 400 });
    }

    const project = await DatabaseService.getProject(projectId, user.id);
    
    if (!project) {
      return json({ error: 'Project not found' }, { status: 404 });
    }

    return json({ project });
  } catch (error) {
    console.error('Error in project loader:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/projects/:id - Atualizar projeto
// DELETE /api/projects/:id - Deletar projeto
export async function action({ request, params }: ActionFunctionArgs) {
  try {
    const { data: { user } } = await supabaseHelpers.auth.getUser();
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    if (!projectId) {
      return json({ error: 'Project ID is required' }, { status: 400 });
    }

    const method = request.method;

    if (method === 'PUT') {
      const updates: UpdateProjectRequest = await request.json();
      
      const project = await DatabaseService.updateProject(projectId, user.id, updates);
      
      if (!project) {
        return json({ error: 'Failed to update project or project not found' }, { status: 404 });
      }

      return json({ project });
    }

    if (method === 'DELETE') {
      const success = await DatabaseService.deleteProject(projectId, user.id);
      
      if (!success) {
        return json({ error: 'Failed to delete project or project not found' }, { status: 404 });
      }

      return json({ message: 'Project deleted successfully' });
    }

    return json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    console.error('Error in project action:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}