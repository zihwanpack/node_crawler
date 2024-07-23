import puppeteer from 'puppeteer';
import { scrapeURLs } from './scrapeURLs.js';

(async () => {
  const urlData = [];
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();
  const selector = '.goods-item';

  page.setDefaultNavigationTimeout(0);

  try {
    await page.goto(
      'https://mpglobal.donki.com/ec-web/d/pcd?titleStr=7Iud7ZKI&gpId=g-i_b_food?lan=ko-kr',
      { waitUntil: 'networkidle0' }
    );

    await page.waitForSelector(selector);

    const divArr = await page.$$(selector);

    for (const div of divArr) {
      const newPagePromise = new Promise((resolve) =>
        browser.once('targetcreated', (target) => resolve(target.page()))
      );

      await div.click();
      const newPage = await newPagePromise;

      await newPage.waitForNavigation({ waitUntil: 'networkidle0' });

      const url = newPage.url();
      urlData.push(url);

      await newPage.close();
    }

    await scrapeURLs(urlData);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
