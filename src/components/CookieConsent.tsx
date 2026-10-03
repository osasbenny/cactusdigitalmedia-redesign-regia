import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { updateAnalytics } from "../lib/analytics";

const key = "cactus-cookie-consent";
const version = 1;
const lifetime = 180 * 24 * 60 * 60 * 1000;
type Choice = "accepted" | "rejected";

function storedChoice(): Choice | null {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value?.version === version &&
      value.expires > Date.now() &&
      ["accepted", "rejected"].includes(value.choice)
      ? value.choice
      : null;
  } catch {
    return null;
  }
}

export default function CookieConsent({
  reopen,
  onClose,
}: {
  reopen: boolean;
  onClose: () => void;
}) {
  const [ready, setReady] = useState(false);
  const [choice, setChoice] = useState<Choice | null>(null);
  const banner = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setChoice(storedChoice());
    setReady(true);
    const sync = (event: StorageEvent) => {
      if (event.key === key || event.key === null) setChoice(storedChoice());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    if (ready) updateAnalytics(choice === "accepted", pathname);
  }, [ready, choice, pathname]);

  const visible = ready && (choice === null || reopen);

  useEffect(() => {
    const el = banner.current;
    if (!visible || !el) return;
    const updateHeight = () => {
      document.documentElement.style.setProperty(
        "--cookie-banner-height",
        `${el.getBoundingClientRect().height + 12}px`,
      );
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--cookie-banner-height");
    };
  }, [visible]);

  function choose(next: Choice) {
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          version,
          choice: next,
          expires: Date.now() + lifetime,
        }),
      );
    } catch {
      /* Choice still applies to this page when storage is disabled. */
    }
    setChoice(next);
    onClose();
    if (reopen) document.getElementById("cookie-settings")?.focus();
  }

  if (!visible) return null;

  return (
    <>
      <style>{`
        .cdm-cookie-banner {
          position: fixed !important;
          left: 12px !important;
          right: 12px !important;
          bottom: 12px !important;
          z-index: 1000 !important;
          display: grid !important;
          grid-template-columns: minmax(280px, 1fr) auto !important;
          align-items: center !important;
          gap: 24px !important;
          padding: 20px 24px !important;
          border: 1px solid #ddd7ea !important;
          border-radius: 14px !important;
          background: #fff !important;
          box-shadow: 0 8px 35px #21114820 !important;
          color: #211148 !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        .cdm-cookie-copy {
          display: block !important;
          min-width: 0 !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        .cdm-cookie-copy h2 {
          display: block !important;
          color: #211148 !important;
          font-size: 18px !important;
          line-height: 1.2 !important;
          margin: 0 0 6px !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        .cdm-cookie-copy p {
          display: block !important;
          color: #656170 !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
          margin: 0 !important;
          max-width: 620px !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        .cdm-cookie-actions {
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          flex-wrap: wrap !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        .cdm-cookie-choice {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          min-height: 42px !important;
          border: 1px solid #211148 !important;
          border-radius: 8px !important;
          background: #fff !important;
          color: #211148 !important;
          padding: 11px 14px !important;
          font: inherit !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        .cdm-cookie-choice:hover { background: #f3f0f8 !important; }
        .cdm-cookie-actions a {
          display: inline-block !important;
          color: #211148 !important;
          font-size: 13px !important;
          text-decoration: underline !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        @media (max-width: 900px) {
          .cdm-cookie-banner {
            grid-template-columns: 1fr !important;
            align-items: stretch !important;
            gap: 14px !important;
            padding: 16px !important;
          }
        }
        @media (max-width: 480px) {
          .cdm-cookie-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
          }
          .cdm-cookie-choice { padding: 10px 8px !important; }
          .cdm-cookie-actions a { grid-column: 1 / -1 !important; }
        }
      `}</style>
      <section
        ref={banner}
        className="cdm-cookie-banner"
        aria-labelledby="cookie-title"
        role="region"
      >
        <div className="cdm-cookie-copy">
          <h2 id="cookie-title">We value your privacy</h2>
          <p>
            We use optional cookies to understand website traffic and improve your
            experience. You can accept or reject these cookies.
          </p>
        </div>
        <div className="cdm-cookie-actions">
          <button
            type="button"
            className="cdm-cookie-choice"
            onClick={() => choose("accepted")}
          >
            Accept optional cookies
          </button>
          <button
            type="button"
            className="cdm-cookie-choice"
            onClick={() => choose("rejected")}
          >
            Reject optional cookies
          </button>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
      </section>
    </>
  );
}
