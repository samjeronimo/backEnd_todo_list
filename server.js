// Requiriendo las dependencias necesarias
var express = require('express');
var cors = require('cors');
//var path = require('path');
var mysql = require('mysql2'); //<--------- mysql2
var bcrypt = require('bcryptjs')

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

//------------------------------------------------------

// Ruta para verificar si el usuario existe (Login)

// Ruta para hacer login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Buscar el usuario por email
  db.query('SELECT * FROM usuario WHERE correo = ?', [email], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta: ', err);
      return res.status(500).json({ error: 'Error en la consulta' });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const user = results[0];

    // Comparar la contraseña hasheada
    bcrypt.compare(password, user.contraseña, (err, isMatch) => {
      if (err) {
        console.error('Error al comparar contraseñas: ', err);
        return res.status(500).json({ error: 'Error al verificar la contraseña' });
      }

      if (!isMatch) {
        return res.status(400).json({ error: 'Contraseña incorrecta' });
      }

      res.status(200).json({ message: 'Login exitoso' });
    });
  });
});

// Ruta para registrar un nuevo usuario
app.post('/registro', (req, res) => {
  const { nombre, correo, contraseña } = req.body;

  // Verificar si el email ya está registrado
  db.query('SELECT * FROM usuario WHERE correo = ?', [correo], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta: ', err);
      return res.status(500).json({ error: 'Error en la consulta' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Hashear la contraseña antes de almacenarla
    bcrypt.hash(contraseña, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error al hashear la contraseña: ', err);
        return res.status(500).json({ error: 'Error al procesar la contraseña' });
      }

      // Insertar el nuevo usuario en la base de datos
      const query = 'INSERT INTO usuario (nombre, correo, contraseña) VALUES (?, ?, ?)';
      db.query(query, [nombre, correo, hashedPassword], (err, result) => {
        if (err) {
          console.error('Error al insertar el usuario: ', err);
          return res.status(500).json({ error: 'Error al registrar usuario' });
        }

        res.status(201).json({ message: 'Usuario registrado exitosamente' });
      });
    });
  });
});

//------------------------------------------------------

// Ruta para consultar los usuarios desde la base de datos
app.get('/tareas', (req, res) => {

  // Realiza una consulta SELECT a la base de datos
  db.query('SELECT * FROM tarea', (err, results) => {
  if (err) {
  console.error('Error al ejecutar la consulta: ', err);
  res.status(500).send('Error en la consulta');
  return;
  }

  // Enviar los resultados de la consulta como respuesta en formato JSON
  res.json(results);
  });
  
  });

  /*app.post('/agregar', (req, res) => {
    const { nombre, estado } = req.body;
  
    if (!nombre || !estado) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
  
    const query = 'INSERT INTO tareas (tarea, estado) VALUES (?, ?)';
    db.query(query, [nombre, estado], (err, result) => {
      if (err) {
        console.error('Error al insertar la tarea: ', err);
        return res.status(500).json({ error: 'Error al guardar la tarea' });
      }
      res.status(201).json({ id: result.insertId, nombre, estado });
    });
  });*/

//----------------------------------------------------------------------------

// Configurar el puerto en el que se escucharán las solicitudes
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

module.exports = app;