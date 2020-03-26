const bannedWords = require('../assets/banned-words');
const buzzWords = require('../assets/buzz-words');

// every article starts with score of 0
// for every banned word in article title, score is -1
// for every buzz word in article title, score is +1
// return articles sorted heighest score to lowest score

module.exports = (articlesArray) => {
  let bannedWordsLength = bannedWords.length;
  let buzzWordsLength = buzzWords.length;
  let articlesArrayLength = articlesArray.length;

  let ia = 0; // articles

  for (; ia < articlesArrayLength; ++ia) {
    const article = articlesArray[ia];
    article.score = 0;
    article.buzz = [];
    article.banned = [];

    let iz = 0; // buzz words
    for (; iz < buzzWordsLength; ++iz) {
      const buzzWord = buzzWords[iz];
      const rx = new RegExp(buzzWord, 'i');
      if (rx.test(article.title)) {
        article.score += 1;
        article.buzz.push(buzzWord);
      }
    }

    let ib = 0; // banned words
    for (; ib < bannedWordsLength; ++ib) {
      const bannedWord = bannedWords[ib];
      const rx = new RegExp(bannedWord, 'i');
      if (rx.test(article.title)) {
        article.score -= 1;
        article.banned.push(bannedWord);
      }
    }
  }

  // sort so height scored article is at index 0
  articlesArray.sort((a, b) => {
    return a.score < b.score ? 1 : -1;
  });

  return articlesArray;
};
