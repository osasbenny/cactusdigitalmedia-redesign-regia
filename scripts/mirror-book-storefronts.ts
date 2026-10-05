import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const SITE_ORIGIN = "https://cactusdigitalmedia.ng";

type Storefront = {
  name: string;
  origins: string[];
  route: string;
  title: string;
  description: string;
  fallbackRoutes: string[];
};

const STOREFRONTS: Storefront[] = [
  {
    name: "Beyond the Machine",
    origins: ["https://beyond-the-machine-book.vercel.app"],
    route: "/beyond-the-machine-book",
    title: "Beyond The Machine — Osagie Bernard Ebhuomhan",
    description:
      "Beyond The Machine explores what it means to remain human in an age increasingly shaped by technology and artificial intelligence.",
    fallbackRoutes: ["/payment/callback"],
  },
  {
    name: "Thoughts Are Things",
    origins: ["https://thoughts-are-things.vercel.app"],
    route: "/thoughts-are-things-book",
    title: "Thoughts Are Things — Osagie Bernard Ebhuomhan",
    description:
      "Thoughts Are Things explores how the mind shapes emotion, belief, behavior, and the life we build.",
    fallbackRoutes: ["/payment/success", "/payment/cancelled"],
  },
  {
    name: "My Big Adventure Coloring Book",
    origins: ["https://aura-kids-books.vercel.app"],
    route: "/my-big-adventure-coloring-book",
    title: "My Big Adventure Coloring Book — AuraKidsBooks",
    description:
      "My Big Adventure Coloring Book is a playful AuraKidsBooks activity title for children, created by Osagie Bernard Ebhuomhan.",
    fallbackRoutes: ["/purchase/success"],
  },
];

async function fetchResponse(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": "CactusDigitalMedia-Build/1.0" },
    signal: AbortSignal.timeout(20_000),
    redirect: "error",
  });
  if (!response.ok)
    throw new Error(`Unable to fetch ${url}: HTTP ${response.status}`);
  return response;
}

