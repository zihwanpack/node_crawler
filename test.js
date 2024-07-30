import fs from 'fs';

const filePath = './medicine_data.json';

const testJsonFile = (filePath) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('파일 읽기 오류:', err);
      return;
    }
    try {
      const jsonArray = JSON.parse(data);
      const count = jsonArray.length;
      console.log('객체 개수:', count);
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
    }
  });
};

testJsonFile(filePath);

export { testJsonFile };
