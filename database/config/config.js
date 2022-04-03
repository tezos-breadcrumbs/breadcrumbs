require('dotenv').config()

module.exports = {
  development: {
    url: process.env.DEV_DATABASE_URL,
    dialect: 'postgres',
  },
  test: {
    username: "postgres",
    password: "postgres",
    database: "database_test",
    host: "127.0.0.1",
    dialect: "postgres", 
    logging: false
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
  },
}