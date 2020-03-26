const puppeteer = require('puppeteer-core');

module.exports = async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_EXE_PATH,
      headless: process.env.DEBUG === 'true' ? false : true,
      slowMo: process.env.DEBUG === 'true' ? 50 : 0,
      args: ['--disable-notifications'],
      devtools: process.env.DEBUG === 'true' ? true : false
    });
    return browser;
  } catch (err) {
    console.log(err);
  }
};
