import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname } from "node:path";

const SITE_ORIGIN = "https://cactusdigitalmedia.ng";

type Storefront = {
  name: string;
  origin: string;
  route: string;
  title: string;
  description: string;
  fallbackRoutes: string[];
};

const STOREFRONTS: Storefront[] = [
  {
    name: "Beyond the Machine",
    origin: "https://the-dance-of-intuition-book.vercel.app",
    route: "/beyond-the-machine-book",
    title: "Beyond The Machine — Osagie Bernard Ebhuomhan",
    description: "Beyond The Machine explores what it means to remain human in an age increasingly shaped by technology and artificial intelligence.",
    fallbackRoutes: ["/payment/callback"],
  },
  {
    name: "Thoughts Are Things",
    origin: "https://thoughts-are-things.vercel.app",
    route: "/thoughts-are-things-book",
    title: "Thoughts Are Things — Osagie Bernard Ebhuomhan",
    description: "Thoughts Are Things explores how the mind shapes emotion, belief, behavior, and the life we build.",
    fallbackRoutes: ["/payment/success", "/payment/cancelled"],
  },
  {
    name: "My Big Adventure Coloring Book",
    origin: "https://aura-kids-books.vercel.app",
    route: "/my-big-adventure-coloring-book",
    title: "My Big Adventure Coloring Book — AuraKidsBooks",
    description: "My Big Adventure Coloring Book is a playful AuraKidsBooks activity title for children, created by Osagie Bernard Ebhuomhan.",
    fallbackRoutes: ["/purchase/success"],
  },
];

function contentTypeIsText(contentType: string) {
  return /(?:javascript|css|json|text|xml|svg)/i.test(contentType);
}

async function fetchResponse(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": "CactusDigitalMedia-Build/1.0" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Unable to fetch ${url}: HTTP ${response.status}`);
  return response;
}

function ensureParent(path: string) {
  const parent = path.slice(0, path.lastIndexOf("/"));
  if (parent) mkdirSync(parent, { recursive: true });
}

function sanitizeExternalName(url: string, index: number) {
  const pathname = new URL(url).pathname;
  const extension = extname(pathname) || ".bin";
  return `external-${String(index + 1).padStart(2, "0")}${extension}`;
}

async function mirrorStorefront(storefront: Storefront) {
  const targetDir = `dist${storefront.route}`;
  mkdirSync(`${targetDir}/assets`, { recursive: true });

  const sourceIndex = await (await fetchResponse(`${storefront.origin}/`)).text();
  const queue = new Set<string>();
  for (const match of sourceIndex.matchAll(/(?:src|href)=["'](\/assets\/[^"']+)["']/g)) queue.add(match[1]);
  if (/href=["']\/favicon\.svg["']/.test(sourceIndex)) queue.add("/favicon.svg");

  const mirrored = new Set<string>();
  const externalMap = new Map<string, string>();
  let externalCount = 0;

  async function mirrorExternal(url: string) {
    if (externalMap.has(url)) return externalMap.get(url)!;
    const localName = sanitizeExternalName(url, externalCount++);
    const localUrl = `${storefront.route}/assets/${localName}`;
    const response = await fetchResponse(url);
    const bytes = Buffer.from(await response.arrayBuffer());
    writeFileSync(`${targetDir}/assets/${localName}`, bytes);
    externalMap.set(url, localUrl);
    return localUrl;
  }

  async function processText(text: string) {
    let output = text.replaceAll("/assets/", `${storefront.route}/assets/`);
    const externalUrls = Array.from(
      new Set(
        [...output.matchAll(/https:\/\/files\.manuscdn\.com\/[A-Za-z0-9_?&=./%+-]+/g)].map((match) => match[0]),
      ),
    );
    for (const url of externalUrls) output = output.replaceAll(url, await mirrorExternal(url));
    return output;
  }

  while (queue.size) {
    const assetPath = queue.values().next().value as string;
    queue.delete(assetPath);
    if (mirrored.has(assetPath)) continue;
    mirrored.add(assetPath);

    const response = await fetchResponse(`${storefront.origin}${assetPath}`);
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const relativePath = assetPath.startsWith("/assets/")
      ? assetPath.slice("/assets/".length)
      : assetPath.slice(1);
    const destination = assetPath.startsWith("/assets/")
      ? `${targetDir}/assets/${relativePath}`
      : `${targetDir}/${relativePath}`;
    ensureParent(destination);

    if (contentTypeIsText(contentType)) {
      let text = await response.text();
      for (const match of text.matchAll(/\/assets\/[A-Za-z0-9._~@%+\-/?=&]+/g)) {
        const clean = match[0].split(/[?#]/)[0];
        if (clean) queue.add(clean);
      }
      text = await processText(text);
      writeFileSync(destination, text);
    } else {
      writeFileSync(destination, Buffer.from(await response.arrayBuffer()));
    }
  }

  let index = await processText(sourceIndex);
  index = index.replaceAll('href="/favicon.svg"', `href="${storefront.route}/favicon.svg"`);
  index = index.replace(/<title>[\s\S]*?<\/title>/i, `<title>${storefront.title}</title>`);
  index = index.replace(
    /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?\s*>/i,
    `<meta name="description" content="${storefront.description}">`,
  );

  const canonical = `${SITE_ORIGIN}${storefront.route}`;
  if (/<link\s+rel=["']canonical["']/i.test(index)) {
    index = index.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}">`);
  } else {
    index = index.replace("</head>", `  <link rel="canonical" href="${canonical}">\n</head>`);
  }
  if (/<meta\s+property=["']og:url["']/i.test(index)) {
    index = index.replace(/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonical}">`);
  } else {
    index = index.replace("</head>", `  <meta property="og:url" content="${canonical}">\n</head>`);
  }

  const googleFonts = [...index.matchAll(/<link[^>]+href=["'](https:\/\/fonts\.googleapis\.com\/[^"']+)["'][^>]*>/g)];
  for (const match of googleFonts) {
    const cssUrl = match[1];
    let css = await (await fetchResponse(cssUrl)).text();
    const fontUrls = Array.from(new Set([...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map((m) => m[1])));
    for (const fontUrl of fontUrls) {
      const localName = sanitizeExternalName(fontUrl, externalCount++);
      const response = await fetchResponse(fontUrl);
      writeFileSync(`${targetDir}/assets/${localName}`, Buffer.from(await response.arrayBuffer()));
      css = css.replaceAll(fontUrl, `${storefront.route}/assets/${localName}`);
    }
    writeFileSync(`${targetDir}/fonts.css`, css);
    index = index.replace(match[0], `<link rel="stylesheet" href="${storefront.route}/fonts.css">`);
  }
  index = index.replace(/<link[^>]+rel=["']preconnect["'][^>]+fonts\.(?:googleapis|gstatic)\.com[^>]*>/g, "");

  writeFileSync(`${targetDir}/index.html`, index);
  for (const fallback of storefront.fallbackRoutes) {
    const dir = `${targetDir}${fallback}`;
    mkdirSync(dir, { recursive: true });
    writeFileSync(`${dir}/index.html`, index);
  }

  const sitemapPath = "dist/sitemap.xml";
  let sitemap = readFileSync(sitemapPath, "utf8");
  if (!sitemap.includes(canonical)) {
    sitemap = sitemap.replace("</urlset>", `<url><loc>${canonical}</loc></url></urlset>`);
    writeFileSync(sitemapPath, sitemap);
  }

  console.log(`Mirrored ${storefront.name} to ${storefront.route}.`);
}

for (const storefront of STOREFRONTS) await mirrorStorefront(storefront);
