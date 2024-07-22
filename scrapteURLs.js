import puppeteer from 'puppeteer';
import fs from 'fs';

const urls = [
  'https://mpglobal.donki.com/ec-web/d/gd?gId=I2021062302901&toComments=false?lan=ko-kr',
  'https://mpglobal.donki.com/ec-web/d/gd?gId=I202101180020&toComments=false?lan=ko-kr',
];

async function scrapeURLs(urls) {
  try {
    const browser = await puppeteer.launch();
    const scrapingPromises = urls.map(async (url) => {
      const page = await browser.newPage();
      await page.goto(url);

      // 메타 태그 정보 수집
      const productName = await page.title();
      const description = await page.$eval('meta[name="description"]', (ele) =>
        ele.getAttribute('content')
      );

      const productPrice = await page.$eval('.jpPrice', (ele) =>
        ele.textContent.trim()
      );
      const productWonPrice = await page.$eval('.price', (ele) =>
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

    fs.writeFileSync('product_data.json', JSON.stringify(scrapedDataArr));

    await browser.close();
  } catch (err) {
    console.log(err);
  }
}

scrapeURLs(urls);
