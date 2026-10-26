const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 3306;
const dbName = process.env.DB_NAME || 'pos_kasir_stok';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: Number(dbPort),
  dialect: 'mysql',
  timezone: '+07:00', // Asia/Jakarta (WIB)
  dialectOptions: {
    charset: 'utf8mb4',
    dateStrings: true,
    typeCast: true
  },
  logging: process.env.NODE_ENV === 'development' ? (msg) => console.log(`[Sequelize] ${msg}`) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Helper function to initialize database connection and create DB if not exists
async function testAndInitDb() {
  try {
    // Attempt standard connection
    await sequelize.authenticate();
    console.log(`[Database] Connected successfully to MySQL database "${dbName}" at ${dbHost}:${dbPort}`);
    return true;
  } catch (error) {
    if (error.original && error.original.code === 'ER_BAD_DB_ERROR') {
      console.log(`[Database] Database "${dbName}" does not exist. Creating database...`);
      const mysql = require('mysql2/promise');
      const connection = await mysql.createConnection({
        host: dbHost,
        port: Number(dbPort),
        user: dbUser,
        password: dbPassword
      });
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await connection.end();
      console.log(`[Database] Database "${dbName}" created successfully. Connecting...`);
      await sequelize.authenticate();
      return true;
    }
    console.error('[Database] Unable to connect to the database:', error.message);
    throw error;
  }
}

module.exports = {
  sequelize,
  testAndInitDb
};
