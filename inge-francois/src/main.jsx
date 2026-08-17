import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import IngeApp from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <IngeApp />
  </StrictMode>
);
