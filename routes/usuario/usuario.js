const router = require("express").Router();
const sql = require("../../config/config");
const BD = process.env.BD;

router.post("/progresoUsuario", (req, res) => {
    let idUsuario = req.body.idUsuario;
    console.log("idUsuario de usuario:", idUsuario);
    const obtenerProgreso = `SELECT progreso FROM ${BD}.usuario WHERE id = ?`;
    sql.ejecutarResSQL(obtenerProgreso, [idUsuario], (resultado) => {
        console.log("Resultado", resultado);
        console.log("Longitud de resultado", resultado.length);
        if (resultado.length > 0) {
            return res
                .status(200)
                .send({ en: 1, m: "Progreso del usuario", progreso: resultado[0].progreso });
        } else {
            return res.status(200).send({ en: -1, m: "No se encontro el progreso del usuario" });
        }
    });
});


module.exports = router;