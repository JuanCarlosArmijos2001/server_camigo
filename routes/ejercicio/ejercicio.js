const router = require("express").Router();
const sql = require("../../config/config");

router.post("/registrarEjercicio", [], (req, res) => {
    let titulo = req.body.titulo;
    let instrucciones = req.body.instrucciones;
    let restricciones = req.body.restricciones;
    let solucion = req.body.solucion;
    let estado = 1;
    let idSubtema = req.body.idSubtema;
    const registrarEjercicio =
        "INSERT INTO ejercicio (titulo, instrucciones, restricciones, solucion, estado, idSubtema) VALUES (?, ?, ?, ?, ?, ?);";
    sql.ejecutarResSQL(
        registrarEjercicio,
        [titulo, instrucciones, restricciones, solucion, estado, idSubtema],
        (resultado) => {
            if (resultado["affectedRows"] > 0)
                return res.status(200).send({
                    en: 1,
                    m: "Se registro el ejercicio con éxito",
                    idEjercicio: resultado["insertId"],
                });
            return res.status(200).send({ en: -1, m: "No se pudo registrar ejercicio" });
        }
    );
});

router.post("/editarEjercicio", [], (req, res) => {
    let id = req.body.id;
    let titulo = req.body.titulo;
    let instrucciones = req.body.instrucciones;
    let restricciones = req.body.restricciones;
    let solucion = req.body.solucion;
    const editarEjercicio =
        "UPDATE ejercicio SET titulo = ?, instrucciones = ?, restricciones = ?, solucion = ? WHERE id = ?;";
    sql.ejecutarResSQL(
        editarEjercicio,
        [titulo, instrucciones, restricciones, solucion, id],
        (resultado) => {
            //return res.status(200).send({result:resultado, titulo:titulo, descripcion:descripcion, id:id})
            if (resultado["affectedRows"] > 0)
                return res
                    .status(200)
                    .send({ en: 1, m: "Se editó el ejercicio con éxito", idEjercicio: id });
            return res.status(200).send({ en: -1, m: "No se pudo editar el ejercicio" });
        }
    );
});

//DEBES ACTIVAR Y DESACTIVAR
router.post("/activarDesactivarEjercicio", [], (req, res) => {
    let id = req.body.id;
    let estado = req.body.estado;
    const actualizarEjercicio = "UPDATE ejercicio SET estado = ? WHERE id = ?;";
    sql.ejecutarResSQL(actualizarEjercicio, [estado, id], (resultado) => {
        //return res.status(200).send({result:resultado, titulo:titulo, descripcion:descripcion, id:id})
        if (resultado["affectedRows"] > 0)
            return res
                .status(200)
                .send({ en: 1, m: "Cambio el estado del ejercicio", idEjercicio: id });
        return res
            .status(200)
            .send({ en: -1, m: "No se pudo cambiar el estado del ejercicio" });
    });
});

// router.post("/listarEjercicios", (req, res) => {
//     let idSubtema = req.body.idSubtema;
//     const obtenerTitulo = "SELECT * FROM ejercicio WHERE idSubtema = ?;";
//     sql.ejecutarResSQL(obtenerTitulo, [idSubtema], (resultado) => {
//         if (resultado.length > 0) {
//             return res
//                 .status(200)
//                 .send({ en: 1, m: "Subtemas obtenidos", ejercicios: resultado });
//         } else {
//             return res.status(200).send({ en: -1, m: "No se encontraron subtemas" });
//         }
//     });
// });

router.post("/listarEjercicios", (req, res) => {
    let idSubtema = req.body.idSubtema;
    let obtenerEjercicios;
        if (req.body.mensaje === "ejerciciosActivos") {
            obtenerEjercicios = "SELECT * FROM ejercicio WHERE idSubtema = ? AND estado = 1;";
        } else {
            obtenerEjercicios = "SELECT * FROM ejercicio WHERE idSubtema = ?;";
        }
    sql.ejecutarResSQL(obtenerEjercicios, [idSubtema], (resultado) => {
        if (resultado.length > 0) {
            return res
                .status(200)
                .send({ en: 1, m: "Ejercicios obtenidos", ejercicios: resultado });
        } else {
            return res.status(200).send({ en: -1, m: "No se encontraron ejercicios" });
        }
    });
});

module.exports = router;
