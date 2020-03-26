const db = require('../utils/db-helpers');
const phrases = require('../assets/comment-on-post-phrases');
const commentOnRedditPost = require('../pptr-scripts/comment-on-reddit-post');

module.exports = async () => {
  // get next phrase
  const index = db.getIndex();
  db.incrementIndex(phrases.length);
  const phrase = phrases[index];

  // comment on reddit post
  await commentOnRedditPost(phrase);

  return true;
};
