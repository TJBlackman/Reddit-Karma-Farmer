// google search with the following params
// time = last hour
// category = news
// results per page = 100

// usage:
// const newArticle = await searchGoogle('Washington'); 
// newArticle = {title: 'some title', link: 'some link', time: 2}

const puppeteer = require('puppeteer-core');
const buzz_words = require('../assets/buzz_words');

// words that we DONT want to appear in the news article title
const dissallowedKeyWords = ['violence', 'death', 'rape', 'torture', 'die', 'body', 'bodies', 'drug','murder','abuse','slain']; 

module.exports = (searchString) => {
    return new Promise((resolve, reject) => {
        puppeteer.launch({executablePath: '/usr/bin/chromium-browser'}).then(async browser => {
            try {
            const page = await browser.newPage();
            const oneHourSearch = (`https://www.google.com/search?q=${searchString}&tbs=qdr:h&tbm=nws&num=100`); // 1 hour search &tbs=qdr:h
            const oneDaySearch = (`https://www.google.com/search?q=${searchString}&tbs=qdr:d&tbm=nws&num=100`); // 1 day search &tbs=qdr:d

            async function getGoogleResults(){
                const search_results = await page.evaluate(() => {
                    return new Promise((res, rej) => {
                        try {
                            const result_nodes = document.querySelectorAll('.g.card'); 
                            if (!result_nodes){ return res(null); }

                            const all_results = Array.from(result_nodes).map(item => {
                                return {
                                    title: (item.querySelector('h3') && item.querySelector('h3').innerText),
                                    link: (item.querySelector('div > a') && item.querySelector('div > a').href),
                                    time: (item.querySelector('.slp span.f') && parseInt(item.querySelector('.slp span.f').innerText))
                                }
                            });

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
            let search_results = await getGoogleResults(); 

            if (!search_results){                  
                await page.goto(oneDaySearch); 
                search_results = await getGoogleResults(); 

                if (!search_results){
                    browser.close();
                    return resolve(null);
                }
            }

            const non_negativeResults = search_results.filter(post => !dissallowedKeyWords.some(word => post.title.includes(word)));

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
                browser.close(); 
                resolve(null);
            }
        });
    });
};