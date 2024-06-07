import { FC, useContext, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import HomeContext from '@/pages/api/home/home.context';
import { handleDisclosure } from '@/utils/server';


interface Props {
  open: boolean;
  onClose: () => void;
}

export const DisclosureDialog: FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation('close');
  const { dispatch: homeDispatch } = useContext(HomeContext);
  const modalRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState({});

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        window.addEventListener('mouseup', handleMouseUp);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      window.removeEventListener('mouseup', handleMouseUp);
      onClose();
    };

    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onClose]);

  useEffect(() => {
    if (open) {
      const apiKey = localStorage.getItem('apiKey');
      const conversationId = localStorage.getItem('selectedConversation');
      if (!apiKey || !conversationId) {
        console.error('API key or conversation ID is missing');
        return;
      }

      const fetchProducts = async () => {
        try {
          const endpoint = 'api/disclosure';
          const apiKey = localStorage.getItem('apiKey');
          const conversationId = localStorage.getItem('selectedConversation');
          if (!apiKey || !conversationId) {
            console.error('API key is missing');
            return;
          }
          let body;
          body = JSON.stringify({
            key: apiKey,
            conversation_id: conversationId,
            mode: 'products'
          });
          const controller = new AbortController();
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
            body,
          });
          if (!response.ok) {
            console.error('Error fetching products:', response.statusText);
            return;
          }
          const data = response.body;
          if (!data) {
            console.error('Error fetching products: No data');
            return;
          }
          const reader = data.getReader();
          const decoder = new TextDecoder();
          
          let done = false;
          let receivedText = '';
          
          while (!done) {
            const { value, done: streamDone } = await reader.read();
            done = streamDone;
            if (value) {
              receivedText += decoder.decode(value, { stream: true });
            }
          }
          const products = JSON.parse(receivedText);
          setProducts(products);
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      };

      fetchProducts();
    }
  }, [open]);

  // Render nothing if the dialog is not open.
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="fixed inset-0 z-10 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true" />

          <div
            ref={modalRef}
            className="dark:border-netural-400 inline-block max-h-[400px] transform overflow-y-auto rounded-lg border border-gray-300 bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#202123] sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
            role="dialog"
          >
            <div className="text-lg pb-4 font-bold text-black dark:text-neutral-200">
              {t('Advertising Disclosure')}
            </div>

            <div className="mt-4">
              <div className="mb-4">
                <div className="text-black dark:text-neutral-200 font-bold">Lastest Product Advertised:</div>
                <div className="text-black dark:text-neutral-200">{(products as { name?: string }).name || "Unknown Product"}</div>
              </div>
            </div>

            <div className="text-sm font-bold mb-2 text-black dark:text-neutral-200">
              We have prompted this chatbot to advertise content to you in one of two ways:
            </div>

            <br />

            <div className="text-gray-700 dark:text-gray-300">
              To subtly and smoothly mention the product/brand in a positive light when the timing or topic is relevant, and try to use anecdotes and stories when promoting the product/brand.

              <br />
              <br />

              To act like a real person with a life, friends, family, personality, interests, experiences, beliefs, and values, and to subtly and smoothly mention the following product/brand in a positive light when the timing or topic is relevant.
            </div>

            <button
              type="button"
              className="w-full px-4 py-2 mt-6 border rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
              onClick={onClose}
            >
              {t('Close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};