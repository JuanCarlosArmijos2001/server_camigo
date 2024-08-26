const router = require("express").Router();
const sql = require("../../config/config");

router.post("/registrarPeriodoAcademico", [], async (req, res) => {
    let mesInicio = req.body.mesInicio;
    let mesFin = req.body.mesFin;
    let anio = req.body.anio;

    const registrarPeriodo = "INSERT INTO periodo_academico (mesInicio, mesFin, anio) VALUES (?, ?, ?);";
    
    sql.ejecutarResSQL(registrarPeriodo, [mesInicio, mesFin, anio], (resultado) => {
        if (resultado["affectedRows"] > 0) {
            // Si se registró el periodo académico, procedemos a verificar si hay un periodo anterior
            verificarPeriodoAnterior(res, resultado["insertId"]);
        } else {
            return res.status(500).send({ en: -1, m: "No se pudo registrar el periodo académico" });
        }
    });
});

//Obtener los periodos académicos registrados
router.get("/periodosAcademicosRegistrados", [], async (req, res) => {
    // Consulta a la base de datos para obtener la lista de períodos académicos
    const queryPeriodosAcademicos = "SELECT id, mesInicio, mesFin, anio FROM periodo_academico ORDER BY id DESC;";

    sql.ejecutarResSQL(queryPeriodosAcademicos, [], (resultado) => {
        if (resultado && !resultado.error) {
            return res.status(200).send({
                en: 1,
                m: "Lista de períodos académicos",
                periodos: resultado
            });
        } else {
            return res.status(500).send({
                en: -1,
                m: "Error al obtener la lista de períodos académicos",
                error: resultado.error
            });
        }
    });
});

//Obtener la información en base al periodo académico seleccionado
router.post("/periodoAcademicoAnterior", [], async (req, res) => {
    const idPeriodoAcademico = req.body.idPeriodoAcademico;

    const queryProgreso = `
        SELECT
            p.nombres AS usuario,
            pu.progreso AS progreso,
            GROUP_CONCAT(CONCAT('Tema ', t.id, ': ', pt.progreso, '%') SEPARATOR '\n') AS progresoTemas,
            GROUP_CONCAT(CONCAT('Subtema ', s.id, ': ', ps.progreso, '%') SEPARATOR '\n') AS progresoSubtemas,
            GROUP_CONCAT(CONCAT('Ejercicio ', e.id, ': ', pe.progreso, '%') SEPARATOR '\n') AS progresoEjercicios
        FROM usuario u
        JOIN periodo_usuario pu ON u.id = pu.idUsuario
        JOIN persona p ON u.persona_id = p.id
        LEFT JOIN periodo_tema pt ON pu.id = pt.idPeriodoUsuario
        LEFT JOIN tema t ON pt.idTema = t.id
        LEFT JOIN periodo_subtema ps ON pt.id = ps.idPeriodoTema
        LEFT JOIN subtema s ON ps.idSubtema = s.id
        LEFT JOIN periodo_ejercicio pe ON ps.id = pe.idPeriodoSubtema
        LEFT JOIN ejercicio e ON pe.idEjercicio = e.id
        WHERE pu.idPeriodoAcademico = ?
        GROUP BY u.id, pu.progreso
    `;

    sql.ejecutarResSQL(queryProgreso, [idPeriodoAcademico], (resultado) => {
        if (resultado && resultado.length > 0) {
            return res.status(200).send({
                en: 1,
                m: "Información del progreso del período académico",
                progreso: resultado
            });
        } else {
            return res.status(200).send({
                en: 1,
                m: "Información del progreso del período académico",
                progreso: []
            });
        }
    });
});

function verificarPeriodoAnterior(res, idPeriodoActual) {
    const queryPeriodoAnterior = "SELECT id FROM periodo_academico WHERE id < ? ORDER BY id DESC LIMIT 1;";
    
    sql.ejecutarResSQL(queryPeriodoAnterior, [idPeriodoActual], (resultado) => {
        if (resultado && resultado.length > 0) {
            // Si existe un periodo anterior, realizamos la copia de seguridad
            ejecutarCopiaSeguridad(res, resultado[0].id, idPeriodoActual);
        } else {
            // Si no hay periodo anterior, simplemente respondemos que se registró el nuevo periodo
            return res.status(200).send({
                en: 1,
                m: "Se registró el periodo académico. No se realizó copia de seguridad por ser el primer periodo.",
                idPeriodoAcademico: idPeriodoActual
            });
        }
    });
}

