import puppeteer from "puppeteer";
import { MongoClient } from "mongodb";
require("dotenv").config();
// MongoDB connection URI and client setup
const uri = process.env.DB;
const client = new MongoClient(uri);

async function main() {
  await client.connect();
  console.log("Connected successfully to MongoDB");

  const database = client.db("Books");
  const collection = database.collection("books");

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
    return bookPods.map((book: any) => ({
      title: book.querySelector("h3 a")?.getAttribute("title"),
      price: convertPrice(book.querySelector(".price_color")?.textContent),
      imgSrc: book.querySelector("img")?.src,
      rating: convertRating(book.querySelector(".star-rating")?.classList[1]),
    }));
  }, url);

  console.log(bookData);

  const operations = bookData.map((book) => ({
    updateOne: {
      filter: { title: book.title }, // Assuming title is unique
      update: { $setOnInsert: book },
      upsert: true,
    },
  }));

  // Insert the data into MongoDB
  const result = await collection.bulkWrite(operations, { ordered: false });
  console.log(
    `Matched ${result.matchedCount}, Modified ${result.modifiedCount}, Upserts ${result.upsertedCount}`
  );

  // Close the browser
  await browser.close();

  // Close the MongoDB connection
  await client.close();
}

main().catch(console.error);
