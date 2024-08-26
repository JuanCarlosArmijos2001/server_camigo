const nodemailer = require('nodemailer');
var mysql = require("mysql2");

var mysqlConnection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.BD,
});

mysqlConnection.connect((err) => {
  if (err) {
    throw new Error(err);
    console.log(err);
  } else {
    console.log(`CONEXION EXITOSA A LA BASE DE DATOS`)
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