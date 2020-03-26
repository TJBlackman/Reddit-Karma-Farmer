# Reddit Karma Farmer

## About

Reddit Karma Farmer is a headless Node app that can post news stories to Reddit.com, comment on posts, or comment on comments. The goal is to farm Reddit Karma for new accounts. This is a joke/hobby project, and is not regularly maintained.

## Installation

Download this repo, then navigate to it's root directory and run `npm i` to download the dependancies. Also, create a `.env` file with the settings you want to use.

| Commands          | Description                                          |
| ----------------- | ---------------------------------------------------- |
| npm run dev       | Run with local env file, and reload program on save. |
| npm run pm2:local | Start pm2 daemon with local env file.                |
| npm run pm2:pi    | Start pm2 daemon with raspberry pi env file.         |

## Settings

This program looks for a `.env` file in it's root directory. I've included a `sample.env` for you to model your own settings file from. If there is no `.env` file, this project will not run.

| Setting             | Default | Description                                                               |
| ------------------- | ------- | ------------------------------------------------------------------------- |
| REDDIT_USERNAME     | ""      | The Reddit username the program should use.                               |
| REDDIT_PASSWORD     | ""      | The Reddit PASSWORD the program should use.                               |
| PROGRAM_ACTION      | "1"     | The action this program should run. See the list of PROGRAM_ACTION below. |
| INTERVAL_IN_MINUTES | "13"    | The amount of time to wait between each program action.                   |

##### Posting

The Post script will gather recent News articles from Google and post a link to them on the appropriate subreddit. The `assets/categories.json` file contains pairs of search terms and subreddits. The `assets/credentials.js` file contains the username and password for the Reddit account you are farming karma for. Run with `npm run post` or use a process manager like PM2; `pm2 start RedditPost.js --name KarmaFarmer`.

###### Commenting on Posts

This Comment script is designed to find a random rising post, and leave a comment on that post. Again, the `assets/credentials.js` file contains the username and password for the Reddit account you are farming karma for. The `assets/commentOnPostPhrases.js` file contains the list of phrases that this script will cycle through and use in it's comments. Run with `npm run commentOnPost` or use a process manager like PM2; `pm2 start RedditPostComment.js --name KarmaFarmer`.

###### Commenting on Comments

This Comment script is designed to find the top rated comment on a rising post, and then simply agree with that comment. Again, the `assets/credentials.js` file contains the username and password for the Reddit account you are farming karma for. The `assets/agreeWithCommentPhrases.js` file contains a list of phrases that is cycled through when commenting. Run with `npm run commentOnComment` or use a process manager like PM2; `pm2 start RedditCommentComment.js --name KarmaFarmer`.

### Requirements

Node and NPM must be install on your machine. Clone this project, `cd` into the root directory, run `npm install` to install dependancies, then run the program you want to run with the commands listed above.

#### Testing

In `/assets/credentials.js`, you can set the debug property to true to enable console logging and screen capture at very specific moments.

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
