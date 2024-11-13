const { app, server } = require('../../server');
const request = require('supertest');
const api = request(app);
const rutaEjercicios = '/ejercicios';
const rutaHistorial = '/historial';

const bodyRegistrar = {
    titulo: 'Nuevo Ejercicio de Prueba',
    instrucciones: 'Instrucciones del ejercicio de prueba',
    restricciones: 'Restricciones del ejercicio de prueba',
    solucion: 'console.log("Solución de prueba");',
    retroalimentacion: 'Retroalimentación del ejercicio de prueba',
    idSubtema: 37
};

const bodyEditar = {
    id: 27,
    titulo: 'Título editado del ejercicio',
    instrucciones: 'Instrucciones editadas del ejercicio',
    restricciones: 'Restricciones editadas del ejercicio',
    solucion: 'console.log("Solución editada");',
    retroalimentacion: 'Retroalimentación editada del ejercicio',
    estado: 1
};

const bodyListarActivos = {
    idSubtema: 37,
    idUsuario: 47,
    mensaje: "ejerciciosActivos"
};

const bodyRegistrarCambio = {
    tipoEntidad: "ejercicio",
    idTema: null,
    idSubtema: 37,
    idEjercicio: 27,
    idPregunta: null,
    detalles: "Se actualizó el contenido del ejercicio",
    idUsuario: 47
};

const bodyActivar_Desactivar = {
    id: 27,
    estado: 1
};

// Listar ejercicios
describe('Test de listado de ejercicios', () => {
    it('Listar ejercicios activos del subtema', async () => {
        const response = await api
            .post(rutaEjercicios + '/listarEjercicios')
            .send(bodyListarActivos);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Ejercicios obtenidos");
        expect(Array.isArray(response.body.ejercicios)).toBe(true);
    });

    it('Intento de listar ejercicios cuando no hay ninguno', async () => {
        const bodySinEjercicios = {
            idSubtema: 999, // ID de subtema que no tiene ejercicios
            idUsuario: 47,
            mensaje: "ejerciciosActivos"
        };

        const response = await api
            .post(rutaEjercicios + '/listarEjercicios')
            .send(bodySinEjercicios);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(-1);
        expect(response.body.m).toBe("No se encontraron ejercicios");
    });

    it('Listar todos los ejercicios del subtema (activos e inactivos)', async () => {
        const bodyTodosEjercicios = {
            idSubtema: 37,
            idUsuario: 47
        };

        const response = await api
            .post(rutaEjercicios + '/listarEjercicios')
            .send(bodyTodosEjercicios);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Ejercicios obtenidos");
        expect(Array.isArray(response.body.ejercicios)).toBe(true);
    });
});

// Registrar ejercicio
describe('Test de registro de ejercicios', () => {
    it('Registrar un nuevo ejercicio con notificaciones', async () => {
        const response = await api
            .post(rutaEjercicios + '/registrarEjercicio')
            .send(bodyRegistrar);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Se registró el ejercicio con éxito y se enviaron correos de notificación");
        expect(response.body.idEjercicio).toBeDefined();
        expect(typeof response.body.idEjercicio).toBe('number');
    });
});

// Editar ejercicio
describe('Test de edición de ejercicios', () => {
    it('Editar un ejercicio existente', async () => {
        const response = await api
            .post(rutaEjercicios + '/editarEjercicio')
            .send(bodyEditar);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Se editó el ejercicio con éxito");
        expect(response.body.idEjercicio).toBe(bodyEditar.id);
        expect(response.body.ejercicioEditadoBackend).toEqual(bodyEditar);
    });

    it('Intentar editar un ejercicio inexistente', async () => {
        const bodyEjercicioInexistente = {
            ...bodyEditar,
            id: 999 // ID que no existe en la base de datos
        };

        const response = await api
            .post(rutaEjercicios + '/editarEjercicio')
            .send(bodyEjercicioInexistente);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(-1);
        expect(response.body.m).toBe("No se pudo editar el ejercicio");
    });
});

// Historial de cambios por ejercicio
describe('Test de registro de cambios en ejercicio', () => {
    it('Registrar un nuevo cambio en ejercicio', async () => {
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

// Activar/desactivar ejercicio
describe('Pruebas para activar/desactivar ejercicio', () => {
    it('debería activar un ejercicio correctamente', async () => {
        const response = await api
            .post(rutaEjercicios + '/activarDesactivarEjercicio')
            .send(bodyActivar_Desactivar)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Cambio el estado del ejercicio");
        expect(response.body.idEjercicio).toBe(bodyActivar_Desactivar.id);
    });

    it('debería desactivar un ejercicio correctamente', async () => {
        bodyActivar_Desactivar.estado = -1;

        const response = await api
            .post(rutaEjercicios + '/activarDesactivarEjercicio')
            .send(bodyActivar_Desactivar)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Cambio el estado del ejercicio");
        expect(response.body.idEjercicio).toBe(bodyActivar_Desactivar.id);
    });

    it('debería manejar el intento de activar/desactivar un ejercicio inexistente', async () => {
        const bodyEjercicioInexistente = {
            ...bodyActivar_Desactivar,
            id: 999 // ID que no existe
        };

        const response = await api
            .post(rutaEjercicios + '/activarDesactivarEjercicio')
            .send(bodyEjercicioInexistente)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body.en).toBe(-1);
        expect(response.body.m).toBe("No se pudo cambiar el estado del ejercicio");
    });
});

afterAll(() => {
    server.close();
});