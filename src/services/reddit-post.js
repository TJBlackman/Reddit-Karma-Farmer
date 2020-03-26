const db = require('../utils/db-helpers');
const categories = require('../assets/post-categories');
const searchGoogle = require('../pptr-scripts/get-news-from-google');
const scoreArticles = require('../utils/rate-google-articles');
const postArticleOnReddit = require('../pptr-scripts/post-article-on-reddit');

module.exports = async () => {
  // check DB for next query
  const index = db.getIndex();
  db.incrementIndex(categories.length);
  const categoryObject = categories[index];

  // query Google for NewsStory
  const results = await searchGoogle(categoryObject.searchTerm);
  scoreArticles(results);

  // post story on Reddit
  await postArticleOnReddit(categoryObject.subreddit, results[0]);

  return true;
};
