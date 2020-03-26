const postNewsStory = require('./services/reddit-post');
const commentOnPost = require('./services/coment-on-post');
const commentOnComment = require('./services/comment-on-comment');

(async () => {
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
    default: {
      throw Error(`PROGRAM_ACTION value must be one of: 1, 2, 3`);
    }
  }

  const sleep = () => new Promise((resolve) => setTimeout(resolve, 60000 * process.env.INTERVAL_IN_MINUTES));

  while (true) {
    try {
      await doPuppeteerAction();
    } catch (err) {
      console.log(err);
    }
    await sleep();
  }
})();
