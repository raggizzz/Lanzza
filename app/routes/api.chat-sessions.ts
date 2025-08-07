import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { DatabaseService } from '~/lib/services/database';
import { supabaseHelpers } from '~/lib/supabase/client';
import type { CreateChatSessionRequest, PaginationParams } from '~/types/database';

// GET /api/chat-sessions - Listar sessões de chat do usuário
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { data: { user } } = await supabaseHelpers.auth.getUser();
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const projectId = searchParams.get('project_id') || undefined;

    // Paginação
    const pagination: PaginationParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sort_by: searchParams.get('sort_by') || 'updated_at',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
    };

    const result = await DatabaseService.getChatSessions(user.id, projectId, pagination);
    
    if (!result) {
      return json({ error: 'Failed to fetch chat sessions' }, { status: 500 });
    }

    return json(result);
  } catch (error) {
    console.error('Error in chat sessions loader:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/chat-sessions - Criar nova sessão de chat
export async function action({ request }: ActionFunctionArgs) {
  try {
    const { data: { user } } = await supabaseHelpers.auth.getUser();
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const method = request.method;

    if (method === 'POST') {
      const sessionData: CreateChatSessionRequest = await request.json();
      
      // Validação básica
      if (!sessionData.title || !sessionData.type) {
        return json({ error: 'Title and type are required' }, { status: 400 });
      }

      const session = await DatabaseService.createChatSession(user.id, sessionData);
      
      if (!session) {
        return json({ error: 'Failed to create chat session' }, { status: 500 });
      }

      return json({ session }, { status: 201 });
    }

    return json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    console.error('Error in chat sessions action:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}