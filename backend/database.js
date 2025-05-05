const mysql = require('mysql2');

//Configuración de la conexión a MySQL.
const connection = mysql.createConnection({
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQL_DATABASE,    
});


connection.connect(err => {
    if(err){
        console.error('Error de conexión:', err);
        return;
    }
    console.log("Conectado a MySQL.");
    console.log(process.env.MYSQLPASSWORD);
    console.log(process.env.MYSQLHOST);
    console.log(process.env.MYSQLPORT);
    console.log(process.env.MYSQLUSER);
    console.log(process.env.MYSQLPASSWORD);
    console.log(process.env.MYSQL_DATABASE);  
});

module.exports = connection;