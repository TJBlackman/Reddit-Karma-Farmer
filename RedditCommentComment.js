const dbMethods = require('./utils/databaseMethods');
const commentOnReddit = require('./utils/commentOnRedditComment');
const phrases = require('./assets/agreeWithCommentPhrases');

const interval = 1000 * 60 * 17;

const commentOnAComment = async () => { 
    try {
        const index = (() => {
            const i = dbMethods.getIndex();
            return i <= phrases.length ? i : 0; 
        })();
    
        await commentOnReddit(phrases[index]); 
        console.log(`Commented at ${new Date().toLocaleTimeString()}: ${phrases[index]}`)
        dbMethods.setIndex(index >= phrases.length - 1 ? 0 : index + 1);
    }
    catch(err){
        dbMethods.recordError(err)
    }
    setTimeout(commentOnAComment, interval);
};

commentOnAComment(); 
