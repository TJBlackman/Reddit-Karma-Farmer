const getBrowser = require('./get-browser');
const logIntoReddit = require('./log-into-reddit');
const path = require('path');

module.exports = async (commentStr) => {
  const browser = await getBrowser();
  try {
    let page = await browser.newPage();
    await logIntoReddit(page);

    // reloading reddit first helps page to not crash
    await page.goto('https://www.reddit.com', { waitUntil: 'networkidle0', timeout: 60000 });
    // now go to /rising
    await page.goto('https://www.reddit.com/r/all/rising/', { waitUntil: 'networkidle0', timeout: 60000 });

    // choose random-ish rising post and go to it
    const link = await page.evaluate(async () => {
      const randomLink = Array.from(document.querySelectorAll('[data-click-id="comments"]'))
        .filter((i) => {
          if (i.innerText.includes('k')) {
            return false;
          }
          const num = parseInt(i.innerText);
          return num > 10 && num < 30;
        })
        .reduce((link, item) => {
          if (!link) {
            return item.href;
          }
          const chance = Math.random();
          return chance > 0.5 ? item.href : link;
        }, null);
      return randomLink;
    });
    if (!link) {
      throw Error('No link was returned. Cannot navigate to a post page.');
    }
    await page.goto(link);
    await page.waitForSelector('.Comment');

    // remove stickied mod comments
    // click button to comment on top existing comment
    await page.evaluate(async () => {
      var topComment = document.querySelector('.Comment');
      if (topComment.innerText.includes('Stickied comment')) {
        topComment.remove();
        topComment = document.querySelector('.Comment');
      }
      var replyButton = Array.from(topComment.querySelectorAll('button')).find((item) =>
        item.innerText.toLowerCase().includes('reply')
      );
      replyButton.click();
      await (() => new Promise((res) => setTimeout(res, 250)))();
      var markdownBtn = topComment.querySelector('[aria-label="Switch to markdown"]');
      if (markdownBtn) {
        markdownBtn.click();
      }
      return true;
    });

    await page.type('textarea', commentStr);
    await page.click('[data-test-id="comment-submission-form-markdown"] [type="submit"]');
    await page.waitFor(1000);
  } catch (err) {
    console.log('Error at: ', new Date().toLocaleTimeString());
    console.log(err);
  }
  browser.close();
  return true;
};
