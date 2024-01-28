const sql = require("../../config/config");

const calcularYActualizarProgresoEjercicio = (id) => {
    return new Promise((resolve, reject) => {
        const calcularProgresoQuery =
            `UPDATE ejercicio SET progreso = ` +
            `(SELECT (COUNT(*) / (SELECT COUNT(*) FROM pregunta WHERE idEjercicio = ?)) * 100 FROM pregunta WHERE idEjercicio = ? AND estado_completado = 1) ` +
            `WHERE id = ?;`;

        sql.ejecutarResSQL(calcularProgresoQuery, [id, id, id], (progresoResultado) => {
            if (progresoResultado instanceof Error) {
                console.error("Error al ejecutar la consulta de progreso:", progresoResultado);
                reject("Error interno del servidor al calcular el progreso");
            }

            if (progresoResultado["affectedRows"] > 0) {
                // Verificar y actualizar estado_completado si es necesario
                const verificarProgresoQuery = `SELECT progreso FROM ejercicio WHERE id = ?;`;
                sql.ejecutarResSQL(verificarProgresoQuery, [id], (progresoActual) => {
                    if (progresoActual instanceof Error) {
                        console.error("Error al ejecutar la consulta de verificación de progreso:", progresoActual);
                        reject("Error interno del servidor al verificar el progreso");
                    }

                    if (progresoActual.length > 0 && progresoActual[0].progreso === 100) {
                        const actualizarEstadoCompletadoQuery = `UPDATE ejercicio SET estado_completado = 1 WHERE id = ?;`;
                        sql.ejecutarResSQL(actualizarEstadoCompletadoQuery, [id], (actualizarEstadoResultado) => {
                            if (actualizarEstadoResultado instanceof Error) {
                                console.error("Error al ejecutar la consulta de actualización de estado_completado:", actualizarEstadoResultado);
                                reject("Error interno del servidor al actualizar el estado_completado");
                            }

                            if (actualizarEstadoResultado["affectedRows"] > 0) {
                                resolve("Elemento completado y progreso actualizado");
                            } else {
                                reject("No se pudo actualizar el estado_completado");
                            }
                        });
                    } else {
                        resolve("El progreso aún no ha llegado al 100% - Ejercicio");
                    }
                });
            } else {
                reject("No se pudo calcular el progreso");
            }
        });
    });
};


const calcularYActualizarProgresoSubtema = (id) => {
    return new Promise((resolve, reject) => {
        const calcularProgresoQuery =
            `UPDATE subtema SET progreso = ` +
            `(SELECT (COUNT(*) / (SELECT COUNT(*) FROM ejercicio WHERE idSubtema = ?)) * 100 FROM ejercicio WHERE idSubtema = ? AND estado_completado = 1) ` +
            `WHERE id = ?;`;

        sql.ejecutarResSQL(calcularProgresoQuery, [id, id, id], (progresoResultado) => {
            if (progresoResultado instanceof Error) {
                console.error("Error al ejecutar la consulta de progreso:", progresoResultado);
                reject("Error interno del servidor al calcular el progreso");
            }

            if (progresoResultado["affectedRows"] > 0) {
                // Verificar y actualizar estado_completado si es necesario
                const verificarProgresoQuery = `SELECT progreso FROM subtema WHERE id = ?;`;
                sql.ejecutarResSQL(verificarProgresoQuery, [id], (progresoActual) => {
                    console.log("progresoActual subtema", progresoActual);
                    if (progresoActual instanceof Error) {
                        console.error("Error al ejecutar la consulta de verificación de progreso:", progresoActual);
                        reject("Error interno del servidor al verificar el progreso");
                    }

                    if (progresoActual.length > 0 && progresoActual[0].progreso === 100) {
                        const actualizarEstadoCompletadoQuery = `UPDATE subtema SET estado_completado = 1 WHERE id = ?;`;
                        sql.ejecutarResSQL(actualizarEstadoCompletadoQuery, [id], (actualizarEstadoResultado) => {
                            if (actualizarEstadoResultado instanceof Error) {
                                console.error("Error al ejecutar la consulta de actualización de estado_completado:", actualizarEstadoResultado);
                                reject("Error interno del servidor al actualizar el estado_completado");
                            }

                            if (actualizarEstadoResultado["affectedRows"] > 0) {
                                resolve("Elemento completado y progreso actualizado");
                            } else {
                                reject("No se pudo actualizar el estado_completado");
                            }
                        });
                    } else {
                        resolve("El progreso aún no ha llegado al 100% - Subtema");
                    }
                });
            } else {
                reject("No se pudo calcular el progreso");
            }
        });
    });
};

