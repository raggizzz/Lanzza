import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { DatabaseService } from '~/lib/services/database';
import { supabaseHelpers } from '~/lib/supabase/client';
import type { CreateProjectRequest, UpdateProjectRequest, ProjectFilters, PaginationParams } from '~/types/database';

// GET /api/projects - Listar projetos do usuário
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { data: { user } } = await supabaseHelpers.auth.getUser();
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Filtros
    const filters: ProjectFilters = {
      type: searchParams.get('type') as any || undefined,
      status: searchParams.get('status') as any || undefined,
      search: searchParams.get('search') || undefined,
      created_after: searchParams.get('created_after') || undefined,
      created_before: searchParams.get('created_before') || undefined,
    };

    // Paginação
    const pagination: PaginationParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sort_by: searchParams.get('sort_by') || 'updated_at',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
    };

    const result = await DatabaseService.getProjects(user.id, filters, pagination);
    
    if (!result) {
      return json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    return json(result);
  } catch (error) {
    console.error('Error in projects loader:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/projects - Criar novo projeto
export async function action({ request }: ActionFunctionArgs) {
  try {
    const { data: { user } } = await supabaseHelpers.auth.getUser();
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const method = request.method;

    if (method === 'POST') {
      const projectData: CreateProjectRequest = await request.json();
      
      // Validação básica
      if (!projectData.name || !projectData.type) {
        return json({ error: 'Name and type are required' }, { status: 400 });
      }

      const project = await DatabaseService.createProject(user.id, projectData);
      
      if (!project) {
        return json({ error: 'Failed to create project' }, { status: 500 });
      }

      return json({ project }, { status: 201 });
    }

    return json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    console.error('Error in projects action:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}