import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const r = (p: string) => new URL(p, import.meta.url).pathname;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@app": r("./src/app"),
      "@auth": r("./src/auth"),
      "@store": r("./src/management-section/store"),
      "@home": r("./src/home"),
      "@ui": r("./src/ui"),
      "@core": r("./src/core"),
      "@nav": r("./src/nav"),
      "@screens": r("./src/screens"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
