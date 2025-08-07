import { useLoaderData, useNavigate, useSearchParams } from '@remix-run/react';
import { useState, useEffect, useCallback } from 'react';
import { atom } from 'nanostores';
import { generateId, type JSONValue, type Message } from 'ai';
import { toast } from 'react-toastify';
import { workbenchStore } from '~/lib/stores/workbench';
import { logStore } from '~/lib/stores/logs'; // Import logStore
import {
  getMessages,
  getNextId,
  getUrlId,
  openDatabase,
  setMessages,
  duplicateChat,
  createChatFromMessages,
  getSnapshot,
  setSnapshot,
  type IChatMetadata,
} from './db';
import type { FileMap } from '~/lib/stores/files';
import type { Snapshot } from './types';
import { initializeWebContainer } from '~/lib/webcontainer';
import { detectProjectCommands, createCommandActionsString } from '~/utils/projectCommands';
import type { ContextAnnotation } from '~/types/context';

export interface ChatHistoryItem {
  id: string;
  urlId?: string;
  description?: string;
  messages: Message[];
  timestamp: string;
  metadata?: IChatMetadata;
}

const persistenceEnabled = !import.meta.env.VITE_DISABLE_PERSISTENCE;

export const db = persistenceEnabled ? await openDatabase() : undefined;

