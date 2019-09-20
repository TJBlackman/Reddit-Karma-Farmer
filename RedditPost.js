const getNewestGoogleSearchFor = require('./utils/searchGoogle');
const postToReddit             = require('./utils/postOnReddit');
const dbMethods                = require('./utils/databaseMethods');
const categories               = require('./assets/categories');


const interval = 1000 * 60 * 37; // 37 minutes between posts 

const getNewsArticleAndPostToReddit = async function (){
    
    const index = (() => {
        const i = dbMethods.getIndex();
        return i <= categories.length ? i : 0; 
    })();

    const { searchTerm, subreddit } = categories[index];
    const article = await getNewestGoogleSearchFor(searchTerm);
    if (article){
        await postToReddit(subreddit, article); 
    }

    dbMethods.setIndex(index >= categories.length - 1 ? 0 : index + 1);
    setTimeout(getNewsArticleAndPostToReddit, interval);
}; 

getNewsArticleAndPostToReddit(); 
