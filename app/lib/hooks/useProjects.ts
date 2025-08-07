import { useState, useEffect, useCallback } from 'react';
import type {
  Project,
  ProjectWithStats,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectFilters,
  PaginationParams,
  PaginatedResponse
} from '~/types/database';

interface UseProjectsOptions {
  filters?: ProjectFilters;
  pagination?: PaginationParams;
  autoFetch?: boolean;
}

interface UseProjectsReturn {
  projects: ProjectWithStats[];
  loading: boolean;
  error: string | null;
  pagination: PaginatedResponse<ProjectWithStats>['pagination'] | null;
  fetchProjects: () => Promise<void>;
  createProject: (data: CreateProjectRequest) => Promise<Project | null>;
  updateProject: (id: string, data: UpdateProjectRequest) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  refreshProjects: () => Promise<void>;
}

export function useProjects(options: UseProjectsOptions = {}): UseProjectsReturn {
  const { filters = {}, pagination = {}, autoFetch = true } = options;
  
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationData, setPaginationData] = useState<PaginatedResponse<ProjectWithStats>['pagination'] | null>(null);

  const buildQueryString = useCallback((filters: ProjectFilters, pagination: PaginationParams) => {
    const params = new URLSearchParams();
    
    // Filtros
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.created_after) params.append('created_after', filters.created_after);
    if (filters.created_before) params.append('created_before', filters.created_before);
    
    // Paginação
    if (pagination.page) params.append('page', pagination.page.toString());
    if (pagination.limit) params.append('limit', pagination.limit.toString());
    if (pagination.sort_by) params.append('sort_by', pagination.sort_by);
    if (pagination.sort_order) params.append('sort_order', pagination.sort_order);
    
    return params.toString();
  }, []);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryString = buildQueryString(filters, pagination);
      const response = await fetch(`/api/projects?${queryString}`);
      
      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to fetch projects');
      }
      
      const data: PaginatedResponse<ProjectWithStats> = await response.json();
      setProjects(data.data);
      setPaginationData(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setProjects([]);
      setPaginationData(null);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination, buildQueryString]);

  const createProject = useCallback(async (data: CreateProjectRequest): Promise<Project | null> => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to create project');
      }
      
      const result = await response.json() as { project: Project };
      
      // Refresh projects list
      await fetchProjects();
      
      return result.project;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  }, [fetchProjects]);

  const updateProject = useCallback(async (id: string, data: UpdateProjectRequest): Promise<Project | null> => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to update project');
      }
      
      const result = await response.json() as { project: Project };
      
      // Update local state
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...result.project } : p));
      
      return result.project;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  }, []);

  const deleteProject = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to delete project');
      }
      
      // Remove from local state
      setProjects(prev => prev.filter(p => p.id !== id));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, []);

  const refreshProjects = useCallback(async () => {
    await fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (autoFetch) {
      fetchProjects();
    }
  }, [autoFetch, fetchProjects]);

  return {
    projects,
    loading,
    error,
    pagination: paginationData,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects,
  };
}

// Hook para um projeto específico
interface UseProjectOptions {
  projectId: string;
  autoFetch?: boolean;
}

interface UseProjectReturn {
  project: ProjectWithStats | null;
  loading: boolean;
  error: string | null;
  fetchProject: () => Promise<void>;
  updateProject: (data: UpdateProjectRequest) => Promise<Project | null>;
  deleteProject: () => Promise<boolean>;
}

export function useProject(options: UseProjectOptions): UseProjectReturn {
  const { projectId, autoFetch = true } = options;
  
  const [project, setProject] = useState<ProjectWithStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      
      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to fetch project');
      }
      
      const data = await response.json() as { project: ProjectWithStats };
      setProject(data.project);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const updateProject = useCallback(async (data: UpdateProjectRequest): Promise<Project | null> => {
    if (!projectId) return null;
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to update project');
      }
      
      const result = await response.json() as { project: Project };
      setProject(prev => prev ? { ...prev, ...result.project } : result.project);
      
      return result.project;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  }, [projectId]);

  const deleteProject = useCallback(async (): Promise<boolean> => {
    if (!projectId) return false;
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to delete project');
      }
      
      setProject(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [projectId]);

  useEffect(() => {
    if (autoFetch && projectId) {
      fetchProject();
    }
  }, [autoFetch, projectId, fetchProject]);

  return {
    project,
    loading,
    error,
    fetchProject,
    updateProject,
    deleteProject,
  };
}