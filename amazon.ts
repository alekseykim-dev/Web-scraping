import puppeteer, { Viewport } from "puppeteer";
import { MongoClient } from "mongodb";
import 'dotenv/config'
const uri = process.env.DB;
const client = new MongoClient(uri);


async function main () {
	await client.connect();
  console.log("Connected successfully to MongoDB");

	const db = client.db("amazon");
	const collection = db.collection("products");

  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  await page.goto(
    process.env.site
  );
  await page.screenshot({path: 'example.png'})

  await page.setViewport({ width: 1080, height: 1024 });

  const productHandles = await page.$$(
    "div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item"
  );

  let i = 0;

  let items = [];

  for (const productHandle of productHandles) {
    let title = "Title not found", price = "Price not found", img: any = "Image not found";

            // Fetch title
            const titleElement = await productHandle.$("h2 > a > span");
            if (titleElement) {
                title = await titleElement.evaluate(el => el.textContent.trim());
            }

            // Fetch price
            const priceElement = await productHandle.$(".a-price > .a-offscreen");
            if (priceElement) {
                price = await priceElement.evaluate(el => el.textContent.trim());
            }

            // Fetch image
            const imgElement = await productHandle.$(".s-image");
            img = imgElement ? await (await imgElement.getProperty('src')).jsonValue() : "Image not found";

            if (title !== "Title not found") {
							const exists = await collection.findOne({ title: title });
							if (!exists) {
									items.push({ title, price, img });
							} else {
									console.log(`Skipping duplicate: ${title}`);
							}
					}

  }
	// Convert item insertion into a proper bulkWrite format with 'insertOne'
const bulkOps = items.map(item => ({
  insertOne: {
    document: item
  }
}));

if (bulkOps.length > 0) {
	const result = await collection.bulkWrite(bulkOps, { ordered: false });
	console.log(`${result.insertedCount} items inserted.`);
} else {
	console.log("No items to insert.");
}

  console.log(items);
	await browser.close();
	await client.close();
}

main().catch(console.error);