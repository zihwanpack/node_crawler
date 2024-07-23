import puppeteer from 'puppeteer';
import fs from 'fs';

// URL 스크래핑 함수
async function scrapeURLs(urlData) {
  const browser = await puppeteer.launch({
    timeout: 600000,
    waitUntil: 'networkidle0',
  });

  const scrapingPromises = urlData.map(async (url) => {
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

    await page.close(); // 페이지 닫기
    return {
      productName,
      description,
      productPrice,
      productWonPrice,
      imageUrl,
    };
  });

  const scrapedDataArr = await Promise.all(scrapingPromises);
  fs.writeFileSync(
    'product_data.json',
    JSON.stringify(scrapedDataArr, null, 2)
  );

  await browser.close();
}

// 메인 스크래핑 함수
(async () => {
  const urlData = [];
  const browser = await puppeteer.launch({
    waitUntil: 'networkidle0',
    timeout: 600000,
    // headless: false,
  });

  const page = await browser.newPage();
  const selector = '.goods-item';

  await page.goto(
    'https://mpglobal.donki.com/ec-web/d/pcd?titleStr=7Iud7ZKI&gpId=g-i_b_food?lan=ko-kr',
    { waitUntil: 'networkidle0' }
  );

  const divArr = await page.$$(selector);

  // 동시 페이지 열기 설정
  const maxConcurrentPages = 5; // 동시에 열 최대 페이지 수
  const promises = [];

  for (const div of divArr) {
    const promise = (async () => {
      await div.click();
      const pages = await browser.pages();
      const newPage = pages[pages.length - 1];

      const url = newPage.url();
      urlData.push(url);
      console.log(urlData);
      await newPage.close();
    })();

    promises.push(promise);

    // 최대 동시 페이지 수에 도달하면 대기
    if (promises.length >= maxConcurrentPages) {
      await Promise.race(promises);
      // 완료된 프로미스 제거
      promises.filter((p) => !p.isFulfilled); // 완료된 프로미스 제외
    }
  }

  await Promise.all(promises); // 모든 프로미스를 기다림
  await scrapeURLs(urlData); // URL 데이터 스크래핑 호출
  await browser.close();
})();
