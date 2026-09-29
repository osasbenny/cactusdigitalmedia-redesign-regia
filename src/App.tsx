import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import {
  About,
  Services,
  ServiceDetail,
  Portfolio,
  ProjectDetail,
  Blog,
  BlogPost,
  Contact,
  Products,
  Legal,
  NotFound,
} from "./pages/Pages";
import { metadata, structuredData } from "./lib/metadata";
function SEO() {
  const { pathname } = useLocation();
  useEffect(() => {
    const m = metadata(pathname);
    document.title = m.title;
    const set = (selector: string, content: string) =>
      document.querySelector(selector)?.setAttribute("content", content);
    set('meta[name="description"]', m.description);
    set('meta[property="og:title"]', m.title);
    set('meta[property="og:description"]', m.description);
    set('meta[property="og:url"]', m.canonical);
    set('meta[property="og:image"]', m.image);
    set('meta[property="og:type"]', m.type);
    set('meta[name="twitter:title"]', m.title);
    set('meta[name="twitter:description"]', m.description);
    set('meta[name="twitter:image"]', m.image);
    set(
      'meta[name="robots"]',
      m.found
        ? "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
        : "noindex",
    );
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute("href", m.canonical);
    const schema = document.getElementById("structured-data");
    if (schema) schema.textContent = JSON.stringify(structuredData(pathname));
  }, [pathname]);
  return null;
}
export default function App() {
  return (
    <>
      <SEO />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="services/:slug" element={<ServiceDetail />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="portfolio/:slug" element={<ProjectDetail />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="contact" element={<Contact />} />
          <Route path="start-project" element={<Contact project />} />
          <Route path="products" element={<Products />} />
          <Route path="privacy" element={<Legal />} />
          <Route path="terms" element={<Legal terms />} />
          <Route path="work" element={<Navigate to="/portfolio" replace />} />
          <Route path="insights" element={<Navigate to="/blog" replace />} />
          <Route
            path="privacy-policy"
            element={<Navigate to="/privacy" replace />}
          />
          <Route
            path="terms-of-service"
            element={<Navigate to="/terms" replace />}
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
