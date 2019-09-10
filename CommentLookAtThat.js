const puppeteer = require('puppeteer-core');
// const puppeteer = require('puppeteer');
const phrases = require('./assets/lookAtThatPhrases');
 
(async () => {
  console.log('running');
  let i = 0; 

  setInterval(() => {
    puppeteer.launch({executablePath: '/usr/bin/chromium-browser'}).then(async browser => {
    // puppeteer.launch({headless: true}).then(async browser => {
      try {
        const page = await browser.newPage();
        await page.goto(`https://www.reddit.com/login/`);

        await page.evaluate(function(){
          return new Promise((res, rej) => {
            document.querySelector('[action="/login"]').username.value = 'HaveALookAtThat';
            document.querySelector('[action="/login"]').password.value = 'WelcomeToReddit303?';
            document.querySelector('[action="/login"]').password.type = 'text';
            res();
          });
        });
        
        await page.evaluate(function(){
          return new Promise((res, rej) => {
            document.querySelector('[action="/login"]').submit();
            res();
          });
        });
        await page.waitForNavigation();
        
        await page.goto(`https://www.reddit.com/r/popular/rising/`);
        
        await page.evaluate(function(){
          return new Promise((res, rej) => {
            var posts = document.querySelectorAll('a[data-click-id="body"]');
            var postId = Math.floor(Math.random() * ((posts.length - 1) - 0 + 1) + 0);
            setTimeout(() => { window.location.assign(posts[postId].href) }, 100)
            res();
          });
        });
        await page.waitForSelector('textarea');
        
        await page.type('textarea', phrases[i], {delay: 10});
        await page.waitFor(1000);
        await page.click('[type="submit"]');
        await page.waitFor(2000);
      }
      catch(err){
        // console.log(err);  
      }

      browser.close();

      if (i + 1 === phrases.length){
        i = 0; 
      } else {
        ++i;
      }
      
    });
  }, 1000*60*15); 
})();