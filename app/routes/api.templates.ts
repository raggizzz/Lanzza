import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { DatabaseService } from '~/lib/services/database';
import { supabaseHelpers } from '~/lib/supabase/client';
import type { CreateTemplateRequest, PaginationParams } from '~/types/database';

// GET /api/templates - Listar templates do usuário e públicos
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { data: { user } } = await supabaseHelpers.auth.getUser();
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const includePublic = searchParams.get('include_public') !== 'false';

    // Paginação
    const pagination: PaginationParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sort_by: searchParams.get('sort_by') || 'updated_at',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
    };

    const result = await DatabaseService.getTemplates(user.id, includePublic, pagination);
    
    if (!result) {
      return json({ error: 'Failed to fetch templates' }, { status: 500 });
    }

    return json(result);
  } catch (error) {
    console.error('Error in templates loader:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/templates - Criar novo template
export async function action({ request }: ActionFunctionArgs) {
  try {
    const { data: { user } } = await supabaseHelpers.auth.getUser();
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const method = request.method;

    if (method === 'POST') {
      const templateData: CreateTemplateRequest = await request.json();
      
      // Validação básica
      if (!templateData.name || !templateData.type || !templateData.template_data) {
        return json({ error: 'Name, type, and template data are required' }, { status: 400 });
      }

      const template = await DatabaseService.createTemplate(user.id, templateData);
      
      if (!template) {
        return json({ error: 'Failed to create template' }, { status: 500 });
      }

      return json({ template }, { status: 201 });
    }

    return json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    console.error('Error in templates action:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}