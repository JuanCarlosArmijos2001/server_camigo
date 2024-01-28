const router = require("express").Router();
const sql = require("../../config/config");
const generarToken = require('../../middlewares/verificarToken').generarToken;
const verificarToken = require('../../middlewares/verificarToken').verificarToken;
const md5 = require('md5');

router.post('/autenticacion', (req, res) => {
    const { email, clave } = req.body;
    const obtenerUsuario = "SELECT u.id AS usuario_id, u.persona_id, u.cuenta_id, u.rol_id, c.clave FROM usuario u JOIN cuenta c ON u.cuenta_id = c.id WHERE c.email = ?;";

    sql.ejecutarResSQL(obtenerUsuario, [email], (resultado) => {
        if (resultado.length > 0) {
            const claveEncriptadaGuardada = resultado[0].clave;
            const claveEncriptadaIngresada = md5(clave);

            if (claveEncriptadaIngresada === claveEncriptadaGuardada) {
                const userId = resultado[0].usuario_id;
                const token = generarToken({ userId });
                const horaCreacion = new Date();
                const horaExpiracion = new Date();
                horaExpiracion.setHours(horaExpiracion.getHours() + 3);

                verificarToken(token, (err, decoded) => {
                    if (err) {
                        return res.status(401).send({ en: -1, m: "Token no válido" });
                    }

                    const estado = 1; // Puedes modificar el estado según tus necesidades
                    const insertarSesion = "INSERT INTO sesion (usuario_id, token, hora_creacion, hora_expiracion, estado) VALUES (?, ?, ?, ?, ?);";
                    sql.ejecutarResSQL(insertarSesion, [userId, token, horaCreacion, horaExpiracion, estado], (insertarResultado) => {
                        console.log('Token generado y sesión creada:', token);
                        return res.status(200).send({ en: 1, m: "Autenticación exitosa", token });
                    });
                });
            } else {
                return res.status(200).send({ en: -1, m: "Credenciales inválidas" });
            }
        } else {
            return res.status(200).send({ en: -1, m: "Credenciales inválidas" });
        }
    });
});

router.post("/detalleSesion", (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).send({ en: -1, m: "Se requiere el ID del usuario en el cuerpo de la solicitud." });
    }

    // Primero, obtenemos el persona_id, cuenta_id y rol_id asociados al usuario
    const obtenerIdsUsuario = "SELECT id, persona_id, cuenta_id, rol_id FROM usuario WHERE id = ?;";

    sql.ejecutarResSQL(obtenerIdsUsuario, [userId], (resultado) => {
        if (resultado.length > 0) {
            const { id, persona_id, cuenta_id, rol_id } = resultado[0];

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
                            userId: id,  // Agregamos el ID del usuario a la respuesta
                            detallesPersona: detallesPersona[0],
                            detallesCuenta: detallesCuenta[0],
                            detallesRol: detallesRol[0],
                        });
                    });
                });
            });
        } else {
            return res.status(200).send({ en: -1, m: "No se encontraron detalles para el usuario" });
        }
    });
});


router.post('/registro', (req, res) => {
    const { nombres, apellidos, email, clave, tipoRol } = req.body;

    // Verificar si el email ya está registrado
    const verificarEmail = "SELECT * FROM cuenta WHERE email = ?;";
    sql.ejecutarResSQL(verificarEmail, [email], (resultado) => {
        if (resultado.length > 0) {
            return res.status(200).send({ en: -1, m: "El email ya está registrado" });
        } else {
            // Crear una nueva cuenta
            const claveEncriptada = md5(clave);
            const crearCuenta = "INSERT INTO cuenta (email, clave) VALUES (?, ?);";
            sql.ejecutarResSQL(crearCuenta, [email, claveEncriptada], (resultadoCuenta) => {
                // Obtener el ID de la cuenta recién creada
                const idCuenta = resultadoCuenta.insertId;

                // Crear un nuevo registro en la tabla persona
                const crearPersona = "INSERT INTO persona (nombres, apellidos) VALUES (?, ?);";
                sql.ejecutarResSQL(crearPersona, [nombres, apellidos], (resultadoPersona) => {
                    // Obtener el ID de la persona recién creada
                    const idPersona = resultadoPersona.insertId;

                    // Obtener el ID del rol basado en el tipo de rol proporcionado
                    const obtenerIdRol = "SELECT id FROM rol WHERE tipo = ?;";
                    sql.ejecutarResSQL(obtenerIdRol, [tipoRol], (resultadoIdRol) => {
                        if (resultadoIdRol.length > 0) {
                            const idRol = resultadoIdRol[0].id;

                            // Crear un nuevo usuario
                            const crearUsuario = "INSERT INTO usuario (persona_id, cuenta_id, rol_id) VALUES (?, ?, ?);";
                            sql.ejecutarResSQL(crearUsuario, [idPersona, idCuenta, idRol], (resultadoUsuario) => {
                                return res.status(200).send({ en: 1, m: "Registro exitoso" });
                            });
                        } else {
                            return res.status(200).send({ en: -1, m: "Tipo de rol no válido" });
                        }
                    });
                });
            });
        }
    });
});


