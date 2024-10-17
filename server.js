const express = require('express')
const jwt = require('jsonwebtoken');
const app = express()
const port = 5000

//configuracion .env
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const SECRET_KEY = process.env.JWT_SECRET_KEY;

//Cofiguraciones de servidor
app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ limit: "1mb", extended: false, parameterLimit: 50 }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuraciones de CORS
app.use(cors());

app.use(cors({
  origin: '*',
  credentials: true
}))


//Ruta por defecto
app.get('/', (req, res) => {
  res.send('Bienvenido a C#Amigo')
})

//Rutas
let temaRouter = require('./routes/tema/tema');
let subtemaRouter = require('./routes/subtema/subtema.js');
let ejercicioRouter = require('./routes/ejercicio/ejercicio.js');
let preguntaRouter = require('./routes/pregunta/pregunta.js');
let comentarioRouter = require('./routes/comentario/comentario.js');
let sesionUsuario = require('./routes/sesionUsuario/sesionUsuario.js');
let historial = require('./routes/historial/historial.js');
let periodoAcademico = require('./routes/periodoAcademico/periodoAcademico.js');
let usuario = require('./routes/usuario/usuario.js');
let valoracion = require('./routes/valoracion/valoracion.js');



//Uso de las rutas
app.use('/temas', temaRouter);
app.use('/subtemas', subtemaRouter);
app.use('/ejercicios', ejercicioRouter);
app.use('/preguntas', preguntaRouter);
app.use('/comentarios', comentarioRouter);
app.use('/sesionUsuario', sesionUsuario);
app.use('/historial', historial);
app.use('/periodoAcademico', periodoAcademico);
app.use('/usuario', usuario);
app.use('/valoracion', valoracion);

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

module.exports = { server, app };
