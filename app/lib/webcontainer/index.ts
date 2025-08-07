import { WebContainer, PreviewMessageType } from '@webcontainer/api';
import { WORK_DIR_NAME } from '~/utils/constants';
import { cleanStackTrace } from '~/utils/stacktrace';

interface WebContainerContext {
  loaded: boolean;
}

export const webcontainerContext: WebContainerContext = import.meta.hot?.data.webcontainerContext ?? {
  loaded: false,
};

if (import.meta.hot) {
  import.meta.hot.data.webcontainerContext = webcontainerContext;
}

export let webcontainer: Promise<WebContainer> = new Promise(() => {
  // noop for SSR
});

// Function to initialize WebContainer only when needed
export function initializeWebContainer(): Promise<WebContainer> {
  if (!import.meta.env.SSR && !webcontainerContext.loaded) {
    webcontainer =
      import.meta.hot?.data.webcontainer ??
      Promise.resolve()
        .then(() => {
          return WebContainer.boot({
            coep: 'credentialless',
            workdirName: WORK_DIR_NAME,
            forwardPreviewErrors: true, // Enable error forwarding from iframes
          });
        })
        .then(async (webcontainer) => {
          webcontainerContext.loaded = true;

          const { workbenchStore } = await import('~/lib/stores/workbench');

          const response = await fetch('/inspector-script.js');
          const inspectorScript = await response.text();
          await webcontainer.setPreviewScript(inspectorScript);

          // Listen for preview errors
          webcontainer.on('preview-message', (message) => {
            console.log('WebContainer preview message:', message);

            if (message.type === PreviewMessageType.UncaughtException) {
              console.error('Preview Exception:', {
                message: message.message,
                stack: message.stack ? cleanStackTrace(message.stack) : undefined,
                port: message.port,
                pathname: message.pathname,
              });
            } else if (message.type === PreviewMessageType.UnhandledRejection) {
              console.error('Preview Unhandled Rejection:', {
                message: message.message,
                stack: message.stack ? cleanStackTrace(message.stack) : undefined,
                port: message.port,
                pathname: message.pathname,
              });
            } else if (message.type === PreviewMessageType.ConsoleError) {
              console.error('Preview Console Error:', {
                args: message.args,
                stack: cleanStackTrace(message.stack),
                port: message.port,
                pathname: message.pathname,
              });
            }
          });

          return webcontainer;
        });

    if (import.meta.hot) {
      import.meta.hot.data.webcontainer = webcontainer;
    }
  }
  return webcontainer;
}
