import puppeteer from 'puppeteer';
import pup2ist from 'puppeteer-to-istanbul';

(async () => {
  const browser = await puppeteer.launch({
    headless: !process.env.CI,
    args: ['--use-gl=egl']
  });
  const page = (await browser.pages())[0];

  // enable coverage
  await page.coverage.startJSCoverage();

  // navigate to unit test page
  page.on('console', msg => {
    for (let i = 0; i < msg.args().length; ++i) {
      const str = msg.args()[i].toString().slice(9);
      if (str[0] == '#') {
        console.log('\x1b[34m');
      }
      console.log(str);
      if (str.trim() == '# ok') {
        console.log('\x1b[32m' + 'SUCCESS!');
        process.exit(0);
      } 
    }
  });

  // navigate to unit test page
  await page.goto('http://127.0.0.1:1234/');

  // disable coverage
  const jsCoverage = await page.coverage.stopJSCoverage();
  pup2ist.write([...jsCoverage]);

  await new Promise(resolve => setTimeout(resolve, 6000));
  await browser.close();
})();