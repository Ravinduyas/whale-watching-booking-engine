import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";

// HashRouter (not BrowserRouter) so deep links + refreshes work on GitHub Pages,
// which serves static files and has no server-side rewrite to index.html.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);
