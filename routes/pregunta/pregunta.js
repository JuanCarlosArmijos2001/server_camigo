const router = require("express").Router();
const sql = require("../../config/config");
const { calcularYActualizarProgresoEjercicio } = require("../utilities/DeterminarProgreso");
const { calcularYActualizarProgresoSubtema } = require("../utilities/DeterminarProgreso");
const { calcularYActualizarProgresoTema } = require("../utilities/DeterminarProgreso");
const { calcularYActualizarProgresoGeneral } = require("../utilities/DeterminarProgreso");

router.post("/registrarPregunta", [], (req, res) => {
    let enunciado = req.body.enunciado;
    let opcion_a = req.body.opcion_a;
    let opcion_b = req.body.opcion_b;
    let opcion_c = req.body.opcion_c;
    let opcion_d = req.body.opcion_d;
    let respuesta_correcta = req.body.respuesta_correcta;
    let justificacion = req.body.justificacion;
    let estado = 1;
    let idEjercicio = req.body.idEjercicio;

    const registrarPregunta =
        "INSERT INTO pregunta (enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, justificacion, estado, idEjercicio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";

    sql.ejecutarResSQL(
        registrarPregunta,
        [enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, justificacion, estado, idEjercicio],
        (resultado) => {
            if (resultado["affectedRows"] > 0)
                return res.status(200).send({
                    en: 1,
                    m: "Se registró la pregunta con éxito",
                    idPregunta: resultado["insertId"],
                });
            return res.status(200).send({ en: -1, m: "No se pudo registrar la pregunta" });
        }
    );
});


router.post("/editarPregunta", [], (req, res) => {
    let id = req.body.id;
    let enunciado = req.body.enunciado;
    let opcion_a = req.body.opcion_a;
    let opcion_b = req.body.opcion_b;
    let opcion_c = req.body.opcion_c;
    let opcion_d = req.body.opcion_d;
    let respuesta_correcta = req.body.respuesta_correcta;
    let justificacion = req.body.justificacion;
    const editarPregunta =
        "UPDATE pregunta SET enunciado = ?, opcion_a = ?, opcion_b = ?, opcion_c = ?, opcion_d = ?, respuesta_correcta = ?, justificacion = ? WHERE id = ?;";
    sql.ejecutarResSQL(
        editarPregunta,
        [enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, justificacion, id],
        (resultado) => {
            if (resultado["affectedRows"] > 0)
                return res
                    .status(200)
                    .send({ en: 1, m: "Se editó la pregunta con éxito", idPregunta: id });
            return res.status(200).send({ en: -1, m: "No se pudo editar la pregunta" });
        }
    );
});

//DEBES ACTIVAR Y DESACTIVAR
router.post("/activarDesactivarPregunta", [], (req, res) => {
    let id = req.body.id;
    let estado = req.body.estado;
    const actualizarPregunta = "UPDATE pregunta SET estado = ? WHERE id = ?;";
    sql.ejecutarResSQL(actualizarPregunta, [estado, id], (resultado) => {
        if (resultado["affectedRows"] > 0)
            return res
                .status(200)
                .send({ en: 1, m: "Cambio el estado de la pregunta", idPregunta: id });
        return res
            .status(200)
            .send({ en: -1, m: "No se pudo cambiar el estado de la pregunta" });
    });
});


router.post("/listarPreguntas", (req, res) => {
    let idEjercicio = req.body.idEjercicio;
    let obtenerPreguntas;
    if (req.body.mensaje === "preguntasActivas") {
        obtenerPreguntas = "SELECT * FROM pregunta WHERE idEjercicio = ? AND estado = 1;";
    } else {
        obtenerPreguntas = "SELECT * FROM pregunta WHERE idEjercicio = ?;";
    }
    sql.ejecutarResSQL(obtenerPreguntas, [idEjercicio], (resultado) => {
        if (resultado.length > 0) {
            return res
                .status(200)
                .send({ en: 1, m: "Preguntas obtenidas", preguntas: resultado });
        } else {
            return res.status(200).send({ en: -1, m: "No se encontraron preguntas" });
        }
    });
});

router.post("/completarPregunta", (req, res) => {
    let idPregunta = req.body.idPregunta;
    let idEjercicio = req.body.idEjercicio;
    let idSubtema = req.body.idSubtema;
    let idTema = req.body.idTema;
    let idUsuario = req.body.idUsuario;
    
    // Cambiar estado_completado de la pregunta a 1
    const completarPregunta = "UPDATE pregunta SET estado_completado = 1 WHERE id = ?;";
    sql.ejecutarResSQL(completarPregunta, [idPregunta], (resultado) => {
        if (resultado["affectedRows"] > 0) {
            calcularYActualizarProgresoEjercicio(idEjercicio)
                .then((mensaje) => {
                    console.log(mensaje);
                    calcularYActualizarProgresoSubtema(idSubtema)
                        .then((mensaje) => {
                            console.log(mensaje);
                            calcularYActualizarProgresoTema(idTema)
                                .then((mensaje) => {
                                    console.log(mensaje);
                                    calcularYActualizarProgresoGeneral(idUsuario)
                                        .then((mensaje) => {
                                            console.log(mensaje);
                                            return res.status(200).send({ en: 1, m: mensaje });
                                        })
                                        .catch((error) => {
                                            return res.status(200).send({ en: -1, m: error });
                                        });
                                })
                                .catch((error) => {
                                    return res.status(200).send({ en: -1, m: error });
                                });
                        })
                        .catch((error) => {
                            return res.status(200).send({ en: -1, m: error });
                        });
                })
                .catch((error) => {
                    return res.status(200).send({ en: -1, m: error });
                });

        } else {
            return res.status(200).send({ en: -1, m: "No se pudo completar la pregunta" });
        }
    });
});


module.exports = router;