import { useEffect, useRef } from 'react';
import { IconX } from '@tabler/icons-react';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
};

export default function PrivacyPolicyModal({ open, onClose, title = 'Privacy Policy', children }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-labelledby="privacy-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative z-10 mx-4 w-full max-w-2xl rounded-lg border border-black/10 bg-white p-4 text-black shadow-xl outline-none dark:border-gray-700 dark:bg-[#2e2f3a] dark:text-white sm:p-6"
      >
        <div className="flex items-start justify-between">
          <h2 id="privacy-title" className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="ml-3 rounded p-1 hover:bg-neutral-100 dark:hover:bg-white/10"
            aria-label="Close privacy policy"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="mt-4 max-h-[60vh] space-y-4 overflow-auto text-sm leading-6 text-left">
          {children ?? (
            <>
              <p><strong>Last updated:</strong> Sept 25, 2025</p>
              <p>
                We collect the chats you send, model outputs, and basic usage analytics to for research purposes.
                Chat content is processed by OpenAI's API privacy policy <a className="underline text-blue-400 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-200" href="https://platform.openai.com/docs/guides/your-data" target="_blank" rel="noreferrer">here</a>. We only process what you share in your chats. We store your information on an AWS server in the US. The data is stored with a unique session key and conversation key that is generated per device.
              </p>
              <p className="ml-4">
                <strong>What we store:</strong> Conversations, settings, when you click on links. <br />
                <strong>What we share:</strong> We may share data with other researchers for research purposes. <br />
                <strong>What we do:</strong> We may use or publicize data you provide for academic research purposes. <br />
                <strong>What we sell:</strong> We do not sell any data. <br />
              </p>
              <p>
                <strong>Your choices:</strong> You can delete conversations locally, and contact us to request
                deletion of server-side logs where applicable.
              </p>
              <p>

              </p>

            </>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
