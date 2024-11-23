const router = require("express").Router();
const sql = require("../../config/config");


router.post('/registrarUsuarioAerobaseComoUsuarioExterno', (req, res) => {
 //registrar usuario en mi bd cuando ya existe en aerobase (usuario nuevo del todo)
});

router.post('/registrarUsuarioB', (req, res) => {
 //registrar usuario en mi bd cuando el usuario tiene cuenta en mi bd pero se registro con una de aerobase
});

router.post('/registrarUsuarioAerobaseComoUsuarioExterno', (req, res) => {
 // registrar usuario en mi bd cuando ya existe en mi bd
});

router.post('/obtenerDetallesUsuarioAerobase', (req, res) => {
 // obtener usuario de aerobase
});





router.post('/validarUsuarioAerobase', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send({ en: -1, m: "El email es obligatorio" });
    }

    // Consulta para obtener el valor de userAerobase
    const verificarUserAerobase = "SELECT userAerobase FROM cuenta WHERE email = ? and userAerobase = 1;";

    sql.ejecutarResSQL(verificarUserAerobase, [email], (resultado) => {
        if (resultados.length > 0) {
            return res.status(200).send({
                en: 1,
                usuarioAerobase: usuarioAerobase,
                m: "Usuario interno"
            });
        } else {
            return res.status(200).send({
                en: -1,
                usuarioAerobase: usuarioAerobase,
                m: "Usuario externo"
            });
        }
        
        // if (resultado.length > 0) {
        //     const usuarioAerobase = resultado[0].userAerobase;

        //     if (usuarioAerobase === -1) {
        //         return res.status(200).send({
        //             en: 1,
        //             usuarioAerobase: usuarioAerobase,
        //             m: "Usuario externo"
        //         });
        //     } else if (usuarioAerobase === 1) {
        //         return res.status(200).send({
        //             en: 1,
        //             usuarioAerobase: usuarioAerobase,
        //             m: "Usuario interno"
        //         });
        //     } else {
        //         return res.status(200).send({
        //             en: -1,
        //             usuarioAerobase: usuarioAerobase,
        //             m: "Estado no reconocido para el usuario"
        //         });
        //     }
        // } else {
        //     return res.status(200).send({
        //         en: -1,
        //         usuarioAerobase: null,
        //         m: "Usuario no encontrado"
        //     });
        // }
    });
});