import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const server = await createServer({
  plugins: [react()],
  logLevel: "error",
});

const mod = await server.ssrLoadModule("/scripts/generate-roadmap-pdf.jsx");
await mod.default();
await server.close();
