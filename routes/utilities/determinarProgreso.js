const sql = require("../../config/config");

const calcularYActualizarProgresoEjercicio = (idEjercicio, idUsuario) => {
    return new Promise((resolve, reject) => {
        const calcularProgresoQuery =
            `UPDATE subtema_ejercicio SET progreso = (` +
            `SELECT (SUM(CASE WHEN ejercicio_pregunta.estado_completado = 1 THEN 1 ELSE 0 END) * 100 / COUNT(*)) ` +
            `FROM ejercicio_pregunta JOIN pregunta ON ejercicio_pregunta.idPregunta = pregunta.id ` +
            `WHERE (pregunta.idEjercicio = ? AND ejercicio_pregunta.idUsuario = ?) ` +
            `) WHERE (subtema_ejercicio.idEjercicio = ? AND subtema_ejercicio.idUsuario = ?);`;


        sql.ejecutarResSQL(calcularProgresoQuery, [idEjercicio, idUsuario, idEjercicio, idUsuario], (progresoResultado) => {
            console.log("progresoResultado", progresoResultado);
            if (progresoResultado instanceof Error) {
                console.error("Error al ejecutar la consulta de progreso:", progresoResultado);
                reject("Error interno del servidor al calcular el progreso ejercicio");
            }

            if (progresoResultado["affectedRows"] > 0) {
                // Verificar y actualizar estado_completado si es necesario
                const verificarProgresoQuery = `SELECT progreso FROM subtema_ejercicio WHERE (idEjercicio = ? and idUsuario = ?);`;
                sql.ejecutarResSQL(verificarProgresoQuery, [idEjercicio, idUsuario], (progresoActual) => {
                    if (progresoActual instanceof Error) {
                        console.error("Error al ejecutar la consulta de verificación de progreso:", progresoActual);
                        reject("Error interno del servidor al verificar el progreso ejercicio");
                    }

                    if (progresoActual.length > 0 && progresoActual[0].progreso === 100) {
                        const actualizarEstadoCompletadoQuery = `UPDATE subtema_ejercicio SET estado_completado = 1 WHERE (idEjercicio = ? and idUsuario = ?);`;
                        sql.ejecutarResSQL(actualizarEstadoCompletadoQuery, [idEjercicio, idUsuario], (actualizarEstadoResultado) => {
                            if (actualizarEstadoResultado instanceof Error) {
                                console.error("Error al ejecutar la consulta de actualización de estado_completado:", actualizarEstadoResultado);
                                reject("Error interno del servidor al actualizar el estado_completado ejercicio");
                            }

                            if (actualizarEstadoResultado["affectedRows"] > 0) {
                                const mensaje = "Ejercicio completado y progreso actualizado ejercicio";
                                const progresoEjercicio = progresoActual[0].progreso;
                                console.log("progresoEjercicio", progresoEjercicio);
                                resolve({ mensaje, progresoEjercicio });
                            } else {
                                reject("No se pudo actualizar el estado_completado ejercicio");
                            }
                        });
                    } else {
                        const mensaje = "El progreso aún no ha llegado al 100% - ejercicio";
                        const progresoEjercicio = progresoActual[0].progreso;
                        console.log("progresoEjercicio", progresoEjercicio);
                        resolve({ mensaje, progresoEjercicio });

                    }
                });
            } else {
                reject("No se pudo calcular el progreso  ejercicio");
            }
        });
    });
};


const calcularYActualizarProgresoSubtema = (idSubtema, idUsuario) => {
    return new Promise((resolve, reject) => {
        const calcularProgresoQuery =
            `UPDATE tema_subtema SET progreso = (` +
            `SELECT (SUM(CASE WHEN subtema_ejercicio.estado_completado = 1 THEN 1 ELSE 0 END) * 100 / COUNT(*)) ` +
            `FROM subtema_ejercicio JOIN ejercicio ON subtema_ejercicio.idEjercicio = ejercicio.id ` +
            `WHERE (ejercicio.idSubtema = ? AND subtema_ejercicio.idUsuario = ?) ` +
            `) WHERE (tema_subtema.idSubtema = ? AND tema_subtema.idUsuario = ?);`;
        sql.ejecutarResSQL(calcularProgresoQuery, [idSubtema, idUsuario, idSubtema, idUsuario], (progresoResultado) => {
            if (progresoResultado instanceof Error) {
                console.error("Error al ejecutar la consulta de progreso:", progresoResultado);
                reject("Error interno del servidor al calcular el progreso  del subtema");
            }

            if (progresoResultado["affectedRows"] > 0) {
                // Verificar y actualizar estado_completado si es necesario
                const verificarProgresoQuery = `SELECT progreso FROM tema_subtema WHERE (idSubtema = ? AND idUsuario = ?);`;
                sql.ejecutarResSQL(verificarProgresoQuery, [idSubtema, idUsuario], (progresoActual) => {
                    console.log("progresoActual subtema", progresoActual);
                    if (progresoActual instanceof Error) {
                        console.error("Error al ejecutar la consulta de verificación de progreso:", progresoActual);
                        reject("Error interno del servidor al verificar el progreso del subtema");
                    }

                    if (progresoActual.length > 0 && progresoActual[0].progreso === 100) {
                        const actualizarEstadoCompletadoQuery = `UPDATE tema_subtema SET estado_completado = 1 WHERE (idSubtema = ? AND idUsuario = ?);`;
                        sql.ejecutarResSQL(actualizarEstadoCompletadoQuery, [idSubtema, idUsuario], (actualizarEstadoResultado) => {
                            if (actualizarEstadoResultado instanceof Error) {
                                console.error("Error al ejecutar la consulta de actualización de estado_completado:", actualizarEstadoResultado);
                                reject("Error interno del servidor al actualizar el estado_completado del subtema");
                            }

                            if (actualizarEstadoResultado["affectedRows"] > 0) {
                                const mensaje = "Subtema completado y progreso actualizado del subtema";
                                const progresoSubtema = progresoActual[0].progreso;
                                resolve({ mensaje, progresoSubtema });
                            } else {
                                reject("No se pudo actualizar el estado_completado del subtema");
                            }
                        });
                    } else {
                        resolve("El progreso aún no ha llegado al 100% - Subtema");
                    }
                });
            } else {
                reject("No se pudo calcular el progreso del subtema");
            }
        });
    });
};

