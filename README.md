# KarmaFarmer

An app made to farm Reddit karma! :D 

This app may not work on your raspberry pi unless you install a very specific version of Chromium and Puppeteer on your raspberry pi. To do so, run these commands with admin priveledges on your raspberry pi.


_// install the chromium version we need_ 

`sudo apt install chromium-browser chromium-codecs-ffmpeg`

_// install npm - only if you don't already have this_

`sudo install npm`

_// install specific Puppeteer version_

`npm install puppeteer-core@v1.11.0`



Then in your project, you need to require puppeteer-core, and target the version of Chromium we installed earlier when you launch a headless browser.

`const puppeteer = require('puppeteer-core');`
`const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser'});`
