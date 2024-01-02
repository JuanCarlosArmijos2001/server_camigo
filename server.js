const express = require('express')
const app = express()
const port = 5000

//configuracion .env
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');

//Cofiguraciones de servidor
app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ limit: "1mb", extended: false, parameterLimit: 50 }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Configuraciones de CORS
app.use(cors());

//Ruta por defecto
app.get('/', (req, res) => {
  res.send('Bienvenido a C#Amigo')
})

//Rutas
let temaRouter = require('./routes/tema/tema');
let subtemaRouter = require('./routes/subtema/subtema.js');
let ejercicioRouter = require('./routes/ejercicio/ejercicio.js');
let preguntaRouter = require('./routes/pregunta/pregunta.js');
let sesionUsuario = require('./routes/sesionUsuario/sesionUsuario.js');

//Uso de las rutas
app.use('/temas', temaRouter);
app.use('/subtemas', subtemaRouter);
app.use('/ejercicios', ejercicioRouter);
app.use('/preguntas', preguntaRouter);
app.use('/sesionUsuario', sesionUsuario);
const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

//app = aplicación
//server = levanta la aplicación
module.exports={server,app};
