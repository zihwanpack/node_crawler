import puppeteer from 'puppeteer';
import { scrapeURLs } from './scrapeURLs.js';
(async () => {
  const urlData = [];
  const browser = await puppeteer.launch({
    waitUntil: 'networkidle0',
    timeout: 600000,
    headless: false,
  });

  const page = await browser.newPage();
  const selector = '.goods-item';

  await page.goto(
    'https://mpglobal.donki.com/ec-web/d/pcd?titleStr=7Iud7ZKI&gpId=g-i_b_food?lan=ko-kr',
    { waitUntil: 'networkidle0' }
  );

  const divArr = await page.$$(selector, (divs) =>
    divs.map((div) => div.outerHTML)
  );

  page.waitForNavigation();
  for (const div of divArr) {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    await div.click();
    const pages = await browser.pages();
    const newPage = pages[pages.length - 1];
    await newPage.waitForNavigation({ waitUntil: 'networkidle0' });

    const url = await newPage.url();
    urlData.push(url);
    console.log(urlData);

    await newPage.close();
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  await scrapeURLs(urlData);
  await browser.close();
})();
