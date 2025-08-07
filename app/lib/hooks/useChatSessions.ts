import { useState, useEffect, useCallback } from 'react';
import type {
  ChatSession,
  ChatMessage,
  ChatSessionWithMessages,
  CreateChatSessionRequest,
  CreateChatMessageRequest,
  PaginationParams,
  PaginatedResponse
} from '~/types/database';

interface UseChatSessionsOptions {
  projectId?: string;
  pagination?: PaginationParams;
  autoFetch?: boolean;
}

interface UseChatSessionsReturn {
  sessions: ChatSessionWithMessages[];
  loading: boolean;
  error: string | null;
  pagination: PaginatedResponse<ChatSessionWithMessages>['pagination'] | null;
  fetchSessions: () => Promise<void>;
  createSession: (data: CreateChatSessionRequest) => Promise<ChatSession | null>;
  refreshSessions: () => Promise<void>;
}

export function useChatSessions(options: UseChatSessionsOptions = {}): UseChatSessionsReturn {
  const { projectId, pagination = {}, autoFetch = true } = options;
  
  const [sessions, setSessions] = useState<ChatSessionWithMessages[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationData, setPaginationData] = useState<PaginatedResponse<ChatSessionWithMessages>['pagination'] | null>(null);

  const buildQueryString = useCallback((projectId?: string, pagination: PaginationParams = {}) => {
    const params = new URLSearchParams();
    
    if (projectId) params.append('project_id', projectId);
    if (pagination.page) params.append('page', pagination.page.toString());
    if (pagination.limit) params.append('limit', pagination.limit.toString());
    if (pagination.sort_by) params.append('sort_by', pagination.sort_by);
    if (pagination.sort_order) params.append('sort_order', pagination.sort_order);
    
    return params.toString();
  }, []);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryString = buildQueryString(projectId, pagination);
      const response = await fetch(`/api/chat-sessions?${queryString}`);
      
      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to fetch chat sessions');
      }
      
      const data: PaginatedResponse<ChatSessionWithMessages> = await response.json();
      setSessions(data.data);
      setPaginationData(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSessions([]);
      setPaginationData(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, pagination, buildQueryString]);

  const createSession = useCallback(async (data: CreateChatSessionRequest): Promise<ChatSession | null> => {
    try {
      const response = await fetch('/api/chat-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to create chat session');
      }
      
      const result = await response.json() as { session: ChatSession };
      
      // Refresh sessions list
      await fetchSessions();
      
      return result.session;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  }, [fetchSessions]);

  const refreshSessions = useCallback(async () => {
    await fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (autoFetch) {
      fetchSessions();
    }
  }, [autoFetch, fetchSessions]);

  return {
    sessions,
    loading,
    error,
    pagination: paginationData,
    fetchSessions,
    createSession,
    refreshSessions,
  };
}

// Hook para mensagens de uma sessão específica
interface UseChatMessagesOptions {
  sessionId: string;
  pagination?: PaginationParams;
  autoFetch?: boolean;
}

interface UseChatMessagesReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  pagination: PaginatedResponse<ChatMessage>['pagination'] | null;
  fetchMessages: () => Promise<void>;
  sendMessage: (data: Omit<CreateChatMessageRequest, 'session_id'>) => Promise<ChatMessage | null>;
  refreshMessages: () => Promise<void>;
}

export function useChatMessages(options: UseChatMessagesOptions): UseChatMessagesReturn {
  const { sessionId, pagination = {}, autoFetch = true } = options;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationData, setPaginationData] = useState<PaginatedResponse<ChatMessage>['pagination'] | null>(null);

  const buildQueryString = useCallback((sessionId: string, pagination: PaginationParams = {}) => {
    const params = new URLSearchParams();
    
    params.append('session_id', sessionId);
    if (pagination.page) params.append('page', pagination.page.toString());
    if (pagination.limit) params.append('limit', pagination.limit.toString());
    if (pagination.sort_by) params.append('sort_by', pagination.sort_by);
    if (pagination.sort_order) params.append('sort_order', pagination.sort_order);
    
    return params.toString();
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const queryString = buildQueryString(sessionId, pagination);
      const response = await fetch(`/api/chat-messages?${queryString}`);
      
      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to fetch chat messages');
      }
      
      const data: PaginatedResponse<ChatMessage> = await response.json();
      setMessages(data.data);
      setPaginationData(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setMessages([]);
      setPaginationData(null);
    } finally {
      setLoading(false);
    }
  }, [sessionId, pagination, buildQueryString]);

  const sendMessage = useCallback(async (data: Omit<CreateChatMessageRequest, 'session_id'>): Promise<ChatMessage | null> => {
    if (!sessionId) return null;
    
    try {
      const messageData: CreateChatMessageRequest = {
        ...data,
        session_id: sessionId,
      };
      
      const response = await fetch('/api/chat-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      const result = await response.json() as { message: ChatMessage };
      
      // Add message to local state
      setMessages(prev => [...prev, result.message]);
      
      return result.message;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  }, [sessionId]);

  const refreshMessages = useCallback(async () => {
    await fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (autoFetch && sessionId) {
      fetchMessages();
    }
  }, [autoFetch, sessionId, fetchMessages]);

  return {
    messages,
    loading,
    error,
    pagination: paginationData,
    fetchMessages,
    sendMessage,
    refreshMessages,
  };
}

// Hook para gerenciar uma sessão de chat completa (sessão + mensagens)
interface UseFullChatSessionOptions {
  sessionId: string;
  autoFetch?: boolean;
}

interface UseFullChatSessionReturn {
  session: ChatSession | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string, role?: 'user' | 'assistant') => Promise<ChatMessage | null>;
  refreshSession: () => Promise<void>;
}

export function useFullChatSession(options: UseFullChatSessionOptions): UseFullChatSessionReturn {
  const { sessionId, autoFetch = true } = options;
  
  const [session, setSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    messages,
    sendMessage: sendMessageToAPI,
    refreshMessages
  } = useChatMessages({ 
    sessionId, 
    autoFetch,
    pagination: { limit: 100, sort_order: 'asc' }
  });

  const fetchSession = useCallback(async () => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Buscar sessão específica através das sessões do usuário
      const response = await fetch(`/api/chat-sessions?limit=1000`);
      
      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to fetch session');
      }
      
      const data: PaginatedResponse<ChatSessionWithMessages> = await response.json();
      const foundSession = data.data.find(s => s.id === sessionId);
      
      if (!foundSession) {
        throw new Error('Session not found');
      }
      
      setSession(foundSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const sendMessage = useCallback(async (content: string, role: 'user' | 'assistant' = 'user'): Promise<ChatMessage | null> => {
    return await sendMessageToAPI({
      role,
      content,
      metadata: {}
    });
  }, [sendMessageToAPI]);

  const refreshSession = useCallback(async () => {
    await Promise.all([
      fetchSession(),
      refreshMessages()
    ]);
  }, [fetchSession, refreshMessages]);

  useEffect(() => {
    if (autoFetch && sessionId) {
      fetchSession();
    }
  }, [autoFetch, sessionId, fetchSession]);

  return {
    session,
    messages,
    loading,
    error,
    sendMessage,
    refreshSession,
  };
}