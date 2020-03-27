const getBrowser = require('./get-browser');
const logIntoReddit = require('./log-into-reddit');

module.exports = async () => {
  const browser = await getBrowser();
  try {
    const page = await browser.newPage();

    await logIntoReddit(page);
    await page.goto(`https://www.reddit.com/user/${process.env.REDDIT_USERNAME}/comments/?sort=new`);
    await page.waitForSelector('.Comment');
    await page.evaluate(async () => {
      try {
        const __sleep = (time) => new Promise((res) => setTimeout(res, time));

        const comments = document.querySelectorAll('.Comment');
        for (let i = 0; i < comments.length; i++) {
          const comment = comments[i];
          const commentIsUpvoted = await (() =>
            new Promise((res) => {
              let _isUpvoted = true;
              comment.querySelectorAll('span').forEach((span) => {
                if (span.innerText.includes('points')) {
                  if (span.innerText.includes('-')) {
                    comment.querySelector('.icon-menu').click();
                    _isUpvoted = false;
                  }
                }
              });
              res(_isUpvoted);
            }))();

          await __sleep(333);

          // end here if comment has positive votes
          if (commentIsUpvoted) {
            continue;
          }

          await (() =>
            new Promise((res) => {
              document
                .querySelector('[role="menu"]')
                .querySelectorAll('button')
                .forEach(async (btn) => {
                  if (btn.innerText === 'Delete') {
                    btn.click();
                  }
                });
              res();
            }))();

          await __sleep(500);

          await (() =>
            new Promise((res) => {
              document
                .querySelector('[aria-modal="true"]')
                .querySelectorAll('button')
                .forEach(async (btn) => {
                  if (btn.innerText === 'DELETE') {
                    btn.click();
                  }
                });
              res();
            }))();

          await __sleep(500);
        }
      } catch (err) {
        // do nothing in browser...
      }
      return true;
    });
    await page.waitFor(1000);
  } catch (err) {
    console.log('Error at: ', new Date().toLocaleTimeString());
    console.log(err);
  }
  browser.close();
  return true;
};
