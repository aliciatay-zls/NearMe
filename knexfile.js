require('dotenv').config();

module.exports = {

  development: {
    client: 'mysql',
    connection: {
      host : process.env.DB_HOST,
      database : process.env.DB_NAME,
      user : process.env.DB_USER,
      password : process.env.DB_PASSWORD
    },
    migrations: {
      directory : "./data/migrations"
    },
    seeds: {
      directory : "./data/seeds"
    }
  },

  staging: {
    client: 'mysql',
    connection: {
      host : process.env.DB_HOST,
      database : process.env.DB_NAME,
      user : process.env.DB_USER,
      password : process.env.DB_PASSWORD
    },
    migrations: {
      directory : "./data/migrations"
    }
  },

  production: {
    client: 'mysql',
    connection: {
      host : process.env.DB_HOST,
      database : process.env.DB_NAME,
      user : process.env.DB_USER,
      password : process.env.DB_PASSWORD
    },
    migrations: {
      directory : "./data/migrations"
    }
  }

};
