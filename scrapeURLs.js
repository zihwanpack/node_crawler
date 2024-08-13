import puppeteer from 'puppeteer';
import fs from 'fs';
import { testJsonFile } from './test.js';

export async function scrapeURLs(
  fileName,
  urlData,
  main_category,
  sub_category
) {
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
      const name = await page.title();
      const description = await page.$eval('meta[name="description"]', (ele) =>
        ele.getAttribute('content')
      );

      const won_price = await page.$eval('.jpPrice', (ele) =>
        ele.textContent.trim()
      );

      const en_price = await page.$eval('.price', (ele) =>
        ele.textContent.trim()
      );

      // 이미지 추출
      const image = await page.$eval('.defaultImg', (ele) =>
        ele.getAttribute('src')
      );

      const sales_area = '일본';

      return {
        name,
        description,
        en_price,
        won_price,
        image,
        sales_area,
        main_category,
        sub_category,
      };
    });

    const scrapedDataArr = await Promise.all(scrapingPromises);
    console.log(scrapedDataArr.length);
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
