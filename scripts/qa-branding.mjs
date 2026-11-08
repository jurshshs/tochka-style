import { chromium } from "../../kufar-parser/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";

const browser = await chromium.launch({ headless: false, channel: "chrome" });
const report = {
  branding: false,
  cardLayoutDesktop: false,
  cardLayoutMobile: false,
  sizeNavigation: false,
  cart: false,
  errors: [],
};

try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.on("pageerror", (error) => report.errors.push(error.message));
  await page.goto("http://localhost:3000/catalog");

  if (!(await page.title()).includes("ТОЧКА СТИЛЯ"))
    throw new Error("SEO title does not contain the brand");
  const logos = page.getByRole("link", { name: "ТОЧКА СТИЛЯ — главная" });
  if ((await logos.count()) !== 2)
    throw new Error("Header/footer logo count failed");
  const logo = logos.first();
  if (!(await logo.isVisible())) throw new Error("Header logo is not visible");
  const loaded = await logo
    .locator("img")
    .evaluate((image) => image.complete && image.naturalWidth > 0);
  if (!loaded) throw new Error("Header logo did not load");
  const favicon = await page.request.get("http://localhost:3000/icon.png");
  if (!favicon.ok()) throw new Error("Favicon did not load");
  if (await page.getByText("OFFGRID", { exact: false }).count())
    throw new Error("Legacy visible brand remains");
  report.branding = true;

  const inspectCards = async () => {
    return page.locator(".card").evaluateAll((cards) =>
      cards.map((card) => {
        const price = card.querySelector(".price").getBoundingClientRect();
        const button = card.querySelector(".outline").getBoundingClientRect();
        return {
          height: Math.round(card.getBoundingClientRect().height),
          gap: Math.round(button.top - price.bottom),
          buttonBottom: Math.round(button.bottom),
          cardBottom: Math.round(card.getBoundingClientRect().bottom),
        };
      }),
    );
  };

  const desktop = await inspectCards();
  if (
    desktop.some(
      (item) => item.gap < 16 || item.cardBottom - item.buttonBottom > 20,
    )
  )
    throw new Error("Desktop card spacing or bottom alignment failed");
  if (new Set(desktop.map((item) => item.height)).size !== 1)
    throw new Error("Desktop cards do not have equal heights");
  report.cardLayoutDesktop = true;

  const sizeButton = page
    .getByRole("link", { name: "Выбрать размер ↗" })
    .first();
  await sizeButton.click();
  await page.waitForURL("**/product/**");
  if (!(await page.locator(".sizes button").count()))
    throw new Error("Size selector was not reached");
  report.sizeNavigation = true;

  await page.goto("http://localhost:3000/catalog");
  const addButton = page.getByRole("button", { name: "В корзину +" }).first();
  await addButton.click();
  await page.getByRole("button", { name: "Открыть корзину" }).click();
  if (!(await page.getByRole("dialog", { name: "Корзина" }).isVisible()))
    throw new Error("Cart drawer did not open");
  report.cart = true;
  await page.keyboard.press("Escape");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/catalog");
  await page.waitForTimeout(500);
  const mobile = await inspectCards();
  if (
    mobile.some(
      (item) => item.gap < 12 || item.cardBottom - item.buttonBottom > 14,
    )
  )
    throw new Error("Mobile card spacing or bottom alignment failed");
  if (new Set(mobile.map((item) => item.height)).size !== 1)
    throw new Error("Mobile cards do not have equal heights");
  if (
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  )
    throw new Error("Mobile horizontal overflow");
  report.cardLayoutMobile = true;

  await fs.mkdir("work", { recursive: true });
  await page.screenshot({
    path: "work/catalog-mobile-brand.png",
    fullPage: false,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("http://localhost:3000/catalog");
  await page.waitForTimeout(500);
  await page.screenshot({
    path: "work/catalog-desktop-brand.png",
    fullPage: false,
  });
} finally {
  await browser.close();
  await fs.writeFile(
    "work/branding-report.json",
    JSON.stringify(report, null, 2),
  );
}

if (report.errors.length) process.exitCode = 1;
console.log(JSON.stringify(report));
