import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/api/hb": {
          target: "https://bot-account-manager-api.homebroker.com",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/hb/, ""),
          headers: {
            Authorization: `Basic ${env.VITE_HB_BASIC_AUTH || ""}`,
          },
        },
        "/api/hb-wallet": {
          target: "https://bot-wallet-api.homebroker.com",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/hb-wallet/, ""),
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
