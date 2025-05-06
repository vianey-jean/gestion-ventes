
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_URL: string;
  // add more env vars here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Make process.env available in TypeScript
declare namespace NodeJS {
  interface ProcessEnv {
    VITE_API_BASE_URL: string;
    VITE_API_URL: string;
    // add more env vars here if needed
  }
}
