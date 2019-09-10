const getNewestGoogleSearchFor = require('./utils/searchGoogle');
const postToReddit = require('./utils/postOnReddit');
const categories = require('./assets/categories');
const dbMethods = require('./utils/databaseMethods');


(() => {
    const postCycle = 1000 * 60 * 60 * 60; // 60 hour cycle
    const timeBetweenPosts = postCycle / categories.length; 

    async function getNewArticleAndPostToReddit(){
        const index = dbMethods.getIndex();
        try {
            const { searchTerm, subreddit } = categories[index];
            const article = await getNewestGoogleSearchFor(searchTerm);
            if (article !== null){
                // console.log(article);
                await postToReddit(subreddit, article); 
            } else {
                // console.log('no article... :(')
            }
            dbMethods.recordArticle(article, index, subreddit);
        }
        catch(err){ 
            dbMethods.recordError(err);
        }

        dbMethods.incrementIndex();
        setTimeout(getNewArticleAndPostToReddit, timeBetweenPosts);
    }; 

    getNewArticleAndPostToReddit(); 
})();