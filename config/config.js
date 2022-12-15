require('dotenv').config();

const {
  DB_USERNAME,
  DB_PASSWORD,
  DB_HOSTNAME,
  DB_NAME,
  DB_DIALECT,
} = process.env;
module.exports = {
  "development": {
    "username": DB_USERNAME,
    "password": DB_PASSWORD,
    "database": DB_NAME,
    "host": DB_HOSTNAME,
    "dialect": DB_DIALECT,
    "dialectOptions": {
      "useUTC": false 
    },
    "timezone": "Asia/Bangkok"
  },
  "test": {
    "username": DB_USERNAME,
    "password": DB_PASSWORD,
    "database": DB_NAME,
    "host": DB_HOSTNAME,
    "dialect": DB_DIALECT,
    "dialectOptions": {
      "useUTC": false 
    },
    "timezone": "Asia/Bangkok"
  },
  "production": {
    "username": DB_USERNAME,
    "password": DB_PASSWORD,
    "database": DB_NAME,
    "host": DB_HOSTNAME,
    "dialect": DB_DIALECT,
    "dialectOptions": {
      "useUTC": false 
    },
    "timezone": "Asia/Bangkok"
  }
}
