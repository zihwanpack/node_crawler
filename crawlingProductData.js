import puppeteer from 'puppeteer';
import fs from 'fs';

async function extractProductData(url) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle0' });

    // 메타 태그 정보 수집
    const productName = await page.title();
    const description = await page.$eval('meta[name="description"]', (ele) =>
      ele.getAttribute('content')
    );

    const productPrice = await page.$eval('.jpPrice', (ele) => ele.textContent);

    const productWonPrice = await page.$eval(
      '.price',
      (ele) => ele.textContent
    );

    // 이미지 추출
    const imageUrl = await page.$eval('.defaultImg', (ele) =>
      ele.getAttribute('src')
    );

    // JSON 파일 저장
    console.log(productName);

    const outputJSON = JSON.stringify({
      description,
      productName,
      productPrice,
      productWonPrice,
      imageUrl,
    });

    if (!fs.existsSync('product_data.json')) {
      fs.writeFileSync('product_data.json', outputJSON);
    } else {
      fs.appendFileSync('./product_data.json', outputJSON);
    }
  } catch (err) {
    console.log(err);
  }
}

export { extractProductData };
