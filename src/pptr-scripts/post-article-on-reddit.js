const getBrowser = require('./get-browser');
const logIntoReddit = require('./log-into-reddit');

module.exports = async (subreddit, article) => {
  const browser = await getBrowser();
  try {
    const page = await browser.newPage();

    await logIntoReddit(page);

    await page.goto(`https://www.reddit.com${subreddit}/submit`);

    // post a link to this subreddit
    await page.evaluate(async () => {
      Array.from(document.querySelectorAll('button')).some((button) => {
        if (button.innerText === 'Link') {
          button.click();
          return true;
        }
      });
      return true;
    });

    // click Do Not send me notifications on my post
    await page.evaluate(async () => {
      document.querySelector('[aria-labelledby="send-replies"] > input').click();
      return true;
    });

    // type in title and url
    await page.type('textarea[placeholder="Title"]', article.title);
    await page.type('textarea[placeholder="Url"]', article.link);

    // submit
    await page.evaluate(async () => {
      Array.from(document.querySelectorAll('button')).some((button) => {
        if (button.innerText === 'POST') {
          button.click();
          return true;
        }
      });
      return true;
    });

    await page.waitForNavigation();
  } catch (err) {
    console.log('Error at: ', new Date().toLocaleTimeString());
    console.log(err);
  }
  browser.close();
  return true;
};
