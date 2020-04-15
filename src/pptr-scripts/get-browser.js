const puppeteer = require('puppeteer-core');

module.exports = async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_EXE_PATH,
      headless: process.env.DEBUG === 'true' ? false : true,
      slowMo: process.env.DEBUG === 'true' ? 50 : 0,
      args: [
        '--disable-notifications',
        '--disable-gpu',
        '--no-sandbox',
        '--lang=en-US',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ],
      devtools: process.env.DEBUG === 'true' ? true : false
    });
    return browser;
  } catch (err) {
    console.log('Error at: ', new Date().toLocaleTimeString());
    console.log(err);
  }
};
