import { Link } from "react-router-dom";
import {
  Code2,
  Smartphone,
  Layers,
  Workflow,
  ShoppingBag,
  PencilRuler,
} from "lucide-react";
import { services, projects, posts, process } from "../data/site";
import { Arrow, CTA, SectionTitle, Cinematic } from "../components/Shared";
import MotionShowcase from "../components/MotionShowcase";
import ProjectCard from "../components/ProjectCard";
const icons = [Code2, Smartphone, Layers, Workflow, ShoppingBag, PencilRuler];
export default function Home() {
  const selected = [
    "web-design",
    "mobile-app-development",
    "saas",
    "ai-automation",
    "ecommerce",
    "ui-ux",
  ].map((slug) => services.find((s) => s.slug === slug)!);
  return (
    <>
      <section className="hero wrap">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="small-line" />
            Creative technology. Real possibilities.
          </span>
          <h1>
            Build better.
            <br />
            Grow <em>smarter.</em>
          </h1>
          <p>
            Websites, apps, and connected digital products.
            <br className="desktop-break" /> Designed around your business.
            Built for what’s next.
          </p>
          <div className="actions">
            <Link className="button dark" to="/start-project">
              Let’s build something <Arrow diagonal />
            </Link>
            <Link className="button plain" to="/portfolio">
              Explore our work <Arrow />
            </Link>
          </div>
          <div className="hero-note">
            <span>Based in Lagos.</span>
            <span>Building beyond borders.</span>
          </div>
        </div>
        <div className="hero-art">
          <div className="art-label">IDEAS → EXPERIENCES</div>
          <img
            className="hero-meeting"
            src="/images/business-meeting.webp"
            width="768"
            height="768"
            alt="People discussing ideas around a meeting table"
            fetchPriority="high"
          />
          <img
            className="hero-developer"
            src="/images/developer.webp"
            width="768"
            height="768"
            alt="A developer working on a digital interface"
          />
          <img
            className="hero-ring"
            src="/images/ring.webp"
            width="500"
            height="500"
            alt=""
          />
          <div className="art-caption">
            <span className="signal" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <div>
              Human ideas.
              <br />
              <strong>Digital possibilities.</strong>
            </div>
            <Arrow diagonal />
          </div>
        </div>
      </section>
      <MotionShowcase />
      <div className="service-ribbon">
        <div className="wrap">
          <span>Websites</span>
          <span>Mobile apps</span>
          <span>SaaS products</span>
          <span>AI & automation</span>
          <span>E-commerce</span>
          <span>UI/UX design</span>
        </div>
      </div>
      <section className="wrap section">
        <SectionTitle
          eyebrow="01 / What we build"
          title={
            <>
              Big thinking.
              <br />
              Purposeful execution.
            </>
          }
          copy="From your first website to your next digital product, we connect the right design and technology to the work that matters."
          link={{ to: "/services", text: "Explore all services" }}
        />
        <div className="services-grid">
          {selected.map((s, i) => {
            const Icon = icons[i];
            return (
              <Link
                className="service-card"
                to={`/services/${s.slug}`}
                key={s.slug}
              >
                <div className="service-top">
                  <Icon strokeWidth={1.4} size={30} />
                  <span>0{i + 1}</span>
                </div>
                <h3>{s.shortLabel}</h3>
                <p>{s.description}</p>
                <span className="service-arrow">
                  <Arrow diagonal />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="ecosystem">
        <div className="wrap ecosystem-grid">
          <div>
            <span className="eyebrow">Connected by design</span>
            <h2>
              One business.
              <br />A whole world
              <br />
              of <em>possibility.</em>
            </h2>
            <p>
              Your website, app, and everyday tools should work together. We
              bring the pieces into one considered digital experience.
            </p>
            <Link className="button light" to="/services">
              Connect the dots <Arrow diagonal />
            </Link>
          </div>
          <div className="ecosystem-art">
            <Cinematic
              src="/video/glass-ribbon.mp4"
              poster="/images/workspace-hands.webp"
              label="Abstract glass ribbon in motion"
            />
            <div className="ecosystem-label">
              DESIGN + ENGINEERING + STRATEGY
            </div>
          </div>
        </div>
      </section>
      <section className="wrap section">
        <SectionTitle
          eyebrow="02 / Recent work"
          title={
            <>
              Less talk.
              <br />
              <em>More to explore.</em>
            </>
          }
          copy="From fuel access and client discovery to local commerce. Explore recent digital products and websites built for very different ambitions."
          link={{ to: "/portfolio", text: "View the full portfolio" }}
        />
        <div className="project-grid">
          {projects
            .filter((p) => p.featured)
            .slice(0, 6)
            .map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
        </div>
      </section>
      <section className="human-section wrap">
        <div className="human-image">
          <img
            src="/images/project-discussion.webp"
            loading="lazy"
            width="768"
            height="768"
            alt="A collaborative discussion around a laptop"
          />
          <span>People first. Always.</span>
        </div>
        <div className="human-copy">
          <span className="eyebrow">Technology with a human side</span>
          <h2>
            Built for people.
            <br />
            Not just <em>screens.</em>
          </h2>
          <p>
            Founded in Lagos in January 2020 by Osagie Bernard Ebhuomhan,
            Cactus Digital Media grew from a digital agency into a team that
            builds client solutions and its own software, SaaS, and AI
            products. We bring product thinking, design, and engineering to
            work that helps people move forward.
          </p>
          <Link className="text-link" to="/about">
            Meet Cactus Digital Media <Arrow diagonal />
          </Link>
        </div>
      </section>
      <section className="wrap section">
        <SectionTitle
          eyebrow="03 / How we work"
          title="A clear path forward."
          copy="A collaborative process, with the right questions up front and clear milestones along the way."
        />
        <div className="process-grid">
          {process.map(([name, title, copy], i) => (
            <article key={name}>
              <span className="step">0{i + 1}</span>
              <span className="eyebrow">{name}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="insight-section">
        <div className="wrap">
          <SectionTitle
            eyebrow="04 / Ideas & insights"
            title={
              <>
                A little perspective.
                <br />A better next move.
              </>
            }
            link={{ to: "/blog", text: "Read all insights" }}
          />
          <div className="blog-grid">
            {posts
              .filter((p) =>
                /mobile-first|convert-more|digital-transformation/.test(p.slug),
              )
              .map((p, i) => (
                <Link className="blog-card" key={p.slug} to={`/blog/${p.slug}`}>
                  <img
                    src={
                      [
                        "/images/smartphone-woman.webp",
                        "/images/ecommerce-owner.webp",
                        "/images/workspace-hands.webp",
                      ][i]
                    }
                    alt=""
                    loading="lazy"
                    width="768"
                    height="768"
                  />
                  <span className="eyebrow">{p.category}</span>
                  <h3>{p.title}</h3>
                  <span className="text-link">
                    Read the story <Arrow diagonal />
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>
      <CTA />
    </>
  );
}
