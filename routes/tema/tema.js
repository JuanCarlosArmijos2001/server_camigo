const router = require("express").Router();
const sql = require("../../config/config");

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
      //return res.status(200).send({result:resultado, titulo:titulo, descripcion:descripcion})
      if (resultado["affectedRows"] > 0)
        return res.status(200).send({
          en: 1,
          m: "Se registro el tema con éxito",
          idTema: resultado["insertId"],
        });
      return res.status(200).send({ en: -1, m: "No se pudo registrar tema" });
    }
  );
});

router.post("/editarTema", [], (req, res) => {
  let id = req.body.id;
  let titulo = req.body.titulo;
  let objetivos = req.body.objetivos;
  let descripcion = req.body.descripcion;
  let recursos = req.body.recursos;
  const editarTema =
    "UPDATE tema SET titulo = ?, objetivos = ?, descripcion = ?, recursos = ? WHERE id = ?;";
  sql.ejecutarResSQL(
    editarTema,
    [titulo, objetivos, descripcion, recursos, id],
    (resultado) => {
      //return res.status(200).send({result:resultado, titulo:titulo, descripcion:descripcion, id:id})
      if (resultado["affectedRows"] > 0)
        return res
          .status(200)
          .send({ en: 1, m: "Se editó el tema con éxito", idTema: id });
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

// router.get("/listarTemas", (req, res) => {
//     sql.ejecutarResSQL("SELECT * FROM tema;", [], (resultado) => {
//       if (resultado.length > 0) {
//         return res
//           .status(200)
//           .send({ en: 1, m: "Temas obtenidos", temas: resultado });
//       } else {
//         return res.status(200).send({ en: -1, m: "No se encontraron temas" });
//       }
//     });
//   });


router.post("/listarTemas", (req, res) => {
  let obtenerTitulo;
  if (req.body.mensaje === "temasActivos") {
    obtenerTitulo = "SELECT * FROM tema WHERE estado = 1;";
  } else {
    obtenerTitulo = "SELECT * FROM tema;";
  }
  sql.ejecutarResSQL(obtenerTitulo, [], (resultado) => {
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
