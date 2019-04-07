const getNewestGoogleSearchFor = require('./utils/searchGoogle');
const postToReddit = require('./utils/postOnReddit');
const categories = require('./assets/categories');

(async () => {
    let index = 0; 
    const full24Hours = 1000 * 60 * 60 * 24; 
    const postInterval = full24Hours / categories.length; 

    setInterval(async function(){
        try {
            const cur_category_index = index % categories.length;
            const { searchTerm, subreddit } = categories[cur_category_index];
            const post = await getNewestGoogleSearchFor(searchTerm);
            await postToReddit(subreddit, post); 
            index++; 
        }
        catch(err){
            console.log(err);
        }
    }, postInterval); 
})();