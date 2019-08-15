const puppeteer = require('puppeteer-core');
// const puppeteer = require('puppeteer');
const creds = require('../assets/credentials');
const dbMethods = require('./databaseMethods');
 
module.exports = function(subreddit, post_object){
  return new Promise((resolve, reject) => {
    try {
      puppeteer.launch({executablePath: '/usr/bin/chromium-browser'}).then(async browser => {
      // puppeteer.launch().then(async browser => {
        try {
          console.log(`Now posting article on ${subreddit}: `, post_object)
          const page = await browser.newPage();
          await page.goto(`https://www.reddit.com/login/`);

          await page.evaluate(function(creds){
            return new Promise((res, rej) => {
              document.querySelector('[action="/login"]').username.value = creds.username;
              document.querySelector('[action="/login"]').password.value = creds.password;
              document.querySelector('[action="/login"]').password.type = 'text';
              res();
            });
          }, creds);

          // await page.screenshot({path: 'login.png'})
          
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
          await page.type('textarea[placeholder="Title"]', post_object.title, { delay: 100 });
          await page.type('textarea[placeholder="Url"]', post_object.link, { delay: 100 });
  
          // await page.screenshot({path: 'formfilled.png'})

          // find and click the post button
          await page.evaluate(function(){
            Array.from(document.querySelectorAll('button')).some(button => {
              if (button.innerText === 'POST'){
                button.click(); 
                return true; 
              }
            });
          }); 
          await page.waitFor(5000); 
          // await page.screenshot({path: 'final.png'})
          resolve(); 
        }
        catch(err){
          resolve(); 
          dbMethods.recordError(err);
        }
        browser.close();
      });
    }
    catch(err){
      dbMethods.recordError(err);
      resolve();
    }
  }); 
}