const mysql = require('mysql2');

//Configuración de la conexión a MySQL.
const connection = mysql.createConnection({
    host: process.env.MYSQLHOST || 'mysql.railway.internal',
    port: process.env.MYSQLPORT || 3306,
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'railway'
    
});


connection.connect(err => {
    if(err){
        console.error('Error de conexión:', err);
        return;
    }
    console.log("Conectado a MySQL.");
    console.log(process.env.MYSQLPASSWORD);
});

module.exports = connection;