import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: [
      ".replit.dev",
      ".repl.co",
      "2a51dba2-a7a2-4a09-82fd-2d445191ddb9-00-2su0owhisv2au.spock.replit.dev"
    ],
    proxy: {
      '/api': {
        target: 'http://0.0.0.0:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});