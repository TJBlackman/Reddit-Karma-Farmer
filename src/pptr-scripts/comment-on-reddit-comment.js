const getBrowser = require('./get-browser');
const logIntoReddit = require('./log-into-reddit');
const { getAlreadyUsedPosts, recordAlreadyUsedPost } = require('../utils/db-helpers');

module.exports = async (commentStr) => {
  const browser = await getBrowser();
  try {
    let page = await browser.newPage();
    await logIntoReddit(page);
    // reloading reddit first helps page to not crash
    await page.goto('https://www.reddit.com', { waitUntil: 'load', timeout: 60000 });
    // now go to /rising
    await page.goto('https://www.reddit.com/r/all/rising/', { waitUntil: 'load', timeout: 60000 });

    const previousUrls = getAlreadyUsedPosts();
    // choose random-ish rising post and go to it
    const link = await page.evaluate(async (previousUrls) => {
      // remove live broadcasts
      const allRedditPosts = document.querySelectorAll('.Post');
      const isBroadcastRegex = /<span>Broadcast<\/span>/;
      let i = 0,
        max = allRedditPosts.length;
      for (; i < max; ++i) {
        const el = allRedditPosts[i];
        const html = el.innerHTML;
        if (isBroadcastRegex.test(html)) {
          el.remove();
        }
      }
      // select a link
      const randomLink = Array.from(document.querySelectorAll('[data-click-id="comments"]'))
        .filter((i) => {
          if (i.innerText.includes('k')) {
            return false;
          }
          if (previousUrls.includes(i.href)) {
            return false;
          }
          const num = parseInt(i.innerText);
          return num >= 30;
        })
        .sort((a, b) => {
          const numCommentsA = parseInt(a.innerText);
          const numCommentsB = parseInt(b.innerText);
          return numCommentsA > numCommentsB ? 1 : -1;
        })
        .reduce((url, anchorTag, index, arr) => {
          // each url gets 50% chance to be saved
          if (index === 0) {
            return anchorTag.href;
          }
          return Math.random() > 0.5 ? anchorTag.href : url;
        }, '');
      return randomLink.trim();
    }, previousUrls);
    if (!link) {
      throw Error('No link was returned. Cannot navigate to a post page.');
    }
    await page.goto(link, { waitUntil: 'load', timeout: 60000 });

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
    recordAlreadyUsedPost(link);
    await page.waitFor(1000);
  } catch (err) {
    console.log('Error at: ', new Date().toLocaleTimeString());
    console.log(err);
  }
  browser.close();
  return true;
};
