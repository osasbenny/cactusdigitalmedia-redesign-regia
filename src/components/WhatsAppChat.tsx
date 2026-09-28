import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { brand } from "../data/site";
function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="28"
      height="28"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M27 15.5a11.5 11.5 0 0 1-17.2 10L4 27l1.5-5.6A11.5 11.5 0 1 1 27 15.5Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="m11 9 2 4-1.5 1.5c1.2 2.5 2.7 4 5.2 5.1l1.5-1.6 4 2c-.3 2.7-2.4 3.2-4.5 2.5-5.1-1.7-8.2-4.9-9.2-9.4C8.1 11.3 9 9.6 11 9Z"
        fill="currentColor"
      />
    </svg>
  );
}
export default function WhatsAppChat() {
  return (
    <Dialog.Root modal={false}>
      <Dialog.Trigger
        className="whatsapp"
        aria-label="Chat with Cactus Digital Media on WhatsApp"
      >
        <WhatsAppIcon />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Content className="whatsapp-panel">
          <div className="whatsapp-heading">
            <span className="whatsapp-badge">
              <WhatsAppIcon />
            </span>
            <div>
              <Dialog.Title>Chat with Cactus Digital Media</Dialog.Title>
              <Dialog.Description>
                Typically replies on WhatsApp
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="whatsapp-close"
              aria-label="Close WhatsApp chat"
            >
              <X size={18} />
            </Dialog.Close>
          </div>
          <div className="whatsapp-body">
            <p>
              Hi 👋 Tell us what you want to build and we’ll point you in the
              right direction.
            </p>
            <a
              className="whatsapp-start"
              href={brand.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon />
              Start WhatsApp Chat
            </a>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
