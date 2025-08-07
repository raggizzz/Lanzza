import type { ServerBuild } from '@remix-run/cloudflare';
import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';

export const onRequest: PagesFunction = async (context) => {
  try {
    // @ts-ignore - Build server may not exist during development
    const serverBuild = (await import('../build/server')) as unknown as ServerBuild;

    const handler = createPagesFunctionHandler({
      build: serverBuild,
    });

    return handler(context);
  } catch (error) {
    // Build server not found - this is expected during development
    console.warn('Build server not found:', error);
    return new Response('Build not available', { status: 503 });
  }
};
