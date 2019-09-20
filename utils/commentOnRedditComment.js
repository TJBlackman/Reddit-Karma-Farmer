// const puppeteer     = require('puppeteer-core');
const puppeteer     = require('puppeteer');
const creds         = require('../assets/credentials');
const dbMethods     = require('./databaseMethods');
 
module.exports = function(comment){
    return new Promise((resolve, reject) => {
        // puppeteer.launch({executablePath: '/usr/bin/chromium-browser', args: ['--disable-notifications']}).then(async browser => {
        puppeteer.launch({headless: false, args: ['--disable-notifications']}).then(async browser => {
            try {
                const page = await browser.newPage();
                await page.goto('https://www.reddit.com/login/');
        
                await page.evaluate(function(creds){
                    return new Promise((res, rej) => {
                      document.querySelector('[action="/login"]').username.value = creds.username;
                      document.querySelector('[action="/login"]').password.value = creds.password;
                      document.querySelector('[action="/login"]').password.type = 'text';
                      document.querySelector('[action="/login"]').submit();
                      res();
                    });
                }, creds);
        
                await page.waitForNavigation();
                  
                await page.goto(`https://www.reddit.com/r/all/rising/`);
        
                const link = await page.evaluate(function(){
                    return new Promise((res, rej) => {
                        const randomLink = Array.from(document.querySelectorAll('[data-click-id="comments"]')).filter(i => {
                            if (i.innerText.includes('k')){ return false; }
                            const num = parseInt(i.innerText);
                            return num > 10 && num < 30;
                        }).reduce((link, item) => {
                            if (!link){
                                return item.href; 
                            }; 
                            const chance = Math.random(); 
                            return chance > 0.5 ? item.href : link;
                        }, null);
                        res(randomLink);
                    });
                });
                
                await page.goto(link);
                await page.waitForSelector('.Comment');
                
                await page.evaluate(function(){
                    return new Promise((res, rej) => {
                        var topComment = document.querySelector('.Comment');
                        var replyButton = Array.from(topComment.querySelectorAll('button')).find(item => item.innerText.toLowerCase().includes('reply'));
                        replyButton.click();
                        var markdownBtn = topComment.querySelector('[aria-label="Markdown mode"]');
                        if (markdownBtn){
                            markdownBtn.click();
                        };
                        res();
                    });
                });
        
                await page.type('textarea', comment);
                await page.click('[data-test-id="comment-submission-form-markdown"] [type="submit"]');
        
                await page.waitFor(2000);
            }
            catch(err){
                dbMethods.recordError(err);
            }
            await browser.close();
            resolve();
        });  
    });
}; 