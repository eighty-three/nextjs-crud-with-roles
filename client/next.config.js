// normal Preact without extra webpack (for audio)
const withPreact = require('next-plugin-preact');

module.exports = withPreact({
  env: {
    HOST: process.env.HOST,
    PORT: process.env.PORT
  },
  trailingSlash: true,
});
