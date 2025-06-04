// database.js
const mysql = require("mysql2");

//Configuración de la conexión a MySQL.
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", //No hay contraseña configurada en MySQL, entonces se pone cadena vacía.
  database: "inventario-ferreteria",
});

//Conectar a la base de datos.

connection.connect((err) => {
  if (err) {
    console.error("Error de conexión:", err);
    return;
  }
  console.log("Conectado a MySQL.");
});

//Exportar la conexión para usarla en otros archivos.

module.exports = connection;

/*
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

module.exports = pool;
*/
