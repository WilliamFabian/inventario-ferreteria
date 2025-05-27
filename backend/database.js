// database.js
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Keep-alive
setInterval(() => {
  pool.query("SELECT 1");
}, 60000);

module.exports = pool;
