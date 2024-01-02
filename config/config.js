var mysql = require("mysql2");

var mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "camigo",
});

mysqlConnection.connect((err) => {
//  if (err) throw new Error(err);
//  console.log(`CONEXION EXITOSA A LA BASE DE DATOS`);
if (err) {throw new Error(err);
  console.log(err);
}else{
  console.log(`CONEXION EXITOSA A LA BASE DE DATOS`)
}
});

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
};
