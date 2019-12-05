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

          await page.waitFor(2000);
        } catch (err) {
          const fileName = path.join(
            __dirname,
            `../screenshots/${Date.now()}.png`
          );
          await page.screenshot({ path: fileName });
          dbMethods.recordError(err, fileName);
        }
        await browser.close();
        resolve();
      });
  });
};
