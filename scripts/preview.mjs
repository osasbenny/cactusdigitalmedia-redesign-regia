import { gzipSync } from "node:zlib";
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname } from "node:path";
const root = resolve("dist");
const config = JSON.parse(await readFile("vercel.json", "utf8"));
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".xml": "application/xml",
  ".txt": "text/plain",
};
const args = process.argv.slice(2);
const port = Number(args[args.indexOf("--port") + 1]) || 4173;
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      let path = decodeURIComponent(url.pathname);
      let status = 200;
      for (const route of config.routes) {
        if (!route.src) continue;
        const match = new RegExp(`^${route.src}$`).test(path);
        if (!match) continue;
        const conditionMatches = (condition) => {
          const value =
            condition.type === "header"
              ? req.headers[condition.key.toLowerCase()]
              : condition.type === "query"
                ? url.searchParams.get(condition.key)
                : condition.type === "host"
                  ? url.hostname
                  : undefined;
          if (value === undefined || value === null) return false;
          return (
            condition.value === undefined ||
            new RegExp(`^(?:${condition.value})$`).test(String(value))
          );
        };
        if (route.has && !route.has.every(conditionMatches)) continue;
        if (route.missing && route.missing.some(conditionMatches)) continue;
        if (route.methods && !route.methods.includes(req.method)) continue;
        if (route.headers)
          for (const [key, value] of Object.entries(route.headers))
            res.setHeader(key, value);
        if (route.status === 308) {
          res.writeHead(308);
          res.end();
          return;
        }
        if (route.dest && route.status !== 404) {
          status = route.status || 200;
          path = route.dest;
          break;
        }
      }
      if (path.startsWith("/api/")) {
        res.writeHead(503, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error:
              "Local static preview does not run email functions. Use Vercel dev or a configured Vercel preview.",
          }),
        );
        return;
      }
      let file = resolve(root, `.${path}`);
      if (file !== root && !file.startsWith(root + "/")) {
        res.writeHead(403);
        res.end();
        return;
      }
      try {
        if ((await stat(file)).isDirectory())
          file = resolve(file, "index.html");
        await stat(file);
      } catch {
        file = resolve(root, "404.html");
        status = 404;
      }
      const raw = await readFile(file);
      const compress =
        /\.(html|js|css|json|svg|xml|txt)$/.test(file) &&
        String(req.headers["accept-encoding"]).includes("gzip");
      if (compress) {
        res.setHeader("Content-Encoding", "gzip");
        const vary = res.getHeader("Vary");
        res.setHeader(
          "Vary",
          vary ? `${vary}, Accept-Encoding` : "Accept-Encoding",
        );
      }
      res.writeHead(status, {
        "Content-Type": types[extname(file)] || "application/octet-stream",
      });
      res.end(compress ? gzipSync(raw) : raw);
    } catch {
      res.writeHead(500);
      res.end("Preview error");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Preview: http://127.0.0.1:${port}`),
  );
