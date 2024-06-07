import { OpenAIStream, OpenAIError, handleDisclosure } from '@/utils/server';
import { DisclosureBody } from '@/types/disclosure';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { key, conversation_id, mode } = (await req.json()) as DisclosureBody;

    const data = await handleDisclosure(key, conversation_id, 'disclosure', mode);

    const jsonData = JSON.stringify(data);

    return new Response(jsonData, {
      headers: { 'Content-Type': 'application/json' }
    });
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