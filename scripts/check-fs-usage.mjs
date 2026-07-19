import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkDirectory(dir) {
  let hasError = false;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (checkDirectory(fullPath)) {
        hasError = true;
      }
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
      // Skip the API route which dynamically imports fs with try-catch for local fallback
      if (fullPath.includes("api/fuse/route.ts")) {
        continue;
      }

      const content = fs.readFileSync(fullPath, "utf8");
      
      // Match static imports of fs/promises or node:fs/promises or fs or node:fs
      const importFsRegex = /import\s+[\s\S]*?\s+from\s+['"](node:)?fs(\/promises)?['"]/g;
      const requireFsRegex = /require\(['"](node:)?fs(\/promises)?['"]\)/g;
      const readFileSyncRegex = /readFileSync\(/g;

      if (importFsRegex.test(content) || requireFsRegex.test(content) || readFileSyncRegex.test(content)) {
        console.error(`❌ Error in ${fullPath}: Detected filesystem usage (fs import or readFileSync).`);
        console.error("   To avoid 500 errors on Edge/Cloudflare runtimes, bundle assets using webpack asset/source instead.");
        hasError = true;
      }
    }
  }

  return hasError;
}

const appDir = path.join(process.cwd(), "app");
console.log(`Checking filesystem module usage in ${appDir}...`);

if (checkDirectory(appDir)) {
  process.exit(1);
} else {
  console.log("✓ No illegal filesystem module usage found in app/ directory.");
  process.exit(0);
}
