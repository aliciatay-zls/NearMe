module.exports = {

  development: { //to-fix: encountering error "Access denied for user ''@'localhost' (using password: NO)""
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
