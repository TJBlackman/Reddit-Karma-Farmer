const postNewsStory = require('./services/reddit-post');
const commentOnPost = require('./services/coment-on-post');
const commentOnComment = require('./services/comment-on-comment');
const deleteNegativeComments = require('./pptr-scripts/delete-negative-comments');

let doPuppeteerAction = null;
switch (process.env.PROGRAM_ACTION) {
  case '1': {
    doPuppeteerAction = postNewsStory;
    break;
  }
  case '2': {
    doPuppeteerAction = commentOnPost;
    break;
  }
  case '3': {
    doPuppeteerAction = commentOnComment;
    break;
  }
  case '69': {
    // Development - meant for testing one pptr script at a time
    doPuppeteerAction = deleteNegativeComments;
    break;
  }
  default: {
    throw Error(`PROGRAM_ACTION value must be one of: 1, 2, 3`);
  }
}

const sleep = () => new Promise((resolve) => setTimeout(resolve, 60000 * process.env.INTERVAL_IN_MINUTES));

(async () => {
  while (true) {
    try {
      await doPuppeteerAction();
    } catch (err) {
      console.log(`New Error at ${new Date().toLocaleString()}`);
      console.log(err);
    }
    await sleep();
  }
})();