async function discoverOrigin(storefront: Storefront) {
  const failures: string[] = [];
  for (const origin of storefront.origins) {
    try {
      const response = await fetchResponse(`${origin}/`);
      const sourceIndex = await response.text();
      if (
        !/id=["']root["']/.test(sourceIndex) ||
        !/src=["']\/assets\/[^"']+\.js["']/.test(sourceIndex) ||
        /geist-skip-nav|Login – Vercel/.test(sourceIndex)
      ) {
        throw new Error(`Invalid storefront document from ${origin}`);
      }
      return { origin, sourceIndex };
    } catch (error) {
      failures.push(
        `${origin}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  throw new Error(
    `No reachable production origin for ${storefront.name}. ${failures.join(" | ")}`,
  );
}

function assetPath(value: string) {
  if (value.startsWith("./assets/")) return `/assets/${value.slice(9)}`;
  if (value.startsWith("assets/")) return `/assets/${value.slice(7)}`;
  return value;
}

function rewriteAssetReferences(text: string, route: string) {
  return text.replace(/(?<![\w:/-])(?:\.\/|\/)?assets\//g, `${route}/assets/`);
}

function ensureParent(path: string) {
  const parent = path.slice(0, path.lastIndexOf("/"));
  if (parent) mkdirSync(parent, { recursive: true });
}

async function mirrorStorefront(storefront: Storefront) {
  const targetDir = `dist${storefront.route}`;
  mkdirSync(`${targetDir}/assets`, { recursive: true });

  const { origin, sourceIndex } = await discoverOrigin(storefront);
  console.log(`Using ${origin} for ${storefront.name}.`);
  const externalMedia = new Map<string, string>();
  const rewriteMedia = (text: string) =>
    text.replace(
      /https:\/\/files\.manuscdn\.com\/[A-Za-z0-9_./%-]+\.(?:png|jpe?g|webp|svg)/gi,
      (url) => {
        const filename = `${createHash("sha256").update(url).digest("hex").slice(0, 16)}-${url.split("/").pop()}`;
        const path = `/media/${filename}`;
        externalMedia.set(url, path);
        return `${storefront.route}${path}`;
      },
    );

  const primaryAssets = new Set<string>();
  for (const match of sourceIndex.matchAll(
    /(?:src|href)=["']((?:\.\/|\/)?assets\/[^"']+)["']/g,
  )) {
    const normalized = assetPath(match[1]);
    if (normalized.startsWith("/assets/"))
      primaryAssets.add(normalized.split(/[?#]/)[0]);
  }

  const publicAssets = new Set<string>();
  for (const match of sourceIndex.matchAll(
    /(?:src|href)=["'](\/[^"']+\.(?:svg|png|ico|webmanifest))(?:\?[^"']*)?["']/gi,
  )) {
    publicAssets.add(match[1]);
  }

  for (const path of primaryAssets) {
    const response = await fetchResponse(`${origin}${path}`);
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    const destination = `${targetDir}${path}`;
    if (/text\/html/i.test(contentType))
      throw new Error(`Asset returned HTML: ${origin}${path}`);
    ensureParent(destination);

    if (/(?:javascript|css|json|text|xml|svg)/i.test(contentType)) {
      let text = await response.text();

      // Storage helpers also compose asset URLs from a base and template filename.
      for (const match of text.matchAll(
        /\$\{[^}]+\}\/([A-Za-z0-9_.-]+\.(?:png|jpe?g|webp|svg|woff2?))/g,
      )) {
        primaryAssets.add(`/assets/${match[1]}`);
      }

      // Vite imports, preload dependency arrays, and CSS URLs may reference secondary chunks.
      for (const match of text.matchAll(
        /["'(]((?:\.\/|\/)?assets\/[^"')?#]+|\.\/[^"')?#]+\.(?:js|css|woff2?|png|jpe?g|svg|webp))(?=["')?#])/g,
      )) {
        const reference = /^(?:\.\/|\/)?assets\//.test(match[1])
          ? assetPath(match[1])
          : match[1];
        const dependency = new URL(reference, `${origin}${path}`).pathname;
        if (dependency.startsWith("/assets/")) primaryAssets.add(dependency);
      }

      for (const match of text.matchAll(
        /(["'(=])\/(?!\/|api\/|assets\/)([A-Za-z0-9_.@%+\-/]+\.(?:png|jpe?g|webp|svg|ico|woff2?|ttf))(?=["')?#])/gi,
      )) {
        publicAssets.add(`/${match[2]}`);
      }

      text = text.replace(
        /(["'(=])\/(?!\/|api\/|assets\/)([A-Za-z0-9_.@%+\-/]+\.(?:png|jpe?g|webp|svg|ico|woff2?|ttf))(?=["')?#])/gi,
        (_match, prefix: string, resource: string) =>
          `${prefix}${storefront.route}/${resource}`,
      );
      text = rewriteAssetReferences(text, storefront.route)
        .replaceAll('"/assets"', JSON.stringify(`${storefront.route}/assets`))
        .replaceAll('window.location.hostname==="cactusdigitalmedia.ng"&&', "");
      writeFileSync(destination, rewriteMedia(text));
    } else {
      writeFileSync(destination, Buffer.from(await response.arrayBuffer()));
    }
  }

  publicAssets.add("/favicon.svg");
  for (const path of publicAssets) {
    try {
      const response = await fetchResponse(`${origin}${path}`);
      const destination = `${targetDir}${path}`;
      ensureParent(destination);
      writeFileSync(destination, Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      console.warn(
        `Skipping optional public asset ${path} for ${storefront.name}:`,
        error,
      );
    }
  }

  // Development runtime and unresolved analytics placeholders are not storefront dependencies.
  const cleanIndex = sourceIndex
    .replace(
      /<script[^>]*id=["']manus-runtime["'][^>]*>[\s\S]*?<\/script>/gi,
      "",
    )
    .replace(
      /<script[^>]*src=["'][^"']*%VITE_[^"']*["'][^>]*>[\s\S]*?<\/script>/gi,
      "",
    );
  let index = rewriteMedia(rewriteAssetReferences(cleanIndex, storefront.route))
    .replaceAll('href="/favicon.svg"', `href="${storefront.route}/favicon.svg"`)
    .replaceAll(
      'href="./favicon.svg"',
      `href="${storefront.route}/favicon.svg"`,
    )
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${storefront.title}</title>`)
    .replace(
      /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?\s*>/i,
      `<meta name="description" content="${storefront.description}">`,
    );

  const canonical = `${SITE_ORIGIN}${storefront.route}`;
  if (/<link\s+rel=["']canonical["']/i.test(index)) {
    index = index.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${canonical}">`,
    );
  } else {
    index = index.replace(
      "</head>",
      `  <link rel="canonical" href="${canonical}">\n</head>`,
    );
  }
  if (/<meta\s+property=["']og:url["']/i.test(index)) {
    index = index.replace(
      /<meta\s+property=["']og:url["'][^>]*>/i,
      `<meta property="og:url" content="${canonical}">`,
    );
  } else {
    index = index.replace(
      "</head>",
      `  <meta property="og:url" content="${canonical}">\n</head>`,
    );
  }

  for (const [url, path] of externalMedia) {
    const response = await fetchResponse(url);
    if (!response.headers.get("content-type")?.startsWith("image/")) {
      throw new Error(`Media returned non-image content: ${url}`);
    }
    const destination = `${targetDir}${path}`;
    ensureParent(destination);
    writeFileSync(destination, Buffer.from(await response.arrayBuffer()));
  }

  writeFileSync(`${targetDir}/index.html`, index);
  for (const fallback of storefront.fallbackRoutes) {
    const dir = `${targetDir}${fallback}`;
    mkdirSync(dir, { recursive: true });
    writeFileSync(`${dir}/index.html`, index);
  }

  const sitemapPath = "dist/sitemap.xml";
  let sitemap = readFileSync(sitemapPath, "utf8");
  if (!sitemap.includes(canonical)) {
    sitemap = sitemap.replace(
      "</urlset>",
      `<url><loc>${canonical}</loc></url></urlset>`,
    );
    writeFileSync(sitemapPath, sitemap);
  }

  console.log(`Mirrored ${storefront.name} to ${storefront.route}.`);
}

for (const storefront of STOREFRONTS) await mirrorStorefront(storefront);
