const router = require("express").Router();
const sql = require("../../config/config");
const BD = process.env.BD;

// Registrar temas
// router.post("/registrarTema", [], (req, res) => {
//   let titulo = req.body.titulo;
//   let objetivos = req.body.objetivos;
//   let descripcion = req.body.descripcion;
//   let recursos = req.body.recursos;
//   let estado = 1;

//   const registrarTema =
//     "INSERT INTO tema (titulo, objetivos, descripcion, recursos, estado) VALUES (?, ?, ?, ?, ?);";

//   sql.ejecutarResSQL(
//     registrarTema,
//     [titulo, objetivos, descripcion, recursos, estado],
//     (resultado) => {
//       if (resultado["affectedRows"] > 0) {
//         const idTemaInsertado = resultado["insertId"];

//         // Segunda consulta para insertar en usuario_tema
//         const insertarEnUsuarioTema =
//           "INSERT INTO usuario_tema (idUsuario, idTema) SELECT id, ? FROM usuario;";

//         sql.ejecutarResSQL(
//           insertarEnUsuarioTema,
//           [idTemaInsertado],
//           (resultadoUsuarioTema) => {
//             if (resultadoUsuarioTema["affectedRows"] > 0) {
//               return res.status(200).send({
//                 en: 1,
//                 m: "Se registró el tema con éxito",
//                 idTema: idTemaInsertado,
//               });
//             } else {
//               return res.status(200).send({ en: -1, m: "No se pudo registrar en usuario_tema porque faltan temas o usuarios" });
//             }
//           }
//         );
//       } else {
//         return res.status(200).send({ en: -1, m: "No se pudo registrar el tema" });
//       }
//     }
//   );
// });

router.post("/registrarTema", [], (req, res) => {
  let titulo = req.body.titulo;
  let objetivos = req.body.objetivos;
  let descripcion = req.body.descripcion;
  let recursos = req.body.recursos;
  let estado = 1;

  const registrarTema =
    "INSERT INTO tema (titulo, objetivos, descripcion, recursos, estado) VALUES (?, ?, ?, ?, ?);";

  sql.ejecutarResSQL(
    registrarTema,
    [titulo, objetivos, descripcion, recursos, estado],
    (resultado) => {
      if (resultado["affectedRows"] > 0) {
        const idTemaInsertado = resultado["insertId"];

        // Segunda consulta para insertar en usuario_tema
        const insertarEnUsuarioTema =
          "INSERT INTO usuario_tema (idUsuario, idTema) SELECT id, ? FROM usuario;";

        sql.ejecutarResSQL(
          insertarEnUsuarioTema,
          [idTemaInsertado],
          (resultadoUsuarioTema) => {
            if (resultadoUsuarioTema["affectedRows"] > 0) {
              // Obtener todos los correos de la tabla cuenta
              const obtenerCorreos = "SELECT email FROM cuenta;";

              sql.ejecutarResSQL(
                obtenerCorreos,
                [],
                (resultadoCorreos) => {
                  if (resultadoCorreos.length > 0) {
                    const asunto = "Nuevo tema creado en C'amigo";
                    const mensaje = `
                    <h3>Se ha creado un nuevo tema en C'amigo: ${titulo} 🆕</h3>
                    <p><strong>Objetivos 🎯:</strong> ${objetivos}</p>
                    <p>Accede a la plataforma para más detalles.💻</p>
                    <p>Carrera de Computación, Universidad Nacional de Loja 🎓</p>
                    <p>NO CONTESTAR ESTE CORREO ✉️</p>
                    <img src="https://inscripciones.unl.edu.ec/images/logo_unl.png" alt="Logo Universidad Nacional de Loja" style="width:150px; height:auto;">
                `;

                    resultadoCorreos.forEach(cuenta => {
                      sql.enviarCorreo(cuenta.email, asunto, mensaje);
                    });

                    return res.status(200).send({
                      en: 1,
                      m: "Se registró el tema con éxito y se enviaron correos de notificación",
                      idTema: idTemaInsertado,
                    });
                  } else {
                    return res.status(200).send({
                      en: 1,
                      m: "Se registró el tema con éxito, pero no hay cuentas para notificar",
                      idTema: idTemaInsertado,
                    });
                  }
                }
              );
            } else {
              return res.status(200).send({ en: -1, m: "No se pudo registrar en usuario_tema porque faltan temas o usuarios" });
            }
          }
        );
      } else {
        return res.status(200).send({ en: -1, m: "No se pudo registrar el tema" });
      }
    }
  );
});