const calcularYActualizarProgresoTema = (idTema, idUsuario) => {
    return new Promise((resolve, reject) => {
        const calcularProgresoQuery =
            `UPDATE usuario_tema SET progreso = (` +
            `SELECT (SUM(CASE WHEN tema_subtema.estado_completado = 1 THEN 1 ELSE 0 END) * 100 / COUNT(*)) ` +
            `FROM tema_subtema JOIN subtema ON tema_subtema.idSubtema = subtema.id ` +
            `WHERE (subtema.idTema = ? AND tema_subtema.idUsuario = ?) ` +
            `) WHERE (usuario_tema.idTema = ? AND usuario_tema.idUsuario = ?);`;

        sql.ejecutarResSQL(calcularProgresoQuery, [idTema, idUsuario, idTema, idUsuario], (progresoResultado) => {
            if (progresoResultado instanceof Error) {
                console.error("Error al ejecutar la consulta de progreso:", progresoResultado);
                reject("Error interno del servidor al calcular el progreso del tema");
            }

            if (progresoResultado["affectedRows"] > 0) {
                // Verificar y actualizar estado_completado si es necesario
                const verificarProgresoQuery = `SELECT progreso FROM usuario_tema WHERE (idTema = ? and idUsuario = ?);`;
                sql.ejecutarResSQL(verificarProgresoQuery, [idTema, idUsuario], (progresoActual) => {
                    console.log("progresoActual tema", progresoActual);
                    if (progresoActual instanceof Error) {
                        console.error("Error al ejecutar la consulta de verificación de progreso:", progresoActual);
                        reject("Error interno del servidor al verificar el progreso del tema");
                    }

                    if (progresoActual.length > 0 && progresoActual[0].progreso === 100) {
                        const actualizarEstadoCompletadoQuery = `UPDATE usuario_tema SET estado_completado = 1 WHERE (idTema = ? and idUsuario = ?);`;
                        sql.ejecutarResSQL(actualizarEstadoCompletadoQuery, [idTema, idUsuario], (actualizarEstadoResultado) => {
                            if (actualizarEstadoResultado instanceof Error) {
                                console.error("Error al ejecutar la consulta de actualización de estado_completado:", actualizarEstadoResultado);
                                reject("Error interno del servidor al actualizar el estado_completado del tema");
                            }

                            if (actualizarEstadoResultado["affectedRows"] > 0) {
                                const mensaje = "Tema completado y progreso actualizado del tema";
                                const progresoTema = progresoActual[0].progreso;
                                resolve({ mensaje, progresoTema });
                            } else {
                                reject("No se pudo actualizar el estado_completado del tema");
                            }
                        });
                    } else {
                        resolve("El progreso aún no ha llegado al 100% - Tema");
                    }
                });
            } else {
                reject("No se pudo calcular el progreso del tema");
            }
        });
    });
};


const calcularYActualizarProgresoGeneral = (idUsuario) => {
    return new Promise((resolve, reject) => {
        const calcularProgresoQuery =
            `UPDATE usuario SET progreso = ` +
            `(SELECT (SUM(CASE WHEN usuario_tema.estado_completado = 1 THEN 1 ELSE 0 END) * 100 / COUNT(*)) ` +
            `FROM usuario_tema WHERE (usuario_tema.idUsuario = ?) ) ` +
            `WHERE id = ?;`;

        sql.ejecutarResSQL(calcularProgresoQuery, [idUsuario, idUsuario], (progresoResultado) => {
            if (progresoResultado instanceof Error) {
                console.error("Error al ejecutar la consulta de progreso:", progresoResultado);
                reject("Error interno del servidor al calcular el progreso del usuario");
            }

            if (progresoResultado["affectedRows"] > 0) {
                const verificarProgresoQuery = `SELECT progreso FROM usuario WHERE id = ?;`;
                sql.ejecutarResSQL(verificarProgresoQuery, [idUsuario], (progresoActual) => {
                    console.log("progresoActual usuario", progresoActual);
                    if (progresoActual instanceof Error) {
                        console.error("Error al ejecutar la consulta de verificación de progreso:", progresoActual);
                        reject("Error interno del servidor al verificar el progreso del tema");
                    }
                    if (progresoActual.length > 0) {
                        const mensaje = "Progreso general determinado y actualizado del usuario";
                        const progresoUsuario = progresoActual[0].progreso;
                        resolve({ mensaje, progresoUsuario });
                    } else {
                        resolve("El progreso aún no ha llegado al 100% - Tema");
                    }
                });
            } else {
                reject("No se pudo calcular el progreso del usuario");
            }
        });
    });
};

module.exports = { calcularYActualizarProgresoEjercicio, calcularYActualizarProgresoSubtema, calcularYActualizarProgresoTema, calcularYActualizarProgresoGeneral };