const express = require("express");

const cors = require("cors");

const db = require("./database");
const connection = require("./database");

const app = express();

const path = require("path");

const port = process.env.PORT || 3000;

//Cloudinary
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dsdnkc3eb",
  api_key: process.env.CLOUDINARY_API_KEY || "479784982925749",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "ecbeq43QirS9FtFP9zBLJQNLgbo",
});

// Configurar almacenamiento
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "inventario-ferreteria", // Nombre de la carpeta en Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"],
    public_id: (req, file) =>
      `${Date.now()}-${file.originalname.split(".")[0]}`,
  },
});

const upload = multer({ storage });
//Fin Cloudinary.

/* Para Railway.
app.use(
  cors({
    origin: "https://inventario-ferreteria-production.up.railway.app",
  })
); */

app.use(
  cors({
    origin: [
      "https://inventario-ferreteria-production.up.railway.app",
      "http://localhost:4200",
    ],
  })
);

app.use(express.json());

const tablasPermitidas = ["productos", "ventas", "reportes", "trabajos"];

function validarTabla(req, res, next) {
  const { tabla } = req.params;
  if (!tablasPermitidas.includes(tabla)) {
    return res.status(400).json({ error: "Tabla no permitida" });
  }
  next();
}

const apiRouter = express.Router();

apiRouter.get("/:tabla", validarTabla, (req, res) => {
  const { tabla } = req.params;
  const sql = `SELECT * FROM ${tabla}`;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

apiRouter.get("/:tabla/:tipo", validarTabla, (req, res) => {
  const { tabla, tipo } = req.params;

  if (tabla !== "productos") {
    return res
      .status(400)
      .json({ error: "Filtro por tipo solo disponible para productos" });
  }

  const sql = `SELECT * FROM ${tabla} WHERE tipo = ?`;

  db.query(sql, [tipo], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

apiRouter.get("/:tabla/id/:id", validarTabla, (req, res) => {
  const { tabla, id } = req.params;
  const sql = `SELECT * FROM ${tabla} WHERE idProducto = ?`;

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0] || { error: "Registro no encontrado" });
  });
});

apiRouter.get("/:tabla/nombre/:nombre", validarTabla, (req, res) => {
  const { tabla, nombre } = req.params;
  const sql = `SELECT * FROM ${tabla} WHERE TRIM(LOWER(nombre)) = TRIM(LOWER(?))`;

  db.query(sql, [nombre], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0] || { error: "Registro no encontrado" });
  });
});

//Buscar Nombre Nuevo.
apiRouter.get("/:tabla/nombre-inicia/:texto", validarTabla, (req, res) => {
  const { tabla, texto } = req.params;
  const sql = `SELECT * FROM ${tabla} WHERE LOWER(nombre) LIKE LOWER(?)`;

  db.query(sql, [`${texto}%`], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res
        .status(404)
        .json({ error: "No se encontraron coincidencias." });
    res.json(results);
  });
});

apiRouter.post("/:tabla/agregar", validarTabla, (req, res) => {
  const { tabla } = req.params;
  const datos = req.body;

  const columnas = Object.keys(datos).join(", ");
  const valores = Object.values(datos);
  const placeholders = valores.map(() => "?").join(", ");

  const query = `INSERT INTO ${tabla} (${columnas}) VALUES (${placeholders})`;

  db.query(query, valores, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Registro agregado correctamente", results });
  });
});

apiRouter.put("/:tabla/editar", validarTabla, (req, res) => {
  const { tabla } = req.params;
  const { idVenta, idProducto, idTrabajo, fechaVenta, fechaTrabajo, ...datos } =
    req.body;

  let idCampo;
  let idValor;

  if (tabla === "productos") {
    idCampo = "idProducto";
    idValor = idProducto;
  } else if (tabla === "ventas") {
    idCampo = "idVenta";
    idValor = idVenta;
  } else if (tabla === "trabajos") {
    idCampo = "idTrabajo";
    idValor = idTrabajo;
  } else {
    return res.status(400).json({ error: "Tabla no válida para edición" });
  }

  if (!idValor) {
    return res
      .status(400)
      .json({ error: `Se requiere ${idCampo} para actualizar` });
  }

  const columnas = Object.keys(datos)
    .map((col) => `${col} = ?`)
    .join(", ");
  const valores = [...Object.values(datos), idValor];

  const query = `UPDATE ${tabla} SET ${columnas} WHERE ${idCampo} = ?`;

  db.query(query, valores, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows > 0) {
      res.json({ message: "Registro actualizado correctamente", result });
    } else {
      res.status(404).json({ error: "Registro no encontrado" });
    }
  });
});

apiRouter.delete("/:tabla/:id", validarTabla, (req, res) => {
  const { tabla, id } = req.params;

  let primaryKey;
  switch (tabla) {
    case "ventas":
      primaryKey = "idVenta";
      break;
    case "trabajos":
      primaryKey = "idTrabajo";
      break;
    default:
      primaryKey = "idProducto";
      break;
  }

  const sql = `DELETE FROM ${tabla} WHERE ${primaryKey} = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows > 0) {
      res.json({ message: "Registro eliminado correctamente" });
    } else {
      res.status(404).json({ error: "Registro no encontrado" });
    }
  });
});

//Cloudinary Ruta.
app.post("/api/upload-image", upload.single("imagen"), (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ error: "No se pudo subir la imagen" });
  }
  res.json({ imageUrl: req.file.path }); // URL pública de Cloudinary
});

//Fin Cloudinary.

app.use("/api", apiRouter);

app.use(
  express.static(path.join(__dirname, "dist/inventario-ferreteria/browser"))
);

app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "dist/inventario-ferreteria/browser/index.html")
  );
});

app.listen(port, () => {
  console.log(`Servidor en puerto ${port}`);
});
