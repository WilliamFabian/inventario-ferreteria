const mysql = require('mysql2');

//Configuración de la conexión a MySQL.
const connection = mysql.createConnection({
    host: 'turntable.proxy.rlwy.net',
    port: 35160,
    user: 'root',
    password: 'QnAwFgZIOBSJlmkJNqZLYDzmGeEzMtVZ',
    database: 'railway'
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