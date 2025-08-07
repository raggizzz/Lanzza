// Tipos do banco de dados
export interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  company?: string;
  role?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: 'mvp' | 'business_plan' | 'canvas' | 'pitch_deck' | 'market_analysis';
  status: 'active' | 'completed' | 'paused' | 'archived';
  data: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  project_id?: string;
  title: string;
  type: 'mvp' | 'business' | 'technical' | 'general';
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Template {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: 'business_canvas' | 'mvp_template' | 'pitch_deck' | 'market_analysis';
  template_data: Record<string, any>;
  is_public: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  user_id: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size?: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AIAnalysis {
  id: string;
  project_id: string;
  user_id: string;
  analysis_type: 'market' | 'viability' | 'risks' | 'competition' | 'financial';
  prompt: string;
  result: Record<string, any>;
  model_used?: string;
  created_at: string;
}

export interface ProjectMetric {
  id: string;
  project_id: string;
  user_id: string;
  metric_name: string;
  metric_value?: number;
  metric_unit?: string;
  period_start?: string;
  period_end?: string;
  metadata: Record<string, any>;
  created_at: string;
}

// Tipos para requests da API
export interface CreateProjectRequest {
  name: string;
  description?: string;
  type: Project['type'];
  data?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: Project['status'];
  data?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface CreateChatSessionRequest {
  title: string;
  type: ChatSession['type'];
  project_id?: string;
}

export interface CreateChatMessageRequest {
  session_id: string;
  role: ChatMessage['role'];
  content: string;
  metadata?: Record<string, any>;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  type: Template['type'];
  template_data: Record<string, any>;
  is_public?: boolean;
  tags?: string[];
}

export interface CreateAIAnalysisRequest {
  project_id: string;
  analysis_type: AIAnalysis['analysis_type'];
  prompt: string;
  result: Record<string, any>;
  model_used?: string;
}

export interface CreateProjectMetricRequest {
  project_id: string;
  metric_name: string;
  metric_value?: number;
  metric_unit?: string;
  period_start?: string;
  period_end?: string;
  metadata?: Record<string, any>;
}

// Tipos para responses da API
export interface ProjectWithStats extends Project {
  chat_sessions_count?: number;
  files_count?: number;
  analyses_count?: number;
  last_activity?: string;
}

export interface ChatSessionWithMessages extends ChatSession {
  messages?: ChatMessage[];
  messages_count?: number;
}

export interface UserStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_chat_sessions: number;
  total_analyses: number;
  total_templates: number;
  storage_used: number; // em bytes
}

// Tipos para filtros e paginação
export interface ProjectFilters {
  type?: Project['type'];
  status?: Project['status'];
  search?: string;
  created_after?: string;
  created_before?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}