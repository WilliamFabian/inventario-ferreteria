const mysql = require('mysql2');

//Configuración de la conexión a MySQL.
const connection = mysql.createConnection({
    host: 'prueba',
    port: process.env.MYSQLPORT || 3306,
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'railway'
});

//Conectar a la base de datos.

connection.connect(err => {
    if(err){
        console.error('Error de conexión:', err);
        return;
    }
    console.log("Conectado a MySQL.");
});

//Exportar la conexión para usarla en otros archivos.

module.exports = connection;