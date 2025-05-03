const mysql = require('mysql2');

//Configuración de la conexión a MySQL.
const connection = mysql.createConnection({
    host: 'turntable.proxy.rlwy.net:35160',
    port: 3306,
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