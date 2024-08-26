const router = require("express").Router();
const sql = require("../../config/config");
const BD = process.env.BD;

//--------------------REGISTRAR SUBTEMA--------------------
// router.post("/registrarSubtema", [], (req, res) => {
//     let idTema = req.body.idTema;
//     let titulo = req.body.titulo;
//     let objetivos = req.body.objetivos;
//     let descripcion = req.body.descripcion;
//     let ejemploCodigo = req.body.ejemploCodigo;
//     let recursos = req.body.recursos;
//     let retroalimentacion = req.body.retroalimentacion;
//     let estado = 1;

//     const registrarSubtema =
//         "INSERT INTO subtema (titulo, objetivos, descripcion, ejemploCodigo, recursos, retroalimentacion, estado, idTema) VALUES (?, ?, ?, ?, ?, ?, ?, ?);";

//     sql.ejecutarResSQL(
//         registrarSubtema,
//         [titulo, objetivos, descripcion, ejemploCodigo, recursos, retroalimentacion, estado, idTema],
//         (resultado) => {
//             if (resultado["affectedRows"] > 0) {
//                 const idSubtemaInsertado = resultado["insertId"];

//                 // Segunda consulta para insertar en usuario_subtema
//                 const insertarEnUsuarioSubtema =
//                     "INSERT INTO tema_subtema (idUsuario, idSubtema) SELECT id, ? FROM usuario;";

//                 sql.ejecutarResSQL(
//                     insertarEnUsuarioSubtema,
//                     [idSubtemaInsertado],
//                     (resultadoUsuarioSubtema) => {
//                         if (resultadoUsuarioSubtema["affectedRows"] > 0) {
//                             return res.status(200).send({
//                                 en: 1,
//                                 m: "Se registró el subtema con éxito",
//                                 idSubtema: idSubtemaInsertado,
//                             });
//                         } else {
//                             return res.status(200).send({ en: -1, m: "No se pudo registrar en usuario_subtema porque faltan subtemas o usuarios" });
//                         }
//                     }
//                 );
//             } else {
//                 return res.status(200).send({ en: -1, m: "No se pudo registrar el subtema" });
//             }
//         }
//     );
// });


//Registrar subtema
router.post("/registrarSubtema", [], (req, res) => {
    let idTema = req.body.idTema;
    let titulo = req.body.titulo;
    let objetivos = req.body.objetivos;
    let descripcion = req.body.descripcion;
    let ejemploCodigo = req.body.ejemploCodigo;
    let recursos = req.body.recursos;
    let retroalimentacion = req.body.retroalimentacion;
    let estado = 1;

    const registrarSubtema =
        "INSERT INTO subtema (titulo, objetivos, descripcion, ejemploCodigo, recursos, retroalimentacion, estado, idTema) VALUES (?, ?, ?, ?, ?, ?, ?, ?);";

    sql.ejecutarResSQL(
        registrarSubtema,
        [titulo, objetivos, descripcion, ejemploCodigo, recursos, retroalimentacion, estado, idTema],
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
                            // Obtener todos los correos de la tabla cuenta
                            const obtenerCorreos = "SELECT email FROM cuenta;";

                            sql.ejecutarResSQL(
                                obtenerCorreos,
                                [],
                                (resultadoCorreos) => {
                                    if (resultadoCorreos.length > 0) {
                                        const asunto = "Nuevo subtema creado en C'amigo";
                                        const mensaje = `
                                            <h3>Se ha creado un nuevo subtema en C'amigo: ${titulo} 🆕</h3>
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
                                            m: "Se registró el subtema con éxito y se enviaron correos de notificación",
                                            idSubtema: idSubtemaInsertado,
                                        });
                                    } else {
                                        return res.status(200).send({
                                            en: 1,
                                            m: "Se registró el subtema con éxito, pero no hay cuentas para notificar",
                                            idSubtema: idSubtemaInsertado,
                                        });
                                    }
                                }
                            );
                        } else {
                            return res.status(200).send({ en: -1, m: "No se pudo registrar en usuario_subtema porque faltan subtemas o usuarios" });
                        }
                    }
                );
            } else {
                return res.status(200).send({ en: -1, m: "No se pudo registrar el subtema" });
            }
        }
    );
});

//Editar subtema

router.post("/editarSubtema", [], (req, res) => {
    let id = req.body.id;
    let titulo = req.body.titulo;
    let objetivos = req.body.objetivos;
    let descripcion = req.body.descripcion;
    let ejemploCodigo = req.body.ejemploCodigo;
    let recursos = req.body.recursos;
    let retroalimentacion = req.body.retroalimentacion;
    let estado = req.body.estado;
    let subtemaEditadoBackend = { id, titulo, objetivos, descripcion, ejemploCodigo, recursos, retroalimentacion, estado };
    const editarSubtema =
        "UPDATE subtema SET titulo = ?, objetivos = ?, descripcion = ?, ejemploCodigo = ?, recursos = ?, retroalimentacion = ?, estado = ? WHERE id = ?;";
    sql.ejecutarResSQL(
        editarSubtema,
        [titulo, objetivos, descripcion, ejemploCodigo, recursos, retroalimentacion, estado, id],
        (resultado) => {
            if (resultado["affectedRows"] > 0)
                return res
                    .status(200)
                    .send({ en: 1, m: "Se editó el subtema con éxito", idSubtema: id, subtemaEditadoBackend });
            return res.status(200).send({ en: -1, m: "No se pudo editar el subtema" });
        }
    );
});

//Activar y desactivar subtema
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

//Listar subtemas
router.post("/listarSubtemas", (req, res) => {
    let idTema = req.body.idTema;
    let idUsuario = req.body.idUsuario;
    let obtenerSubtemas;
    if (req.body.mensaje === "subtemasActivos") {
        obtenerSubtemas =
            `SELECT tema_subtema.idSubtema, tema_subtema.progreso, subtema.titulo, subtema.objetivos, subtema.descripcion, subtema.ejemploCodigo, subtema.recursos, subtema.retroalimentacion, subtema.estado ` +
            `FROM ${BD}.tema_subtema ` +
            `INNER JOIN ${BD}.subtema ON tema_subtema.idSubtema = subtema.id ` +
            `WHERE subtema.idTema = ? AND idUsuario = ? AND estado = 1;`;
    } else {
        obtenerSubtemas =
            `SELECT tema_subtema.idSubtema, tema_subtema.progreso, subtema.titulo, subtema.objetivos, subtema.descripcion, subtema.ejemploCodigo, subtema.recursos, subtema.retroalimentacion, subtema.estado ` +
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
