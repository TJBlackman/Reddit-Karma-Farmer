const puppeteer = require('puppeteer-core');

module.exports = async ({ headless, slowMo, devtools } = { headless: true, slowMo: 0, devtools: false }) => {
  try {
    const isHeadless = headless === false ? false : process.env.DEBUG === 'true' ? false : true;
    const hasSlowmo = slowMo || process.env.DEBUG === 'true' ? 50 : 0;
    const hasDevTools = devtools || process.env.DEBUG === 'true' ? true : false;

    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_EXE_PATH,
      headless: isHeadless,
      slowMo: hasSlowmo,
      devtools: hasDevTools,
      args: [
        '--disable-notifications',
        '--disable-gpu',
        '--no-sandbox',
        '--lang=en-US',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });
    return browser;
  } catch (err) {
    console.log('Error at: ', new Date().toLocaleTimeString());
    console.log(err);
  }
};