const calcularYActualizarProgresoTema = (id) => {
    return new Promise((resolve, reject) => {
        const calcularProgresoQuery =
            `UPDATE tema SET progreso = ` +
            `(SELECT (COUNT(*) / (SELECT COUNT(*) FROM subtema WHERE idTema = ?)) * 100 FROM subtema WHERE idTema = ? AND estado_completado = 1) ` +
            `WHERE id = ?;`;

        sql.ejecutarResSQL(calcularProgresoQuery, [id, id, id], (progresoResultado) => {
            if (progresoResultado instanceof Error) {
                console.error("Error al ejecutar la consulta de progreso:", progresoResultado);
                reject("Error interno del servidor al calcular el progreso");
            }

            if (progresoResultado["affectedRows"] > 0) {
                // Verificar y actualizar estado_completado si es necesario
                const verificarProgresoQuery = `SELECT progreso FROM tema WHERE id = ?;`;
                sql.ejecutarResSQL(verificarProgresoQuery, [id], (progresoActual) => {
                    console.log("progresoActual tema", progresoActual);
                    if (progresoActual instanceof Error) {
                        console.error("Error al ejecutar la consulta de verificación de progreso:", progresoActual);
                        reject("Error interno del servidor al verificar el progreso");
                    }

                    if (progresoActual.length > 0 && progresoActual[0].progreso === 100) {
                        const actualizarEstadoCompletadoQuery = `UPDATE tema SET estado_completado = 1 WHERE id = ?;`;
                        sql.ejecutarResSQL(actualizarEstadoCompletadoQuery, [id], (actualizarEstadoResultado) => {
                            if (actualizarEstadoResultado instanceof Error) {
                                console.error("Error al ejecutar la consulta de actualización de estado_completado:", actualizarEstadoResultado);
                                reject("Error interno del servidor al actualizar el estado_completado");
                            }

                            if (actualizarEstadoResultado["affectedRows"] > 0) {
                                resolve("Elemento completado y progreso actualizado");
                            } else {
                                reject("No se pudo actualizar el estado_completado");
                            }
                        });
                    } else {
                        resolve("El progreso aún no ha llegado al 100% - Tema");
                    }
                });
            } else {
                reject("No se pudo calcular el progreso");
            }
        });
    });
};


const calcularYActualizarProgresoGeneral = (id) => {
    return new Promise((resolve, reject) => {
        const calcularProgresoQuery =
            `UPDATE usuario SET progreso = ` +
            `(SELECT (COUNT(*) / (SELECT COUNT(*) FROM tema WHERE idUsuario = ?)) * 100 FROM tema WHERE idUsuario = ? AND estado_completado = 1) ` +
            `WHERE id = ?;`;

        sql.ejecutarResSQL(calcularProgresoQuery, [id, id, id], (progresoResultado) => {
            if (progresoResultado instanceof Error) {
                console.error("Error al ejecutar la consulta de progreso:", progresoResultado);
                reject("Error interno del servidor al calcular el progreso");
            }

            if (progresoResultado["affectedRows"] > 0) {
                const verificarProgresoQuery = `SELECT progreso FROM usuario WHERE id = ?;`;
                sql.ejecutarResSQL(verificarProgresoQuery, [id], (progresoActual) => {
                    console.log("progresoActual usuario", progresoActual);
                    if (progresoActual instanceof Error) {
                        console.error("Error al ejecutar la consulta de verificación de progreso:", progresoActual);
                        reject("Error interno del servidor al verificar el progreso");
                    }

                    if (progresoActual.length > 0 && progresoActual[0].progreso === 100) {
                        const actualizarEstadoCompletadoQuery = `UPDATE usuario SET estado_completado = 1 WHERE id = ?;`;
                        sql.ejecutarResSQL(actualizarEstadoCompletadoQuery, [id], (actualizarEstadoResultado) => {
                            if (actualizarEstadoResultado instanceof Error) {
                                console.error("Error al ejecutar la consulta de actualización de estado_completado:", actualizarEstadoResultado);
                                reject("Error interno del servidor al actualizar el estado_completado");
                            }

                            if (actualizarEstadoResultado["affectedRows"] > 0) {
                                resolve("Elemento completado y progreso actualizado");
                            } else {
                                reject("No se pudo actualizar el estado_completado");
                            }
                        });
                    } else {
                        resolve("El progreso aún no ha llegado al 100% - Usuario");
                    }
                });
            } else {
                reject("No se pudo calcular el progreso");
            }
        });
    });
};

module.exports = { calcularYActualizarProgresoEjercicio, calcularYActualizarProgresoSubtema, calcularYActualizarProgresoTema, calcularYActualizarProgresoGeneral };