const dbMethods       = require('./utils/databaseMethods');
const commentOnReddit = require('./utils/commentOnRedditPost');
const phrases         = require('./assets/commentOnPostPhrases');



const interval = 1000 * 60 * 15; // 15 minutes between comments

const commentOnAComment = async () => { 
    const index = (() => {
        const i = dbMethods.getIndex();
        return i <= phrases.length ? i : 0; 
    })();

    await commentOnReddit(phrases[index]); 
    dbMethods.setIndex(index >= phrases.length - 1 ? 0 : index + 1);
    setTimeout(commentOnAComment, interval);
};

commentOnAComment(); 
