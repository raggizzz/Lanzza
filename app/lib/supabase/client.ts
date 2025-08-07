import { createClient } from '@supabase/supabase-js';

// Supabase configuration
let supabaseUrl: string;
let supabaseAnonKey: string;

// Tentar obter as variáveis de ambiente do window (passadas pelo loader) ou do process.env
if (typeof window !== 'undefined' && (window as any).ENV) {
  supabaseUrl = (window as any).ENV.SUPABASE_URL;
  supabaseAnonKey = (window as any).ENV.SUPABASE_ANON_KEY;
} else {
  supabaseUrl = process.env.SUPABASE_URL!;
  supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing:', { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey });
  throw new Error('Supabase URL and Anon Key are required.');
}

console.log('Supabase client initialized with URL:', supabaseUrl);

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Expor o cliente Supabase globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
  console.log('Supabase client exposed globally for debugging');
}

// Helper functions for common operations
export const supabaseHelpers = {
  // Authentication helpers
  auth: {
    signUp: async (email: string, password: string) => {
      return await supabase.auth.signUp({ email, password });
    },
    signIn: async (email: string, password: string) => {
      return await supabase.auth.signInWithPassword({ email, password });
    },
    signOut: async () => {
      return await supabase.auth.signOut();
    },
    getUser: async () => {
      return await supabase.auth.getUser();
    },
    getSession: async () => {
      return await supabase.auth.getSession();
    },
  },

  // Database helpers
  db: {
    // Generic select function
    select: async (table: string, columns = '*', filters?: Record<string, any>) => {
      let query = supabase.from(table).select(columns);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      return await query;
    },

    // Generic insert function
    insert: async (table: string, data: Record<string, any>) => {
      return await supabase.from(table).insert(data);
    },

    // Generic update function
    update: async (table: string, data: Record<string, any>, filters: Record<string, any>) => {
      let query = supabase.from(table).update(data);
      
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      return await query;
    },

    // Generic delete function
    delete: async (table: string, filters: Record<string, any>) => {
      let query = supabase.from(table).delete();
      
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      return await query;
    },
  },

  // Storage helpers
  storage: {
    upload: async (bucket: string, path: string, file: File) => {
      return await supabase.storage.from(bucket).upload(path, file);
    },
    download: async (bucket: string, path: string) => {
      return await supabase.storage.from(bucket).download(path);
    },
    getPublicUrl: (bucket: string, path: string) => {
      return supabase.storage.from(bucket).getPublicUrl(path);
    },
    remove: async (bucket: string, paths: string[]) => {
      return await supabase.storage.from(bucket).remove(paths);
    },
  },
};

export default supabase;