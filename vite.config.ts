import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "https://server-gestion-ventes.onrender.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1200,
    minify: "esbuild",
    cssMinify: "esbuild",
    assetsInlineLimit: 4096,
    modulePreload: { polyfill: true },
    rollupOptions: {
      output: {
        // Découpage fin : le navigateur ne télécharge que ce dont la page a besoin
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return "react";
          if (id.includes("framer-motion") || id.includes("popmotion") || id.includes("motion-dom")) return "motion";
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("jspdf") || id.includes("html2canvas") || id.includes("xlsx") || id.includes("jszip")) return "export";
          if (id.includes("date-fns")) return "date";
          if (id.includes("lucide-react")) return "icons";
          return "vendor";
        },
      },
    },
  },
  esbuild: mode === "production"
    ? { drop: ["console", "debugger"] }
    : undefined,
}));
