# Reddit Karma Farmer

## About

Reddit Karma Farmer is a Node app that can post news stories to Reddit.com, comment on posts, or comment on comments. The goal is to farm Reddit Karma for new accounts. This is a joke/hobby project, and is not regularly maintained.

## Installation

Download this repo, then navigate to it's root directory and run `npm i` to download the dependancies. Also, create a `.env` file with the settings you want to use.

| Commands    | Description                                         |
| ----------- | --------------------------------------------------- |
| npm run dev | Run app immediately with live reloads on file save. |
| npm run pm2 | Run app continuously using pm2 daemon.              |

## Settings

This program looks for a `.env` file in it's root directory. I've included a `sample.env` for you to model your own settings file from. If there is no `.env` file, this project will not run.

| Setting             | Required | Default | Description                                                                          |
| ------------------- | -------- | ------- | ------------------------------------------------------------------------------------ |
| REDDIT_USERNAME     | Required | ""      | The Reddit username the program should use.                                          |
| REDDIT_PASSWORD     | Required | ""      | The Reddit PASSWORD the program should use.                                          |
| PROGRAM_ACTION      | Required | 1       | The action this program should run. See the list of PROGRAM_ACTION below.            |
| INTERVAL_IN_MINUTES | Required | 13      | The amount of time to wait between each program action.                              |
| CHROME_EXE_PATH     | Required | ""      | The path to a Chrome executable file on disk. General presets included in .env file. |

## Program Actions

The `PROGRAM_ACTION` value in the .env file will identify which of the following actions the program will run.

##### Create New Reddit Post from Google News Story | PROGRAM_ACTION = 1

The post script will gather recent News articles from Google and post a link to them on the appropriate subreddit. The `src/assets/post-categories.js` file contains pairs of search terms and subreddits. Execute this action by setting `PROGRAM_ACTION=1` in your .env file.

##### Top Level Comment on Rising Post | PROGRAM_ACTION = 2

This comment script is designed to find a random rising post, and leave a top level comment on that post. The `src/assets/comment-on-post-phrases.js` file contains the list of phrases that this script will cycle through and use in it's comments. Execute this action by setting `PROGRAM_ACTION=2` in your .env file.

##### Comment on Top Level Comment on rising Post | PROGRAM_ACTION = 3

This Comment script is designed to find the top rated comment on a rising post, and then simply agree with that comment. The `src/assets/comment-on-comment-phrases.js` file contains a list of phrases that is cycled through when commenting. Finally, the program will evaluate your previous comments for downvoted comments in the negative vote range, and delete those comments to prevent more downvotes. Execute this action by setting `PROGRAM_ACTION=3` in your .env file.

### Requirements

- Node
- NPM
- Chrome

### Raspberry Pi Setup

Raspberry Pi in this guide is running Raspbian GNU/Linux 9 (stretch).  
Install NPM on your pi, if it is not already installed.

- Download the proper chromium version:
  - `sudo apt install chromium-browser chromium-codecs-ffmpeg`
- AND - point to the chromium browser we specifically downloaded:
  - `CHROME_EXE_PATH="/usr/bin/chromium-browser"`

### Technology & Skills

- Javascript in a Node environment
- DOM Scraping Techniques
- Headless Chrome
- Local .json DB
- Browser Automated Tasks
