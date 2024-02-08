const router = require("express").Router();
const sql = require("../../config/config");
const BD = process.env.BD;

//--------------------REGISTRAR SUBTEMA--------------------
router.post("/registrarSubtema", [], (req, res) => {
    let idTema = req.body.idTema;
    let titulo = req.body.titulo;
    let objetivos = req.body.objetivos;
    let descripcion = req.body.descripcion;
    let ejemploCodigo = req.body.ejemploCodigo;
    let recursos = req.body.recursos;
    let estado = 1;

    const registrarSubtema =
        "INSERT INTO subtema (titulo, objetivos, descripcion, ejemploCodigo, recursos, estado, idTema) VALUES (?, ?, ?, ?, ?, ?, ?);";

    sql.ejecutarResSQL(
        registrarSubtema,
        [titulo, objetivos, descripcion, ejemploCodigo, recursos, estado, idTema],
        (resultado) => {
            if (resultado["affectedRows"] > 0) {
                const idSubtemaInsertado = resultado["insertId"];

                // Segunda consulta para insertar en usuario_subtema
                const insertarEnUsuarioSubtema =
                    "INSERT INTO tema_subtema (idUsuario, idSubtema) SELECT id, ? FROM usuario;";

                sql.ejecutarResSQL(
                    insertarEnUsuarioSubtema,
                    [idSubtemaInsertado],
                    (resultadoUsuarioSubtema) => {
                        if (resultadoUsuarioSubtema["affectedRows"] > 0) {
                            return res.status(200).send({
                                en: 1,
                                m: "Se registró el subtema con éxito",
                                idSubtema: idSubtemaInsertado,
                            });
                        } else {
                            return res.status(200).send({ en: -1, m: "No se pudo registrar en usuario_subtema" });
                        }
                    }
                );
            } else {
                return res.status(200).send({ en: -1, m: "No se pudo registrar el subtema" });
            }
        }
    );
});



router.post("/editarSubtema", [], (req, res) => {
    let id = req.body.id;
    let titulo = req.body.titulo;
    let objetivos = req.body.objetivos;
    let descripcion = req.body.descripcion;
    let ejemploCodigo = req.body.ejemploCodigo;
    let recursos = req.body.recursos;
    let estado = req.body.estado;
    let subtemaEditadoBackend = { id, titulo, objetivos, descripcion, ejemploCodigo, recursos, estado };
    const editarSubtema =
        "UPDATE subtema SET titulo = ?, objetivos = ?, descripcion = ?, ejemploCodigo = ?, recursos = ?, estado = ? WHERE id = ?;";
    sql.ejecutarResSQL(
        editarSubtema,
        [titulo, objetivos, descripcion, ejemploCodigo, recursos, estado, id],
        (resultado) => {
            //return res.status(200).send({result:resultado, titulo:titulo, descripcion:descripcion, id:id})
            if (resultado["affectedRows"] > 0)
                return res
                    .status(200)
                    .send({ en: 1, m: "Se editó el subtema con éxito", idSubtema: id, subtemaEditadoBackend });
            return res.status(200).send({ en: -1, m: "No se pudo editar el subtema" });
        }
    );
});

//DEBES ACTIVAR Y DESACTIVAR
router.post("/activarDesactivarSubtema", [], (req, res) => {
    let id = req.body.id;
    let estado = req.body.estado;
    const actualizarSubtema = "UPDATE subtema SET estado = ? WHERE id = ?;";
    sql.ejecutarResSQL(actualizarSubtema, [estado, id], (resultado) => {
        //return res.status(200).send({result:resultado, titulo:titulo, descripcion:descripcion, id:id})
        if (resultado["affectedRows"] > 0)
            return res
                .status(200)
                .send({ en: 1, m: "Cambio el estado del subtema", idSubtema: id });
        return res
            .status(200)
            .send({ en: -1, m: "No se pudo cambiar el estado del subtema" });
    });
});


router.post("/listarSubtemas", (req, res) => {
    let idTema = req.body.idTema;
    let idUsuario = req.body.idUsuario;
    let obtenerSubtemas;
    if (req.body.mensaje === "subtemasActivos") {
        obtenerSubtemas =
            `SELECT tema_subtema.idSubtema, tema_subtema.progreso, subtema.titulo, subtema.objetivos, subtema.descripcion, subtema.ejemploCodigo, subtema.recursos, subtema.estado ` +
            `FROM ${BD}.tema_subtema ` +
            `INNER JOIN ${BD}.subtema ON tema_subtema.idSubtema = subtema.id ` +
            `WHERE subtema.idTema = ? AND idUsuario = ? AND estado = 1;`;
    } else {
        obtenerSubtemas =
            `SELECT tema_subtema.idSubtema, tema_subtema.progreso, subtema.titulo, subtema.objetivos, subtema.descripcion, subtema.ejemploCodigo, subtema.recursos, subtema.estado ` +
            `FROM ${BD}.tema_subtema ` +
            `INNER JOIN ${BD}.subtema ON tema_subtema.idSubtema = subtema.id ` +
            `WHERE subtema.idTema = ? AND idUsuario = ?;`;
    }
    sql.ejecutarResSQL(obtenerSubtemas, [idTema, idUsuario], (resultado) => {
        if (resultado.length > 0) {
            return res
                .status(200)
                .send({ en: 1, m: "Subtemas obtenidos", subtemas: resultado });
        } else {
            return res.status(200).send({ en: -1, m: "No se encontraron subtemas" });
        }
    });
});



module.exports = router;
