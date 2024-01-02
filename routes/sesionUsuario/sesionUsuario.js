const router = require("express").Router();
const sql = require("../../config/config");
const md5 = require('md5');

router.post('/autenticacion', (req, res) => {
    const { email, clave } = req.body;
    const obtenerCuenta = "SELECT * FROM cuenta WHERE email = ?;";

    sql.ejecutarResSQL(obtenerCuenta, [email], (resultado) => {
        if (resultado.length > 0) {
            const claveEncriptadaIngresada = md5(clave);

            // Compara la clave encriptada ingresada con la clave encriptada almacenada
            if (claveEncriptadaIngresada === resultado[0].clave) {
                // Incluye el externalId en la respuesta
                const { externalId, ...usuarioInfo } = resultado[0];
                return res.status(200).send({ en: 1, m: "Autenticación exitosa", usuario: usuarioInfo, externalId });
            } else {
                return res.status(200).send({ en: -1, m: "Credenciales inválidas" });
            }
        } else {
            return res.status(200).send({ en: -1, m: "Credenciales inválidas" });
        }
    });
});

router.post('/registro', (req, res) => {
    const { nombres, apellidos, email, clave, tipoRol, external_id } = req.body;

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

                // Obtener el ID del rol basado en el tipo de rol proporcionado
                const obtenerIdRol = "SELECT id FROM rol WHERE tipo = ?;";
                sql.ejecutarResSQL(obtenerIdRol, [tipoRol], (resultadoIdRol) => {
                    if (resultadoIdRol.length > 0) {
                        const idRol = resultadoIdRol[0].id;

                        // Crear un nuevo usuario
                        const crearUsuario = "INSERT INTO persona (nombres, apellidos, idCuenta, idRol, external_id) VALUES (?, ?, ?, ?, ?);";
                        sql.ejecutarResSQL(crearUsuario, [nombres, apellidos, idCuenta, idRol, external_id], (resultadoUsuario) => {
                            return res.status(200).send({ en: 1, m: "Registro exitoso" });
                        });
                    } else {
                        return res.status(200).send({ en: -1, m: "Tipo de rol no válido" });
                    }
                });
            });
        }
    });
});

module.exports = router;
