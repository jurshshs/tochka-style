import { chromium } from "../../kufar-parser/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
const { products } = JSON.parse(await fs.readFile("data/catalog.json", "utf8"));
const browser = await chromium.launch({ headless: false, channel: "chrome" });
try {
  const page = await browser.newPage({
    viewport: { width: 1400, height: 1000 },
  });
  await page.goto("http://localhost:3000");
  for (let batch = 0; batch < 4; batch++) {
    await page.setContent(
      '<body style="margin:0;background:#222;color:white;font:14px Arial;display:grid;grid-template-columns:repeat(4,1fr)">' +
        products
          .slice(batch * 8, batch * 8 + 8)
          .map(
            (p) =>
              "<div>" +
              p.id +
              " " +
              p.title.slice(0, 40) +
              '<div style="display:flex">' +
              p.images
                .slice(0, 2)
                .map(
                  (im, i) =>
                    `<div>${i + 1}<img style="width:170px;height:230px;object-fit:contain" src="http://localhost:3000/${im.localPath}"></div>`,
                )
                .join("") +
              "</div></div>",
          )
          .join(""),
    );
    await page
      .locator("img")
      .evaluateAll((imgs) => Promise.all(imgs.map((im) => im.decode())));
    await page.screenshot({
      path: `work/contact-${batch}.png`,
      fullPage: true,
    });
  }
} finally {
  await browser.close();
}
