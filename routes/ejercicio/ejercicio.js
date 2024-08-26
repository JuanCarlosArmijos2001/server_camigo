const router = require("express").Router();
const sql = require("../../config/config");
const BD = process.env.BD;

//--------------------REGISTRAR EJERCICIO--------------------
// router.post("/registrarEjercicio", [], (req, res) => {
//     let titulo = req.body.titulo;
//     let instrucciones = req.body.instrucciones;
//     let restricciones = req.body.restricciones;
//     let solucion = req.body.solucion;
//     let retroalimentacion = req.body.retroalimentacion;
//     let estado = 1;
//     let idSubtema = req.body.idSubtema;

//     const registrarEjercicio =
//         "INSERT INTO ejercicio (titulo, instrucciones, restricciones, solucion, retroalimentacion, estado, idSubtema) VALUES (?, ?, ?, ?, ?, ?, ?);";

//     sql.ejecutarResSQL(
//         registrarEjercicio,
//         [titulo, instrucciones, restricciones, solucion, retroalimentacion, estado, idSubtema],
//         (resultado) => {
//             if (resultado["affectedRows"] > 0) {
//                 const idEjercicioInsertado = resultado["insertId"];

//                 // Segunda consulta para insertar en subtema_ejercicio por cada usuario
//                 const insertarEnSubtemaEjercicio =
//                     "INSERT INTO subtema_ejercicio (idUsuario, idEjercicio) SELECT id, ? FROM usuario;";

//                 sql.ejecutarResSQL(
//                     insertarEnSubtemaEjercicio,
//                     [idEjercicioInsertado],
//                     (resultadoSubtemaEjercicio) => {
//                         if (resultadoSubtemaEjercicio["affectedRows"] > 0) {
//                             return res.status(200).send({
//                                 en: 1,
//                                 m: "Se registró el ejercicio con éxito",
//                                 idEjercicio: idEjercicioInsertado,
//                             });
//                         } else {
//                             return res.status(200).send({ en: -1, m: "No se pudo registrar en subtema_ejercicio porque faltan ejercicios o usuarios"  });
//                         }
//                     }
//                 );
//             } else {
//                 return res.status(200).send({ en: -1, m: "No se pudo registrar el ejercicio" });
//             }
//         }
//     );
// });

//Registrar ejercicio 
router.post("/registrarEjercicio", [], (req, res) => {
    let titulo = req.body.titulo;
    let instrucciones = req.body.instrucciones;
    let restricciones = req.body.restricciones;
    let solucion = req.body.solucion;
    let retroalimentacion = req.body.retroalimentacion;
    let estado = 1;
    let idSubtema = req.body.idSubtema;

    const registrarEjercicio =
        "INSERT INTO ejercicio (titulo, instrucciones, restricciones, solucion, retroalimentacion, estado, idSubtema) VALUES (?, ?, ?, ?, ?, ?, ?);";

    sql.ejecutarResSQL(
        registrarEjercicio,
        [titulo, instrucciones, restricciones, solucion, retroalimentacion, estado, idSubtema],
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
                            // Obtener todos los correos de la tabla cuenta
                            const obtenerCorreos = "SELECT email FROM cuenta;";

                            sql.ejecutarResSQL(
                                obtenerCorreos,
                                [],
                                (resultadoCorreos) => {
                                    if (resultadoCorreos.length > 0) {
                                        const asunto = "Nuevo ejercicio creado en C'amigo";
                                        const mensaje = `
                                            <h3>Se ha creado un nuevo ejercicio en C'amigo: ${titulo} 🆕</h3>
                                            <p><strong>Instrucciones 📝:</strong> ${instrucciones}</p>
                                            <p>Accede a la plataforma para practicar y mejorar tus habilidades. 💪💻</p>
                                            <p>Carrera de Computación, Universidad Nacional de Loja 🎓</p>
                                            <p>NO CONTESTAR ESTE CORREO ✉️</p>
                                            <img src="https://inscripciones.unl.edu.ec/images/logo_unl.png" alt="Logo Universidad Nacional de Loja" style="width:150px; height:auto;">
                                        `;

                                        resultadoCorreos.forEach(cuenta => {
                                            sql.enviarCorreo(cuenta.email, asunto, mensaje);
                                        });

                                        return res.status(200).send({
                                            en: 1,
                                            m: "Se registró el ejercicio con éxito y se enviaron correos de notificación",
                                            idEjercicio: idEjercicioInsertado,
                                        });
                                    } else {
                                        return res.status(200).send({
                                            en: 1,
                                            m: "Se registró el ejercicio con éxito, pero no hay cuentas para notificar",
                                            idEjercicio: idEjercicioInsertado,
                                        });
                                    }
                                }
                            );
                        } else {
                            return res.status(200).send({ en: -1, m: "No se pudo registrar en subtema_ejercicio porque faltan ejercicios o usuarios" });
                        }
                    }
                );
            } else {
                return res.status(200).send({ en: -1, m: "No se pudo registrar el ejercicio" });
            }
        }
    );
});

//Editar ejercicio
router.post("/editarEjercicio", [], (req, res) => {
    let id = req.body.id;
    let titulo = req.body.titulo;
    let instrucciones = req.body.instrucciones;
    let restricciones = req.body.restricciones;
    let solucion = req.body.solucion;
    let retroalimentacion = req.body.retroalimentacion;
    let estado = req.body.estado;
    let ejercicioEditadoBackend = { id, titulo, instrucciones, restricciones, solucion, retroalimentacion, estado };

    const editarEjercicio =
        "UPDATE ejercicio SET titulo = ?, instrucciones = ?, restricciones = ?, solucion = ?, retroalimentacion = ?, estado = ? WHERE id = ?;";
    sql.ejecutarResSQL(
        editarEjercicio,
        [titulo, instrucciones, restricciones, solucion, retroalimentacion, estado, id],
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

//Activar y desactivar ejercicio
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

//Listar ejercicios
router.post("/listarEjercicios", (req, res) => {
    let idSubtema = req.body.idSubtema;
    let idUsuario = req.body.idUsuario;

    let obtenerEjercicios;
    if (req.body.mensaje === "ejerciciosActivos") {
        obtenerEjercicios =
            `SELECT subtema_ejercicio.idEjercicio, subtema_ejercicio.progreso, ejercicio.titulo, ejercicio.instrucciones, ejercicio.restricciones, ejercicio.solucion, ejercicio.retroalimentacion, ejercicio.estado ` +
            `FROM ${BD}.subtema_ejercicio ` +
            `INNER JOIN ${BD}.ejercicio ON subtema_ejercicio.idEjercicio = ejercicio.id ` +
            `WHERE ejercicio.idSubtema = ? AND idUsuario = ? AND estado = 1;`;
    } else {
        obtenerEjercicios =
            `SELECT subtema_ejercicio.idEjercicio, subtema_ejercicio.progreso, ejercicio.titulo, ejercicio.instrucciones, ejercicio.restricciones, ejercicio.solucion, ejercicio.retroalimentacion, ejercicio.estado ` +
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
