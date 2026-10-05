import { ArticleContext } from "./lib/article";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/global.css";
import "./styles/founder.css";
// Keep the current purple website visual system until the next approved brand migration.
const initialArticle = JSON.parse(
  document.getElementById("article-data")?.textContent || "null",
);
const element = (
  <BrowserRouter>
    <ArticleContext.Provider value={initialArticle}>
      <App />
    </ArticleContext.Provider>
  </BrowserRouter>
);
const root = document.getElementById("root")!;
if (root.hasChildNodes()) hydrateRoot(root, element);
else createRoot(root).render(element);
