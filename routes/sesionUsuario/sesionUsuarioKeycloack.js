const router = require("express").Router();
const sql = require("../../config/config");


router.post('/registrarUsuarioAerobaseComoUsuarioExterno', (req, res) => {
    //registrar usuario en mi bd cuando ya existe en aerobase (usuario nuevo del todo)
    const { nombres, apellidos, email, tipoRol } = req.body;
    console.log(req.body);

    const crearCuenta = "INSERT INTO cuenta (email, clave, usuarioAerobase) VALUES (?, 'aerobasePassword', 1);";
    sql.ejecutarResSQL(crearCuenta, [email], (resultadoCuenta) => {
        // Obtener el ID de la cuenta recién creada
        const idCuenta = resultadoCuenta.insertId;
        console.log(idCuenta);

        // Crear un nuevo registro en la tabla persona
        const crearPersona = "INSERT INTO persona (nombres, apellidos) VALUES (?, ?);";
        sql.ejecutarResSQL(crearPersona, [nombres, apellidos], (resultadoPersona) => {
            // Obtener el ID de la persona recién creada
            const idPersona = resultadoPersona.insertId;
            console.log("idPersona: ", idPersona);

            // Obtener el ID del rol basado en el tipo de rol proporcionado
            const obtenerIdRol = "SELECT id FROM rol WHERE tipo = ?;";
            sql.ejecutarResSQL(obtenerIdRol, [tipoRol], (resultadoIdRol) => {
                if (resultadoIdRol.length > 0) {
                    const idRol = resultadoIdRol[0].id;
                    console.log("idRol: ", idRol);
                    // Crear un nuevo usuario
                    const crearUsuario = "INSERT INTO usuario (persona_id, cuenta_id, rol_id) VALUES (?, ?, ?);";
                    sql.ejecutarResSQL(crearUsuario, [idPersona, idCuenta, idRol], (resultadoUsuario) => {
                        if (resultadoUsuario["affectedRows"] > 0) {
                            const idUsuarioInsertado = resultadoUsuario["insertId"];
                            console.log("idUsuarioInsertado: ", idUsuarioInsertado);
                            // Segunda consulta para insertar en usuario_tema

                            const insertarTemasNuevoUsuario =
                                "INSERT INTO usuario_tema (idUsuario, idTema) SELECT ?, id FROM tema;";
                            sql.ejecutarResSQL(
                                insertarTemasNuevoUsuario,
                                [idUsuarioInsertado],
                                (resultadoTemasUsuario) => {
                                    // No verificamos affectedRows aquí, continuamos con la siguiente inserción
                                    const insertarSubtemasNuevoUsuario =
                                        "INSERT INTO tema_subtema (idUsuario, idSubtema) SELECT ?, id FROM subtema;";
                                    sql.ejecutarResSQL(
                                        insertarSubtemasNuevoUsuario,
                                        [idUsuarioInsertado],
                                        (resultadoSubtemasUsuario) => {
                                            // No verificamos affectedRows aquí, continuamos con la siguiente inserción
                                            const insertarEjerciciosNuevoUsuario =
                                                "INSERT INTO subtema_ejercicio (idUsuario, idEjercicio) SELECT ?, id FROM ejercicio;";
                                            sql.ejecutarResSQL(
                                                insertarEjerciciosNuevoUsuario,
                                                [idUsuarioInsertado],
                                                (resultadoEjercicioUsuario) => {
                                                    // No verificamos affectedRows aquí, continuamos con la última inserción
                                                    const insertarPreguntasNuevoUsuario =
                                                        "INSERT INTO ejercicio_pregunta (idUsuario, idPregunta) SELECT ?, id FROM pregunta;";
                                                    sql.ejecutarResSQL(
                                                        insertarPreguntasNuevoUsuario,
                                                        [idUsuarioInsertado],
                                                        (resultadoPreguntaUsuario) => {
                                                            // Aquí tampoco verificamos affectedRows
                                                            return res.status(200).send({
                                                                en: 1,
                                                                m: "Se registró correctamente el usuario",
                                                                tipoUsuario: "De Interno a Externo",
                                                                userId: idUsuarioInsertado,
                                                            });
                                                        }
                                                    );
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        } else {
                            return res.status(200).send({ en: -1, m: "No se pudo crear el usuario" });
                        }
                    });
                } else {
                    return res.status(200).send({ en: -1, m: "Tipo de rol no válido" });
                }
            });
        });
    });
});

router.post('/obtenerDetallesUsuarioAerobase', (req, res) => {
    // obtener datos de usuario interno como si fuera un usuario externo
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).send({ en: -1, m: "Se requiere el ID del usuario en el cuerpo de la solicitud." });
    }

    // Primero, obtenemos el persona_id, cuenta_id, rol_id y progreso asociados al usuario
    const obtenerIdsUsuario = "SELECT id, persona_id, cuenta_id, rol_id, progreso FROM usuario WHERE id = ?;";

    sql.ejecutarResSQL(obtenerIdsUsuario, [userId], (resultado) => {
        if (resultado.length > 0) {
            const { id, persona_id, cuenta_id, rol_id, progreso } = resultado[0];

            // Segundo, obtenemos los detalles de la persona
            const obtenerDetallesPersona = "SELECT * FROM persona WHERE id = ?;";
            sql.ejecutarResSQL(obtenerDetallesPersona, [persona_id], (detallesPersona) => {
                // Y también los detalles de la cuenta
                const obtenerDetallesCuenta = "SELECT id, email FROM cuenta WHERE id = ?;";
                sql.ejecutarResSQL(obtenerDetallesCuenta, [cuenta_id], (detallesCuenta) => {
                    // Tercero, obtenemos los detalles del rol
                    const obtenerDetallesRol = "SELECT * FROM rol WHERE id = ?;";
                    sql.ejecutarResSQL(obtenerDetallesRol, [rol_id], (detallesRol) => {
                        return res.status(200).send({
                            en: 1,
                            m: "Detalles de la persona, cuenta y rol obtenidos",
                            userId: id,
                            progreso: progreso,  // Agregamos el progreso del usuario a la respuesta
                            detallesPersona: detallesPersona[0],
                            detallesCuenta: detallesCuenta[0],
                            detallesRol: detallesRol[0],
                            tipoUsuario: "De Interno a Externo",
                        });
                    });
                });
            });
        } else {
            return res.status(200).send({ en: -1, m: "No se encontraron detalles para el usuario" });
        }
    });

});

router.post('/comprobarExistenciaDeUsuarioInternoComoUsuarioInterno', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send({ en: -1, m: "El email es obligatorio" });
    }

    // Consulta para saber si el usuario posee o no una cuenta en el sistema
    const verificarExistenciaCuenta = "SELECT * FROM cuenta WHERE email = ?;";

    sql.ejecutarResSQL(verificarExistenciaCuenta, [email], (resultadoExistenciaCuenta) => {
        console.log("CUENTA EXISTE")
        console.log(resultadoExistenciaCuenta);
        if (resultadoExistenciaCuenta.length > 0) {
            const { id: idCuenta } = resultadoExistenciaCuenta[0];
            // Existe cuenta de usuario
            const obtenerIdsUsuario = "SELECT id FROM usuario WHERE cuenta_id = ?;";
            sql.ejecutarResSQL(obtenerIdsUsuario, [idCuenta], (resultadoUserID) => {
                if (resultadoUserID.length > 0) {
                    const { id: idUsuario } = resultadoUserID[0];

                    // Consulta para saber si la cuenta existente del usuario es como usuario interno (Aerobase) o externo (Normal)
                    const verificarCuentaComoUsuarioExterno = "SELECT * FROM cuenta WHERE email = ? and usuarioAerobase = -1;";

                    sql.ejecutarResSQL(verificarCuentaComoUsuarioExterno, [email], (resultadoCuentaComoUsuarioExterno) => {
                        console.log(resultadoCuentaComoUsuarioExterno);

                        if (resultadoCuentaComoUsuarioExterno.length > 0) {
                            
                            // Existe cuenta de usuario externo (Normal)
                            return res.status(200).send({
                                en: 1,
                                tipoUsuario: "Externo",
                                userId: idUsuario,
                                m: "El Usuario SÍ posee una cuenta en el sistema como usuario externo"
                            });
                        } else {
                            // Existe cuenta de usuario interno (Aerobase)
                            return res.status(200).send({
                                en: 1,
                                tipoUsuario: "Interno",
                                userId: idUsuario,
                                m: "El Usuario Sí posee una cuenta en el sistema como usuario interno"
                            });
                        }
                    });
                } else {
                    return res.status(200).send({ en: -1, m: "No se encontraron detalles para el usuario" });
                }
            });
        } else {
            // NO Existe cuenta de usuario
            return res.status(200).send({
                en: 1,
                m: "El Usuario NO posee ninguna cuenta en el sistema"
            });
        }
    });
});

module.exports = router;