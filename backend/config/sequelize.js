const { Sequelize } = require('sequelize');
const config = require('./env');

let sequelize;

if (config.databaseUrl) {
  sequelize = new Sequelize(config.databaseUrl, {
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  sequelize = new Sequelize(config.dbName, config.dbUser, String(config.dbPassword), {
    host: config.dbHost,
    port: config.dbPort,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

module.exports = sequelize;
