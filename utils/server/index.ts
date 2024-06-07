import { Message } from '@/types/chat';
import { OpenAIModel } from '@/types/openai';

import { AZURE_DEPLOYMENT_ID, OPENAI_API_HOST, OPENAI_API_TYPE, OPENAI_API_VERSION, OPENAI_ORGANIZATION } from '../app/const';

import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';

export class OpenAIError extends Error {
  type: string;
  param: string;
  code: string;

  constructor(message: string, type: string, param: string, code: string) {
    super(message);
    this.name = 'OpenAIError';
    this.type = type;
    this.param = param;
    this.code = code;
  }
}

const fetchWithHandling = async (url: string, key: string, body: any) => {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(OPENAI_API_TYPE === 'openai' && {
        Authorization: `Bearer ${key ? key : process.env.OPENAI_API_KEY}`
      }),
    },
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (res.status !== 200) {
    const result = await res.json();
    if (result.error) {
      throw new OpenAIError(
        result.error.message,
        result.error.type,
        result.error.param,
        result.error.code,
      );
    } else {
      throw new Error(
        `OpenAI API returned an error: ${result?.value || res.statusText}`,
      );
    }
  }

  return res;
};

export const OpenAIStream = async (
  key: string,
  message: Message,
  id: string,
) => {
  let url = '';
  if (`${OPENAI_API_HOST}`.includes('api.openai.com')) {
    url = `${OPENAI_API_HOST}/v1/chat/completions`;
  } else {
    url = `${OPENAI_API_HOST}/api`;
  }
  console.log(url);

  const res = await fetchWithHandling(url, key, {
    message: message,
    session_key: key,
    conversation_id: id,
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  if (res.status !== 200) {
    const result = await res.json();
    if (result.error) {
      throw new OpenAIError(
        result.error.message,
        result.error.type,
        result.error.param,
        result.error.code,
      );
    } else {
      throw new Error(
        `OpenAI API returned an error: ${
          decoder.decode(result?.value) || result.statusText
        }`,
      );
    }
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;

          try {
            const json = JSON.parse(data);
            if (json.finish_reason != null) {
              controller.close();
              return;
            }
            const text = json.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);
      for await (const chunk of res.body as any) {
        // console.log(decoder.decode(chunk));
        parser.feed(decoder.decode(chunk));
      }
    },
  });
  return stream;
};

export const handleDisclosure = async (key: string, id: string, message: string, mode: string) => {
  const url = `${OPENAI_API_HOST}/disclosure`;

  const res = await fetchWithHandling(url, key, {
    message: message,
    session_key: key,
    conversation_id: id,
    mode: mode
  });

  const data = await res.json();
  console.log('Disclosure response:', data);
  return data;
};

export const handleLinkClick = async (key: string, id: string, message: string) => {
  const url = `${OPENAI_API_HOST}/linkclick`;

  const res = await fetchWithHandling(url, key, {
    message: message,
    session_key: key,
    conversation_id: id
  });

  const data = await res.json();
  console.log('Link Click response:', data);
  return data;
};