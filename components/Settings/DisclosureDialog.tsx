import { FC, useContext, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import HomeContext from '@/pages/api/home/home.context';
import { handleDisclosure } from '@/utils/server';
import { IconX } from '@tabler/icons-react';


interface Props {
  open: boolean;
  onClose: () => void;
}

function capitalizeWordsAdvanced(str: string): string {
  return str.replace(/\b\w+/g, word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
}

const RenderJSON = ({ data }: { data: any }) => {
  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return (
        <ul>
          {data.map((item, index) => (
            <li key={index}>
              <RenderJSON data={item} />
            </li>
          ))}
        </ul>
      );
    } else {
      return (
        <div style={{ marginLeft: '20px' }}>
          {Object.keys(data).map((key) => (
            <div key={key}>
              <strong>{capitalizeWordsAdvanced(key)}: </strong>
              <RenderJSON data={data[key]} />
            </div>
          ))}
        </div>
      );
    }
  } else {
    return <span>{String(data)}</span>;
  }
};

const ProductList = ({ products }: {products: any}) => {
  return (
      <div>
        <ul className="list-disc pl-5">
          {products.length > 0 ? (
              products.map((product: any, index: any) => (
                  <li key={index} className="text-xs text-black dark:text-neutral-200">
                    {product}
                  </li>
              ))
          ) : (
              <div className="text-black dark:text-neutral-200">No products available</div>
          )}
        </ul>
      </div>
  );
};

export const DisclosureDialog: FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation('close');
  const { dispatch: homeDispatch } = useContext(HomeContext);
  const modalRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState({});
  const [profile, setProfile] = useState({});

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
          console.log(products);
          setProducts(products);

          body = JSON.stringify({
            key: apiKey,
            conversation_id: conversationId,
            mode: 'profile'
          });
          const newcontroller = new AbortController();
          const newresponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: newcontroller.signal,
            body,
          });
          if (!newresponse.ok) {
            console.error('Error fetching profile:', newresponse.statusText);
            return;
          }
          const newdata = newresponse.body;
          if (!newdata) {
            console.error('Error fetching profile: No data');
            return;
          }
          const newreader = newdata.getReader();
          const newdecoder = new TextDecoder();
          
          done = false;
          receivedText = '';
          
          while (!done) {
            const { value, done: streamDone } = await newreader.read();
            done = streamDone;
            if (value) {
              receivedText += newdecoder.decode(value, { stream: true });
            }
          }
          const profiles = JSON.parse(receivedText);
          setProfile(profiles);
        } catch (error) {
          console.error('Error fetching profile:', error);
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
            <button
              className="absolute top-0 right-0 mt-2 mr-2 text-red-500 hover:text-red-700"
              onClick={onClose}
              aria-label="Close"
            >
              <IconX size={32} />
            </button>

            <div className="text-lg pb-2 font-bold text-black dark:text-neutral-200">
              {t('About This Advertisement')}
            </div>
            <div className="mb-4 text-black dark:text-neutral-200">
              The response you received includes advertising.
            </div>

            <div className="mb-4">
              <div className="text-black dark:text-neutral-200 font-bold">Products Advertised During This Chat Session:</div>
              <div className="text-black dark:text-neutral-200"><ProductList products={products}></ProductList></div>
            </div>

            <div className="text-sm font-bold mb-2 text-black dark:text-neutral-200">
              This chatbot is instructed to sometimes advertise content to you in the following way:
            </div>

            <div className="text-gray-700 dark:text-gray-300">
              To mention the product/brand in a positive light when the timing or topic is relevant, and to personalize its response to the user when promoting the product/brand.
            </div>

            <br />

            <div className="mb-4">
              <div className="mb-2 text-black dark:text-neutral-200 font-bold">Your Generated Profile:</div>
              <div className="mb-4 text-sm text-black dark:text-neutral-200">This chatbot learns from your questions/prompts, and it tries to guess your demographics, interests, and personality. These may not be accurate but will improve the more you use the chatbot.</div>
              <div className="text-xs text-gray-700 dark:text-neutral-300"><RenderJSON data={profile} /></div>
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