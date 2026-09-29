import { describe, expect, it } from "vitest";
import { allRoutes, metadata, structuredData } from "../src/lib/metadata";
import { projects } from "../src/data/site";
import config from "../vercel.json";

describe("search and portfolio discoverability", () => {
  it("preserves the exact homepage description and canonicalizes alternate paths", () => {
    expect(metadata("/").description).toBe(
      "We build high-performance web applications, custom mobile apps (Android & iOS), and enterprise digital solutions engineered for business growth.",
    );
    expect(metadata("/portfolio/?view=Websites").canonical).toBe(
      "https://cactusdigitalmedia.ng/portfolio",
    );
    expect(metadata("/missing-page").found).toBe(false);
  });
  it("gives all published pages unique metadata and structured page information", () => {
    expect(new Set(allRoutes.map((path) => metadata(path).title)).size).toBe(
      allRoutes.length,
    );
    for (const path of allRoutes) {
      expect(metadata(path).found).toBe(true);
      expect(metadata(path).description.length).toBeGreaterThan(20);
      expect(
        structuredData(path)["@graph"].some(
          (item) =>
            "description" in item &&
            item.description === metadata(path).description,
        ),
      ).toBe(true);
    }
  });
  it("makes every recent project reachable directly through Vercel", () => {
    for (const project of projects.filter((p) => p.status === "Recent work")) {
      expect(
        config.routes.some(
          (route) =>
            route.src === `/portfolio/${project.slug}/?` &&
            route.dest === `/portfolio/${project.slug}/index.html`,
        ),
      ).toBe(true);
    }
  });
});
