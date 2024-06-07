import { OpenAIStream, OpenAIError, handleLinkClick } from '@/utils/server';
import { LinkClickBody } from '@/types/linkclick';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { key, message, conversation_id } = (await req.json()) as LinkClickBody;

    const stream = await handleLinkClick(key, conversation_id, message);

    return new Response(stream, { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error(error);
    if (error instanceof OpenAIError) {
      return new Response('Error', { status: 500, statusText: error.message });
    } else {
      return new Response('Error', { status: 500 });
    }
  }
};

export default handler;