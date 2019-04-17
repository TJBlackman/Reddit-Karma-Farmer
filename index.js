const getNewestGoogleSearchFor = require('./utils/searchGoogle');
const postToReddit = require('./utils/postOnReddit');
const categories = require('./assets/categories');


(async () => {
    let index = 0; 
    const postCycle = 1000 * 60 * 60 * 49.33; // 50 hour cycle
    const timeBetweenPosts = postCycle / categories.length; 

    async function getNewArticleAndPostToReddit(){
        index++; 
        try {
            const cur_category_index = index % categories.length;
            const { searchTerm, subreddit } = categories[cur_category_index];
            const article = await getNewestGoogleSearchFor(searchTerm);
            
            if (!article){
                return getNewArticleAndPostToReddit(); 
            }
            await postToReddit(subreddit, article); 
        }
        catch(err){ /* Do nothing... ¯\_(ツ)_/¯ */ }

        setTimeout(getNewArticleAndPostToReddit, timeBetweenPosts);
    }; 

    getNewArticleAndPostToReddit(); 
})();