import puppeteer from 'puppeteer';
import fs from 'fs';
import { testJsonFile } from './test.js';

export async function scrapeURLs(fileName, urlData) {
  const filePath = `${fileName}.json`;
  try {
    const browser = await puppeteer.launch({
      timeout: 60000,
      waitUntil: 'networkidle0',
    });

    const scrapingPromises = urlData.map(async (url) => {
      const page = await browser.newPage();

      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

      // 메타 태그 정보 수집
      const productName = await page.title();
      const description = await page.$eval('meta[name="description"]', (ele) =>
        ele.getAttribute('content')
      );

      const productWonPrice = await page.$eval('.jpPrice', (ele) =>
        ele.textContent.trim()
      );
      productPrice;
      const productPrice = await page.$eval('.price', (ele) =>
        ele.textContent.trim()
      );

      // 이미지 추출
      const imageUrl = await page.$eval('.defaultImg', (ele) =>
        ele.getAttribute('src')
      );

      return {
        productName,
        description,
        productPrice,
        productWonPrice,
        imageUrl,
      };
    });

    const scrapedDataArr = await Promise.all(scrapingPromises);

    try {
      if (fs.existsSync(filePath)) {
        const existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const newData = existingData.concat(scrapedDataArr);
        fs.writeFileSync(filePath, JSON.stringify(newData));
        testJsonFile(filePath);
      } else {
        fs.writeFileSync(`${fileName}.json`, JSON.stringify(scrapedDataArr));
        testJsonFile(filePath);
      }
    } catch (error) {
      console.error('Error writing to file:', error);
    }

    await browser.close();
  } catch (err) {
    console.log(err);
  }
}
