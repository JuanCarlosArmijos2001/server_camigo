const router = require("express").Router();
const sql = require("../../config/config");

router.post("/registrarComentario", [], (req, res) => {
    let nombreUsuario = req.body.nombreUsuario;
    let contenido = req.body.contenido;
    let idEjercicio = req.body.idEjercicio;

    const registrarComentario =
        "INSERT INTO comentario (nombreUsuario, contenido, idEjercicio) VALUES (?, ?, ?);";

    sql.ejecutarResSQL(registrarComentario, [nombreUsuario, contenido, idEjercicio], (resultado) => {
        if (resultado["affectedRows"] > 0) {
            return res.status(200).send({
                en: 1,
                m: "Se registró el comentario con éxito",
                idComentario: resultado["insertId"],
            });
        }
        return res.status(200).send({ en: -1, m: "No se pudo registrar el comentario" });
    });
});

router.post("/editarComentario", [], (req, res) => {
    let id = req.body.id;
    let nombreUsuario = req.body.nombreUsuario;
    let contenido = req.body.contenido;

    const editarComentario =
        "UPDATE comentario SET nombreUsuario = ?, contenido = ? WHERE id = ?;";

    sql.ejecutarResSQL(editarComentario, [nombreUsuario, contenido, id], (resultado) => {
        if (resultado["affectedRows"] > 0) {
            return res.status(200).send({
                en: 1,
                m: "Se editó el comentario con éxito",
                idComentario: id,
            });
        }
        return res.status(200).send({ en: -1, m: "No se pudo editar el comentario" });
    });
});


router.post("/listarComentarios", (req, res) => {
    let idEjercicio = req.body.idEjercicio;

    const listarComentarios =
        "SELECT * FROM comentario WHERE idEjercicio = ?;";

    sql.ejecutarResSQL(listarComentarios, [idEjercicio], (resultado) => {
        if (resultado.length > 0) {
            return res.status(200).send({ en: 1, m: "Comentarios obtenidos", comentarios: resultado });
        } else {
            return res.status(200).send({ en: -1, m: "No se encontraron comentarios", comentarios: [] });
        }
    });
});



module.exports = router;