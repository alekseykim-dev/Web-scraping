import puppeteer from "puppeteer-extra";
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
import { Browser } from "puppeteer";
import { email, password } from "./secret";

puppeteer.use(StealthPlugin());

const { executablePath } = require("puppeteer");
const fs = require("fs");
(async () => {
  // Launch the browser and open a new blank page
  const browser: Browser = await puppeteer.launch({
    headless: false,
    executablePath: executablePath(),
  });
  const page = await browser.newPage();
  const url = "http://enginx.uz/account/signIn.php";

  await page.goto(url, { waitUntil: "networkidle0" });

  await page.setViewport({ width: 1080, height: 1024 });

  await page.waitForSelector("input[name='username']", { visible: true });
  await page.waitForSelector("input[name='password']", { visible: true });
  await page.waitForSelector("input[type='submit']", { visible: true });

  await page.waitForTimeout(15000);

  await browser.close();
})();
