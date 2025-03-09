// Requiriendo las dependencias necesarias
var express = require('express');
var cors = require('cors');
//var path = require('path');
var mysql = require('mysql2'); //<--------- mysql2

// Crear una instancia de la aplicación Express
var app = express();

// Usar CORS para permitir solicitudes desde el puerto 5500 (o el origen de tu frontend)
app.use(cors({
  origin: 'http://127.0.0.1:5500', // Aquí puedes ajustar esto al origen de tu frontend
}));

// Middlewares para la configuración básica de Express
app.use(express.json()); // Para parsear JSON en las solicitudes
app.use(express.urlencoded({ extended: false })); // Para parsear formularios

// Rutas del servidor
app.get('/', (req, res) => {
  res.send('¡Hola desde mi backend en Express!');
});

// Rutas adicionales
app.get('/hola', (req, res) => {
  res.send('¡Hola Mundo Jacinto!');
});

//----------------------------------------------------------------------------
//CONSULTAS A MI BASE DE DATOS SQL EN MYSQL SERVER

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Sajeronimo2008_:)',
  database: 'todo_list'
});

//CONECTAR A LA BASE DE DATOS
db.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos: ', err);
    return;
  }
  console.log('Conexión a la base de datos establecida');
});


// Ruta para consultar los usuarios desde la base de datos
app.get('/tareas', (req, res) => {

  // Realiza una consulta SELECT a la base de datos
  db.query('SELECT * FROM tareas', (err, results) => {
  if (err) {
  console.error('Error al ejecutar la consulta: ', err);
  res.status(500).send('Error en la consulta');
  return;
  }

  // Enviar los resultados de la consulta como respuesta en formato JSON
  res.json(results);
  });
  
  });

  app.post('/agregar', (req, res) => {
    const { nombre_tarea, estado } = req.body;
  
    if (!nombre_tarea || !estado) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
  
    const query = 'INSERT INTO tareas (nombre_tarea, estado) VALUES (?, ?)';
    db.query(query, [nombre_tarea, estado], (err, result) => {
      if (err) {
        console.error('Error al insertar la tarea: ', err);
        return res.status(500).json({ error: 'Error al guardar la tarea' });
      }
      res.status(201).json({ id: result.insertId, nombre_tarea, estado });
    });
  });

//----------------------------------------------------------------------------

// Configurar el puerto en el que se escucharán las solicitudes
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

module.exports = app;