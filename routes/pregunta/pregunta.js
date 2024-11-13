const router = require("express").Router();
const sql = require("../../config/config");
const { calcularYActualizarProgresoEjercicio } = require("../utilities/determinarProgreso");
const { calcularYActualizarProgresoSubtema } = require("../utilities/determinarProgreso");
const { calcularYActualizarProgresoTema } = require("../utilities/determinarProgreso");
const { calcularYActualizarProgresoGeneral } = require("../utilities/determinarProgreso");
const BD = process.env.BD;

//registrar pregunta
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
                            // Obtener todos los correos de la tabla cuenta
                            const obtenerCorreos = "SELECT email FROM cuenta;";

                            sql.ejecutarResSQL(
                                obtenerCorreos,
                                [],
                                (resultadoCorreos) => {
                                    if (resultadoCorreos.length > 0) {
                                        const asunto = "Nueva pregunta creada en C'amigo";
                                        const mensaje = `
                                            <h3>Se ha creado una nueva pregunta en C'amigo 🆕</h3>
                                            <p><strong>Enunciado 🤔:</strong> ${enunciado}</p>
                                            <p>Accede a la plataforma para poner a prueba tus conocimientos. 🧠💡</p>
                                            <p>Carrera de Computación, Universidad Nacional de Loja 🎓</p>
                                            <p>NO CONTESTAR ESTE CORREO ✉️</p>
                                            <img src="https://inscripciones.unl.edu.ec/images/logo_unl.png" alt="Logo Universidad Nacional de Loja" style="width:150px; height:auto;">
                                        `;

                                        resultadoCorreos.forEach(cuenta => {
                                            sql.enviarCorreo(cuenta.email, asunto, mensaje);
                                        });

                                        return res.status(200).send({
                                            en: 1,
                                            m: "Se registró la pregunta con éxito y se enviaron correos de notificación",
                                            idPregunta: idPreguntaInsertada,
                                        });
                                    } else {
                                        return res.status(200).send({
                                            en: 1,
                                            m: "Se registró la pregunta con éxito, pero no hay cuentas para notificar",
                                            idPregunta: idPreguntaInsertada,
                                        });
                                    }
                                }
                            );
                        } else {
                            return res.status(200).send({ en: -1, m: "No se pudo registrar en ejercicio_pregunta porque faltan preguntas o usuarios" });
                        }
                    }
                );
            } else {
                return res.status(200).send({ en: -1, m: "No se pudo registrar la pregunta" });
            }
        }
    );
});

//editar pregunta
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

//activar o desactivar pregunta
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

//listar preguntas
router.post("/listarPreguntas", (req, res) => {
    let idEjercicio = req.body.idEjercicio;
    let idUsuario = req.body.idUsuario;
    let obtenerPreguntas;
    if (req.body.mensaje === "preguntasActivas") {
        obtenerPreguntas =
            `SELECT ejercicio_pregunta.idPregunta, ejercicio_pregunta.estado_completado, pregunta.enunciado, pregunta.opcion_a, pregunta.opcion_b, pregunta.opcion_c, pregunta.opcion_d, pregunta.respuesta_correcta, pregunta.justificacion, pregunta.estado ` +
            `FROM ${BD}.ejercicio_pregunta ` +
            `INNER JOIN ${BD}.pregunta ON ejercicio_pregunta.idPregunta = pregunta.id ` +
            `WHERE pregunta.idEjercicio = ? AND idUsuario = ? AND estado = 1;`;
    } else {
        obtenerPreguntas =
            `SELECT ejercicio_pregunta.idPregunta, ejercicio_pregunta.estado_completado, pregunta.enunciado, pregunta.opcion_a, pregunta.opcion_b, pregunta.opcion_c, pregunta.opcion_d, pregunta.respuesta_correcta, pregunta.justificacion, pregunta.estado ` +
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

//completar pregunta
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
                    console.log(progresoEjercicio);
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



module.exports = router;