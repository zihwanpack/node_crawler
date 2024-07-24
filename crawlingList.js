import puppeteer from 'puppeteer';
import { scrapeURLs } from './scrapeURLs.js';
import { testJsonFile } from './test.js';

(async () => {
  const urlData = [];
  const browser = await puppeteer.launch({
    headless: false,
  });
  // 원하는 페이지 url
  const pageUrl =
    'https://mpglobal.donki.com/ec-web/d/pcd?titleStr=7Iud7ZKI&gpId=g-i_b_food?lan=ko-kr';
  // 원하는 데이터 파일명
  const fileName = 'food_data';
  const selector = '.goods-item';

  const page = await browser.newPage();
  await page.setViewport({
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
  });
  page.setDefaultNavigationTimeout(0);

  try {
    await page.goto(pageUrl, { waitUntil: 'networkidle0' });
    // 크롤링전 페이지 조작을 위한 5초
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await page.waitForSelector(selector);
    const divArr = await page.$$(selector);

    for (const div of divArr) {
      const newPagePromise = new Promise((resolve) =>
        browser.once('targetcreated', (target) => resolve(target.page()))
      );
      await div.click();
      const newPage = await newPagePromise;
      await newPage.waitForNavigation();
      const url = newPage.url();
      urlData.push(url);
      await newPage.close();
      console.log(urlData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    // url에서 정보 긁어오기
    await scrapeURLs(fileName, urlData);
    await testJsonFile(`${fileName}.json`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
