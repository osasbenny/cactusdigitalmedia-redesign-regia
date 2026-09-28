import { createContext, useContext, useEffect, useState } from "react";
export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  blocks: { type: string; text: string }[];
}
export const ArticleContext = createContext<Article | null>(null);
export function useArticle(slug: string | undefined) {
  const initial = useContext(ArticleContext);
  const [loaded, setLoaded] = useState<Article | null>(initial);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!slug || loaded?.slug === slug) return;
    const controller = new AbortController();
    setFailed(false);
    fetch(`/content/${encodeURIComponent(slug)}.json`, {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error("Article unavailable");
        return r.json();
      })
      .then((a: Article) => setLoaded(a))
      .catch((e) => {
        if (e.name !== "AbortError") setFailed(true);
      });
    return () => controller.abort();
  }, [slug, loaded?.slug]);
  return { article: loaded?.slug === slug ? loaded : null, failed };
}
