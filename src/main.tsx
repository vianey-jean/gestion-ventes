import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { installRuntimeSecurity } from './lib/runtimeSecurity'
import { installAntiTamper } from './lib/antiTamper'
import { installSecureTransport } from './lib/secureTransport'

// Durcissement runtime (léger, exécuté une seule fois avant le rendu)
installRuntimeSecurity();
// Défenses anti-clone / anti-iframe / anti-exfiltration
installAntiTamper();
// Chiffrement de transport : handshake ECDH au démarrage + chiffrement des envois
installSecureTransport();

createRoot(document.getElementById("root")!).render(<App />);
