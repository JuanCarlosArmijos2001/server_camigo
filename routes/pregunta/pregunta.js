const router = require("express").Router();
const sql = require("../../config/config");
const { calcularYActualizarProgresoEjercicio } = require("../utilities/determinarProgreso");
const { calcularYActualizarProgresoSubtema } = require("../utilities/determinarProgreso");
const { calcularYActualizarProgresoTema } = require("../utilities/determinarProgreso");
const { calcularYActualizarProgresoGeneral } = require("../utilities/determinarProgreso");
const BD = process.env.BD;

//--------------------REGISTRAR PREGUNTA--------------------
router.post("/registrarPregunta", [], (req, res) => {
    let enunciado = req.body.enunciado;
    let opcion_a = req.body.opcion_a;
    let opcion_b = req.body.opcion_b;
    let opcion_c = req.body.opcion_c;
    let opcion_d = req.body.opcion_d;
    let respuesta_correcta = req.body.respuesta_correcta;
    let justificacion = req.body.justificacion;
    let estado = 1;
    let idEjercicio = req.body.idEjercicio; // Asegúrate de que este campo esté disponible en el cuerpo de la solicitud

    const registrarPregunta =
        "INSERT INTO pregunta (enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, justificacion, estado, idEjercicio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";

    sql.ejecutarResSQL(
        registrarPregunta,
        [enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, justificacion, estado, idEjercicio],
        (resultado) => {
            if (resultado["affectedRows"] > 0) {
                const idPreguntaInsertada = resultado["insertId"];

                // Segunda consulta para insertar en ejercicio_pregunta por cada usuario
                const insertarEnEjercicioPregunta =
                    "INSERT INTO ejercicio_pregunta (idUsuario, idPregunta) SELECT id, ? FROM usuario;";

                sql.ejecutarResSQL(
                    insertarEnEjercicioPregunta,
                    [idPreguntaInsertada],
                    (resultadoEjercicioPregunta) => {
                        if (resultadoEjercicioPregunta["affectedRows"] > 0) {
                            return res.status(200).send({
                                en: 1,
                                m: "Se registró la pregunta con éxito",
                                idPregunta: idPreguntaInsertada,
                            });
                        } else {
                            return res.status(200).send({ en: -1, m: "No se pudo registrar en ejercicio_pregunta" });
                        }
                    }
                );
            } else {
                return res.status(200).send({ en: -1, m: "No se pudo registrar la pregunta" });
            }
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
    let estado = req.body.estado;
    let preguntaEditadaBackend = { id, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, justificacion, estado };
    const editarPregunta =
        "UPDATE pregunta SET enunciado = ?, opcion_a = ?, opcion_b = ?, opcion_c = ?, opcion_d = ?, respuesta_correcta = ?, justificacion = ?, estado = ? WHERE id = ?;";
    sql.ejecutarResSQL(
        editarPregunta,
        [enunciado, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, justificacion, estado, id],
        (resultado) => {
            if (resultado["affectedRows"] > 0)
                return res
                    .status(200)
                    .send({ en: 1, m: "Se editó la pregunta con éxito", idPregunta: id, preguntaEditadaBackend });
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
    let idUsuario = req.body.idUsuario;
    let obtenerPreguntas;
    if (req.body.mensaje === "preguntasActivas") {
        obtenerPreguntas =
            `SELECT ejercicio_pregunta.idPregunta, pregunta.enunciado, pregunta.opcion_a, pregunta.opcion_b, pregunta.opcion_c, pregunta.opcion_d, pregunta.respuesta_correcta, pregunta.justificacion, pregunta.estado ` +
            `FROM ${BD}.ejercicio_pregunta ` +
            `INNER JOIN ${BD}.pregunta ON ejercicio_pregunta.idPregunta = pregunta.id ` +
            `WHERE pregunta.idEjercicio = ? AND idUsuario = ? AND estado = 1;`;
    } else {
        obtenerPreguntas =
            `SELECT ejercicio_pregunta.idPregunta, pregunta.enunciado, pregunta.opcion_a, pregunta.opcion_b, pregunta.opcion_c, pregunta.opcion_d, pregunta.respuesta_correcta, pregunta.justificacion, pregunta.estado ` +
            `FROM ${BD}.ejercicio_pregunta ` +
            `INNER JOIN ${BD}.pregunta ON ejercicio_pregunta.idPregunta = pregunta.id ` +
            `WHERE pregunta.idEjercicio = ? AND idUsuario = ?;`;
    }
    sql.ejecutarResSQL(obtenerPreguntas, [idEjercicio, idUsuario], (resultado) => {
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

    console.log("datos del frontend:", "pregunta", idPregunta, "ejercicio", idEjercicio, "subtema", idSubtema, "tema", idTema, "usuario", idUsuario);

    // Cambiar estado_completado de la pregunta a 1
    const completarPregunta = "UPDATE ejercicio_pregunta SET estado_completado = 1 WHERE (idUsuario = ? and idPregunta = ?);";
    sql.ejecutarResSQL(completarPregunta, [idUsuario, idPregunta], (resultado) => {
        console.log("completarPregunta", resultado["affectedRows"])
        if (resultado["affectedRows"] > 0) {
            calcularYActualizarProgresoEjercicio(idEjercicio, idUsuario)
                .then(({mensaje, progresoEjercicio}) => {
                    console.log(mensaje);
                    console.log("progreso en el clg",progresoEjercicio);
                    calcularYActualizarProgresoSubtema(idSubtema, idUsuario)
                        .then(({mensaje, progresoSubtema}) => {
                            console.log(mensaje);
                            console.log(progresoSubtema);
                            calcularYActualizarProgresoTema(idTema, idUsuario)
                                .then(({mensaje, progresoTema}) => {
                                    console.log(mensaje);
                                    console.log(progresoTema);
                                    calcularYActualizarProgresoGeneral(idUsuario)
                                        .then(({mensaje, progresoUsuario}) => {
                                            console.log(mensaje);
                                            console.log(progresoUsuario);
                                            console.log("progreso ejercicio en funcion",progresoEjercicio);
                                            return res.status(200).send({ en: 1, m: mensaje, progresoEjercicio, progresoSubtema, progresoTema, progresoUsuario });
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


router.post('/resetearProgreso', (req, res) => {
    const queries = [
        "UPDATE test.usuario SET progreso = 0 WHERE id > 0",
        "UPDATE test.usuario_tema SET progreso = 0, estado_completado = -1 WHERE id > 0",
        "UPDATE test.tema_subtema SET progreso = 0, estado_completado = -1 WHERE id > 0",
        "UPDATE test.subtema_ejercicio SET progreso = 0, estado_completado = -1 WHERE id > 0",
        "UPDATE test.ejercicio_pregunta SET estado_completado = -1 WHERE id > 0"
    ];

    // Función para ejecutar la siguiente consulta en la lista
    const executeNextQuery = () => {
        if (queries.length === 0) {
            res.status(200).json({ en: -1, m: "Reinicio de progreso de usuarios realizado" });
            return;
        }

        const query = queries.shift();
        sql.ejecutarResSQL(query, [], (resultados) => {
            executeNextQuery();
        });
    };

    // Iniciar el proceso de ejecución de consultas
    executeNextQuery();
});



module.exports = router;