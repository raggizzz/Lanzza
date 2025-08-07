import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { DatabaseService } from '~/lib/services/database';
import { supabaseHelpers } from '~/lib/supabase/client';
import type { CreateChatMessageRequest, PaginationParams } from '~/types/database';

// GET /api/chat-messages?session_id=xxx - Listar mensagens de uma sessão
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { data: { user } } = await supabaseHelpers.auth.getUser();
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      return json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Verificar se o usuário tem acesso à sessão
    const sessions = await DatabaseService.getChatSessions(user.id);
    const hasAccess = sessions?.data.some(session => session.id === sessionId);
    
    if (!hasAccess) {
      return json({ error: 'Access denied to this chat session' }, { status: 403 });
    }

    // Paginação
    const pagination: PaginationParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
      sort_by: searchParams.get('sort_by') || 'created_at',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc',
    };

    const result = await DatabaseService.getChatMessages(sessionId, pagination);
    
    if (!result) {
      return json({ error: 'Failed to fetch chat messages' }, { status: 500 });
    }

    return json(result);
  } catch (error) {
    console.error('Error in chat messages loader:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/chat-messages - Criar nova mensagem
export async function action({ request }: ActionFunctionArgs) {
  try {
    const { data: { user } } = await supabaseHelpers.auth.getUser();
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const method = request.method;

    if (method === 'POST') {
      const messageData: CreateChatMessageRequest = await request.json();
      
      // Validação básica
      if (!messageData.session_id || !messageData.role || !messageData.content) {
        return json({ error: 'Session ID, role, and content are required' }, { status: 400 });
      }

      // Verificar se o usuário tem acesso à sessão
      const sessions = await DatabaseService.getChatSessions(user.id);
      const hasAccess = sessions?.data.some(session => session.id === messageData.session_id);
      
      if (!hasAccess) {
        return json({ error: 'Access denied to this chat session' }, { status: 403 });
      }

      const message = await DatabaseService.createChatMessage(messageData);
      
      if (!message) {
        return json({ error: 'Failed to create chat message' }, { status: 500 });
      }

      return json({ message }, { status: 201 });
    }

    return json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    console.error('Error in chat messages action:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}