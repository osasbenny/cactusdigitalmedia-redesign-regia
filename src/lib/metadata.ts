import { brand, services, projects, posts } from "../data/site";
export function metadata(path: string) {
  let title = "Cactus Digital Media — Build better. Grow smarter.";
  let description =
    "Websites, apps, SaaS products, and AI automation. Cactus Digital Media connects design and technology around your business.";
  let found = true;
  const base: Record<string, [string, string]> = {
    "/about": [
      "About Cactus Digital Media",
      "Design, engineering, and product thinking for ambitious businesses.",
    ],
    "/services": [
      "Our services",
      "Websites, applications, SaaS, AI automation, e-commerce, and digital growth.",
    ],
    "/portfolio": [
      "Our portfolio",
      "Explore website design and development work across different industries.",
    ],
    "/blog": [
      "Ideas & insights",
      "Practical guidance for websites, digital products, and business growth.",
    ],
    "/contact": [
      "Contact Cactus Digital Media",
      "Tell us what you want to build, improve, or connect.",
    ],
    "/start-project": [
      "Start a project",
      "Share your project brief with Cactus Digital Media.",
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
      },
      {
        "@type": "WebSite",
        "@id": brand.origin + "/#website",
        name: brand.name,
        url: brand.origin,
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
                  name: m.title,
                  item: m.canonical,
                },
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
