const router = require("express").Router();
const sql = require("../../config/config");

// router.post("/registrarPeriodoAcademico", [], async (req, res) => {
//     let mesInicio = req.body.mesInicio;
//     let mesFin = req.body.mesFin;
//     let anio = req.body.anio;

//     const registrarPeriodo = "INSERT INTO periodo_academico (mesInicio, mesFin, anio) VALUES (?, ?, ?);";

//     sql.ejecutarResSQL(registrarPeriodo, [mesInicio, mesFin, anio], (resultado) => {
//         if (resultado["affectedRows"] > 0) {
//             copiaSeguridadPeriodoAnterior(res, resultado["insertId"]);
//         } else {
//             return res.status(500).send({ en: -1, m: "No se pudo registrar el periodo académico" });
//         }
//     });
// });

// //Obtener los periodos académicos registrados
// router.post("/listarPeriodosAcademicosAnteriores", [], async (req, res) => {
//     const queryPeriodosAcademicos = `
//         SELECT id, mesInicio, mesFin, anio 
//         FROM periodo_academico 
//         WHERE id != (SELECT MAX(id) FROM periodo_academico)
//         ORDER BY id DESC;
//     `;

//     sql.ejecutarResSQL(queryPeriodosAcademicos, [], (resultado) => {
//         if (resultado && !resultado.error) {
//             return res.status(200).send({
//                 en: 1,
//                 m: "Lista de períodos académicos anteriores",
//                 periodos: resultado
//             });
//         } else {
//             return res.status(500).send({
//                 en: -1,
//                 m: "Error al obtener la lista de períodos académicos anteriores",
//                 error: resultado.error
//             });
//         }
//     });
// });


// router.get("/periodoAcademicoActual", [], async (req, res) => {
//     const query = `
//         SELECT id, mesInicio, mesFin, anio 
//         FROM periodo_academico 
//         ORDER BY id DESC 
//         LIMIT 1;
//     `;

//     sql.ejecutarResSQL(query, [], (resultado) => {
//         if (resultado && resultado.length > 0 && !resultado.error) {
//             return res.status(200).send({
//                 en: 1,
//                 m: "Periodo académico actual obtenido con éxito",
//                 periodoActual: resultado[0]
//             });
//         } else {
//             return res.status(500).send({
//                 en: -1,
//                 m: "Error al obtener el periodo académico actual",
//                 error: resultado.error || "No se encontraron periodos académicos"
//             });
//         }
//     });
// });

router.post("/registrarPeriodoAcademico", [], async (req, res) => {
    let mesInicio = req.body.mesInicio;
    let mesFin = req.body.mesFin;

    const registrarPeriodo = "INSERT INTO periodo_academico (mesInicio, mesFin) VALUES (?, ?);";

    sql.ejecutarResSQL(registrarPeriodo, [mesInicio, mesFin], (resultado) => {
        if (resultado["affectedRows"] > 0) {
            copiaSeguridadPeriodoAnterior(res, resultado["insertId"]);
        } else {
            return res.status(500).send({ en: -1, m: "No se pudo registrar el periodo académico" });
        }
    });
});

router.post("/listarPeriodosAcademicosAnteriores", [], async (req, res) => {
    const queryPeriodosAcademicos = `
        SELECT id, DATE_FORMAT(mesInicio, '%Y-%m-%d') as mesInicio, 
               DATE_FORMAT(mesFin, '%Y-%m-%d') as mesFin
        FROM periodo_academico 
        WHERE id != (SELECT MAX(id) FROM periodo_academico)
        ORDER BY id DESC;
    `;

    sql.ejecutarResSQL(queryPeriodosAcademicos, [], (resultado) => {
        if (resultado && !resultado.error) {
            return res.status(200).send({
                en: 1,
                m: "Lista de períodos académicos anteriores",
                periodos: resultado
            });
        } else {
            return res.status(500).send({
                en: -1,
                m: "Error al obtener la lista de períodos académicos anteriores",
                error: resultado.error
            });
        }
    });
});

