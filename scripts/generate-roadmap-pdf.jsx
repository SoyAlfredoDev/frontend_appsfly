import React from "react";
import { renderToFile } from "@react-pdf/renderer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdirSync } from "fs";
import RoadmapDocument from "./RoadmapDocument.jsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsDir = join(__dirname, "../../docs");
const outputPath = join(docsDir, "AppsFly-Proximos-Pasos.pdf");

mkdirSync(docsDir, { recursive: true });

export default async function generateRoadmapPdf() {
  await renderToFile(<RoadmapDocument />, outputPath);
  console.log(`PDF generado: ${outputPath}`);
}

// Ejecución directa (vite ssrLoadModule o node con transform)
if (import.meta.url === `file://${process.argv[1]}`) {
  await generateRoadmapPdf();
}
