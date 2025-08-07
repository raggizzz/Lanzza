import { supabase } from '../supabase/client';
import type {
  UserProfile,
  Project,
  ChatSession,
  ChatMessage,
  Template,
  ProjectFile,
  AIAnalysis,
  ProjectMetric,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateChatSessionRequest,
  CreateChatMessageRequest,
  CreateTemplateRequest,
  CreateAIAnalysisRequest,
  CreateProjectMetricRequest,
  ProjectWithStats,
  ChatSessionWithMessages,
  UserStats,
  ProjectFilters,
  PaginationParams,
  PaginatedResponse
} from '../../types/database';

export class DatabaseService {
  // ===== USER PROFILES =====
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  }

  static async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const [projectsResult, sessionsResult, analysesResult, templatesResult] = await Promise.all([
        supabase.from('projects').select('status', { count: 'exact' }).eq('user_id', userId),
        supabase.from('chat_sessions').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('ai_analyses').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('templates').select('id', { count: 'exact' }).eq('user_id', userId)
      ]);

      const projects = projectsResult.data || [];
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;

      return {
        total_projects: projectsResult.count || 0,
        active_projects: activeProjects,
        completed_projects: completedProjects,
        total_chat_sessions: sessionsResult.count || 0,
        total_analyses: analysesResult.count || 0,
        total_templates: templatesResult.count || 0,
        storage_used: 0 // TODO: Implementar cálculo de storage
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }

  // ===== PROJECTS =====
  static async getProjects(
    userId: string,
    filters: ProjectFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<ProjectWithStats> | null> {
    try {
      const { page = 1, limit = 10, sort_by = 'updated_at', sort_order = 'desc' } = pagination;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('projects')
        .select(`
          *,
          chat_sessions:chat_sessions(count),
          project_files:project_files(count),
          ai_analyses:ai_analyses(count)
        `, { count: 'exact' })
        .eq('user_id', userId);

      // Aplicar filtros
      if (filters.type) query = query.eq('type', filters.type);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.created_after) query = query.gte('created_at', filters.created_after);
      if (filters.created_before) query = query.lte('created_at', filters.created_before);

      // Aplicar ordenação e paginação
      query = query
        .order(sort_by, { ascending: sort_order === 'asc' })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching projects:', error);
        return null;
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: data?.map(project => ({
          ...project,
          chat_sessions_count: project.chat_sessions?.[0]?.count || 0,
          files_count: project.project_files?.[0]?.count || 0,
          analyses_count: project.ai_analyses?.[0]?.count || 0
        })) || [],
        pagination: {
          page,
          limit,
          total,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1
        }
      };
    } catch (error) {
      console.error('Error fetching projects:', error);
      return null;
    }
  }

  static async getProject(projectId: string, userId: string): Promise<ProjectWithStats | null> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        chat_sessions:chat_sessions(count),
        project_files:project_files(count),
        ai_analyses:ai_analyses(count)
      `)
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      return null;
    }

    return {
      ...data,
      chat_sessions_count: data.chat_sessions?.[0]?.count || 0,
      files_count: data.project_files?.[0]?.count || 0,
      analyses_count: data.ai_analyses?.[0]?.count || 0
    };
  }

  static async createProject(userId: string, projectData: CreateProjectRequest): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        ...projectData
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return null;
    }

    return data;
  }

  static async updateProject(
    projectId: string,
    userId: string,
    updates: UpdateProjectRequest
  ): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return null;
    }

    return data;
  }

  static async deleteProject(projectId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting project:', error);
      return false;
    }

    return true;
  }

  // ===== CHAT SESSIONS =====
  static async getChatSessions(
    userId: string,
    projectId?: string,
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<ChatSessionWithMessages> | null> {
    try {
      const { page = 1, limit = 10, sort_by = 'updated_at', sort_order = 'desc' } = pagination;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('chat_sessions')
        .select(`
          *,
          messages:chat_messages(count)
        `, { count: 'exact' })
        .eq('user_id', userId);

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      query = query
        .order(sort_by, { ascending: sort_order === 'asc' })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching chat sessions:', error);
        return null;
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: data?.map(session => ({
          ...session,
          messages_count: session.messages?.[0]?.count || 0
        })) || [],
        pagination: {
          page,
          limit,
          total,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1
        }
      };
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      return null;
    }
  }

  static async createChatSession(
    userId: string,
    sessionData: CreateChatSessionRequest
  ): Promise<ChatSession | null> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        ...sessionData
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat session:', error);
      return null;
    }

    return data;
  }

  // ===== CHAT MESSAGES =====
  static async getChatMessages(
    sessionId: string,
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<ChatMessage> | null> {
    try {
      const { page = 1, limit = 50, sort_by = 'created_at', sort_order = 'asc' } = pagination;
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact' })
        .eq('session_id', sessionId)
        .order(sort_by, { ascending: sort_order === 'asc' })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching chat messages:', error);
        return null;
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1
        }
      };
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return null;
    }
  }

  static async createChatMessage(messageData: CreateChatMessageRequest): Promise<ChatMessage | null> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(messageData)
      .select()
      .single();

    if (error) {
      console.error('Error creating chat message:', error);
      return null;
    }

    return data;
  }

  // ===== AI ANALYSES =====
  static async createAIAnalysis(
    userId: string,
    analysisData: CreateAIAnalysisRequest
  ): Promise<AIAnalysis | null> {
    const { data, error } = await supabase
      .from('ai_analyses')
      .insert({
        user_id: userId,
        ...analysisData
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating AI analysis:', error);
      return null;
    }

    return data;
  }

  static async getProjectAnalyses(
    projectId: string,
    userId: string
  ): Promise<AIAnalysis[]> {
    const { data, error } = await supabase
      .from('ai_analyses')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching project analyses:', error);
      return [];
    }

    return data || [];
  }

  // ===== TEMPLATES =====
  static async getTemplates(
    userId: string,
    includePublic: boolean = true,
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Template> | null> {
    try {
      const { page = 1, limit = 10, sort_by = 'updated_at', sort_order = 'desc' } = pagination;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('templates')
        .select('*', { count: 'exact' });

      if (includePublic) {
        query = query.or(`user_id.eq.${userId},is_public.eq.true`);
      } else {
        query = query.eq('user_id', userId);
      }

      query = query
        .order(sort_by, { ascending: sort_order === 'asc' })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching templates:', error);
        return null;
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1
        }
      };
    } catch (error) {
      console.error('Error fetching templates:', error);
      return null;
    }
  }

  static async createTemplate(
    userId: string,
    templateData: CreateTemplateRequest
  ): Promise<Template | null> {
    const { data, error } = await supabase
      .from('templates')
      .insert({
        user_id: userId,
        ...templateData
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      return null;
    }

    return data;
  }

  // ===== PROJECT METRICS =====
  static async createProjectMetric(
    userId: string,
    metricData: CreateProjectMetricRequest
  ): Promise<ProjectMetric | null> {
    const { data, error } = await supabase
      .from('project_metrics')
      .insert({
        user_id: userId,
        ...metricData
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project metric:', error);
      return null;
    }

    return data;
  }

  static async getProjectMetrics(
    projectId: string,
    userId: string
  ): Promise<ProjectMetric[]> {
    const { data, error } = await supabase
      .from('project_metrics')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching project metrics:', error);
      return [];
    }

    return data || [];
  }
}