router.get("/periodoAcademicoActual", [], async (req, res) => {
    const query = `
        SELECT id, DATE_FORMAT(mesInicio, '%Y-%m-%d') as mesInicio, 
               DATE_FORMAT(mesFin, '%Y-%m-%d') as mesFin
        FROM periodo_academico 
        ORDER BY id DESC 
        LIMIT 1;
    `;

    sql.ejecutarResSQL(query, [], (resultado) => {
        if (resultado && resultado.length > 0 && !resultado.error) {
            return res.status(200).send({
                en: 1,
                m: "Periodo académico actual obtenido con éxito",
                periodoActual: resultado[0]
            });
        } else {
            return res.status(500).send({
                en: -1,
                m: "Error al obtener el periodo académico actual",
                error: resultado.error || "No se encontraron periodos académicos"
            });
        }
    });
});

router.post("/resumenProgresoUsuarios", [], async (req, res) => {
    const { idPeriodoAcademico } = req.body;
    const query = `
        SELECT 
            u.id AS idUsuario,
            p.nombres AS usuario,
            pu.progreso AS progresoGeneral,
            AVG(pt.progreso) AS promedioTemas,
            AVG(ps.progreso) AS promedioSubtemas,
            AVG(pe.progreso) AS promedioEjercicios
        FROM usuario u
        JOIN persona p ON u.persona_id = p.id
        JOIN rol r ON u.rol_id = r.id
        JOIN periodo_usuario pu ON u.id = pu.idUsuario
        LEFT JOIN periodo_tema pt ON pu.id = pt.idPeriodoUsuario
        LEFT JOIN periodo_subtema ps ON pt.id = ps.idPeriodoTema
        LEFT JOIN periodo_ejercicio pe ON ps.id = pe.idPeriodoSubtema
        WHERE pu.idPeriodoAcademico = ?
        AND r.tipo = 'estudiante'
        GROUP BY u.id, p.nombres, pu.progreso
    `;

    sql.ejecutarResSQL(query, [idPeriodoAcademico], (resultado) => {
        if (resultado && !resultado.error) {
            const resumenFormateado = resultado.map(row => ({
                idUsuario: row.idUsuario,
                usuario: row.usuario,
                progresoGeneral: parseFloat(row.progresoGeneral).toFixed(2),
                promedioTemas: parseFloat(row.promedioTemas).toFixed(2),
                promedioSubtemas: parseFloat(row.promedioSubtemas).toFixed(2),
                promedioEjercicios: parseFloat(row.promedioEjercicios).toFixed(2)
            }));

            return res.status(200).send({
                en: 1,
                m: "Resumen de progreso de estudiantes",
                resumen: resumenFormateado
            });
        } else {
            return res.status(500).send({
                en: -1,
                m: "Error al obtener el resumen de progreso de estudiantes",
                error: resultado.error
            });
        }
    });
});


router.post("/detallesProgresoCompleto", [], async (req, res) => {
    const { idPeriodoAcademico, idUsuario } = req.body;
    const query = `
        SELECT 
            t.id AS idTema,
            t.titulo AS tema,
            pt.progreso AS progresoTema,
            s.id AS idSubtema,
            s.titulo AS subtema,
            ps.progreso AS progresoSubtema,
            e.id AS idEjercicio,
            e.titulo AS ejercicio,
            pe.progreso AS progresoEjercicio
        FROM periodo_tema pt
        JOIN tema t ON pt.idTema = t.id
        JOIN periodo_usuario pu ON pt.idPeriodoUsuario = pu.id
        LEFT JOIN periodo_subtema ps ON ps.idPeriodoTema = pt.id
        LEFT JOIN subtema s ON ps.idSubtema = s.id
        LEFT JOIN periodo_ejercicio pe ON pe.idPeriodoSubtema = ps.id
        LEFT JOIN ejercicio e ON pe.idEjercicio = e.id
        WHERE pu.idPeriodoAcademico = ? AND pu.idUsuario = ?
        ORDER BY t.id, s.id, e.id
    `;

    sql.ejecutarResSQL(query, [idPeriodoAcademico, idUsuario], (resultado) => {
        if (resultado && !resultado.error) {
            const detallesEstructurados = estructurarResultados(resultado);
            return res.status(200).send({
                en: 1,
                m: "Detalles de progreso completo",
                detalles: detallesEstructurados
            });
        } else {
            return res.status(500).send({
                en: -1,
                m: "Error al obtener los detalles de progreso",
                error: resultado.error
            });
        }
    });
});

