const getBrowser = require('./get-browser');
const logIntoReddit = require('./log-into-reddit');

module.exports = async (commentStr) => {
  const browser = await getBrowser();
  try {
    const page = await browser.newPage();

    await logIntoReddit(page);
    await page.goto(`https://www.reddit.com/r/all/rising/`);

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

    // go to my profile > comment hisory
    // delete any negative comments to prevent more downvotes
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

          await __sleep(250);

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

          await __sleep(250);

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

          await __sleep(250);
        }
      } catch (err) {
        // do nothing in browser...
      }
      return true;
    });
  } catch (err) {
    console.log(err);
  }
  browser.close();
  return true;
};
