const db = require('../utils/db-helpers');
const phrases = require('../assets/comment-on-comment-phrases');
const commentOnRedditComment = require('../pptr-scripts/comment-on-reddit-comment');

module.exports = async () => {
  // get next phrase
  const index = db.getIndex();
  db.incrementIndex(phrases.length);
  const phrase = phrases[index];

  // comment on reddit post
  await commentOnRedditComment(phrase);

  return true;
};
