// google search with the following params
// time = last hour
// category = news
// results per page = 100

// usage:
// const newArticle = await searchGoogle('Washington'); 
// newArticle = {title: 'some title', link: 'some link', time: 2}

const puppeteer = require('puppeteer');
const buzz_words = require('../assets/buzz_words');

// words that we DONT want to appear in the news article title
const dissallowedKeyWords = ['violence', 'death', 'rape', 'torture', 'die', 'body', 'bodies', 'drug']; 

module.exports = (searchString) => {
    return new Promise((resolve, reject) => {
        puppeteer.launch({headless: true}).then(async browser => {
            try {
              const page = await browser.newPage();
              await page.goto(`https://www.google.com/search?q=${searchString}&tbs=qdr:h&tbm=nws&num=100`);

              const search_results = await page.evaluate(() => {
                return new Promise((res, rej) => {
                    try {
                        let all_results = Array.from(document.querySelectorAll('.g.card')).map(item => {
                            return {
                                title: (item.querySelector('h3') && item.querySelector('h3').innerText),
                                link: (item.querySelector('div > a') && item.querySelector('div > a').href),
                                time: (item.querySelector('.slp span.f') && parseInt(item.querySelector('.slp span.f').innerText))
                            }
                        });
                        res(all_results);
                    }
                    catch(err){
                        rej(err); 
                    }
                });
              });

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
              .sort((a, b) => { return a > b ? 1 : -1; });

              browser.close(); 
              resolve(scoredResults[0]); // pass back the newest, highest-scoring post
            }
            catch(err){
                reject(err);
            }
        });
    });
};