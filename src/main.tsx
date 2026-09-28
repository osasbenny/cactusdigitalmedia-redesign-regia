import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/global.css";
const element = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
const root = document.getElementById("root")!;
if (root.hasChildNodes()) hydrateRoot(root, element);
else createRoot(root).render(element);
