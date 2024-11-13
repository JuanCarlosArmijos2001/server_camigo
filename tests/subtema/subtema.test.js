const { app, server } = require('../../server');
const request = require('supertest');
const api = request(app);
const rutaSubtemas = '/subtemas';
const rutaHistorial = '/historial';

const bodyListarActivos = {
    idTema: 32,
    idUsuario: 47,
    mensaje: "subtemasActivos"
};

const bodyRegistrar = {
    idTema: 32,
    titulo: 'Nuevo Subtema de Prueba',
    objetivos: 'Objetivos del subtema de prueba',
    descripcion: 'Descripción del subtema de prueba',
    ejemploCodigo: 'console.log("Ejemplo de código");',
    recursos: 'Recursos del subtema de prueba',
    retroalimentacion: 'Retroalimentación del subtema de prueba'
};

const bodyEditar = {
    id: 37,
    titulo: 'Título editado del subtema',
    objetivos: 'Objetivos editados del subtema',
    descripcion: 'Descripción editada del subtema',
    ejemploCodigo: 'console.log("Código editado");',
    recursos: 'Recursos editados del subtema',
    retroalimentacion: 'Retroalimentación editada del subtema',
    estado: 1
};

const bodyRegistrarCambio = {
    tipoEntidad: "subtema",
    idTema: 32,
    idSubtema: 37,
    idEjercicio: null,
    idPregunta: null,
    detalles: "Se actualizó el contenido del subtema",
    idUsuario: 47
};

const bodyActivar_Desactivar = {
    id: 37,
    estado: 1
};

// Listar subtemas
describe('Test de listado de subtemas', () => {
    it('Listar subtemas activos del tema', async () => {
        const response = await api
            .post(rutaSubtemas + '/listarSubtemas')
            .send(bodyListarActivos);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Subtemas obtenidos");
        expect(Array.isArray(response.body.subtemas)).toBe(true);
    });

    it('Intento de listar subtemas cuando no hay ninguno', async () => {
        const bodySinSubtemas = {
            idTema: 999, // ID de tema que no tiene subtemas
            idUsuario: 47,
            mensaje: "subtemasActivos"
        };

        const response = await api
            .post(rutaSubtemas + '/listarSubtemas')
            .send(bodySinSubtemas);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(-1);
        expect(response.body.m).toBe("No se encontraron subtemas");
    });

    it('Listar todos los subtemas del tema (activos e inactivos)', async () => {
        const bodyTodosSubtemas = {
            idTema: 32,
            idUsuario: 47
        };

        const response = await api
            .post(rutaSubtemas + '/listarSubtemas')
            .send(bodyTodosSubtemas);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Subtemas obtenidos");
        expect(Array.isArray(response.body.subtemas)).toBe(true);
    });
});

// Registrar subtema
describe('Test de registro de subtemas', () => {
    it('Registrar un nuevo subtema con notificaciones', async () => {
        const response = await api
            .post(rutaSubtemas + '/registrarSubtema')
            .send(bodyRegistrar);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Se registró el subtema con éxito y se enviaron correos de notificación");
        expect(response.body.idSubtema).toBeDefined();
        expect(typeof response.body.idSubtema).toBe('number');
    });
});

// // Editar subtema
describe('Test de edición de subtemas', () => {
    it('Editar un subtema existente', async () => {
        const response = await api
            .post(rutaSubtemas + '/editarSubtema')
            .send(bodyEditar);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Se editó el subtema con éxito");
        expect(response.body.idSubtema).toBe(bodyEditar.id);
        expect(response.body.subtemaEditadoBackend).toEqual(bodyEditar);
    });

    it('Intentar editar un subtema inexistente', async () => {
        const bodySubtemaInexistente = {
            ...bodyEditar,
            id: 999 // ID que no existe en la base de datos
        };

        const response = await api
            .post(rutaSubtemas + '/editarSubtema')
            .send(bodySubtemaInexistente);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(-1);
        expect(response.body.m).toBe("No se pudo editar el subtema");
    });
});

// // Historial de cambios por subtema
describe('Test de registro de cambios en subtema', () => {
    it('Registrar un nuevo cambio en subtema', async () => {
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

// Activar/desactivar subtema
describe('Pruebas para activar/desactivar subtema', () => {
    it('debería activar un subtema correctamente', async () => {
        const response = await api
            .post(rutaSubtemas + '/activarDesactivarSubtema')
            .send(bodyActivar_Desactivar)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Cambio el estado del subtema");
        expect(response.body.idSubtema).toBe(bodyActivar_Desactivar.id);
    });

    it('debería desactivar un subtema correctamente', async () => {
        bodyActivar_Desactivar.estado = -1;

        const response = await api
            .post(rutaSubtemas + '/activarDesactivarSubtema')
            .send(bodyActivar_Desactivar)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Cambio el estado del subtema");
        expect(response.body.idSubtema).toBe(bodyActivar_Desactivar.id);
    });

    it('debería manejar el intento de activar/desactivar un subtema inexistente', async () => {
        const bodySubtemaInexistente = {
            ...bodyActivar_Desactivar,
            id: 999 // ID que no existe
        };

        const response = await api
            .post(rutaSubtemas + '/activarDesactivarSubtema')
            .send(bodySubtemaInexistente)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body.en).toBe(-1);
        expect(response.body.m).toBe("No se pudo cambiar el estado del subtema");
    });
});

afterAll(() => {
    server.close();
});