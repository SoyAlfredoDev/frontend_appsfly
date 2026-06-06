import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.join(__dirname, "../src/pages");

const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".jsx")) files.push(full);
  }
}
walk(srcRoot);

const pageContainerImport =
  'import PageContainer from "../components/layout/PageContainer.jsx";';
const pageContainerImportDeep =
  'import PageContainer from "../../components/layout/PageContainer.jsx";';

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  if (!content.includes("ProtectedView") && !content.includes("NavBarComponent")) {
    continue;
  }

  const depth = file.includes("/admin/") || file.includes("/purchase/") || file.includes("/Sales/") || file.includes("/users/") || file.includes("/dashboard/") || file.includes("/dailySales/") || file.includes("/business/")
    ? "../../"
    : "../";

  content = content.replace(/import NavBarComponent[^\n]+\n/g, "");
  content = content.replace(/import ProtectedView[^\n]+\n/g, "");

  if (!content.includes("PageContainer")) {
    const importLine = depth === "../../" ? pageContainerImportDeep : pageContainerImport;
    const lastImport = content.lastIndexOf("\nimport ");
    const endOfImport = content.indexOf("\n", lastImport + 1);
    content =
      content.slice(0, endOfImport + 1) +
      importLine +
      "\n" +
      content.slice(endOfImport + 1);
  }

  content = content.replace(/<ProtectedView>\s*/g, "<PageContainer>\n");
  content = content.replace(/<\/ProtectedView>/g, "</PageContainer>");
  content = content.replace(/\s*<NavBarComponent\s*\/>\s*\n/g, "\n");
  content = content.replace(/mt-\[35px\]|mt-\[65px\]|mt-\[80px\]/g, "");
  content = content.replace(
    /className="min-h-screen bg-gray-50\/50 p-6 md:p-12\s*"/g,
    'className=""',
  );
  content = content.replace(
    /className="min-h-screen bg-gray-50 pb-12"/g,
    'className=""',
  );

  fs.writeFileSync(file, content);
  console.log("Migrated:", path.relative(srcRoot, file));
}
