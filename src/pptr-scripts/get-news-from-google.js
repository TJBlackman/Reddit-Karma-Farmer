const getBrowser = require('./get-browser');

module.exports = async (searchString) => {
  const browser = await getBrowser();
  try {
    let oneHourResults = null;
    let oneDayResults = null;
    const page = await browser.newPage();
    const oneHourSearch = `https://www.google.com/search?q=${searchString}&tbs=qdr:h,sbd:1&tbm=nws&num=100`; // 1 hour search &tbs=qdr:h
    const oneDaySearch = `https://www.google.com/search?q=${searchString}&tbs=qdr:d,sbd:1&tbm=nws&num=100`; // 1 day search &tbs=qdr:d

    // google results from the past 60 minutes
    await page.goto(oneHourSearch);
    oneHourResults = await page.evaluate(async () => {
      const result_nodes = document.querySelectorAll('g-card');
      if (!result_nodes) {
        return null;
      }
      const all_results = Array.from(result_nodes)
        .map((item) => ({
          title:
            item.querySelector('a > div > div:nth-child(2) > div:nth-child(2)') &&
            item.querySelector('a > div > div:nth-child(2) > div:nth-child(2)').innerText,
          link: item.querySelector('a') && item.querySelector('a').href
        }))
        .filter((item) => item.title && item.link && !item.title.includes('...'));
      if (all_results.length === 0) {
        return null;
      }
      return all_results;
    });

    // google results from the past 60 minutes
    if (!oneHourResults) {
      await page.goto(oneDaySearch);
      oneDayResults = await page.evaluate(async () => {
        const result_nodes = document.querySelectorAll('g-card');
        if (!result_nodes) {
          return null;
        }
        const all_results = Array.from(result_nodes)
          .map((item) => ({
            title:
              item.querySelector('a > div > div:nth-child(2) > div:nth-child(2)') &&
              item.querySelector('a > div > div:nth-child(2) > div:nth-child(2)').innerText,
            link: item.querySelector('a') && item.querySelector('a').href
          }))
          .filter((item) => item.title && item.link && !item.title.includes('...'));
        if (all_results.length === 0) {
          return null;
        }
        return all_results;
      });
    }
    browser.close();
    return oneHourResults ? oneHourResults : oneDayResults;
  } catch (err) {
    console.log('Error at: ', new Date().toLocaleTimeString());
    console.log(err);
    browser.close();
  }
};
