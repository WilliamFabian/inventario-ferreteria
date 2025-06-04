// database.js
const mysql = require("mysql2");

// Para pool.

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || "localhost",
  port: process.env.MYSQLPORT || "3306",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "",
  database: process.env.MYSQL_DATABASE || "inventario-ferreteria",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Keep-alive
setInterval(() => {
  pool.query("SELECT 1");
}, 60000);

pool.query("SELECT 1", (err) => {
  if (err) {
    console.error("Error de conexión inicial:", err);
  } else {
    console.log("Conectado a MySQL.");
  }
});

module.exports = pool;
