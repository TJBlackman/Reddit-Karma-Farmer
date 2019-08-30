# Reddit Karma Farmer

##### About
Reddit Karma Farmer is a Node app that posts news stories to their appropriate subreddits, in hopes of farming upvote Karma on Reddit. An `assets/categories.json` file contains a hand-crafted array of search terms, paired wih subreddits. For each pair, this app will use a headless chrome instance to search Google News based on the search terms, then select a news article. Next, it navigates to Reddit and logs in with credentials from the `assets/credentials.js` file. It then redirects to the paired subreddit, and posts the news article. A `setInterval()` is used to loop through all posts, about every 30 minutes. A simple .json file is written to after each post, as a quick and simple databse.

I chose to use Headless Chrome via Puppeteer instead of the Reddit API because it was super fast and I didn't have to read any Reddit API docs. I also already know how to use Puppeteer, which made it effecient. The API would be faster operationally, but at a rate of 1 post per 36 minues, it doesn't really matter. This is a joke hobby project anyway! 

##### Start Up
With the Node runtime environment and NPM installed on your machine, simply run `node index.js`, or use a process manager like PM2 to run the index.js file.

##### Raspberry Pi Model 3 Startup
Raspberry Pi in this guide is running Raspbian GNU/Linux 9 (stretch).  
Install NPM on your pi, if it is not already installed.  
Download the proper chromium version:  
    `sudo apt install chromium-browser chromium-codecs-ffmpeg`  
Install correct puppeteer version:  
    `npm install puppeteer-core@v1.11.0`  
Finally, in the project, when instantiating Puppeteer, use the version of Puppeteer we installed ealier  
    `const puppeteer = require('puppeteer-core');`  
AND - point to the chromium browser we specifically downloaded:  
    `const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser'});`
    
##### Technology & Skills
- Javascript in a Node environment
- DOM Scraping Techniques
- Headless Chrome
- Simple .json DB
- Browser Automated Tasks