// router.post("/resumenProgresoUsuariosActual", [], async (req, res) => {
//     const queryPeriodoActual = `
//         SELECT id, mesInicio, mesFin, anio
//         FROM periodo_academico
//         ORDER BY id DESC
//         LIMIT 1;
//     `;

//     sql.ejecutarResSQL(queryPeriodoActual, [], (resultadoPeriodo) => {
//         if (resultadoPeriodo && resultadoPeriodo.length > 0 && !resultadoPeriodo.error) {
//             const idPeriodoActual = resultadoPeriodo[0].id;

//             const query = `
//                 SELECT 
//                     u.id AS idUsuario,
//                     p.nombres AS usuario,
//                     u.progreso AS progresoGeneral,
//                     AVG(COALESCE(ts.progreso, 0)) AS promedioTemas,
//                     AVG(COALESCE(se.progreso, 0)) AS promedioSubtemas,
//                     AVG(COALESCE(se.progreso, 0)) AS promedioEjercicios
//                 FROM usuario u
//                 JOIN persona p ON u.persona_id = p.id
//                 JOIN rol r ON u.rol_id = r.id
//                 LEFT JOIN tema_subtema ts ON u.id = ts.idUsuario
//                 LEFT JOIN subtema_ejercicio se ON u.id = se.idUsuario
//                 WHERE r.id = 1
//                 GROUP BY u.id, p.nombres, u.progreso
//             `;

//             sql.ejecutarResSQL(query, [], (resultado) => {
//                 if (resultado && !resultado.error) {
//                     const resumenFormateado = resultado.map(row => ({
//                         idUsuario: row.idUsuario,
//                         usuario: row.usuario,
//                         progresoGeneral: parseFloat(row.progresoGeneral).toFixed(2),
//                         promedioTemas: parseFloat(row.promedioTemas).toFixed(2),
//                         promedioSubtemas: parseFloat(row.promedioSubtemas).toFixed(2),
//                         promedioEjercicios: parseFloat(row.promedioEjercicios).toFixed(2)
//                     }));

//                     return res.status(200).send({
//                         en: 1,
//                         m: "Resumen de progreso de usuarios con rol_id 1 (período actual)",
//                         resumen: resumenFormateado
//                     });
//                 } else {
//                     return res.status(500).send({
//                         en: -1,
//                         m: "Error al obtener el resumen de progreso de usuarios con rol_id 1 (período actual)",
//                         error: resultado.error
//                     });
//                 }
//             });
//         } else {
//             return res.status(500).send({
//                 en: -1,
//                 m: "Error al obtener el periodo académico actual",
//                 error: resultadoPeriodo.error || "No se encontraron periodos académicos"
//             });
//         }
//     });
// });

