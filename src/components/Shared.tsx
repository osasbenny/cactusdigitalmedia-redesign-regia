import { useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight, Pause, Play } from "lucide-react";
export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return diagonal ? (
    <ArrowUpRight size={19} aria-hidden="true" />
  ) : (
    <ArrowRight size={19} aria-hidden="true" />
  );
}
export function SectionTitle({
  eyebrow,
  title,
  copy,
  link,
}: {
  eyebrow: string;
  title: ReactNode;
  copy?: string;
  link?: { to: string; text: string };
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      <div>
        {copy && <p>{copy}</p>}
        {link && (
          <Link className="text-link" to={link.to}>
            {link.text}
            <Arrow />
          </Link>
        )}
      </div>
    </div>
  );
}
export function PageHero({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <header className="page-hero wrap">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{copy}</p>
    </header>
  );
}
export function Cinematic({
  src,
  poster,
  label,
  className = "",
}: {
  src: string;
  poster: string;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  return (
    <div className={`cinematic ${className}`}>
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        poster={poster}
        aria-label={label}
      />
      <button
        className="video-control"
        aria-label={active ? "Pause animation" : "Play film animation"}
        onClick={() => {
          const el = ref.current;
          if (!el) return;
          if (active) {
            el.pause();
            setActive(false);
          } else {
            if (!el.getAttribute("src")) el.src = src;
            void el
              .play()
              .then(() => setActive(true))
              .catch(() => setActive(false));
          }
        }}
      >
        {active ? <Pause size={16} /> : <Play size={16} />}
        <span>{active ? "Pause" : "Play film"}</span>
      </button>
    </div>
  );
}
export function CTA() {
  return (
    <section className="wrap cta">
      <span className="eyebrow">Your next digital move</span>
      <h2>
        Good ideas deserve
        <br />a <em>great build.</em>
      </h2>
      <div>
        <p>
          Tell us what you want to launch, improve, or connect.
          <br />
          Let’s work out the right next step.
        </p>
        <Link className="button dark" to="/start-project">
          Start a project <Arrow diagonal />
        </Link>
      </div>
    </section>
  );
}
