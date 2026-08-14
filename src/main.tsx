import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { installRuntimeSecurity } from './lib/runtimeSecurity'

// Durcissement runtime (léger, exécuté une seule fois avant le rendu)
installRuntimeSecurity();

createRoot(document.getElementById("root")!).render(<App />);
