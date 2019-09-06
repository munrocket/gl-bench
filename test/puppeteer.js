import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--enable-webgl-draft-extensions', '--no-sandbox'] 
  });

  console.log('=== puppeteer test ===');

  const page = await browser.newPage();
  page.on('console', msg => {
    for (let i = 0; i < msg.args().length; ++i) {
      const str = msg.args()[i].toString().slice(9);
      console.log(str);
      if (str.trim() == '# ok') {
        process.exit(0)
      } else if (str == '# not ok') {
        process.exit(1)
      }
    }
  });
  await page.goto('http://127.0.0.1:1234/');

  await new Promise(resolve => setTimeout(resolve, 10000));
  process.exit(2);
})();