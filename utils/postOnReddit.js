// const puppeteer    = require('puppeteer-core');
const puppeteer    = require('puppeteer');
const creds        = require('../assets/credentials');
const dbMethods    = require('./databaseMethods');
 
module.exports = function(subreddit, post_object){
  return new Promise(async (resolve, reject) => {
    // const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser', args: ['--disable-notifications']});
    const browser = await puppeteer.launch({headless: false, args: ['--disable-notifications']});
    try {
      const page = await browser.newPage();
      
      page.on('dialog', async dialog => {
        await dialog.dismiss();
      });

      await page.goto(`https://www.reddit.com/login/`);

      await page.evaluate(function(creds){
        return new Promise((res, rej) => {
          document.querySelector('[action="/login"]').username.value = creds.username;
          document.querySelector('[action="/login"]').password.value = creds.password;
          document.querySelector('[action="/login"]').password.type = 'text';
          res();
        });
      }, creds);
      
      await page.evaluate(function(creds){
        return new Promise((res, rej) => {
          document.querySelector('[action="/login"]').submit();
          res();
        });
      }, creds);
      

      await page.waitForNavigation();
      
      await page.goto(`https://www.reddit.com${subreddit}/submit`);

      // click Link button, to post a link
      await page.evaluate(function(){
        return new Promise((res, rej) => {
          Array.from(document.querySelectorAll('button')).some(button => {
            if (button.innerText === 'Link'){
              button.click(); 
              res(); 
              return true; 
            }
          })
        });
      });

      // click Do Not send me notifications on my post
      await page.evaluate(function(){
        return new Promise((res, rej) => {
          document.querySelector('[aria-labelledby="send-replies"] > input').click();
          res();
        });
      }); 

      // type in title and url
      await page.type('textarea[placeholder="Title"]', post_object.title, { delay: 10 });
      await page.type('textarea[placeholder="Url"]', post_object.link, { delay: 10 });


      // find and click the post button
      await page.evaluate(function(){
        Array.from(document.querySelectorAll('button')).some(button => {
          if (button.innerText === 'POST'){
            button.click(); 
            return true; 
          }
        });
      }); 
      await page.waitFor(1000); 
    }
    catch(err){
      dbMethods.recordError(err);
    }
    await browser.close();
    resolve();
  }); 
};