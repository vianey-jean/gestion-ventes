import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { installRuntimeSecurity } from './lib/runtimeSecurity'
import { installAntiTamper } from './lib/antiTamper'

// Durcissement runtime (léger, exécuté une seule fois avant le rendu)
installRuntimeSecurity();
// Défenses anti-clone / anti-iframe / anti-exfiltration
installAntiTamper();

createRoot(document.getElementById("root")!).render(<App />);
