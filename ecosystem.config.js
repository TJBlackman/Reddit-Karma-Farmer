module.exports = {
  apps: [
    {
      name: 'Karma Farmer',
      script: './src/index.js',
      node_args: '-r dotenv/config'
    }
  ]
};
