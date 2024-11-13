const { app, server } = require('../../server');
const request = require('supertest');
const api = request(app);
const rutaTemas = '/temas';
const rutaHistorial = '/historial';

const bodyListarActivos = {
    idUsuario: 47,
    mensaje: "temasActivos"
};

const bodyRegistrar = {
    titulo: 'Nuevo Tema de Prueba',
    objetivos: 'Objetivos del tema de prueba',
    descripcion: 'Descripción del tema de prueba',
    recursos: 'Recursos del tema de prueba'
};

const bodyEditar = {
    id: 32,
    titulo: 'Título editado',
    objetivos: 'Objetivos editados',
    descripcion: 'Descripción editada',
    recursos: 'Recursos editados',
    estado: 1
};

const bodyRegistrarCambio = {
    tipoEntidad: "tema",
    idTema: 32,
    idSubtema: null,
    idEjercicio: null,
    idPregunta: null,
    detalles: "Se actualizó el contenido del tema",
    idUsuario: 47
};

const bodyActivar_Desactivar = {
    id: 32,
    estado: 1
};

const bodyBusquedaValida = {
    idUsuario: 47,            // ID de un usuario existente
    busqueda: "Título editado" // Término que existe en algún tema
};


//Listar temas
describe('Test de listado de temas', () => {
    // Prueba para listar temas activos
    it('Listar temas activos del usuario', async () => {
        const response = await api
            .post(rutaTemas + '/listarTemas')
            .send(bodyListarActivos);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Temas obtenidos");
        expect(Array.isArray(response.body.temas)).toBe(true);
    });

    // Prueba para el caso cuando no hay temas
    it('Intento de listar temas cuando no hay ninguno', async () => {
        const bodySinTemas = {
            idUsuario: 999 // ID de usuario que no tiene temas asignados
        };

        const response = await api
            .post(rutaTemas + '/listarTemas')
            .send(bodySinTemas);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(-1);
        expect(response.body.m).toBe("No se encontraron temas");
    });

    // Prueba para listar todos los temas (activos e inactivos)
    it('Listar todos los temas del usuario (activos e inactivos)', async () => {
        const bodyTodosTemas = {
            idUsuario: 47  // Usando el mismo ID que en la primera prueba
        };

        const response = await api
            .post(rutaTemas + '/listarTemas')
            .send(bodyTodosTemas);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Temas obtenidos");
        expect(Array.isArray(response.body.temas)).toBe(true);
    });
});

// registar tema
describe('Test de registro de temas', () => {
    // Prueba para registrar un tema exitosamente
    it('Registrar un nuevo tema con notificaciones', async () => {
        const response = await api
            .post(rutaTemas + '/registrarTema')
            .send(bodyRegistrar);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Se registró el tema con éxito y se enviaron correos de notificación");
        expect(response.body.idTema).toBeDefined();
        expect(typeof response.body.idTema).toBe('number');
    });
});

//editar tema
describe('Test de edición de temas', () => {
    // Prueba para editar un tema exitosamente
    it('Editar un tema existente', async () => {
        const response = await api
            .post(rutaTemas + '/editarTema')
            .send(bodyEditar);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Se editó el tema con éxito");
        expect(response.body.idTema).toBe(bodyEditar.id);
        expect(response.body.temaEditadoBackend).toEqual(bodyEditar);
    });

    // Prueba para intentar editar un tema que no existe
    it('Intentar editar un tema inexistente', async () => {
        const bodyTemaInexistente = {
            ...bodyEditar,
            id: 999 // ID que no existe en la base de datos
        };

        const response = await api
            .post(rutaTemas + '/editarTema')
            .send(bodyTemaInexistente);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(-1);
        expect(response.body.m).toBe("No se pudo editar el tema");
    });
});

//historial de cambios por tema
describe('Test de registro de cambios', () => {
    // Prueba para registrar un cambio exitosamente
    it('Registrar un nuevo cambio en tema', async () => {
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

//activar/desactivar tema

describe('Pruebas para activar/desactivar tema', () => {

    it('debería activar un tema correctamente', async () => {
        const response = await api
            .post(rutaTemas + '/activarDesactivarTema')
            .send(bodyActivar_Desactivar)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body.en).toBe(1);
    });

    it('debería desactivar un tema correctamente', async () => {
        bodyActivar_Desactivar.estado = -1;

        const response = await api
            .post(rutaTemas + '/activarDesactivarTema')
            .send(bodyActivar_Desactivar)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body.en).toBe(1);
    });
});

describe('Test de búsqueda de temas', () => {
    it('Buscar contenido con término existente', async () => {
        const response = await api
            .post(rutaTemas + '/buscarTemas')
            .send(bodyBusquedaValida);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Contenido encontrado");
        expect(Array.isArray(response.body.temas)).toBe(true);
        expect(response.body.temas.length).toBeGreaterThan(0);
        
        // Verificar la estructura de cada tema encontrado
        const primerTema = response.body.temas[0];
        expect(primerTema).toHaveProperty('idTema');
        expect(primerTema).toHaveProperty('progreso');
        expect(primerTema).toHaveProperty('titulo');
        expect(primerTema).toHaveProperty('objetivos');
        expect(primerTema).toHaveProperty('descripcion');
        expect(primerTema).toHaveProperty('recursos');
        expect(primerTema).toHaveProperty('estado');
    });
});

afterAll(() => {
    server.close();
});

