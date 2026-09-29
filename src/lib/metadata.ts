import { brand, services, projects, posts } from "../data/site";
export function metadata(path: string) {
  path = path.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  let title = "Cactus Digital Media | Web & Mobile App Development";
  let description =
    "We build high-performance web applications, custom mobile apps (Android & iOS), and enterprise digital solutions engineered for business growth.";
  let found = true;
  const base: Record<string, [string, string]> = {
    "/about": [
      "About Cactus Digital Media",
      "Founded in Lagos in January 2020 by Osagie Bernard Ebhuomhan. Explore our journey from digital agency to software, SaaS, and AI product engineering.",
    ],
    "/services": [
      "Our services",
      "Explore web and mobile app development, SaaS engineering, AI automation, e-commerce, and UI/UX design services from Cactus Digital Media in Lagos.",
    ],
    "/portfolio": [
      "Our portfolio",
      "Explore Cactus Digital Media’s portfolio of Android apps, websites, e-commerce stores, and digital product designs, including GoFuel App and HabitMind.",
    ],
    "/blog": [
      "Ideas & insights",
      "Practical guidance for websites, digital products, and business growth.",
    ],
    "/contact": [
      "Contact Cactus Digital Media",
      "Contact Cactus Digital Media in Lagos, Nigeria about websites, mobile apps, SaaS platforms, AI systems, and support for your business.",
    ],
    "/start-project": [
      "Start a project",
      "Share your goals, scope, and timeline with Cactus Digital Media to start planning your website, mobile app, or custom software project.",
    ],
    "/products": [
      "Digital products",
      "Turn a recurring business problem into a useful digital product.",
    ],
    "/privacy": [
      "Privacy policy",
      "How Cactus Digital Media handles your inquiry information.",
    ],
    "/terms": [
      "Website terms",
      "Terms for using the Cactus Digital Media website.",
    ],
  };
  if (base[path]) [title, description] = base[path];
  else if (path !== "/") {
    const item =
      services.find((s) => path === `/services/${s.slug}`) ||
      projects.find((p) => path === `/portfolio/${p.slug}`) ||
      posts.find((p) => path === `/blog/${p.slug}`);
    if (item) {
      title = "title" in item ? item.title : item.shortLabel;
      description = "description" in item ? item.description : item.excerpt;
    } else {
      title = "Page not found";
      found = false;
    }
  }
  return {
    title: title.includes("Cactus Digital Media")
      ? title
      : `${title} — Cactus Digital Media`,
    description,
    canonical: brand.origin + path,
    image:
      brand.origin +
      (projects.find((p) => path === `/portfolio/${p.slug}`)?.image ||
        "/images/business-meeting.webp"),
    type: posts.some((p) => path === `/blog/${p.slug}`) ? "article" : "website",
    found,
  };
}
export const allRoutes = [
  "/",
  "/about",
  "/services",
  "/portfolio",
  "/blog",
  "/contact",
  "/start-project",
  "/products",
  "/privacy",
  "/terms",
  ...services.map((s) => `/services/${s.slug}`),
  ...projects.map((p) => `/portfolio/${p.slug}`),
  ...posts.map((p) => `/blog/${p.slug}`),
];
export function structuredData(path: string) {
  const m = metadata(path);
  const article = posts.find((p) => path === `/blog/${p.slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": brand.origin + "/#organization",
        name: brand.name,
        url: brand.origin,
        email: brand.email,
        logo: brand.origin + "/apple-touch-icon.png",
        description: metadata("/").description,
        foundingDate: "2020-01",
        foundingLocation: { "@type": "Place", name: "Lagos, Nigeria" },
        founder: {
          "@type": "Person",
          name: "Osagie Bernard Ebhuomhan",
          jobTitle: "Founder, CEO and Lead Product/Software Engineer",
        },
      },
      {
        "@type": "WebSite",
        "@id": brand.origin + "/#website",
        name: brand.name,
        url: brand.origin,
      },
      {
        "@type":
          path === "/about"
            ? "AboutPage"
            : path === "/contact"
              ? "ContactPage"
              : "WebPage",
        "@id": m.canonical + "#webpage",
        url: m.canonical,
        name: m.title,
        description: m.description,
        inLanguage: "en",
        isPartOf: { "@id": brand.origin + "/#website" },
        about: { "@id": brand.origin + "/#organization" },
        primaryImageOfPage: { "@type": "ImageObject", url: m.image },
      },
      ...(path === "/"
        ? []
        : [
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: brand.origin,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name:
                    path.split("/").length > 2
                      ? metadata("/" + path.split("/")[1]).title
                      : m.title,
                  item:
                    path.split("/").length > 2
                      ? brand.origin + "/" + path.split("/")[1]
                      : m.canonical,
                },
                ...(path.split("/").length > 2
                  ? [
                      {
                        "@type": "ListItem",
                        position: 3,
                        name: m.title,
                        item: m.canonical,
                      },
                    ]
                  : []),
              ],
            },
          ]),
      ...(article
        ? [
            {
              "@type": "Article",
              headline: article.title,
              datePublished: article.date,
              dateModified: "2026-09-28",
              author: { "@type": "Organization", name: brand.name },
              mainEntityOfPage: m.canonical,
            },
          ]
        : []),
    ],
  };
}
