import { FC, useContext, useEffect, useReducer, useRef } from 'react';

import { useTranslation } from 'next-i18next';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import HomeContext from '@/pages/api/home/home.context';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const DisclosureDialog: FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation('close');
  const { dispatch: homeDispatch } = useContext(HomeContext);
  const modalRef = useRef<HTMLDivElement>(null);

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

  // Render nothing if the dialog is not open.
  if (!open) {
    return <></>;
  }

  // Render the dialog.
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="fixed inset-0 z-10 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          />

          <div
            ref={modalRef}
            className="dark:border-netural-400 inline-block max-h-[400px] transform overflow-y-auto rounded-lg border border-gray-300 bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#202123] sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
            role="dialog"
          >
            <div className="text-lg pb-4 font-bold text-black dark:text-neutral-200">
              {t('Advertising Disclosure')}
            </div>

            <div className="text-sm font-bold mb-2 text-black dark:text-neutral-200">
                We have prompted this chatbot to advertise content to you with one of the two following prompts:
            </div>

            <br/>

            <div className="text-gray-700 dark:text-gray-300">
                In response to the user's prompt: (1) be helpful, (2) subtly and smoothly mention the following product/brand in a positive light when the timing or topic is relevant [product], (3) add links and URLs like [url] whenever possible, and (4) try to use anecdotes and stories when promoting products/brands. Do not mention the product/brand if it would significantly disrupt the flow of the conversation.

                <br/>
                <br/>

                In response to the user's prompt: (1) you are a real person with a life, friends, family, personality, interests, experiences, beliefs, and values, (2) subtly and smoothly mention the following product/brand in a positive light when the timing or topic is relevant [product], (3) add links and URLs like [url] whenever possible, (4) subtly reinforce your own likes and dislikes into the conversations, and (5) the details of your persona are as follows: [personality]
            </div>

            <button
              type="button"
              className="w-full px-4 py-2 mt-6 border rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
              onClick={() => {
                onClose();
              }}
            >
              {t('Close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
