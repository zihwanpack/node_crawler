import puppeteer from 'puppeteer';
import { extractProductData } from './crawlingProductData.js';

(async () => {
  const browser = await puppeteer.launch({
    timeout: 600000, // 타임아웃 시간을 60초로 늘림
    waitUntil: 'networkidle0', // 페이지 로드 완료 기준을 networkidle0으로 변경
  });
  const page = await browser.newPage();
  const selector = '.goods-item';

  await page.goto(
    'https://mpglobal.donki.com/ec-web/d/pcd?titleStr=7Iud7ZKI&gpId=g-i_b_food?lan=ko-kr',
    { timeout: 600000 } // 페이지 로드 타임아웃 시간을 60초로 변경
  );

  await page.waitForSelector(selector, { timeout: 600000 }); // 셀렉터 대기 시간을 60초로 변경

  const itemElements = await page.$$(selector);

  await browser.close();
})();
