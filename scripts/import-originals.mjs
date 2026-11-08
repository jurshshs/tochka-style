import fs from "node:fs/promises";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "..");
const source = process.argv[2];
if (!source)
  throw Error(
    "Usage: node scripts/import-originals.mjs <folder containing product-001, product-002, ...>",
  );
const data = JSON.parse(
  await fs.readFile(path.join(root, "data/catalog.json"), "utf8"),
);
const manifestPath = path.join(root, "data/image-overrides.json");
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
for (const p of data.products) {
  const dir = path.join(path.resolve(source), p.id);
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (e) {
    if (e.code === "ENOENT") continue;
    throw e;
  }
  const names = entries
    .filter((e) => e.isFile() && /\.(jpe?g|png|webp|avif)$/i.test(e.name))
    .map((e) => e.name)
    .sort();
  if (!names.length) continue;
  await fs.mkdir(path.join(root, "public/originals", p.id), {
    recursive: true,
  });
  for (const name of names)
    await fs.copyFile(
      path.join(dir, name),
      path.join(root, "public/originals", p.id, name),
    );
  manifest[p.id] = names.map((n) => `originals/${p.id}/${n}`);
}
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(
  "Updated image manifest; product records and source catalog unchanged.",
);
