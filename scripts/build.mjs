import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), "..");
const dist = path.join(root, "dist");

const files = [
  ["index.html", "index.html"],
  ["styles.css", "styles.css"],
  ["script.js", "script.js"],
  ["social_ai_signals.json", "social_ai_signals.json"],
  ["ai_model_google_reaction.csv", "ai_model_google_reaction.csv"],
  ["ai_model_google_reaction.md", "ai_model_google_reaction.md"],
  ["jensen_huang_stocks_extraction.csv", "jensen_huang_stocks_extraction.csv"],
  ["jensen_huang_stocks_extraction.md", "jensen_huang_stocks_extraction.md"],
  [
    "outputs/jensen_excel/jensen_huang_stocks_extraction.xlsx",
    "outputs/jensen_excel/jensen_huang_stocks_extraction.xlsx",
  ],
];

await fs.rm(dist, { recursive: true, force: true });

for (const [srcRel, destRel] of files) {
  const src = path.join(root, srcRel);
  const dest = path.join(dist, destRel);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
}

console.log(`Built ${dist}`);
