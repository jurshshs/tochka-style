import { chromium } from "../../kufar-parser/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
import crypto from "node:crypto";
const read = async (p) => JSON.parse(await fs.readFile(p, "utf8"));
const data = await read("data/catalog.json");
const source = await read("../catalog-data/products.json");
const originals = Array.isArray(source) ? source : source.products;
const report = {
  products: data.products.length,
  images: 0,
  routes: 0,
  categories: 0,
  checks: [],
  errors: [],
};
assert.equal(new Set(data.products.map((p) => p.id)).size, 32);
for (const p of data.products) {
  const s = originals.find((s) => s.id === p.id);
  assert(s);
  assert.equal(p.title, s.title);
  assert.deepEqual(p.price, s.price);
  assert.equal(p.price.currency, "BYN");
  for (const im of p.images) {
    const local = await fs.readFile("public/" + im.localPath);
    const original = await fs.readFile("../catalog-data/" + im.localPath);
    assert.equal(
      crypto.createHash("sha256").update(local).digest("hex"),
      crypto.createHash("sha256").update(original).digest("hex"),
    );
    report.images++;
  }
}
report.checks.push("IDs, titles, BYN prices and all image bytes match source");
const b = await chromium.launch({ headless: false, channel: "chrome" });
try {
  const page = await b.newPage();
  page.on("pageerror", (e) => report.errors.push(e.message));
  for (const p of data.products) {
    const r = await page.request.get("http://localhost:3000/product/" + p.slug);
    assert.equal(r.status(), 200);
    report.routes++;
  }
  for (const c of data.categories.filter((c) => c.count)) {
    const r = await page.request.get("http://localhost:3000/category/" + c.id);
    assert.equal(r.status(), 200);
    report.categories++;
  }
  assert.equal(
    (
      await page.request.get("http://localhost:3000/product/not-a-product")
    ).status(),
    404,
  );
  await page.goto("http://localhost:3000/catalog");
  const paths = data.products.flatMap((p) =>
    p.images.map((im) => "/" + im.localPath),
  );
  const decoded = await page.evaluate(async (paths) => {
    let n = 0;
    for (const src of paths) {
      const im = new Image();
      im.src = src;
      await im.decode();
      n++;
    }
    return n;
  }, paths);
  assert.equal(decoded, 125);
  const count = async (n) => {
    await page.waitForTimeout(100);
    assert.equal(await page.locator("article").count(), n);
  };
  await count(32);
  for (const c of data.categories.filter((c) => c.count)) {
    await page.getByLabel("Категория", { exact: true }).selectOption(c.id);
    await count(c.count);
  }
  await page.getByLabel("Категория", { exact: true }).selectOption("");
  const size = data.products.flatMap((p) => p.size)[0];
  await page.getByLabel("Размер", { exact: true }).selectOption(size);
  await count(data.products.filter((p) => p.size.includes(size)).length);
  await page.getByLabel("Размер", { exact: true }).selectOption("");
  await page.getByLabel("Максимальная цена").fill("100");
  await count(
    data.products.filter(
      (p) => p.price.amount !== null && p.price.amount <= 100,
    ).length,
  );
  await page.getByLabel("Максимальная цена").fill("");
  for (const sort of ["asc", "desc", "name"]) {
    await page.getByLabel("Сортировка").selectOption(sort);
    const links = await page
      .locator(".product-title")
      .evaluateAll((items) => items.map((item) => item.getAttribute("href")));
    const expected = [...data.products]
      .sort((a, b) =>
        sort === "asc"
          ? a.price.amount - b.price.amount
          : sort === "desc"
            ? b.price.amount - a.price.amount
            : a.title.localeCompare(b.title),
      )
      .map((p) => `/product/${p.slug}`);
    assert.deepEqual(links, expected);
  }
  report.checks.push(
    "All category filters, size, max price, three sorts, 404, image decoding",
  );
  const product = data.products.find((p) => p.size.length);
  await page.goto("http://localhost:3000/product/" + product.slug);
  assert(
    await page
      .getByRole("button", { name: "Добавить в корзину +", exact: true })
      .isDisabled(),
  );
  await page.locator(".sizes button").first().click();
  await page.getByLabel("Количество", { exact: true }).fill("2");
  await page
    .getByRole("button", { name: "Добавить в корзину +", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Увеличить фото", exact: true })
    .click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "detached" });
  await page.reload();
  await page.getByRole("button", { name: "Открыть корзину" }).click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("Shift+Tab");
  assert(
    await page.evaluate(
      () => !!document.activeElement.closest("[role=dialog]"),
    ),
  );
  await page.getByRole("button", { name: "Увеличить количество" }).click();
  await page.getByRole("link", { name: "К оформлению →" }).click();
  await page.waitForURL("**/checkout");
  await page.getByRole("dialog").waitFor({ state: "detached" });
  await page.goto("http://localhost:3000/cart");
  await page.getByRole("button", { name: "Удалить", exact: true }).click();
  assert(await page.getByText("Здесь пока пусто").isVisible());
  report.checks.push(
    "Required size, quantity, persistence, zoom Escape, focus trap, checkout navigation, remove",
  );
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/catalog",
      "/cart",
      "/checkout",
      "/about",
      "/product/" + product.slug,
    ]) {
      await page.goto("http://localhost:3000" + route);
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `Overflow ${width} ${route}`,
      );
    }
  }
  report.checks.push(
    "No horizontal overflow at 390, 768, 1440px across six page types",
  );
  assert.equal(report.errors.length, 0);
} finally {
  await b.close();
  await fs.writeFile("work/verification.json", JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report));
