import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(
      'https://mpglobal.donki.com/ec-web/d/gd?gId=I2021062302901&toComments=false?lan=ko-kr'
    );

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
    console.log(
      description,
      productName,
      productPrice,
      productWonPrice,
      imageUrl
    );

    const outputJSON = JSON.stringify({
      description,
      productName,
      productPrice,
      productWonPrice,
      imageUrl,
    });

    fs.writeFileSync('product_data.json', outputJSON);

    await browser.close();
  } catch (err) {
    console.log(err);
  }
})();
