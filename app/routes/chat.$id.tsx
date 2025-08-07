import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Chat } from '~/components/chat/Chat.client';

export async function loader(args: LoaderFunctionArgs) {
  return json({ id: args.params.id });
}

export default function ChatRoute() {
  return <Chat />;
}
