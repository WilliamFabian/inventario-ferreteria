const mysql = require('mysql2');

//Configuración de la conexión a MySQL.
const connection = mysql.createConnection(
    {host: 'localhost',
        user: 'root',
        password: '', //No hay contraseña configurada en MySQL, entonces se pone cadena vacía.
        database: 'inventario-ferreteria'
    }
);

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