router.post("/resumenProgresoUsuariosActual", [], async (req, res) => {
    const queryPeriodoActual = `
        SELECT id, 
               DATE_FORMAT(mesInicio, '%Y-%m-%d') as mesInicio, 
               DATE_FORMAT(mesFin, '%Y-%m-%d') as mesFin
        FROM periodo_academico
        ORDER BY id DESC
        LIMIT 1;
    `;

    sql.ejecutarResSQL(queryPeriodoActual, [], (resultadoPeriodo) => {
        if (resultadoPeriodo && resultadoPeriodo.length > 0 && !resultadoPeriodo.error) {
            const idPeriodoActual = resultadoPeriodo[0].id;

            const query = `
                SELECT 
                    u.id AS idUsuario,
                    p.nombres AS usuario,
                    u.progreso AS progresoGeneral,
                    AVG(COALESCE(ts.progreso, 0)) AS promedioTemas,
                    AVG(COALESCE(se.progreso, 0)) AS promedioSubtemas,
                    AVG(COALESCE(se.progreso, 0)) AS promedioEjercicios
                FROM usuario u
                JOIN persona p ON u.persona_id = p.id
                JOIN rol r ON u.rol_id = r.id
                LEFT JOIN tema_subtema ts ON u.id = ts.idUsuario
                LEFT JOIN subtema_ejercicio se ON u.id = se.idUsuario
                WHERE r.id = 1
                GROUP BY u.id, p.nombres, u.progreso
            `;

            sql.ejecutarResSQL(query, [], (resultado) => {
                if (resultado && !resultado.error) {
                    const resumenFormateado = resultado.map(row => ({
                        idUsuario: row.idUsuario,
                        usuario: row.usuario,
                        progresoGeneral: parseFloat(row.progresoGeneral).toFixed(2),
                        promedioTemas: parseFloat(row.promedioTemas).toFixed(2),
                        promedioSubtemas: parseFloat(row.promedioSubtemas).toFixed(2),
                        promedioEjercicios: parseFloat(row.promedioEjercicios).toFixed(2)
                    }));

                    return res.status(200).send({
                        en: 1,
                        m: "Resumen de progreso de usuarios con rol_id 1 (período actual)",
                        periodoActual: {
                            id: resultadoPeriodo[0].id,
                            mesInicio: resultadoPeriodo[0].mesInicio,
                            mesFin: resultadoPeriodo[0].mesFin
                        },
                        resumen: resumenFormateado
                    });
                } else {
                    return res.status(500).send({
                        en: -1,
                        m: "Error al obtener el resumen de progreso de usuarios con rol_id 1 (período actual)",
                        error: resultado.error
                    });
                }
            });
        } else {
            return res.status(500).send({
                en: -1,
                m: "Error al obtener el periodo académico actual",
                error: resultadoPeriodo.error || "No se encontraron periodos académicos"
            });
        }
    });
});


//---------------------------FUNCIONES--------------------------------
function copiaSeguridadPeriodoAnterior(res, idPeriodoActual) {
    const queryPeriodoAnterior = "SELECT id FROM periodo_academico WHERE id < ? ORDER BY id DESC LIMIT 1;";

    sql.ejecutarResSQL(queryPeriodoAnterior, [idPeriodoActual], (resultado) => {
        if (resultado && resultado.length > 0) {
            const idPeriodoAnterior = resultado[0].id;
            ejecutarCopiaSeguridad(res, idPeriodoAnterior, idPeriodoActual);
        } else {
            return res.status(200).send({
                en: 1,
                m: "Se registró el periodo académico. No se realizó copia de seguridad por ser el primer periodo.",
                idPeriodoAcademico: idPeriodoActual
            });
        }
    });
}