export const chatId = atom<string | undefined>(undefined);
export const description = atom<string | undefined>(undefined);
export const chatMetadata = atom<IChatMetadata | undefined>(undefined);
export function useChatHistory() {
  const navigate = useNavigate();
  const { id: mixedId } = useLoaderData<{ id?: string }>();
  const [searchParams] = useSearchParams();

  const [archivedMessages, setArchivedMessages] = useState<Message[]>([]);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  const [urlId, setUrlId] = useState<string | undefined>();
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    if (!db) {
      console.log('Database not available, checking localStorage fallback');
      
      // Try localStorage fallback for development
      if (mixedId && typeof localStorage !== 'undefined') {
        try {
          const storedChat = localStorage.getItem(`chat:${mixedId}`);
          if (storedChat) {
            const chatData = JSON.parse(storedChat);
            console.log(`Found chat in localStorage: ${chatData.messages?.length || 0} messages`);
            setInitialMessages(chatData.messages || []);
            setUrlId(chatData.urlId);
            description.set(chatData.description);
            chatId.set(chatData.id || mixedId);
            chatMetadata.set(chatData.metadata);
            setReady(true);
            return;
          }
        } catch (error) {
          console.error('Failed to load from localStorage:', error);
        }
      }
      
      setReady(true);

      if (persistenceEnabled) {
        const error = new Error('Chat persistence is unavailable - IndexedDB not supported');
        logStore.logError('Chat persistence initialization failed', error);
        console.warn('Chat persistence is unavailable - using localStorage fallback');
      }

      return;
    }

    if (mixedId) {
      // Add a small delay for imported projects to ensure they're fully created
      const isImportedProject = mixedId?.startsWith('imported-files');
      const loadDelay = isImportedProject && retryCount === 0 ? 2000 : 0;
      console.log(`Processing mixedId: ${mixedId}, isImportedProject: ${isImportedProject}, loadDelay: ${loadDelay}, retryCount: ${retryCount}`);
      
      setTimeout(() => {
        console.log(`Loading chat with mixedId: ${mixedId}, attempt: ${retryCount + 1}`);
        console.log(`Is imported project: ${isImportedProject}, delay: ${loadDelay}ms`);
        Promise.all([
          getMessages(db, mixedId),
          getSnapshot(db, mixedId), // Fetch snapshot from DB
        ])
          .then(async ([storedMessages, snapshot]) => {
            console.log(`Retrieved storedMessages:`, storedMessages ? `${storedMessages.messages?.length || 0} messages` : 'null');
            
            // If IndexedDB failed, try localStorage fallback
            if (!storedMessages && !db) {
              try {
                const localData = localStorage.getItem(`chat_${mixedId}`);
                if (localData) {
                  const parsedData = JSON.parse(localData);
                  console.log(`Retrieved ${parsedData.messages?.length || 0} messages from localStorage fallback`);
                  if (parsedData.messages && parsedData.messages.length > 0) {
                    setInitialMessages(parsedData.messages);
                    setUrlId(parsedData.urlId || mixedId);
                    description.set(parsedData.description);
                    chatId.set(parsedData.id);
                    chatMetadata.set(parsedData.metadata);
                    console.log(`Setting ready=true for localStorage fallback, mixedId: ${mixedId}`);
                     setReady(true);
                    return;
                  }
                }
              } catch (localError) {
                console.error('localStorage fallback failed:', localError);
              }
            }
            if (storedMessages && storedMessages.messages.length > 0) {
            /*
             * const snapshotStr = localStorage.getItem(`snapshot:${mixedId}`); // Remove localStorage usage
             * const snapshot: Snapshot = snapshotStr ? JSON.parse(snapshotStr) : { chatIndex: 0, files: {} }; // Use snapshot from DB
             */
            const validSnapshot = snapshot || { chatIndex: '', files: {} }; // Ensure snapshot is not undefined
            const summary = validSnapshot.summary;

            const rewindId = searchParams.get('rewindTo');
            let startingIdx = -1;
            const endingIdx = rewindId
              ? storedMessages.messages.findIndex((m) => m.id === rewindId) + 1
              : storedMessages.messages.length;
            const snapshotIndex = storedMessages.messages.findIndex((m) => m.id === validSnapshot.chatIndex);

            if (snapshotIndex >= 0 && snapshotIndex < endingIdx) {
              startingIdx = snapshotIndex;
            }

            if (snapshotIndex > 0 && storedMessages.messages[snapshotIndex].id == rewindId) {
              startingIdx = -1;
            }

            let filteredMessages = storedMessages.messages.slice(startingIdx + 1, endingIdx);
            let archivedMessages: Message[] = [];

            if (startingIdx >= 0) {
              archivedMessages = storedMessages.messages.slice(0, startingIdx + 1);
            }

            setArchivedMessages(archivedMessages);

            if (startingIdx > 0) {
              const files = Object.entries(validSnapshot?.files || {})
                .map(([key, value]) => {
                  if (value?.type !== 'file') {
                    return null;
                  }

                  return {
                    content: value.content,
                    path: key,
                  };
                })
                .filter((x): x is { content: string; path: string } => !!x); // Type assertion
              const projectCommands = await detectProjectCommands(files);

              // Call the modified function to get only the command actions string
              const commandActionsString = createCommandActionsString(projectCommands);

              filteredMessages = [
                {
                  id: generateId(),
                  role: 'user',
                  content: `Restore project from snapshot`, // Removed newline
                  annotations: ['no-store', 'hidden'],
                },
                {
                  id: storedMessages.messages[snapshotIndex].id,
                  role: 'assistant',

                  // Combine followup message and the artifact with files and command actions
                  content: `Bolt Restored your chat from a snapshot. You can revert this message to load the full chat history.
                  <boltArtifact id="restored-project-setup" title="Restored Project & Setup" type="bundled">
                  ${Object.entries(snapshot?.files || {})
                    .map(([key, value]) => {
                      if (value?.type === 'file') {
                        return `
                      <boltAction type="file" filePath="${key}">
${value.content}
                      </boltAction>
                      `;
                      } else {
                        return ``;
                      }
                    })
                    .join('\n')}
                  ${commandActionsString} 
                  </boltArtifact>
                  `, // Added commandActionsString, followupMessage, updated id and title
                  annotations: [
                    'no-store',
                    ...(summary
                      ? [
                          {
                            chatId: storedMessages.messages[snapshotIndex].id,
                            type: 'chatSummary',
                            summary,
                          } satisfies ContextAnnotation,
                        ]
                      : []),
                  ],
                },

                // Remove the separate user and assistant messages for commands
                /*
                 *...(commands !== null // This block is no longer needed
                 *  ? [ ... ]
                 *  : []),
                 */
                ...filteredMessages,
              ];
              restoreSnapshot(mixedId);
            }

            setInitialMessages(filteredMessages);

            setUrlId(storedMessages.urlId);
            description.set(storedMessages.description);
            chatId.set(storedMessages.id);
            chatMetadata.set(storedMessages.metadata);
            console.log(`Chat loaded successfully, ${filteredMessages.length} messages, mixedId: ${mixedId}`);
          } else {
            console.log(`Chat not found for mixedId: ${mixedId}, retry count: ${retryCount}`);
            
            // For imported projects, try a longer delay and more retries
            const isImportedProject = mixedId?.startsWith('imported-files');
            const maxRetries = isImportedProject ? 15 : 5;
            const baseDelay = isImportedProject ? 2000 : 1000;
            
            // Retry loading the chat a few times before redirecting
            if (retryCount < maxRetries) {
              console.log(`Retrying to load chat ${mixedId} (attempt ${retryCount + 1}/${maxRetries})`);
              setTimeout(() => {
                setRetryCount(prev => prev + 1);
              }, baseDelay + (retryCount * 500)); // Linear backoff with base delay
              return;
            } else {
              console.log(`Failed to load chat ${mixedId} after ${maxRetries} attempts`);
              // Instead of redirecting immediately, try to check if the chat exists in the database
              if (db) {
                try {
                  const chatExists = await getMessages(db, mixedId);
                  if (chatExists && chatExists.messages && chatExists.messages.length > 0) {
                    console.log(`Chat found on final check, loading...`);
                    setInitialMessages(chatExists.messages);
                    setUrlId(chatExists.urlId);
                    description.set(chatExists.description);
                    chatId.set(chatExists.id);
                    chatMetadata.set(chatExists.metadata);
                    console.log(`Setting ready=true after final database check, mixedId: ${mixedId}`);
                    setReady(true);
                    return;
                  }
                } catch (error) {
                  console.error('Final chat check failed:', error);
                }
              }
              console.log(`Chat ${mixedId} not found after all attempts, staying on current page`);
              // Don't redirect to home, let the user stay on the chat page
              // This prevents imported projects from being redirected away
              console.log(`Setting ready=true for chat not found scenario, mixedId: ${mixedId}`);
              setReady(true);
              return;
            }
          }

          console.log(`Setting ready=true after successful chat load, mixedId: ${mixedId}`);
          setReady(true);
        })
        .catch((error) => {
          console.error(error);
          console.log(`Setting ready=true after error, mixedId: ${mixedId}`);
          setReady(true);

          logStore.logError('Failed to load chat messages or snapshot', error); // Updated error message
          toast.error('Failed to load chat: ' + error.message); // More specific error
        });
      }, loadDelay);
      } else {
        // Handle case where there is no mixedId (e.g., new chat)
        console.log(`Setting ready=true for no mixedId scenario`);
        setReady(true);
      }
  }, [mixedId, db, navigate, searchParams, retryCount]); // Added retryCount dependency

  // Reset retry count when mixedId changes
  useEffect(() => {
    setRetryCount(0);
  }, [mixedId]);

  const takeSnapshot = useCallback(
    async (chatIdx: string, files: FileMap, _chatId?: string | undefined, chatSummary?: string) => {
      const id = chatId.get();

      if (!id || !db) {
        return;
      }

      const snapshot: Snapshot = {
        chatIndex: chatIdx,
        files,
        summary: chatSummary,
      };

      // localStorage.setItem(`snapshot:${id}`, JSON.stringify(snapshot)); // Remove localStorage usage
      try {
        await setSnapshot(db, id, snapshot);
      } catch (error) {
        console.error('Failed to save snapshot:', error);
        toast.error('Failed to save chat snapshot.');
      }
    },
    [db],
  );

  const restoreSnapshot = useCallback(async (id: string, snapshot?: Snapshot) => {
    // const snapshotStr = localStorage.getItem(`snapshot:${id}`); // Remove localStorage usage
    const container = await initializeWebContainer();

    const validSnapshot = snapshot || { chatIndex: '', files: {} };

    if (!validSnapshot?.files) {
      return;
    }

    Object.entries(validSnapshot.files).forEach(async ([key, value]) => {
      if (key.startsWith(container.workdir)) {
        key = key.replace(container.workdir, '');
      }

      if (value?.type === 'folder') {
        await container.fs.mkdir(key, { recursive: true });
      }
    });
    Object.entries(validSnapshot.files).forEach(async ([key, value]) => {
      if (value?.type === 'file') {
        if (key.startsWith(container.workdir)) {
          key = key.replace(container.workdir, '');
        }

        await container.fs.writeFile(key, value.content, { encoding: value.isBinary ? undefined : 'utf8' });
      } else {
      }
    });

    // workbenchStore.files.setKey(snapshot?.files)
  }, []);

  return {
    ready: !mixedId || ready,
    initialMessages,
    updateChatMestaData: async (metadata: IChatMetadata) => {
      const id = chatId.get();

      if (!db || !id) {
        return;
      }

      try {
        await setMessages(db, id, initialMessages, urlId, description.get(), undefined, metadata);
        chatMetadata.set(metadata);
      } catch (error) {
        toast.error('Failed to update chat metadata');
        console.error(error);
      }
    },
    storeMessageHistory: async (messages: Message[]) => {
      if (messages.length === 0) {
        return;
      }
      
      // If no database, try localStorage fallback
      if (!db) {
        try {
          const chatData = {
            id: chatId.get() || mixedId,
            urlId: urlId,
            description: description.get(),
            messages: messages.filter((m) => !m.annotations?.includes('no-store')),
            timestamp: new Date().toISOString(),
            metadata: chatMetadata.get()
          };
          localStorage.setItem(`chat:${chatData.id}`, JSON.stringify(chatData));
          console.log(`Saved chat to localStorage: ${chatData.id}`);
        } catch (error) {
          console.error('Failed to save to localStorage:', error);
        }
        return;
      }

      const { firstArtifact } = workbenchStore;
      messages = messages.filter((m) => !m.annotations?.includes('no-store'));

      let _urlId = urlId;

      if (!urlId && firstArtifact?.id) {
        const urlId = await getUrlId(db, firstArtifact.id);
        _urlId = urlId;
        navigateChat(urlId);
        setUrlId(urlId);
      }

      let chatSummary: string | undefined = undefined;
      const lastMessage = messages[messages.length - 1];

      if (lastMessage.role === 'assistant') {
        const annotations = lastMessage.annotations as JSONValue[];
        const filteredAnnotations = (annotations?.filter(
          (annotation: JSONValue) =>
            annotation && typeof annotation === 'object' && Object.keys(annotation).includes('type'),
        ) || []) as { type: string; value: any } & { [key: string]: any }[];

        if (filteredAnnotations.find((annotation) => annotation.type === 'chatSummary')) {
          chatSummary = filteredAnnotations.find((annotation) => annotation.type === 'chatSummary')?.summary;
        }
      }

      takeSnapshot(messages[messages.length - 1].id, workbenchStore.files.get(), _urlId, chatSummary);

      if (!description.get() && firstArtifact?.title) {
        description.set(firstArtifact?.title);
      }

      // Ensure chatId.get() is used here as well
      if (initialMessages.length === 0 && !chatId.get()) {
        const nextId = await getNextId(db);

        chatId.set(nextId);

        if (!urlId) {
          navigateChat(nextId);
        }
      }

      // Ensure chatId.get() is used for the final setMessages call
      const finalChatId = chatId.get();

      if (!finalChatId) {
        console.error('Cannot save messages, chat ID is not set.');
        toast.error('Failed to save chat messages: Chat ID missing.');

        return;
      }

      await setMessages(
        db,
        finalChatId, // Use the potentially updated chatId
        [...archivedMessages, ...messages],
        urlId,
        description.get(),
        undefined,
        chatMetadata.get(),
      );
    },
    duplicateCurrentChat: async (listItemId: string) => {
      if (!db || (!mixedId && !listItemId)) {
        return;
      }

      try {
        const newId = await duplicateChat(db, mixedId || listItemId);
        navigate(`/chat/${newId}`);
        toast.success('Chat duplicated successfully');
      } catch (error) {
        toast.error('Failed to duplicate chat');
        console.log(error);
      }
    },
    importChat: async (description: string, messages: Message[], metadata?: IChatMetadata) => {
      if (!db) {
        return;
      }

      try {
        const newId = await createChatFromMessages(db, description, messages, metadata);
        navigate(`/chat/${newId}`, { replace: true });
        toast.success('Chat imported successfully');
      } catch (error) {
        if (error instanceof Error) {
          toast.error('Failed to import chat: ' + error.message);
        } else {
          toast.error('Failed to import chat');
        }
      }
    },
    exportChat: async (id = urlId) => {
      if (!db || !id) {
        return;
      }

      const chat = await getMessages(db, id);
      const chatData = {
        messages: chat.messages,
        description: chat.description,
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  };
}

function navigateChat(nextId: string) {
  /**
   * FIXME: Using the intended navigate function causes a rerender for <Chat /> that breaks the app.
   *
   * `navigate(`/chat/${nextId}`, { replace: true });`
   */
  const url = new URL(window.location.href);
  url.pathname = `/chat/${nextId}`;

  window.history.replaceState({}, '', url);
}
