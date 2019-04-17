const puppeteer = require('puppeteer-core');
const creds = require('../assets/credentials');
 
module.exports = function(subreddit, post_object){
  return new Promise((resolve, reject) => {
    try {
      puppeteer.launch({executablePath: '/usr/bin/chromium-browser'}).then(async browser => {
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
  
          // find and click the post button
          await page.evaluate(function(){
            return new Promise((res, rej) => {
              Array.from(document.querySelectorAll('button')).some(button => {
                if (button.innerText === 'POST'){
                  button.click(); 
                  res(); 
                  return true; 
                }
              })
            });
          }); 
          await page.waitFor(5000); 
          browser.close();
          resolve(); 
        }
        catch(err){
          browser.close();
        }
      });
    }
    catch(err){
      resolve();
    }
  }); 
}