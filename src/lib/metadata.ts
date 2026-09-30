import { brand, services, projects, posts } from "../data/site";

export const servedMarkets = [
  "Nigeria",
  "Lagos",
  "Abuja",
  "Tanzania",
  "Egypt",
  "Australia",
  "USA",
  "Canada",
];

const organizationId = `${brand.origin}/#organization`;
const websiteId = `${brand.origin}/#website`;
const founderId = `${brand.origin}/about#osagie-bernard-ebhuomhan`;

const socialProfiles = [
  "https://github.com/osasbenny",
  "https://www.linkedin.com/in/osagie-bernard-ebhuomhan-osg/",
  "https://www.instagram.com/osas.codes/",
  "http://www.behance.net/osas_codes",
];

const servedMarketSchema = servedMarkets.map((name) => ({
  "@type": ["Lagos", "Abuja"].includes(name) ? "City" : "Country",
  name: name === "USA" ? "United States" : name,
}));

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
      "Practical guidance for websites, digital products, automation, and business growth.",
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
      "Explore digital products, software, SaaS, and AI systems created by Cactus Digital Media.",
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

  if (base[path]) {
    [title, description] = base[path];
  } else if (path !== "/") {
    const service = services.find((s) => path === `/services/${s.slug}`);
    const project = projects.find((p) => path === `/portfolio/${p.slug}`);
    const article = posts.find((p) => path === `/blog/${p.slug}`);

    if (service) {
      title = service.shortLabel;
      description = service.description;
    } else if (project) {
      title = project.title;
      description = project.description;
    } else if (article) {
      title = article.title;
      description = article.metaDescription;
    } else {
      title = "Page not found";
      found = false;
    }
  }

  const project = projects.find((p) => path === `/portfolio/${p.slug}`);
  const article = posts.find((p) => path === `/blog/${p.slug}`);

  return {
    title: title.includes("Cactus Digital Media")
      ? title
      : `${title} — Cactus Digital Media`,
    description,
    canonical: brand.origin + path,
    keywords: [
      brand.name,
      "custom software development",
      "web application development",
      "mobile app development",
      "SaaS development",
      "AI automation",
      "Android and iOS apps",
      "enterprise digital solutions",
      ...servedMarkets,
    ].join(", "),
    image:
      brand.origin +
      (project?.image || "/images/cactus-digital-media-business-meeting.webp"),
    type: article ? "article" : "website",
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

function pageType(path: string) {
  if (path === "/about") return "AboutPage";
  if (path === "/contact" || path === "/start-project") return "ContactPage";
  if (path === "/blog") return "Blog";
  if (path === "/products" || path === "/portfolio" || path === "/services")
    return "CollectionPage";
  return "WebPage";
}

function breadcrumbName(segment: string) {
  const names: Record<string, string> = {
    services: "Services",
    portfolio: "Portfolio",
    blog: "Ideas & insights",
    products: "Digital products",
  };
  return names[segment] || segment.replaceAll("-", " ");
}

export function structuredData(path: string) {
  path = path.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  const m = metadata(path);
  const article = posts.find((p) => path === `/blog/${p.slug}`);
  const service = services.find((s) => path === `/services/${s.slug}`);
  const project = projects.find((p) => path === `/portfolio/${p.slug}`);

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: brand.name,
      url: brand.origin,
      email: brand.email,
      logo: {
        "@type": "ImageObject",
        "@id": `${brand.origin}/#logo`,
        url: `${brand.origin}/cactus-digital-media-apple-touch-icon.png`,
      },
      image: `${brand.origin}/images/cactus-digital-media-business-meeting.webp`,
      description: metadata("/").description,
      areaServed: servedMarketSchema,
      foundingDate: "2020-01",
      foundingLocation: { "@type": "Place", name: "Lagos, Nigeria" },
      founder: { "@id": founderId },
      sameAs: socialProfiles,
      knowsAbout: [
        "Custom software development",
        "Web application development",
        "Mobile app development",
        "SaaS product development",
        "AI automation",
        "UI/UX design",
        "E-commerce development",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Cactus Digital Media services",
        itemListElement: services.map((serviceItem) => ({
          "@type": "Offer",
          url: `${brand.origin}/services/${serviceItem.slug}`,
          itemOffered: {
            "@type": "Service",
            name: serviceItem.shortLabel,
            description: serviceItem.description,
            provider: { "@id": organizationId },
          },
        })),
      },
    },
    {
      "@type": "Person",
      "@id": founderId,
      name: "Osagie Bernard Ebhuomhan",
      jobTitle: "Founder, CEO and Lead Product/Software Engineer",
      url: `${brand.origin}/about`,
      worksFor: { "@id": organizationId },
      sameAs: socialProfiles,
      knowsAbout: [
        "Software engineering",
        "Product engineering",
        "Mobile application development",
        "SaaS",
        "AI automation",
      ],
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: brand.name,
      url: brand.origin,
      publisher: { "@id": organizationId },
      inLanguage: "en",
    },
    {
      "@type": pageType(path),
      "@id": `${m.canonical}#webpage`,
      url: m.canonical,
      name: m.title,
      description: m.description,
      inLanguage: "en",
      isPartOf: { "@id": websiteId },
      about: { "@id": organizationId },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: m.image,
      },
    },
  ];

  if (path !== "/") {
    const segments = path.split("/").filter(Boolean);
    const itemListElement = [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: brand.origin,
      },
    ];

    if (segments.length > 1) {
      itemListElement.push({
        "@type": "ListItem",
        position: 2,
        name: breadcrumbName(segments[0]),
        item: `${brand.origin}/${segments[0]}`,
      });
      itemListElement.push({
        "@type": "ListItem",
        position: 3,
        name: article?.title || service?.shortLabel || project?.title || m.title,
        item: m.canonical,
      });
    } else {
      itemListElement.push({
        "@type": "ListItem",
        position: 2,
        name: m.title,
        item: m.canonical,
      });
    }

    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${m.canonical}#breadcrumb`,
      itemListElement,
    });
  }

  if (service) {
    graph.push({
      "@type": "Service",
      "@id": `${m.canonical}#service`,
      name: service.shortLabel,
      serviceType: service.shortLabel,
      description: service.description,
      url: m.canonical,
      provider: { "@id": organizationId },
      areaServed: servedMarketSchema,
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: `${service.shortLabel} capabilities`,
        itemListElement: service.capabilities.map((capability) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: capability,
          },
        })),
      },
    });
  }

  if (project) {
    graph.push({
      "@type": "CreativeWork",
      "@id": `${m.canonical}#project`,
      name: project.title,
      description: project.description,
      url: m.canonical,
      image: project.image ? `${brand.origin}${project.image}` : m.image,
      creator: { "@id": organizationId },
      about: project.category,
    });
  }

  if (article) {
    graph.push({
      "@type": "BlogPosting",
      "@id": `${m.canonical}#article`,
      headline: article.title,
      description: article.metaDescription || article.excerpt,
      image: {
        "@type": "ImageObject",
        url: m.image,
      },
      datePublished: article.date,
      dateModified: article.date,
      author: { "@id": founderId },
      publisher: { "@id": organizationId },
      mainEntityOfPage: { "@id": `${m.canonical}#webpage` },
      isPartOf: { "@id": websiteId },
      inLanguage: "en",
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
