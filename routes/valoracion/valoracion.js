const router = require("express").Router();
const sql = require("../../config/config");

router.post("/valoracionTemas", [], (req, res) => {
    let idUsuario = req.body.idUsuario;
    let idTema = req.body.idTema;

    const toggleValoracion =
        "UPDATE usuario_tema SET valoracion = CASE WHEN valoracion = 1 THEN -1 ELSE 1 END " +
        "WHERE idUsuario = ? AND idTema = ?;";

    sql.ejecutarResSQL(toggleValoracion, [idUsuario, idTema], (resultado) => {
        if (resultado["affectedRows"] > 0) {
            return res.status(200).send({
                en: 1,
                m: "Se actualizó la valoración con éxito",
            });
        } else {
            return res.status(200).send({ en: -1, m: "No se actualizó la valoración del tema" });
        }
    });
});

router.post("/valoracionStatus", [], (req, res) => {
    let idUsuario = req.body.idUsuario;
    let idTema = req.body.idTema;

    const getValoracion = "SELECT valoracion FROM usuario_tema WHERE idUsuario = ? AND idTema = ?;";
    
    sql.ejecutarResSQL(getValoracion, [idUsuario, idTema], (resultado) => {
        if (resultado.length > 0) {
            return res.status(200).json({
                en: 1,
                valoracion: resultado[0].valoracion
            });
        } else {
            return res.status(200).json({ en: -1, valoracion: -1 });
        }
    });
});

router.get("/topTemas", [], (req, res) => {
    const query = `
        SELECT 
            t.id, 
            t.titulo, 
            SUM(CASE WHEN ut.valoracion = 1 THEN 1 ELSE 0 END) as likes
        FROM 
            tema t
        LEFT JOIN 
            usuario_tema ut ON t.id = ut.idTema
        GROUP BY 
            t.id, t.titulo
        ORDER BY 
            likes DESC
        LIMIT 5
    `;

    sql.ejecutarResSQL(query, [], (resultado) => {
        if (resultado.length > 0) {
            return res.status(200).json({
                en: 1,
                temas: resultado
            });
        } else {
            return res.status(200).json({ en: -1, m: "No se encontraron temas" });
        }
    });
});

module.exports = router;