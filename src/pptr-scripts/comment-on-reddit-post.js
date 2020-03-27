const getBrowser = require('./get-browser');
const logIntoReddit = require('./log-into-reddit');

module.exports = async (commentStr) => {
  const browser = await getBrowser();
  try {
    const page = await browser.newPage();

    await logIntoReddit(page);
    await page.goto(`https://www.reddit.com/r/all/rising/`);

    const link = await page.evaluate(async () => {
      var randomLink = Array.from(document.querySelectorAll('div[data-click-id="background"]'))
        .filter((i) => {
          var comments = i.querySelector('[data-click-id="comments"]').innerText;
          if (comments.includes('k')) {
            return false;
          }
          const num = parseInt(comments);
          return num > 10 && num < 60;
        })
        .reduce((link, item) => {
          const href = item.querySelector('a[data-click-id="body"]').href;
          if (!link) {
            return href;
          }
          const chance = Math.random();
          return chance > 0.5 ? href : link;
        }, null);
      return randomLink;
    });

    await page.goto(link);
    await page.waitForSelector('[aria-label="Switch to markdown"]');

    await page.evaluate(async () => {
      const textarea = document.querySelector('textarea');
      if (!textarea) {
        document.querySelector('[aria-label="Switch to markdown"]').click();
      }
      return;
    });

    await page.type('textarea', commentStr);
    await page.click('[data-test-id="comment-submission-form-markdown"] [type="submit"]');
  } catch (err) {
    console.log('Error at: ', new Date().toLocaleTimeString());
    console.log(err);
  }
  browser.close();
  return true;
};
