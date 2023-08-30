import path from 'path';

// import .env variables
require('dotenv-safe').config({
  path: path.join(__dirname, '../../.env'),
  example: path.join(__dirname, '../../.env.example')
});

console.log(path.join(__dirname, '/.env'), 'env location');

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
//   mongo: {
//     uri: process.env.NODE_ENV === 'test' ? process.env.MONGO_URI_TESTS : process.env.MONGO_URI
//   },
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
};
