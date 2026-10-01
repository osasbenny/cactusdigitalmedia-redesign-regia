import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, ArrowRight, Pause, Play } from "lucide-react";
import { projects, services } from "../data/site";

function naturalList(items: string[]) {
  const clean = items.filter(Boolean);
  if (clean.length === 0) return "the core product experience";
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(", ")}, and ${clean.at(-1)}`;
}

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
  const manualPause = useRef(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const update = () => {
      if (
        visible &&
        !reduced.matches &&
        !manualPause.current &&
        !document.hidden
      ) {
        if (!video.getAttribute("src")) video.src = src;
        video.muted = true;
        void video.play().catch(() => undefined);
      } else video.pause();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        update();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    reduced.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      video.pause();
    };
  }, [src]);
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
        onPlay={() => setActive(true)}
        onPause={() => setActive(false)}
      />
      <button
        className="video-control"
        aria-label={active ? "Pause animation" : "Play film animation"}
        onClick={() => {
          const el = ref.current;
          if (!el) return;
          if (active) {
            manualPause.current = true;
            el.pause();
            setActive(false);
          } else {
            manualPause.current = false;
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
  const { pathname } = useLocation();
  const serviceSlug = pathname.startsWith("/services/")
    ? pathname.slice("/services/".length)
    : "";
  const projectSlug = pathname.startsWith("/portfolio/")
    ? pathname.slice("/portfolio/".length)
    : "";
  const service = services.find((item) => item.slug === serviceSlug);
  const project = projects.find((item) => item.slug === projectSlug);
  const archivedProjects = projects.filter((item) => item.status === "Archived work");

  let context: string[] = [];

  if (service) {
    context = [
      `For ${service.shortLabel.toLowerCase()}, we typically shape the scope around ${naturalList(service.capabilities)}. The useful combination depends on the audience, the business goal, the systems the work must connect to, and what needs to be ready for the first meaningful release.`,
      `Depending on those requirements, implementation may draw on ${naturalList(service.technologies)}. We choose the stack after discovery, with attention to maintainability, accessibility, integrations, measurement, and launch needs so the technology supports the product instead of driving it.`,
    ];
  } else if (project) {
    const focus = project.features?.length
      ? naturalList(project.features)
      : project.description;
    context = [
      `${project.title} is part of our ${project.category.toLowerCase()} portfolio. This case study is centered on ${focus}. It documents the experience represented in our portfolio and keeps the description tied to the project information, screens, and public references we can verify.`,
      project.status === "Archived work"
        ? `This is an archived portfolio record, so the current third-party website may have changed since the work was originally delivered. We preserve the page as part of Cactus Digital Media’s project history and link to a live destination only when one is still available in the project record.`
        : `For related work, we begin by clarifying the audience, primary journey, essential first release, and the systems around the product. The exact scope varies by project, but the aim stays consistent: make the experience understandable, useful, and practical to evolve after launch.`,
    ];
  } else if (pathname === "/portfolio") {
    context = [
      "Our portfolio combines recent products with an archive of earlier client and concept work. Keeping both visible makes the project history easier to understand while giving search engines and visitors a clear path from the main portfolio page to the individual case-study records.",
    ];
  }

  return (
    <section className="wrap cta">
      <span className="eyebrow">Your next digital move</span>
      <h2>
        Good ideas deserve
        <br />a <em>great build.</em>
      </h2>
      {context.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {pathname === "/portfolio" && archivedProjects.length > 0 && (
        <details>
          <summary className="text-link">
            Browse {archivedProjects.length} archived projects
          </summary>
          <div className="tech-tags" aria-label="Archived portfolio projects">
            {archivedProjects.map((item) => (
              <Link
                key={item.slug}
                className="filter"
                to={`/portfolio/${item.slug}`}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </details>
      )}
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
