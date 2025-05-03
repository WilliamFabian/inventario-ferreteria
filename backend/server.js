//Importamos módulos necesarios.



//Framework para crear servidorse web en Node.js.
const express = require('express');

//CORS permite que el FrontEnd (Angular) pueda hacer peticiones al backend (Node.js).
const cors = require('cors');

//Importamos la conexión a la base de datos desde database.js.
const db = require('./database');
const connection = require('./database');

//Creamos una instancia de la aplicación Express.
const app = express();

const path = require('path'); //Railway.

//Definimos el puerto en el que se ejecutará el servidor.
const port = process.env.PORT || 3000; //RailWay.

const fs = require('fs');
console.log("Directorio actual:", __dirname);
console.log("¿Existe dist/inventario-ferreteria?", fs.existsSync(path.join(__dirname, 'dist/inventario-ferreteria')));
if (fs.existsSync(path.join(__dirname, 'dist/inventario-ferreteria'))) {
  console.log("Contenido de dist/inventario-ferreteria:", fs.readdirSync(path.join(__dirname, 'dist/inventario-ferreteria')));
  console.log("¿Existe index.html?", fs.existsSync(path.join(__dirname, 'dist/inventario-ferreteria/index.html')));
}

//Middlewares.

//Habilitamos CORS para permitir peticiones desde otros dominios (como el Frotnend).
app.use(cors());

//Permite procesar JSON en las solicitudes.
app.use(express.json());

// 🔹 Tablas permitidas (Evita inyecciones SQL)
const tablasPermitidas = ['productos', 'ventas', 'reportes', 'trabajos'];

// Middleware para validar la tabla
function validarTabla(req, res, next) {
    const { tabla } = req.params;
    if (!tablasPermitidas.includes(tabla)) {
        return res.status(400).json({ error: 'Tabla no permitida' });
    }
    next();
}

// Definimos una ruta base para la API
const apiRouter = express.Router();

// 📌 Obtener todos los registros (productos o ventas)
apiRouter.get('/:tabla', validarTabla, (req, res) => {
    const { tabla } = req.params;
    const sql = `SELECT * FROM ${tabla}`;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// 📌 Obtener registros por tipo (solo para productos)
apiRouter.get('/:tabla/:tipo', validarTabla, (req, res) => {
    const { tabla, tipo } = req.params;

    if (tabla !== 'productos') {
        return res.status(400).json({ error: 'Filtro por tipo solo disponible para productos' });
    }

    const sql = `SELECT * FROM ${tabla} WHERE tipo = ?`;

    db.query(sql, [tipo], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// 📌 Obtener un registro por ID
apiRouter.get('/:tabla/id/:id', validarTabla, (req, res) => {
    const { tabla, id } = req.params;
    const sql = `SELECT * FROM ${tabla} WHERE idProducto = ?`;

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results[0] || { error: 'Registro no encontrado' });
    });
});

// 📌 Obtener un registro por Nombre
apiRouter.get('/:tabla/nombre/:nombre', validarTabla, (req, res) => {
    const { tabla, nombre } = req.params;
    const sql = `SELECT * FROM ${tabla} WHERE TRIM(LOWER(nombre)) = TRIM(LOWER(?))`;

    db.query(sql, [nombre], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results[0] || { error: 'Registro no encontrado' });
    });
});

// 📌 Agregar un registro (productos o ventas)
apiRouter.post('/:tabla/agregar', validarTabla, (req, res) => {
    const { tabla } = req.params;
    const datos = req.body;

    const columnas = Object.keys(datos).join(', ');
    const valores = Object.values(datos);
    const placeholders = valores.map(() => '?').join(', ');

    const query = `INSERT INTO ${tabla} (${columnas}) VALUES (${placeholders})`;

    db.query(query, valores, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Registro agregado correctamente', results });
    });
});

// 📌 Editar un registro
apiRouter.put('/:tabla/editar', validarTabla, (req, res) => {
    const { tabla } = req.params;
    const { idVenta, idProducto, idTrabajo, ...datos } = req.body;

    console.log("🔹 Tabla:", tabla);
    console.log("🔹 Cuerpo recibido:", req.body);

    let idCampo;
    let idValor;

    if (tabla === 'productos') {
        idCampo = 'idProducto';
        idValor = idProducto;
    } else if (tabla === 'ventas') {
        idCampo = 'idVenta';
        idValor = idVenta;
    } else if (tabla === 'trabajos') {
        idCampo = 'idTrabajo';
        idValor = idTrabajo;
    } else {
        return res.status(400).json({ error: 'Tabla no válida para edición' });
    }

    if (!idValor) {
        return res.status(400).json({ error: `Se requiere ${idCampo} para actualizar` });
    }

    console.log("🔹 ID a actualizar:", idValor);

    const columnas = Object.keys(datos).map((col) => `${col} = ?`).join(', ');
    const valores = [...Object.values(datos), idValor];

    const query = `UPDATE ${tabla} SET ${columnas} WHERE ${idCampo} = ?`;

    db.query(query, valores, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows > 0) {
            res.json({ message: 'Registro actualizado correctamente', result });
        } else {
            res.status(404).json({ error: 'Registro no encontrado' });
        }
    });
});



// 📌 Eliminar un registro
apiRouter.delete('/:tabla/:id', validarTabla, (req, res) => {
    const { tabla, id } = req.params;

    // Determinar el nombre correcto de la clave primaria según la tabla
    let primaryKey;
    switch (tabla) {
        case 'ventas':
            primaryKey = 'idVenta';
            break;
        case 'trabajos':
            primaryKey = 'idTrabajo';
            break;
        default:
            primaryKey = 'idProducto';
            break;
    }

    const sql = `DELETE FROM ${tabla} WHERE ${primaryKey} = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows > 0) {
            res.json({ message: 'Registro eliminado correctamente' });
        } else {
            res.status(404).json({ error: 'Registro no encontrado' });
        }
    });
});

// Montamos el router de la API en la ruta /api
app.use('/api', apiRouter);

app.use(express.static(path.join(__dirname, 'dist/inventario-ferreteria')));

// Redirigir cualquier ruta desconocida al index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/inventario-ferreteria/index.html'));
});

app.listen(port, () => {
  console.log(`Servidor en puerto ${port}`);
});