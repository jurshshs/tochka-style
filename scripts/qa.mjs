import { chromium } from "../../kufar-parser/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
const b = await chromium.launch({
  headless: false,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const p = await b.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.goto("http://localhost:3000/catalog");
await p.getByLabel("Поиск товаров").fill("Coach");
await p.waitForTimeout(500);
if ((await p.locator("article").count()) !== 3) throw Error("Search failed");
await p.getByRole("button", { name: "В корзину +" }).first().click();
await p.reload();
await p.getByRole("button", { name: "Открыть корзину" }).click();
await p.getByRole("dialog").waitFor();
if (!(await p.getByText("Итого", { exact: true }).isVisible()))
  throw Error("Persistence failed");
await p.keyboard.press("Escape");
await p.setViewportSize({ width: 390, height: 844 });
await p.goto("http://localhost:3000");
await p.getByRole("button", { name: "Меню", exact: true }).click();
if (!(await p.locator("nav").isVisible())) throw Error("Mobile menu failed");
await p.getByRole("button", { name: "Меню", exact: true }).click();
if (await p.evaluate(() => document.documentElement.scrollWidth > innerWidth))
  throw Error("Horizontal overflow");
await fs.mkdir("work", { recursive: true });
await p.screenshot({ path: "work/mobile.png", fullPage: true });
await p.setViewportSize({ width: 1440, height: 1000 });
await p.screenshot({ path: "work/desktop.png", fullPage: false });
console.log(
  JSON.stringify({
    search: true,
    cartPersistence: true,
    mobileMenu: true,
    noOverflow: true,
    errors,
  }),
);
await b.close();
if (errors.length) process.exitCode = 1;
