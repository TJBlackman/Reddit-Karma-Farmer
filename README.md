# Reddit Karma Farmer

### About
Reddit Karma Farmer is a headless Node app that can post news stories to Reddit.com, comment on posts, or comment on comments. The goal is to farm Reddit Karma for new accounts. This is a joke/hobby project, and is not regularly maintained.

###### Posting
The Post script will gather recent News articles from Google and post a link to them on the appropriate subreddit. The `assets/categories.json` file contains pairs of search terms and subreddits. The `assets/credentials.js` file contains the username and password for the Reddit account you are farming karma for. Run with `npm run post` or use a process manager like PM2; `pm2 start RedditPost.js --name KarmaFarmer`.

###### Commenting on Posts
This Comment script is designed to find a random rising post, and leave a comment on that post. Again, the `assets/credentials.js` file contains the username and password for the Reddit account you are farming karma for. The `assets/commentOnPostPhrases.js` file contains the list of phrases that this script will cycle through and use in it's comments. Run with `npm run commentOnPost` or use a process manager like PM2; `pm2 start RedditPostComment.js --name KarmaFarmer`.

###### Commenting on Comments
This Comment script is designed to find the top rated comment on a rising post, and then simply agree with that comment. Again, the `assets/credentials.js` file contains the username and password for the Reddit account you are farming karma for. The `assets/agreeWithCommentPhrases.js` file contains a list of phrases that is cycled through when commenting. Run with `npm run commentOnComment` or use a process manager like PM2; `pm2 start RedditCommentComment.js --name KarmaFarmer`.

### Requirements
Node and NPM must be install on your machine. Clone this project, `cd` into the root directory, run `npm install` to install dependancies, then run the program you want to run with the commands listed above.

### Raspberry Pi Model 3 Startup
Raspberry Pi in this guide is running Raspbian GNU/Linux 9 (stretch).  
Install NPM on your pi, if it is not already installed.  
- Download the proper chromium version:  
  - `sudo apt install chromium-browser chromium-codecs-ffmpeg`  
- Install correct puppeteer core version:  
   - `npm install puppeteer-core@v1.11.0`  
- Finally, in the project, when instantiating Puppeteer, use the version of Puppeteer we installed ealier  
   - `const puppeteer = require('puppeteer-core');`  
- AND - point to the chromium browser we specifically downloaded:  
   - `const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser'});`
    
### Technology & Skills
- Javascript in a Node environment
- DOM Scraping Techniques
- Headless Chrome
- Simple .json DB
- Browser Automated Tasks
