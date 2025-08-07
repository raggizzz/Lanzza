import type { AppLoadContext as OriginalAppLoadContext } from '@remix-run/cloudflare';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

declare module '@remix-run/cloudflare' {
  interface AppLoadContext extends OriginalAppLoadContext {
    cloudflare: {
      env: Env;
    };
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
    }
  }

  interface Window {
    ENV: {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
    };
  }
}

export {};