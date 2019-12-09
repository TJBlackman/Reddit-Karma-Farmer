// const puppeteer = require('puppeteer-core');
const puppeteer = require('puppeteer');
const creds = require('../assets/credentials');
const dbMethods = require('./databaseMethods');
const path = require('path');

module.exports = function(comment) {
  return new Promise((resolve, reject) => {
    // puppeteer
    //   .launch({ executablePath: '/usr/bin/chromium-browser' })
    //   .then(async browser => {
    puppeteer
      .launch({ headless: true, args: ['--disable-notifications'] })
      .then(async browser => {
        const page = await browser.newPage();
        try {
          await page.goto('https://www.reddit.com/login/');
          if (creds.debug) {
            console.log('At login...');
            await page.screenshot({ path: './login.png' });
          }
          await page.evaluate(function(creds) {
            return new Promise((res, rej) => {
              document.querySelector('[action="/login"]').username.value =
                creds.username;
              document.querySelector('[action="/login"]').password.value =
                creds.password;
              document.querySelector('[action="/login"]').password.type =
                'text';
              document.querySelector('[action="/login"]').submit();
              res();
            });
          }, creds);

          await page.waitForNavigation();

          await page.goto(`https://www.reddit.com/r/all/rising/`);
          if (creds.debug) {
            console.log('At /r/rising...');
            await page.screenshot({ path: './rising.png' });
          }

          const link = await page.evaluate(function() {
            return new Promise((res, rej) => {
              const randomLink = Array.from(
                document.querySelectorAll('[data-click-id="comments"]')
              )
                .filter(i => {
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
              res(randomLink);
            });
          });

          await page.goto(link);
          await page.waitForSelector('.Comment');

          if (creds.debug) {
            console.log('At comment...');
            await page.screenshot({ path: './comment.png' });
          }

          await page.evaluate(function() {
            return new Promise((res, rej) => {
              var topComment = document.querySelector('.Comment');
              if (topComment.innerText.includes('Stickied comment')) {
                topComment.remove();
                topComment = document.querySelector('.Comment');
              }
              var replyButton = Array.from(
                topComment.querySelectorAll('button')
              ).find(item => item.innerText.toLowerCase().includes('reply'));
              replyButton.click();
              var markdownBtn = topComment.querySelector(
                '[aria-label="Markdown mode"]'
              );
              if (markdownBtn) {
                markdownBtn.click();
              }
              res();
            });
          });

          await page.type('textarea', comment);

          if (creds.debug) {
            console.log('At comment typed...');
            await page.screenshot({ path: './comment-typed.png' });
          }

          await page.click(
            '[data-test-id="comment-submission-form-markdown"] [type="submit"]'
          );

          await page.waitFor(1000);

          // go to my profile > comment hisory
          await page.goto(
            `https://www.reddit.com/user/${creds.username}/comments/?sort=new`
          );

          await page.waitFor(1000);

          // delete any negative comments to prevent more downvotes
          await page.waitForSelector('.Comment');
          await page.evaluate(function() {
            return new Promise(__resolve => {
              (async () => {
                try {
                  const __sleep = time =>
                    new Promise(res => setTimeout(res, time));

                  const comments = document.querySelectorAll('.Comment');
                  for (let i = 0; i < comments.length; i++) {
                    const comment = comments[i];
                    const commentIsUpvoted = await (() =>
                      new Promise(res => {
                        let _isUpvoted = true;
                        comment.querySelectorAll('span').forEach(span => {
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
                      new Promise(res => {
                        document
                          .querySelector('[role="menu"]')
                          .querySelectorAll('button')
                          .forEach(async btn => {
                            if (btn.innerText === 'Delete') {
                              btn.click();
                            }
                          });
                        res();
                      }))();

                    await __sleep(250);

                    await (() =>
                      new Promise(res => {
                        document
                          .querySelector('[aria-modal="true"]')
                          .querySelectorAll('button')
                          .forEach(async btn => {
                            if (btn.innerText === 'DELETE') {
                              btn.click();
                            }
                          });
                        res();
                      }))();

                    await __sleep(250);
                  }
                  __resolve();
                } catch (err) {
                  __resolve();
                }
              })();
            });
          });
        } catch (err) {
          const fileName = path.join(
            __dirname,
            `../screenshots/${Date.now()}.png`
          );
          if (creds.debug) {
            await page.screenshot({ path: fileName });
          }
          dbMethods.recordError(err, fileName);
        }
        await browser.close();
        resolve();
      });
  });
};
