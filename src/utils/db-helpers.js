const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const adapter = new FileSync(path.join(__dirname, '../db.json'));
const db = low(adapter);

// increment index
const incrementIndex = function (arrayLength) {
  db.update('index', (i) => (i >= arrayLength - 1 ? 0 : i + 1)).write();
};

const setIndex = function (num) {
  db.set('index', num).write();
};

// retrieve index
const getIndex = function () {
  return db.get('index').value() || 0;
};

// record an error
const recordError = function (err, imgPath) {
  db.get('errors')
    .push({
      time: new Date().toLocaleString(),
      message: err.message,
      fileName: err.fileName,
      line: err.lineNumber,
      imagePath: imgPath,
    })
    .write();
};

const getAlreadyUsedPosts = () => {
  return db.get('alreadyUsedPosts').value();
};

const recordAlreadyUsedPost = (url) => {
  const posts = getAlreadyUsedPosts();
  posts.push(url);
  if (posts.length > 2) {
    posts.shift();
  }
  db.set('alreadyUsedPosts', posts).write();
};
module.exports = {
  incrementIndex,
  setIndex,
  getIndex,
  recordError,
  getAlreadyUsedPosts,
  recordAlreadyUsedPost,
};