function ejecutarCopiaSeguridad(res, idPeriodoAnterior, idPeriodoActual) {
    const queries = [
        `INSERT INTO periodo_usuario (idUsuario, idPeriodoAcademico, progreso) 
         SELECT u.id, ?, u.progreso FROM usuario u;`,
        
        `INSERT INTO periodo_tema (idTema, idPeriodoUsuario, progreso) 
         SELECT t.id, pu.id, COALESCE(ut.progreso, 0) 
         FROM tema t 
         CROSS JOIN periodo_usuario pu 
         LEFT JOIN usuario_tema ut ON ut.idTema = t.id AND ut.idUsuario = pu.idUsuario 
         WHERE pu.idPeriodoAcademico = ?;`,
        
        `INSERT INTO periodo_subtema (idSubtema, idPeriodoTema, progreso) 
         SELECT s.id, pt.id, COALESCE(us.progreso, 0) 
         FROM subtema s 
         JOIN tema t ON s.idTema = t.id 
         CROSS JOIN periodo_usuario pu 
         JOIN periodo_tema pt ON pt.idTema = t.id AND pt.idPeriodoUsuario = pu.id 
         LEFT JOIN tema_subtema us ON us.idSubtema = s.id AND us.idUsuario = pu.idUsuario 
         WHERE pu.idPeriodoAcademico = ?;`,
        
        `INSERT INTO periodo_ejercicio (idEjercicio, idPeriodoSubtema, progreso) 
         SELECT e.id, ps.id, COALESCE(ue.progreso, 0) 
         FROM ejercicio e 
         JOIN subtema s ON e.idSubtema = s.id 
         JOIN tema t ON s.idTema = t.id 
         CROSS JOIN periodo_usuario pu 
         JOIN periodo_tema pt ON pt.idTema = t.id AND pt.idPeriodoUsuario = pu.id 
         JOIN periodo_subtema ps ON ps.idSubtema = s.id AND ps.idPeriodoTema = pt.id 
         LEFT JOIN subtema_ejercicio ue ON ue.idEjercicio = e.id AND ue.idUsuario = pu.idUsuario 
         WHERE pu.idPeriodoAcademico = ?;`
    ];

    ejecutarQueries(queries, 0, idPeriodoAnterior, res, idPeriodoActual);
}

function ejecutarQueries(queries, index, idPeriodoAnterior, res, idPeriodoActual) {
    if (index >= queries.length) {
        return res.status(200).send({
            en: 1,
            m: "Se registró el nuevo periodo académico y se realizó la copia de seguridad del periodo anterior con éxito",
            idPeriodoAcademico: idPeriodoActual,
            idPeriodoAnterior: idPeriodoAnterior
        });
    }

    sql.ejecutarResSQL(queries[index], [idPeriodoAnterior], (resultado) => {
        if (resultado && !resultado.error) {
            ejecutarQueries(queries, index + 1, idPeriodoAnterior, res, idPeriodoActual);
        } else {
            return res.status(500).send({
                en: -1,
                m: `Error en la copia de seguridad en el paso ${index + 1}`,
                error: resultado.error
            });
        }
    });
}

//Funcion para obtener el progreso de un solo periodo academico
function obtenerProgresoUsuariosPeriodoAcademico(idPeriodoAcademico) {
    const queryProgreso = `
        SELECT
            p.nombres AS usuario,
            pu.progreso AS progreso,
            GROUP_CONCAT(CONCAT('Tema ', t.id, ': ', pt.progreso, '%') SEPARATOR '\n') AS progresoTemas,
            GROUP_CONCAT(CONCAT('Subtema ', s.id, ': ', ps.progreso, '%') SEPARATOR '\n') AS progresoSubtemas,
            GROUP_CONCAT(CONCAT('Ejercicio ', e.id, ': ', pe.progreso, '%') SEPARATOR '\n') AS progresoEjercicios
        FROM usuario u
        JOIN periodo_usuario pu ON u.id = pu.idUsuario
        JOIN persona p ON u.persona_id = p.id
        LEFT JOIN periodo_tema pt ON pu.id = pt.idPeriodoUsuario
        LEFT JOIN tema t ON pt.idTema = t.id
        LEFT JOIN periodo_subtema ps ON pt.id = ps.idPeriodoTema
        LEFT JOIN subtema s ON ps.idSubtema = s.id
        LEFT JOIN periodo_ejercicio pe ON ps.id = pe.idPeriodoSubtema
        LEFT JOIN ejercicio e ON pe.idEjercicio = e.id
        WHERE pu.idPeriodoAcademico = ?
        GROUP BY u.id, pu.progreso
    `;

    return sql.ejecutarResSQL(queryProgreso, [idPeriodoAcademico]);
}


module.exports = router;