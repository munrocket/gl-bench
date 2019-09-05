import puppeteer from 'puppeteer';
run().then(() => console.log('Done')).catch(error => console.log(error));

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
    //devtools: true,
    args: ['--window-size=1200,600']
  });
  
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:1234/');

  await new Promise(resolve => setTimeout(resolve, 10000));
  await browser.close();
}