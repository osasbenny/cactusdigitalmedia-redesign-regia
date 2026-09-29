import { useArticle } from "../lib/article";
import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { services, projects, posts, process, brand } from "../data/site";
import {
  Arrow,
  CTA,
  PageHero,
  SectionTitle,
  Cinematic,
} from "../components/Shared";
import ProjectCard from "../components/ProjectCard";
import InquiryForm from "../components/InquiryForm";
export function About() {
  return (
    <>
      <PageHero
        eyebrow="Meet Cactus Digital Media"
        title="Good technology starts with understanding."
        copy="Founded in January 2020 in Lagos, Nigeria, we bring design, engineering, and product thinking together for businesses and the products they build."
      />
      <section className="wrap about-grid">
        <img
          src="/images/creative-team.webp"
          alt="People collaborating in a creative workspace"
          width="768"
          height="768"
        />
        <div>
          <span className="eyebrow">Our point of view</span>
          <h2>
            Make it useful.
            <br />
            Make it considered.
            <br />
            <em>Make it work.</em>
          </h2>
          <p>
            A stronger digital presence starts with the people using it. We take
            the time to understand your business, simplify the important
            journeys, and build the foundations for what comes next.
          </p>
          <p>
            From websites and mobile applications to SaaS products and
            automation, our work connects the visible experience with the
            systems behind it.
          </p>
          <Link to="/start-project" className="text-link">
            Tell us what you’re building <Arrow diagonal />
          </Link>
        </div>
      </section>
      <section className="wrap section about-story" aria-labelledby="our-story-title">
        <div className="about-story-heading">
          <span className="eyebrow">Our story</span>
          <h2 id="our-story-title">
            From digital services to <em>products and platforms.</em>
          </h2>
          <p>
            Cactus Digital Media was founded in January 2020 by Osagie Bernard
            Ebhuomhan in Lagos, Nigeria. What began as a service-based digital
            and software agency has grown into a broader software and
            digital-product engineering company.
          </p>
        </div>
        <div className="about-story-grid">
          <article>
            <span className="eyebrow">2020 / Our beginnings</span>
            <h3>Building for businesses.</h3>
            <p>
              We started with website and mobile app development, e-commerce,
              UI/UX design, digital marketing, maintenance, IT support, and
              custom technology services.
            </p>
          </article>
          <article>
            <span className="eyebrow">Our evolution</span>
            <h3>Going beyond agency work.</h3>
            <p>
              Our work expanded into full-stack business software, SaaS
              platforms, dashboards, portals, fintech and marketplace
              solutions, cloud integrations, automation systems, and
              AI-powered applications.
            </p>
          </article>
          <article>
            <span className="eyebrow">Today and ahead</span>
            <h3>Creating what comes next.</h3>
            <p>
              Alongside custom client solutions, we research, design, and
              develop our own applications, SaaS products, AI systems, and
              technology platforms for businesses and consumers in Africa and
              globally.
            </p>
          </article>
        </div>
        <div className="about-leadership">
          <span className="eyebrow">Leadership & collaboration</span>
          <p>
            Founder and CEO <strong>Osagie Bernard Ebhuomhan</strong> also
            serves as Lead Product/Software Engineer. Depending on the
            project, we work with specialists in software development, UI/UX
            and product design, infrastructure, digital strategy, and related
            disciplines. Our long-term direction is to keep growing from a
            traditional digital agency into a technology company that can
            create, launch, and scale software, SaaS, and AI products.
          </p>
        </div>
      </section>
      <section className="wrap section">
        <SectionTitle eyebrow="Our approach" title="Clarity at every stage." />
        <div className="process-grid">
          {process.map(([name, title, copy], i) => (
            <article key={name}>
              <span className="step">0{i + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
      <CTA />
    </>
  );
}
export function Services() {
  return (
    <>
      <PageHero
        eyebrow="What we do"
        title="The right tools. A bigger possibility."
        copy="Design, development, and digital growth—connected around your business goals."
      />
      <section className="wrap services-list">
        {services.map((s, i) => (
          <Link className="service-row" key={s.slug} to={`/services/${s.slug}`}>
            <span className="row-number">{String(i + 1).padStart(2, "0")}</span>
            <h2>{s.shortLabel}</h2>
            <p>{s.description}</p>
            <Arrow diagonal />
          </Link>
        ))}
      </section>
      <CTA />
    </>
  );
}
export function ServiceDetail() {
  const { slug } = useParams();
  const s = services.find((x) => x.slug === slug);
  if (!s) return <NotFound />;
  return (
    <>
      <PageHero eyebrow={s.shortLabel} title={s.label} copy={s.description} />
      <section className="wrap detail-split">
        <Cinematic
          src="/video/metallic-laptop.mp4"
          poster="/images/developer.webp"
          label="Laptop product animation"
        />
        <div>
          <span className="eyebrow">The challenge</span>
          <h2>
            A practical path
            <br />
            to <em>better.</em>
          </h2>
          <p>{s.problem}</p>
          <p>{s.solution}</p>
          <Link className="button dark" to="/start-project">
            Discuss your project <Arrow diagonal />
          </Link>
        </div>
      </section>
      <section className="wrap section">
        <SectionTitle
          eyebrow="Built around your needs"
          title="What we can help with."
        />
        <div className="capabilities">
          {s.capabilities.map((c, i) => (
            <article key={c}>
              <span>0{i + 1}</span>
              <h3>{c}</h3>
            </article>
          ))}
        </div>
        <div className="tech-tags">
          {s.technologies.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </section>
      <section className="wrap section compact">
        <SectionTitle
          eyebrow="How it comes together"
          title="Discover. Design. Build. Launch."
          copy="We clarify the scope, agree the direction, build in milestones, and review the result together."
        />
        <Link to="/portfolio" className="text-link">
          Explore our website work <Arrow diagonal />
        </Link>
      </section>
      <CTA />
    </>
  );
}
export function Portfolio() {
  const [params, setParams] = useSearchParams();
  const filter = params.get("view") || "recent";
  const [query, setQuery] = useState("");
  const categories = [
    "Mobile Applications",
    "SaaS / Products",
    "Web Applications",
    "E-commerce",
    "Websites",
  ];
  const list = projects.filter(
    (p) =>
      (filter === "all" ||
        (filter === "recent"
          ? p.status === "Recent work"
          : filter === "archive"
            ? p.status === "Archived work"
            : p.category === filter && p.status === "Recent work")) &&
      p.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHero
        eyebrow="Recent projects & selected work"
        title="Ideas made real."
        copy="Mobile products, digital platforms, and distinctive websites. Explore the work—and the thinking behind the experience."
      />
      <section className="wrap portfolio-section">
        <div className="filter-bar">
          <div role="group" aria-label="Filter portfolio">
            {[
              ["recent", "Recent work"],
              ["all", "All work"],
              ...categories.map((c) => [c, c]),
              ["archive", "Archive"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={filter === value ? "filter active" : "filter"}
                aria-pressed={filter === value}
                onClick={() =>
                  setParams(value === "recent" ? {} : { view: value })
                }
              >
                {label}
              </button>
            ))}
          </div>
          <label className="search">
            <span className="sr-only">Search projects</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a project…"
              type="search"
            />
          </label>
        </div>
        <p className="result-count" role="status">
          {list.length} projects
        </p>
        <div className="project-grid">
          {list.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
        {!list.length && (
          <div className="empty">
            <h2>No projects match “{query}”.</h2>
            <button
              className="button dark"
              onClick={() => {
                setQuery("");
                setParams({ view: "all" });
              }}
            >
              Show all work
            </button>
          </div>
        )}
      </section>
      <CTA />
    </>
  );
}
export function ProjectDetail() {
  const { slug } = useParams();
  const p = projects.find((x) => x.slug === slug);
  if (!p) return <NotFound />;
  const mobile = p.category === "Mobile Applications";
  return (
    <>
      <PageHero
        eyebrow={`Portfolio / ${p.category}`}
        title={p.title}
        copy={p.description}
      />
      <section className="wrap project-detail">
        <div className="case-summary case-intro">
          <div>
            <span className="eyebrow">The experience</span>
            <h2>{p.context || `A digital presence for ${p.title}.`}</h2>
            {p.credit && <p>{p.credit}</p>}
          </div>
          <div>
            {p.features && (
              <ul className="case-features">
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            )}
            {p.liveUrl ? (
              <a
                href={p.liveUrl}
                className="button dark"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit project <Arrow diagonal />
              </a>
            ) : (
              <p className="muted">Explore the project design below.</p>
            )}
          </div>
        </div>
        {p.image && (
          <div className={mobile ? "case-cover mobile-cover" : "case-cover"}>
            <img
              src={p.image}
              alt={`${p.title} project design`}
              width={mobile ? 1000 : 1000}
              height={mobile ? 1000 : 760}
            />
          </div>
        )}
        {p.gallery && p.gallery.length > 0 && (
          <div className={mobile ? "case-gallery app-gallery" : "case-gallery"}>
            {p.gallery.map((img, i) => (
              <figure key={img.src}>
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  width={img.width}
                  height={img.height}
                />
                <figcaption>
                  {mobile
                    ? img.alt
                    : `${p.title} — complete website experience`}
                </figcaption>
                {!mobile && i === 0 && (
                  <a
                    className="text-link"
                    href={img.src}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View full-size design <Arrow diagonal />
                  </a>
                )}
              </figure>
            ))}
          </div>
        )}
        <Link className="text-link" to="/portfolio">
          Back to all work <Arrow />
        </Link>
      </section>
      <CTA />
    </>
  );
}
export function Blog() {
  const [query, setQuery] = useState("");
  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHero
        eyebrow="Ideas & insights"
        title="Think clearly. Build thoughtfully."
        copy="Practical perspectives on websites, digital products, automation, and business growth."
      />
      <section className="wrap section compact">
        <label className="search">
          <span className="sr-only">Search articles</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find an insight…"
          />
        </label>
        <div className="article-list">
          {filtered.map((p, i) => (
            <Link to={`/blog/${p.slug}`} key={p.slug}>
              <span className="row-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <span className="eyebrow">{p.category}</span>
                <h2>{p.title}</h2>
                <p>{p.excerpt}</p>
              </div>
              <Arrow diagonal />
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
          <p role="status">No articles match your search.</p>
        )}
      </section>
      <CTA />
    </>
  );
}
export function BlogPost() {
  const { slug } = useParams();
  const { article, failed } = useArticle(slug);
  const p = posts.find((x) => x.slug === slug);
  if (!p) return <NotFound />;
  return (
    <>
      <PageHero
        eyebrow={`Insights / ${p.category}`}
        title={p.title}
        copy="Practical guidance for your next digital decision."
      />
      <article className="article-body wrap">
        <p className="article-meta">
          Cactus Digital Media · <time dateTime={p.date}>25 August 2026</time> ·
          Updated for Cactus, September 2026
        </p>
        {!article && (
          <p role="status">
            {failed
              ? "This article could not be loaded. Please refresh the page."
              : "Loading article…"}
          </p>
        )}
        {article?.blocks.map((b, i) =>
          b.type === "h2" ? (
            <h2 key={i}>{b.text}</h2>
          ) : b.type === "h3" ? (
            <h3 key={i}>{b.text}</h3>
          ) : b.type === "li" ? (
            <p key={i} className="checklist-item">
              ✓ {b.text}
            </p>
          ) : (
            <p key={i}>{b.text}</p>
          ),
        )}
        <Link className="text-link" to="/blog">
          All insights <Arrow />
        </Link>
      </article>
      <CTA />
    </>
  );
}
export function Contact({ project = false }: { project?: boolean }) {
  return (
    <>
      <PageHero
        eyebrow={project ? "Start a project" : "Get in touch"}
        title={
          project
            ? "Your idea. Our next conversation."
            : "Let’s talk about what’s next."
        }
        copy={
          project
            ? "Tell us what you have in mind. We’ll help you shape the scope and next step."
            : "A new idea, a better website, or a product ready to grow. We’d love to hear about it."
        }
      />
      <section className="wrap contact-grid">
        <aside>
          <span className="eyebrow">A direct line</span>
          <h2>
            Small question.
            <br />
            Big ambition.
            <br />
            <em>Say hello.</em>
          </h2>
          <a className="contact-email" href={`mailto:${brand.email}`}>
            {brand.email}
          </a>
          <a
            href={brand.whatsapp}
            className="text-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Chat on WhatsApp <Arrow diagonal />
          </a>
          <p>
            Lagos, Nigeria
            <br />
            Working with businesses everywhere.
          </p>
        </aside>
        <div className="form-panel">
          <h2>{project ? "Your project brief" : "Send us a message"}</h2>
          <p>Fields marked * are required.</p>
          <InquiryForm project={project} />
        </div>
      </section>
    </>
  );
}
export function Products() {
  return (
    <>
      <PageHero
        eyebrow="Products & possibilities"
        title="Thinking beyond the launch."
        copy="We help turn recurring problems into useful digital products, from early discovery to a working SaaS foundation."
      />
      <section className="wrap detail-split">
        <img
          src="/images/designer-stylus.webp"
          alt="A designer refining a digital interface"
          width="768"
          height="768"
        />
        <div>
          <h2>
            Have a product
            <br />
            in <em>mind?</em>
          </h2>
          <p>
            Define the audience, the core workflow, and the first useful
            release. Our SaaS and application services help turn that direction
            into a buildable plan.
          </p>
          <Link className="button dark" to="/services/saas">
            Explore SaaS development <Arrow diagonal />
          </Link>
        </div>
      </section>
      <CTA />
    </>
  );
}
export function Legal({ terms = false }: { terms?: boolean }) {
  return (
    <>
      <PageHero
        eyebrow="Cactus Digital Media"
        title={terms ? "Website terms" : "Privacy policy"}
        copy="Last updated: 28 September 2026"
      />
      <article className="article-body wrap">
        {terms ? (
          <>
            <h2>Using this website</h2>
            <p>
              This website provides information about Cactus Digital Media’s
              services and work. Sending an inquiry does not create a contract
              or reserve a delivery date. Scope, pricing, payment, ownership,
              and timelines are agreed separately in writing.
            </p>
            <h2>Project examples and external links</h2>
            <p>
              Portfolio screenshots show archived designs. Third-party websites
              may change after delivery and are controlled by their respective
              operators. Their content and policies may differ from ours.
            </p>
            <h2>SMS messaging terms</h2>
            <p>
              By selecting an optional SMS checkbox, you agree to receive only
              the selected category of text messages from Cactus Digital Media
              at the mobile number you supply. Inquiry and project messages may
              include consultations, appointments, support, and service updates.
              Marketing messages may include service offers and promotions and
              require a separate opt-in. Consent is not a condition of
              purchasing services.
            </p>
            <p>
              Message frequency varies. Message and data rates may apply. Reply
              STOP to opt out or HELP for assistance, or email {brand.email}.
              Carriers are not liable for delayed or undelivered messages. You
              can submit an inquiry without opting into either SMS category.
            </p>
            <h2>Content and acceptable use</h2>
            <p>
              Do not misuse the inquiry tools, attempt unauthorized access, or
              copy protected content without permission. Client names and
              trademarks remain the property of their owners.
            </p>
          </>
        ) : (
          <>
            <h2>Information you share</h2>
            <p>
              When you submit a form, we receive your name, email, optional
              contact and company details, selected service, message, and any
              project details you provide. We use this information to respond to
              your inquiry and discuss the work you requested.
            </p>
            <h2>How information is handled</h2>
            <p>
              Inquiries are delivered through our configured email provider.
              Hosting and email providers process information necessary to
              provide their services. We do not sell inquiry information. A
              hashed network identifier may be retained for up to one hour to
              limit form abuse. Please do not submit passwords, payment details,
              or sensitive records through these forms.
            </p>
            <h2>Mobile information and SMS consent</h2>
            <p>
              SMS preferences are optional, separate, and unchecked by default.
              Providing a phone number or accepting this privacy policy does not
              subscribe you to SMS. When you submit a form, your selected
              preferences, phone number, disclosure version and wording, source
              form, and submission time are included in the inquiry email as a
              consent record.
            </p>
            <p>
              We do not sell or share mobile information with third parties or
              affiliates for marketing or promotional purposes. SMS opt-in data
              and consent are not shared with third parties for their marketing.
              Service providers may process this information only as necessary
              to deliver our communications and support the service.
            </p>
            <p>
              Reply STOP to opt out of SMS or HELP for assistance. You may also
              contact us using the email below. Choosing not to receive SMS does
              not affect your ability to purchase services.
            </p>
            <h2>Retention and your choices</h2>
            <p>
              We retain correspondence as needed to handle the inquiry and any
              resulting business relationship. Contact us to request access,
              correction, or deletion of your inquiry information, subject to
              applicable recordkeeping requirements.
            </p>
            <h2>Cookies and external services</h2>
            <p>
              This site does not currently load advertising or analytics
              cookies. Opening WhatsApp or a portfolio website takes you to a
              separate service with its own privacy practices.
            </p>
          </>
        )}
        <h2>Contact</h2>
        <p>
          Questions? Email <a href={`mailto:${brand.email}`}>{brand.email}</a>.
        </p>
      </article>
    </>
  );
}
export function NotFound() {
  return (
    <section className="wrap not-found">
      <span className="eyebrow">404 / Page not found</span>
      <h1>
        A little off
        <br />
        <em>the path.</em>
      </h1>
      <p>That page doesn’t exist. Let’s get you somewhere useful.</p>
      <Link className="button dark" to="/">
        Back to home <Arrow />
      </Link>
    </section>
  );
}