//Editar tema

router.post("/editarTema", [], (req, res) => {
  let id = req.body.id;
  let titulo = req.body.titulo;
  let objetivos = req.body.objetivos;
  let descripcion = req.body.descripcion;
  let recursos = req.body.recursos;
  let estado = req.body.estado;
  let temaEditadoBackend = {id, titulo, objetivos, descripcion, recursos, estado};

  const editarTema =
    "UPDATE tema SET titulo = ?, objetivos = ?, descripcion = ?, recursos = ?, estado = ? WHERE id = ?;";
  sql.ejecutarResSQL(
    editarTema,
    [titulo, objetivos, descripcion, recursos, estado, id],
    (resultado) => {
      //return res.status(200).send({result:resultado, titulo:titulo, descripcion:descripcion, id:id})
      if (resultado["affectedRows"] > 0)
        return res
          .status(200)
          .send({ en: 1, m: "Se editó el tema con éxito", idTema: id, temaEditadoBackend});
      return res.status(200).send({ en: -1, m: "No se pudo editar el tema" });
    }
  );
});

//DEBES ACTIVAR Y DESACTIVAR
router.post("/activarDesactivarTema", [], (req, res) => {
  let id = req.body.id;
  let estado = req.body.estado;
  const actualizarTema = "UPDATE tema SET estado = ? WHERE id = ?;";
  sql.ejecutarResSQL(actualizarTema, [estado, id], (resultado) => {
    //return res.status(200).send({result:resultado, titulo:titulo, descripcion:descripcion, id:id})
    if (resultado["affectedRows"] > 0)
      return res
        .status(200)
        .send({ en: 1, m: "Cambio el estado del tema", idTema: id });
    return res
      .status(200)
      .send({ en: -1, m: "No se pudo cambiar el estado del tema" });
  });
});

//Listar temas
router.post("/listarTemas", (req, res) => {
  let obtenerTemas;
  let idUsuario = req.body.idUsuario;
  if (req.body.mensaje === "temasActivos") {
    obtenerTemas =
    `SELECT usuario_tema.idTema, usuario_tema.progreso, tema.titulo, tema.objetivos, tema.descripcion, tema.recursos, tema.estado ` +
    `FROM ${BD}.usuario_tema ` +
    `INNER JOIN ${BD}.tema ON usuario_tema.idTema = tema.id ` +
    `WHERE usuario_tema.idUsuario = ? AND tema.estado = 1;`;
  } else {
    obtenerTemas =
      `SELECT usuario_tema.idTema, usuario_tema.progreso, tema.titulo, tema.objetivos, tema.descripcion, tema.recursos, tema.estado ` +
      `FROM ${BD}.usuario_tema ` +
      `INNER JOIN ${BD}.tema ON usuario_tema.idTema = tema.id ` +
      `WHERE usuario_tema.idUsuario = ?;`;
  }
  sql.ejecutarResSQL(obtenerTemas, [idUsuario], (resultado) => {
    if (resultado.length > 0) {
      return res
        .status(200)
        .send({ en: 1, m: "Temas obtenidos", temas: resultado });
    } else {
      return res.status(200).send({ en: -1, m: "No se encontraron temas" });
    }
  });
});


module.exports = router;