import puppeteer from "puppeteer";
const fs = require("fs");
import { Browser } from "puppeteer";
(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const url = "https://books.toscrape.com/";

  await page.goto(url);

  await page.setViewport({ width: 1080, height: 1024 });

  const bookData = await page.evaluate((url) => {
    const convertPrice = (price: string) => {
      return parseFloat(price.replace("£", ""));
    };

    const convertRating = (rating: string) => {
      switch (rating) {
        case "One":
          return "1";
        case "Two":
          return "2";
        case "Three":
          return "3";
        case "Four":
          return "4";
        case "Five":
          return "5";
        default:
          return "0";
      }
    };

    const bookPods = Array.from(document.querySelectorAll(".product_pod"));
    const data = bookPods.map((book: any) => ({
      title: book.querySelector("h3 a")?.getAttribute("title"),
      price: convertPrice(book.querySelector(".price_color")?.innerText),
      imgSrc: url + book.querySelector("img")?.getAttribute("src"),
      rating: convertRating(book.querySelector(".star-rating")?.classList[1]),
    }));
    return data;
  }, url);

  console.log(bookData);
  await browser.close();

  fs.writeFile("data.json", JSON.stringify(bookData), (err: any) => {
    if(err) throw err;
    console.log("JSON data is saved.");
  });
})();
