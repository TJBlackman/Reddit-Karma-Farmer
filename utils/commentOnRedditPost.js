const puppeteer = require('puppeteer-core');
// const puppeteer         = require('puppeteer');
const creds = require('../assets/credentials');
const dbMethods = require('./databaseMethods');

module.exports = function(comment) {
  return new Promise((resolve, reject) => {
    puppeteer
      .launch({ executablePath: '/usr/bin/chromium-browser' })
      .then(async browser => {
        // puppeteer.launch({headless: false, args: ['--disable-notifications']}).then(async browser => {
        try {
          const page = await browser.newPage();
          await page.goto('https://www.reddit.com/login/');

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

          const link = await page.evaluate(function() {
            return new Promise((res, rej) => {
              var randomLink = Array.from(
                document.querySelectorAll('div[data-click-id="background"]')
              )
                .filter(i => {
                  var comments = i.querySelector('[data-click-id="comments"]')
                    .innerText;
                  if (comments.includes('k')) {
                    return false;
                  }
                  const num = parseInt(comments);
                  return num > 10 && num < 60;
                })
                .reduce((link, item) => {
                  const href = item.querySelector('a[data-click-id="body"]')
                    .href;
                  if (!link) {
                    return href;
                  }
                  const chance = Math.random();
                  return chance > 0.5 ? href : link;
                }, null);
              res(randomLink);
            });
          });

          await page.goto(link);
          await page.waitForSelector('[aria-label="Markdown mode"]');

          await page.evaluate(function() {
            return new Promise((res, rej) => {
              const textarea = document.querySelector('textarea');
              if (!textarea) {
                document.querySelector('[aria-label="Markdown mode"]').click();
              }
              res();
            });
          });

          await page.type('textarea', comment);
          await page.click(
            '[data-test-id="comment-submission-form-markdown"] [type="submit"]'
          );

          await page.waitFor(1000);
        } catch (err) {
          dbMethods.recordError(err);
        }
        await browser.close();
        resolve();
      });
  });
};
