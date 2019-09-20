// const puppeteer = require('puppeteer-core');
const puppeteer = require('puppeteer');
const buzz_words = require('../assets/buzzwords');
const badwords = require('../assets/badwords');
const dbMethods = require('./databaseMethods');

module.exports = (searchString) => {
    return new Promise(async (resolve, reject) => {
        
        // const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser', args: ['--disable-notifications']});
        const browser = await puppeteer.launch({headless: false, args: ['--disable-notifications']});
        
        try {
            const page = await browser.newPage();
            const oneHourSearch = (`https://www.google.com/search?q=${searchString}&tbs=qdr:h,sbd:1&tbm=nws&num=100`); // 1 hour search &tbs=qdr:h
            const oneDaySearch = (`https://www.google.com/search?q=${searchString}&tbs=qdr:d,sbd:1&tbm=nws&num=100`); // 1 day search &tbs=qdr:d

            const getGoogleResults = async function(){
                const search_results = await page.evaluate(() => {
                    return new Promise((res, rej) => {
                        try {
                            const result_nodes = document.querySelectorAll('g-card'); 
                            if (!result_nodes){ 
                                return res(null); 
                            }

                            const all_results = Array.from(result_nodes).map(item => ({
                                title: (item.querySelector('a > div > div:nth-child(2) > div:nth-child(2)') && item.querySelector('a > div > div:nth-child(2) > div:nth-child(2)').innerText),
                                link: (item.querySelector('a') && item.querySelector('a').href)
                            })).filter(item => item.title && item.link && !item.title.includes('...'));

                            if (all_results.length === 0){ 
                                return res(null); 
                            }
                            res(all_results);
                        }
                        catch(err){
                            return res(null); 
                        }
                    });
                });
                return search_results; 
            }

            await page.goto(oneHourSearch); 
            let search_results = await getGoogleResults(); 
            
            if (!search_results){                  
                await page.goto(oneDaySearch); 
                search_results = await getGoogleResults(); 

                if (!search_results) {
                    browser.close();
                    return resolve(null);
                }
            }


            const non_negativeResults = search_results
                .filter(post => !badwords.some(word => {
                    return post.title.includes(word); 
                }) && post.link.includes('.com'));

            const scoredResults = non_negativeResults.map(post => {
                const score_obj = buzz_words.reduce((acc, word) => {
                        if (post.title.includes(word)){
                            acc.score++; 
                            acc.buzzwords.push(word);
                        }; 
                        return acc; 
                    }, {score: 0, buzzwords: []}); 
                    return {
                        ...score_obj,
                        ...post
                    };
                })
                .sort((a, b) => { return a.time < b.time ? 1 : -1; })
                .sort((a, b) => { return a.score >= b.score ? 1 : -1; });

            browser.close(); 
            resolve(scoredResults[0]); // pass back the newest, highest-scoring post
        }
        catch(err) {
            dbMethods.recordError(err);
            resolve(null);
        }
        await browser.close();
    });
};