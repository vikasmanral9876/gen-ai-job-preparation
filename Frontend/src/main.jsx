import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import "./style.scss"

// Apply persisted theme on startup (Default: neon)
try {
  const savedTheme = localStorage.getItem("hirepilot_theme") || "neon";
  document.documentElement.setAttribute("data-theme", savedTheme);
} catch (e) {
  console.error("Failed to load initial theme:", e);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
