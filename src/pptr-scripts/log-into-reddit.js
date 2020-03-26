module.exports = async (page) => {
  await page.goto('https://www.reddit.com/login/');
  await page.evaluate(
    async (creds) => {
      document.querySelector('[action="/login"]').username.value = creds.username;
      document.querySelector('[action="/login"]').password.value = creds.password;
      document.querySelector('[action="/login"]').password.type = 'text';
      document.querySelector('[action="/login"]').submit();
      return true;
    },
    {
      username: process.env.REDDIT_USERNAME,
      password: process.env.REDDIT_PASSWORD
    }
  );
  await page.waitForNavigation();
  return page;
};
