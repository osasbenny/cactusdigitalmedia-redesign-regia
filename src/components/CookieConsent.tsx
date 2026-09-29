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
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty(
        "--cookie-banner-height",
        `${el.getBoundingClientRect().height + 12}px`,
      );
    });
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
    <section
      ref={banner}
      className="cookie-banner"
      aria-labelledby="cookie-title"
    >
      <div className="cookie-copy">
        <h2 id="cookie-title">We value your privacy</h2>
        <p>
          We use optional cookies to understand website traffic and improve your
          experience. You can accept or reject these cookies.
        </p>
      </div>
      <div className="cookie-actions">
        <button className="cookie-choice" onClick={() => choose("accepted")}>
          Accept optional cookies
        </button>
        <button className="cookie-choice" onClick={() => choose("rejected")}>
          Reject optional cookies
        </button>
        <Link to="/privacy">Privacy Policy</Link>
      </div>
    </section>
  );
}
