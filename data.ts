import puppeteer from "puppeteer-extra";
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const { executablePath } = require("puppeteer");
const fs = require("fs");
(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: executablePath(),
  });
  const page = await browser.newPage();
  const url = "https://bot.sannysoft.com/";

  await page.goto(url);
  await page.screenshot({ path: "bot.jpg" });

  await page.setViewport({ width: 1080, height: 1024 });

  await browser.close();
})();
