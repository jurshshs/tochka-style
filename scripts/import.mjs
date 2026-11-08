import fs from "node:fs/promises";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "..");
const data = JSON.parse(
  await fs.readFile(path.join(root, "../catalog-data/products.json"), "utf8"),
);
await fs.mkdir(path.join(root, "data"), { recursive: true });
await fs.cp(
  path.join(root, "../catalog-data/images"),
  path.join(root, "public/images"),
  { recursive: true },
);
await fs.writeFile(
  path.join(root, "data/catalog.json"),
  JSON.stringify(data, null, 2),
);
console.log(`Imported ${data.products.length} products; source unchanged.`);
