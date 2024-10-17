const router = require("express").Router();
const sql = require("../../config/config");

router.post("/registrarCambio", (req, res) => {
    let tipoEntidad = req.body.tipoEntidad;
    let idTema = req.body.idTema;
    let idSubtema = req.body.idSubtema;
    let idEjercicio = req.body.idEjercicio;
    let idPregunta = req.body.idPregunta;
    let detalles = req.body.detalles;
    let idUsuario = req.body.idUsuario;

    const registrarCambio =
        "INSERT INTO historial (tipo_entidad, id_tema, id_subtema, id_ejercicio, id_pregunta, detalles, id_usuario) VALUES (?, ?, ?, ?, ?, ?, ?);";

    sql.ejecutarResSQL(
        registrarCambio,
        [tipoEntidad, idTema, idSubtema, idEjercicio, idPregunta, detalles, idUsuario],
        (resultado) => {
            if (resultado["affectedRows"] > 0) {
                return res.status(200).send({
                    en: 1,
                    m: "Se registró el cambio con éxito",
                    idCambio: resultado["insertId"],
                });
            } else {
                return res.status(200).send({ en: -1, m: "No se pudo registrar el cambio" });
            }
        }
    );
});


router.post("/listarCambios", (req, res) => {
    const idEntidad = req.body.idEntidad;
    const tipoEntidad = req.body.tipoEntidad;

    if (!idEntidad || !tipoEntidad) {
        return res.status(400).send({ en: -1, m: "El ID de la entidad y el tipo de entidad son obligatorios" });
    }

    let obtenerCambiosSQL;

    switch (tipoEntidad.toLowerCase()) {
        case "tema":
            obtenerCambiosSQL = "SELECT * FROM historial WHERE id_tema = ?;";
            break;
        case "subtema":
            obtenerCambiosSQL = "SELECT * FROM historial WHERE id_subtema = ?;";
            break;
        case "ejercicio":
            obtenerCambiosSQL = "SELECT * FROM historial WHERE id_ejercicio = ?;";
            break;
        case "pregunta":
            obtenerCambiosSQL = "SELECT * FROM historial WHERE id_pregunta = ?;";
            break;
        default:
            return res.status(400).send({ en: -1, m: "Tipo de entidad no válido" });
    }

    sql.ejecutarResSQL(obtenerCambiosSQL, [idEntidad], (resultado) => {
        if (resultado.length > 0) {
            // Invertir el orden de los resultados
            const cambiosInvertidos = resultado.reverse();
            return res.status(200).send({ en: 1, m: "Cambios obtenidos", cambios: cambiosInvertidos });
        } else {
            return res.status(200).send({ en: -1, m: `No se encontraron cambios para esta ${tipoEntidad}` });
        }
    });
});

module.exports = router;
