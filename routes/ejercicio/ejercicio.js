const router = require("express").Router();
const sql = require("../../config/config");
const BD = process.env.BD;

//--------------------REGISTRAR EJERCICIO--------------------
router.post("/registrarEjercicio", [], (req, res) => {
    let titulo = req.body.titulo;
    let instrucciones = req.body.instrucciones;
    let restricciones = req.body.restricciones;
    let solucion = req.body.solucion;
    let estado = 1;
    let idSubtema = req.body.idSubtema; // Asegúrate de que este campo esté disponible en el cuerpo de la solicitud

    const registrarEjercicio =
        "INSERT INTO ejercicio (titulo, instrucciones, restricciones, solucion, estado, idSubtema) VALUES (?, ?, ?, ?, ?, ?);";

    sql.ejecutarResSQL(
        registrarEjercicio,
        [titulo, instrucciones, restricciones, solucion, estado, idSubtema],
        (resultado) => {
            if (resultado["affectedRows"] > 0) {
                const idEjercicioInsertado = resultado["insertId"];

                // Segunda consulta para insertar en subtema_ejercicio por cada usuario
                const insertarEnSubtemaEjercicio =
                    "INSERT INTO subtema_ejercicio (idUsuario, idEjercicio) SELECT id, ? FROM usuario;";

                sql.ejecutarResSQL(
                    insertarEnSubtemaEjercicio,
                    [idEjercicioInsertado],
                    (resultadoSubtemaEjercicio) => {
                        if (resultadoSubtemaEjercicio["affectedRows"] > 0) {
                            return res.status(200).send({
                                en: 1,
                                m: "Se registró el ejercicio con éxito",
                                idEjercicio: idEjercicioInsertado,
                            });
                        } else {
                            return res.status(200).send({ en: -1, m: "No se pudo registrar en subtema_ejercicio" });
                        }
                    }
                );
            } else {
                return res.status(200).send({ en: -1, m: "No se pudo registrar el ejercicio" });
            }
        }
    );
});


router.post("/editarEjercicio", [], (req, res) => {
    let id = req.body.id;
    let titulo = req.body.titulo;
    let instrucciones = req.body.instrucciones;
    let restricciones = req.body.restricciones;
    let solucion = req.body.solucion;
    let estado = req.body.estado;
    let ejercicioEditadoBackend = { id, titulo, instrucciones, restricciones, solucion, estado };

    const editarEjercicio =
        "UPDATE ejercicio SET titulo = ?, instrucciones = ?, restricciones = ?, solucion = ?, estado = ? WHERE id = ?;";
    sql.ejecutarResSQL(
        editarEjercicio,
        [titulo, instrucciones, restricciones, solucion, estado, id],
        (resultado) => {
            //return res.status(200).send({result:resultado, titulo:titulo, descripcion:descripcion, id:id})
            if (resultado["affectedRows"] > 0)
                return res
                    .status(200)
                    .send({ en: 1, m: "Se editó el ejercicio con éxito", idEjercicio: id, ejercicioEditadoBackend });
            return res.status(200).send({ en: -1, m: "No se pudo editar el ejercicio" });
        }
    );
});

//DEBES ACTIVAR Y DESACTIVAR
router.post("/activarDesactivarEjercicio", [], (req, res) => {
    let id = req.body.id;
    let estado = req.body.estado;
    const actualizarEjercicio = "UPDATE ejercicio SET estado = ? WHERE id = ?;";
    sql.ejecutarResSQL(actualizarEjercicio, [estado, id], (resultado) => {
        //return res.status(200).send({result:resultado, titulo:titulo, descripcion:descripcion, id:id})
        if (resultado["affectedRows"] > 0)
            return res
                .status(200)
                .send({ en: 1, m: "Cambio el estado del ejercicio", idEjercicio: id });
        return res
            .status(200)
            .send({ en: -1, m: "No se pudo cambiar el estado del ejercicio" });
    });
});


router.post("/listarEjercicios", (req, res) => {
    let idSubtema = req.body.idSubtema;
    let idUsuario = req.body.idUsuario;

    let obtenerEjercicios;
    if (req.body.mensaje === "ejerciciosActivos") {
        obtenerEjercicios =
            `SELECT subtema_ejercicio.idEjercicio, subtema_ejercicio.progreso, ejercicio.titulo, ejercicio.instrucciones, ejercicio.restricciones, ejercicio.solucion, ejercicio.estado ` +
            `FROM ${BD}.subtema_ejercicio ` +
            `INNER JOIN ${BD}.ejercicio ON subtema_ejercicio.idEjercicio = ejercicio.id ` +
            `WHERE ejercicio.idSubtema = ? AND idUsuario = ? AND estado = 1;`;
    } else {
        obtenerEjercicios =
            `SELECT subtema_ejercicio.idEjercicio, subtema_ejercicio.progreso, ejercicio.titulo, ejercicio.instrucciones, ejercicio.restricciones, ejercicio.solucion, ejercicio.estado ` +
            `FROM ${BD}.subtema_ejercicio ` +
            `INNER JOIN ${BD}.ejercicio ON subtema_ejercicio.idEjercicio = ejercicio.id ` +
            `WHERE ejercicio.idSubtema = ? AND idUsuario = ?;`;
    }
    sql.ejecutarResSQL(obtenerEjercicios, [idSubtema, idUsuario], (resultado) => {
        if (resultado.length > 0) {
            return res
                .status(200)
                .send({ en: 1, m: "Ejercicios obtenidos", ejercicios: resultado });
        } else {
            return res.status(200).send({ en: -1, m: "No se encontraron ejercicios" });
        }
    });
});

module.exports = router;
