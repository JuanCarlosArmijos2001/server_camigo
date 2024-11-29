// const nodemailer = require('nodemailer');
// var mysql = require("mysql2");

// var mysqlConnection = mysql.createConnection({
//   host: process.env.HOST,
//   user: process.env.USER,
//   password: process.env.PASSWORD,
//   database: process.env.BD,
// });

// mysqlConnection.connect((err) => {
//   if (err) {
//     console.log(err);
//     throw new Error(err);
//   } else {
//     console.log(`CONEXION EXITOSA A LA BASE DE DATOS, BD: `, process.env.BD);
//   }
// });

const nodemailer = require('nodemailer');
const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

// Configuración de conexión a MySQL
const mysqlConnection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.BD,
});

// Función para inicializar la base de datos desde el archivo schema.sql
function initializeDatabase(connection) {
  try {
    // Leer el archivo schema.sql
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Separar las sentencias SQL (por punto y coma) y ejecutar una por una
    const statements = schema
      .split(";")
      .filter((stmt) => stmt.trim()); // Filtra sentencias no vacías

    for (const statement of statements) {
      connection.query(statement, (err) => {
        if (err) {
          console.error("Error al ejecutar una sentencia SQL:", err);
        }
      });
    }

    console.log("La estructura de la base de datos se ha inicializado correctamente.");
  } catch (err) {
    console.error("Error al inicializar la base de datos:", err);
  }
}

// Conectar y ejecutar la inicialización
console.log(mysqlConnection);
console.log(process.env.HOST);
console.log(process.env.USER);
console.log(process.env.PASSWORD);
console.log(process.env.BD);

mysqlConnection.connect((err) => {
  
  if (err) {
    console.error("Error al conectar a la base de datos:", err);
    throw new Error(err);
  } else {
    console.log(`CONEXIÓN EXITOSA A LA BASE DE DATOS: ${process.env.BD}`);

    // Inicializar la base de datos
    initializeDatabase(mysqlConnection);
  }
});

const transporter = nodemailer.createTransport({
  service: process.env.SERVICE,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.PASSWORD_EMAIL,
  }
});

function enviarCorreo(correo, asunto, mensaje) {
  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: correo,
    subject: asunto,
    html: mensaje,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email enviado: " + info.response);
    }
  });
}

function ejecutarResSQL(QUERY, VALORES, callback, res) {
  mysqlConnection.query(QUERY, VALORES, (err, ejecucion) => {
    if (err) {
      console.log(err + " SQL: " + QUERY + " VALORES: " + VALORES);
      return res.status(400).send({
        error: 1,
        m: err.sqlMessage,
      });
    }
    callback(ejecucion);
  });
}

module.exports = {
  ejecutarResSQL: ejecutarResSQL,
  enviarCorreo: enviarCorreo
};