function ejecutarCopiaSeguridad(res, idPeriodoAnterior, idPeriodoActual) {
    const queries = [
        // Realizar copia de seguridad del progreso de usuario
        `INSERT INTO periodo_usuario (idUsuario, idPeriodoAcademico, progreso) 
         SELECT u.id, ?, u.progreso FROM usuario u;`,

        // Realizar copia de seguridad del progreso de usuario_tema
        `INSERT INTO periodo_tema (idTema, idPeriodoUsuario, progreso) 
         SELECT t.id, pu.id, COALESCE(ut.progreso, 0) 
         FROM tema t 
         CROSS JOIN periodo_usuario pu 
         LEFT JOIN usuario_tema ut ON ut.idTema = t.id AND ut.idUsuario = pu.idUsuario 
         WHERE pu.idPeriodoAcademico = ?;`,

        // Realizar copia de seguridad del progreso de tema_subtema
        `INSERT INTO periodo_subtema (idSubtema, idPeriodoTema, progreso) 
         SELECT s.id, pt.id, COALESCE(ts.progreso, 0) 
         FROM subtema s 
         JOIN tema t ON s.idTema = t.id 
         CROSS JOIN periodo_usuario pu 
         JOIN periodo_tema pt ON pt.idTema = t.id AND pt.idPeriodoUsuario = pu.id 
         LEFT JOIN tema_subtema ts ON ts.idSubtema = s.id AND ts.idUsuario = pu.idUsuario 
         WHERE pu.idPeriodoAcademico = ?;`,

        // Realizar copia de seguridad del progreso de subtema_ejercicio
        `INSERT INTO periodo_ejercicio (idEjercicio, idPeriodoSubtema, progreso) 
         SELECT e.id, ps.id, COALESCE(se.progreso, 0) 
         FROM ejercicio e 
         JOIN subtema s ON e.idSubtema = s.id 
         JOIN tema t ON s.idTema = t.id 
         CROSS JOIN periodo_usuario pu 
         JOIN periodo_tema pt ON pt.idTema = t.id AND pt.idPeriodoUsuario = pu.id 
         JOIN periodo_subtema ps ON ps.idSubtema = s.id AND ps.idPeriodoTema = pt.id 
         LEFT JOIN subtema_ejercicio se ON se.idEjercicio = e.id AND se.idUsuario = pu.idUsuario 
         WHERE pu.idPeriodoAcademico = ?;`,

        // Actualizar el progreso de usuario a 0
        `UPDATE usuario u
        SET u.progreso = 0;`,

        // Actualizar el progreso y estado_completado de usuario_tema
        `UPDATE usuario_tema ut
        SET ut.progreso = 0, 
        ut.estado_completado = -1`,

        // Actualizar el progreso y estado_completado de tema_subtema
        `UPDATE tema_subtema ts
        SET ts.progreso = 0,
        ts.estado_completado = -1`,

        // Actualizar el estado_completado de subtema_ejercicio
        `UPDATE subtema_ejercicio se
        SET se.progreso = 0,
        se.estado_completado = -1`,

        // Actualizar el estado_completado de ejercicio_pregunta
        `UPDATE ejercicio_pregunta ep
        SET ep.estado_completado = -1`
    ];

    ejecutarQueries(queries, 0, idPeriodoAnterior, res, idPeriodoActual);
}

function ejecutarQueries(queries, index, idPeriodoAnterior, res, idPeriodoActual) {
    if (index >= queries.length) {
        return res.status(200).send({
            en: 1,
            m: "Se registró el nuevo periodo académico y se realizó la copia de seguridad del periodo anterior con éxito",
            idPeriodoAcademico: idPeriodoActual,
            idPeriodoAnterior: idPeriodoAnterior
        });
    }

    sql.ejecutarResSQL(queries[index], [idPeriodoAnterior], (resultado) => {
        if (resultado && !resultado.error) {
            ejecutarQueries(queries, index + 1, idPeriodoAnterior, res, idPeriodoActual);
        } else {
            return res.status(500).send({
                en: -1,
                m: `Error en la copia de seguridad en el paso ${index + 1}`,
                error: resultado.error
            });
        }
    });
}

function estructurarResultados(resultados) {
    const temas = {};

    resultados.forEach(row => {
        if (!temas[row.idTema]) {
            temas[row.idTema] = {
                tema: row.tema,
                progreso: row.progresoTema,
                subtemas: {}
            };
        }

        if (row.idSubtema) {
            if (!temas[row.idTema].subtemas[row.idSubtema]) {
                temas[row.idTema].subtemas[row.idSubtema] = {
                    subtema: row.subtema,
                    progreso: row.progresoSubtema,
                    ejercicios: []
                };
            }

            if (row.idEjercicio) {
                temas[row.idTema].subtemas[row.idSubtema].ejercicios.push({
                    ejercicio: row.ejercicio,
                    progreso: row.progresoEjercicio
                });
            }
        }
    });

    return Object.values(temas).map(tema => ({
        ...tema,
        subtemas: Object.values(tema.subtemas)
    }));
}

module.exports = router;