router.put('/editarUsuario', (req, res) => {
    const { userId, nombres, apellidos, email, clave } = req.body;

    // Verificar si el usuario existe
    const verificarUsuario = "SELECT * FROM usuario WHERE id = ?;";

    sql.ejecutarResSQL(verificarUsuario, [userId], (resultadoUsuario) => {
        if (resultadoUsuario.length === 0) {
            return res.status(404).send({ en: -1, m: "Usuario no encontrado" });
        }

        // Actualizar la cuenta asociada al usuario, incluida la clave si se proporciona
        let actualizarCuenta;
        let parametrosCuenta;

        if (clave) {
            // Si se proporciona una nueva clave, actualizar también la clave
            actualizarCuenta = "UPDATE cuenta SET email = ?, clave = ? WHERE id = ?;";
            const claveEncriptada = md5(clave);
            parametrosCuenta = [email, claveEncriptada, resultadoUsuario[0].cuenta_id];
        } else {
            // Si no se proporciona una nueva clave, solo actualizar el email
            actualizarCuenta = "UPDATE cuenta SET email = ? WHERE id = ?;";
            parametrosCuenta = [email, resultadoUsuario[0].cuenta_id];
        }

        sql.ejecutarResSQL(actualizarCuenta, parametrosCuenta, (resultadoCuenta) => {
            // Actualizar la persona asociada al usuario
            const actualizarPersona = "UPDATE persona SET nombres = ?, apellidos = ? WHERE id = ?;";
            sql.ejecutarResSQL(actualizarPersona, [nombres, apellidos, resultadoUsuario[0].persona_id], (resultadoPersona) => {
                return res.status(200).send({ en: 1, m: "Usuario actualizado exitosamente" });
            });
        });
    });
});

router.get('/listarDocentes', (req, res) => {
    const listarDocentes = `
        SELECT persona.nombres, persona.apellidos, cuenta.email
        FROM usuario
        INNER JOIN persona ON usuario.persona_id = persona.id
        INNER JOIN cuenta ON usuario.cuenta_id = cuenta.id
        INNER JOIN rol ON usuario.rol_id = rol.id
        WHERE rol.tipo = 'docente';
    `;

    sql.ejecutarResSQL(listarDocentes, [], (resultados) => {
        if (resultados.length > 0) {
            res.status(200).json(resultados);
        } else {
            console.error("No se encontraron docentes.");
            res.status(200).json({ en: -1, m: "No se encontraron docentes" });
        }
    });
});

router.get('/listarAdministradores', (req, res) => {
    const listarAdministradores = `
        SELECT persona.nombres, persona.apellidos, cuenta.email
        FROM usuario
        INNER JOIN persona ON usuario.persona_id = persona.id
        INNER JOIN cuenta ON usuario.cuenta_id = cuenta.id
        INNER JOIN rol ON usuario.rol_id = rol.id
        WHERE rol.tipo = 'administrador';
    `;

    sql.ejecutarResSQL(listarAdministradores, [], (resultados) => {
        if (resultados.length > 0) {
            res.status(200).json(resultados);
        } else {
            console.error("No se encontraron administradores.");
            res.status(200).json({ en: -1, m: "No se encontraron administradores" });
        }
    });
});





module.exports = router;