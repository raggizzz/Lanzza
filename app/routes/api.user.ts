import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { DatabaseService } from '~/lib/services/database';
import { supabaseHelpers } from '~/lib/supabase/client';
import type { UserProfile } from '~/types/database';

// GET /api/user - Obter perfil e estatísticas do usuário
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { data: { user } } = await supabaseHelpers.auth.getUser();
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const includeStats = searchParams.get('include_stats') === 'true';

    const profile = await DatabaseService.getUserProfile(user.id);
    
    if (!profile) {
      return json({ error: 'User profile not found' }, { status: 404 });
    }

    let stats = null;
    if (includeStats) {
      stats = await DatabaseService.getUserStats(user.id);
    }

    return json({ 
      profile,
      stats: includeStats ? stats : undefined
    });
  } catch (error) {
    console.error('Error in user loader:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/user - Atualizar perfil do usuário
export async function action({ request }: ActionFunctionArgs) {
  try {
    const { data: { user } } = await supabaseHelpers.auth.getUser();
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const method = request.method;

    if (method === 'PUT') {
      const updates: Partial<UserProfile> = await request.json();
      
      // Remover campos que não devem ser atualizados pelo usuário
      delete updates.id;
      delete updates.created_at;
      delete updates.updated_at;

      const profile = await DatabaseService.updateUserProfile(user.id, updates);
      
      if (!profile) {
        return json({ error: 'Failed to update user profile' }, { status: 500 });
      }

      return json({ profile });
    }

    return json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    console.error('Error in user action:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}