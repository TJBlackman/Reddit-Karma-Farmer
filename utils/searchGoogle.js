const puppeteer = require('puppeteer-core');
// const puppeteer = require('puppeteer');
const buzz_words = require('../assets/buzz_words');
const dbMethods = require('./databaseMethods');

// words that we DONT want to appear in the news article title
const dissallowedKeyWords = ['violence', 'death', 'rape', 'torture', 'die', 'body', 'bodies', 'drug','murder','abuse','slain']; 

module.exports = (searchString) => {
    return new Promise((resolve, reject) => {
        puppeteer.launch({executablePath: '/usr/bin/chromium-browser'}).then(async browser => {
        // puppeteer.launch().then(async browser => {
            try {
            const page = await browser.newPage();
            const oneHourSearch = (`https://www.google.com/search?q=${searchString}&tbs=qdr:h,sbd:1&tbm=nws&num=100`); // 1 hour search &tbs=qdr:h
            const oneDaySearch = (`https://www.google.com/search?q=${searchString}&tbs=qdr:d,sbd:1&tbm=nws&num=100`); // 1 day search &tbs=qdr:d

            async function getGoogleResults(){
                const search_results = await page.evaluate(() => {
                    return new Promise((res, rej) => {
                        try {
                            const result_nodes = document.querySelectorAll('g-card'); 
                            if (!result_nodes){ return res(null); }

                            const all_results = Array.from(result_nodes).map(item => {
                                return {
                                    title: (item.querySelector('a > div > div:nth-child(2) > div:nth-child(2)') && item.querySelector('a > div > div:nth-child(2) > div:nth-child(2)').innerText),
                                    link: (item.querySelector('a') && item.querySelector('a').href)
                                }
                            }).filter(item => item.title && item.link);

                            if (all_results.length === 0){ res(null); }
                            return res(all_results);
                        }
                        catch(err){
                            return res(null); 
                        }
                    });
                });
                return search_results; 
            }

            await page.goto(oneHourSearch); 
            // await page.screenshot({path: '1hour.png'})
            let search_results = await getGoogleResults(); 
            console.log(`1 hour results: ${search_results && search_results.length}`)
            
            if (!search_results){                  
                await page.goto(oneDaySearch); 
                // await page.screenshot({path: '1day.png'})
                search_results = await getGoogleResults(); 
                console.log(`1 day results: ${search_results && search_results.length}`)

                if (!search_results) {
                    browser.close();
                    return resolve(null);
                }
            }

            const non_negativeResults = search_results
                .filter(post => !dissallowedKeyWords.some(word => {
                    console.log(post); 
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
            catch(err){
                console.log(err);
                // browser.close(); 
                // dbMethods.recordError(err);
                // resolve(null);
            }
        });
    });
};