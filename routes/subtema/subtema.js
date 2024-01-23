const router = require("express").Router();
const sql = require("../../config/config");

router.post("/registrarSubtema", [], (req, res) => {
    let titulo = req.body.titulo;
    let objetivos = req.body.objetivos;
    let descripcion = req.body.descripcion;
    let ejemploCodigo = req.body.ejemploCodigo;
    let recursos = req.body.recursos;
    let estado = 1;
    let idTema = req.body.idTema;

    const registrarSubtema =
        "INSERT INTO subtema (titulo, objetivos, descripcion, ejemploCodigo, recursos, estado, idTema) VALUES (?, ?, ?, ?, ?, ?, ?);";

    sql.ejecutarResSQL(
        registrarSubtema,
        [titulo, objetivos, descripcion, ejemploCodigo, recursos, estado, idTema],
        (resultado) => {
            if (resultado["affectedRows"] > 0)
                return res.status(200).send({
                    en: 1,
                    m: "Se registró el subtema con éxito",
                    idSubtema: resultado["insertId"],
                });
            return res.status(200).send({ en: -1, m: "No se pudo registrar el subtema" });
        }
    );
});

router.post("/editarSubtema", [], (req, res) => {
    let id = req.body.id;
    let titulo = req.body.titulo;
    let objetivos = req.body.objetivos;
    let descripcion = req.body.descripcion;
    let ejemploCodigo = req.body.ejemploCodigo;
    let recursos = req.body.recursos;
    const editarSubtema =
        "UPDATE subtema SET titulo = ?, objetivos = ?, descripcion = ?, ejemploCodigo = ?, recursos = ? WHERE id = ?;";
    sql.ejecutarResSQL(
        editarSubtema,
        [titulo, objetivos, descripcion, ejemploCodigo, recursos, id],
        (resultado) => {
            //return res.status(200).send({result:resultado, titulo:titulo, descripcion:descripcion, id:id})
            if (resultado["affectedRows"] > 0)
                return res
                    .status(200)
                    .send({ en: 1, m: "Se editó el subtema con éxito", idSubtema: id });
            return res.status(200).send({ en: -1, m: "No se pudo editar el subtema" });
        }
    );
});

//DEBES ACTIVAR Y DESACTIVAR
router.post("/activarDesactivarSubtema", [], (req, res) => {
    let id = req.body.id;
    let estado = req.body.estado;
    const actualizarSubtema = "UPDATE subtema SET estado = ? WHERE id = ?;";
    sql.ejecutarResSQL(actualizarSubtema, [estado, id], (resultado) => {
        //return res.status(200).send({result:resultado, titulo:titulo, descripcion:descripcion, id:id})
        if (resultado["affectedRows"] > 0)
            return res
                .status(200)
                .send({ en: 1, m: "Cambio el estado del subtema", idSubtema: id });
        return res
            .status(200)
            .send({ en: -1, m: "No se pudo cambiar el estado del subtema" });
    });
});


router.post("/listarSubtemas", (req, res) => {
    let idTema = req.body.idTema;
    let obtenerSubtemas;
    if (req.body.mensaje === "subtemasActivos") {
        obtenerSubtemas = "SELECT * FROM subtema WHERE idTema = ? AND estado = 1;";
    } else {
        obtenerSubtemas = "SELECT * FROM subtema WHERE idTema = ?;";
    }
    sql.ejecutarResSQL(obtenerSubtemas, [idTema], (resultado) => {
        if (resultado.length > 0) {
            return res
                .status(200)
                .send({ en: 1, m: "Subtemas obtenidos", subtemas: resultado });
        } else {
            return res.status(200).send({ en: -1, m: "No se encontraron subtemas" });
        }
    });
});



module.exports = router;
