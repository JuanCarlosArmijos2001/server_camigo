const { app, server } = require('../../server');
const request = require('supertest');
const api = request(app);
const rutaPreguntas = '/preguntas';
const rutaHistorial = '/historial';

const bodyRegistrar = {
    enunciado: 'Nuevo enunciado de prueba',
    opcion_a: 'Opción A de prueba',
    opcion_b: 'Opción B de prueba',
    opcion_c: 'Opción C de prueba',
    opcion_d: 'Opción D de prueba',
    respuesta_correcta: 'a',
    justificacion: 'Justificación de la respuesta de prueba',
    idEjercicio: 27
};

const bodyEditar = {
    id: 32,
    enunciado: 'Enunciado editado',
    opcion_a: 'Opción A editada',
    opcion_b: 'Opción B editada',
    opcion_c: 'Opción C editada',
    opcion_d: 'Opción D editada',
    respuesta_correcta: 'b',
    justificacion: 'Justificación editada',
    estado: 1
};

const bodyListarActivas = {
    idEjercicio: 27,
    idUsuario: 47,
    mensaje: "preguntasActivas"
};

const bodyCompletarPregunta = {
    idPregunta: 32,
    idEjercicio: 27,
    idSubtema: 37,
    idTema: 32,
    idUsuario: 47
};

const bodyRegistrarCambio = {
    tipoEntidad: "pregunta",
    idTema: 32,
    idSubtema: 37,
    idEjercicio: 27,
    idPregunta: 32,
    detalles: "Se actualizó el contenido de la pregunta",
    idUsuario: 47
};

const bodyActivar_Desactivar = {
    id: 32,
    estado: 1
};

// Listar preguntas
describe('Test de listado de preguntas', () => {
    it('Listar preguntas activas del ejercicio', async () => {
        const response = await api
            .post(rutaPreguntas + '/listarPreguntas')
            .send(bodyListarActivas);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Preguntas obtenidas");
        expect(Array.isArray(response.body.preguntas)).toBe(true);
    });

    it('Intento de listar preguntas cuando no hay ninguna', async () => {
        const bodySinPreguntas = {
            idEjercicio: 999, // ID de ejercicio que no tiene preguntas
            idUsuario: 47,
            mensaje: "preguntasActivas"
        };

        const response = await api
            .post(rutaPreguntas + '/listarPreguntas')
            .send(bodySinPreguntas);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(-1);
        expect(response.body.m).toBe("No se encontraron preguntas");
    });

    it('Listar todas las preguntas del ejercicio (activas e inactivas)', async () => {
        const bodyTodasPreguntas = {
            idEjercicio: 27,
            idUsuario: 47
        };

        const response = await api
            .post(rutaPreguntas + '/listarPreguntas')
            .send(bodyTodasPreguntas);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Preguntas obtenidas");
        expect(Array.isArray(response.body.preguntas)).toBe(true);
    });
});

// Registrar pregunta
describe('Test de registro de preguntas', () => {
    it('Registrar una nueva pregunta con notificaciones', async () => {
        const response = await api
            .post(rutaPreguntas + '/registrarPregunta')
            .send(bodyRegistrar);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Se registró la pregunta con éxito y se enviaron correos de notificación");
        expect(response.body.idPregunta).toBeDefined();
        expect(typeof response.body.idPregunta).toBe('number');
    });
});

// Editar pregunta
describe('Test de edición de preguntas', () => {
    it('Editar una pregunta existente', async () => {
        const response = await api
            .post(rutaPreguntas + '/editarPregunta')
            .send(bodyEditar);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Se editó la pregunta con éxito");
        expect(response.body.idPregunta).toBe(bodyEditar.id);
        expect(response.body.preguntaEditadaBackend).toEqual(bodyEditar);
    });

    it('Intentar editar una pregunta inexistente', async () => {
        const bodyPreguntaInexistente = {
            ...bodyEditar,
            id: 999 // ID que no existe en la base de datos
        };

        const response = await api
            .post(rutaPreguntas + '/editarPregunta')
            .send(bodyPreguntaInexistente);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(-1);
        expect(response.body.m).toBe("No se pudo editar la pregunta");
    });
});

// Completar pregunta
describe('Test de completar pregunta', () => {
    it('Completar una pregunta existente', async () => {
        const response = await api
            .post(rutaPreguntas + '/completarPregunta')
            .send(bodyCompletarPregunta);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.progresoEjercicio).toBeDefined();
        expect(response.body.progresoSubtema).toBeDefined();
        expect(response.body.progresoTema).toBeDefined();
        expect(response.body.progresoUsuario).toBeDefined();
    });

    it('Intentar completar una pregunta inexistente', async () => {
        const bodyPreguntaInexistente = {
            ...bodyCompletarPregunta,
            idPregunta: 999 // ID que no existe
        };

        const response = await api
            .post(rutaPreguntas + '/completarPregunta')
            .send(bodyPreguntaInexistente);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(-1);
        expect(response.body.m).toBe("No se pudo completar la pregunta");
    });
});

// Historial de cambios por pregunta
describe('Test de registro de cambios en pregunta', () => {
    it('Registrar un nuevo cambio en pregunta', async () => {
        const response = await api
            .post(rutaHistorial + '/registrarCambio')
            .send(bodyRegistrarCambio);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Se registró el cambio con éxito");
        expect(response.body.idCambio).toBeDefined();
        expect(typeof response.body.idCambio).toBe('number');
    });
});

// Activar/desactivar pregunta
describe('Pruebas para activar/desactivar pregunta', () => {
    it('debería activar una pregunta correctamente', async () => {
        const response = await api
            .post(rutaPreguntas + '/activarDesactivarPregunta')
            .send(bodyActivar_Desactivar)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Cambio el estado de la pregunta");
        expect(response.body.idPregunta).toBe(bodyActivar_Desactivar.id);
    });

    it('debería desactivar una pregunta correctamente', async () => {
        bodyActivar_Desactivar.estado = -1;

        const response = await api
            .post(rutaPreguntas + '/activarDesactivarPregunta')
            .send(bodyActivar_Desactivar)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Cambio el estado de la pregunta");
        expect(response.body.idPregunta).toBe(bodyActivar_Desactivar.id);
    });

    it('debería manejar el intento de activar/desactivar una pregunta inexistente', async () => {
        const bodyPreguntaInexistente = {
            ...bodyActivar_Desactivar,
            id: 999 // ID que no existe
        };

        const response = await api
            .post(rutaPreguntas + '/activarDesactivarPregunta')
            .send(bodyPreguntaInexistente)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body.en).toBe(-1);
        expect(response.body.m).toBe("No se pudo cambiar el estado de la pregunta");
    });
});

afterAll(() => {
    server.close();
});