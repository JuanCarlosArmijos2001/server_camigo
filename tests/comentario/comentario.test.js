const { app, server } = require('../../server');
const request = require('supertest');
const api = request(app);
const rutaComentarios = '/comentarios';
const rutaUsuario = '/usuario';
const rutaPeriodo = '/periodoAcademico';
const rutaValoracion = '/valoracion';

const bodyRegistrar = {
    nombreUsuario: 'Usuario Test',
    contenido: 'Este es un comentario de prueba',
    idEjercicio: 27
};

const bodyEditar = {
    id: 13,
    nombreUsuario: 'Usuario Editado',
    contenido: 'Contenido del comentario editado'
};

const bodyListar = {
    idEjercicio: 27
};

const bodyProgresoExistente = {
    idUsuario: 47
};

const bodyProgresoInexistente = {
    idUsuario: 999
};

const bodyPeriodoValido = {
    mesInicio: '2025-03-01',
    mesFin: '2025-07-01'
};

const bodyValoracionExistente = {
    idUsuario: 47,
    idTema: 32
};

// Listar comentarios
describe('Test de listado de comentarios', () => {
    it('Listar comentarios de un ejercicio con comentarios existentes', async () => {
        const response = await api
            .post(rutaComentarios + '/listarComentarios')
            .send(bodyListar);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Comentarios obtenidos");
        expect(Array.isArray(response.body.comentarios)).toBe(true);
    });

    it('Intento de listar comentarios cuando no hay ninguno', async () => {
        const bodySinComentarios = {
            idEjercicio: 999 // ID de ejercicio que no tiene comentarios
        };

        const response = await api
            .post(rutaComentarios + '/listarComentarios')
            .send(bodySinComentarios);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(-1);
        expect(response.body.m).toBe("No se encontraron comentarios");
        expect(Array.isArray(response.body.comentarios)).toBe(true);
        expect(response.body.comentarios).toHaveLength(0);
    });
});

// Registrar comentario
describe('Test de registro de comentarios', () => {
    it('Registrar un nuevo comentario exitosamente', async () => {
        const response = await api
            .post(rutaComentarios + '/registrarComentario')
            .send(bodyRegistrar);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Se registró el comentario con éxito");
        expect(response.body.idComentario).toBeDefined();
        expect(typeof response.body.idComentario).toBe('number');
    });
});

// Editar comentario
describe('Test de edición de comentarios', () => {
    it('Editar un comentario existente', async () => {
        const response = await api
            .post(rutaComentarios + '/editarComentario')
            .send(bodyEditar);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Se editó el comentario con éxito");
        expect(response.body.idComentario).toBe(bodyEditar.id);
    });

    it('Intentar editar un comentario inexistente', async () => {
        const bodyComentarioInexistente = {
            ...bodyEditar,
            id: 999 // ID que no existe en la base de datos
        };

        const response = await api
            .post(rutaComentarios + '/editarComentario')
            .send(bodyComentarioInexistente);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(-1);
        expect(response.body.m).toBe("No se pudo editar el comentario");
    });

    it('Intentar editar un comentario con datos incompletos', async () => {
        const bodyIncompleto = {
            id: 1,
            // Faltan nombreUsuario y contenido
        };

        const response = await api
            .post(rutaComentarios + '/editarComentario')
            .send(bodyIncompleto);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(-1);
        expect(response.body.m).toBe("No se pudo editar el comentario");
    });
});

// Progreso de usuario
describe('Test de progreso de usuario', () => {
    it('Obtener progreso de un usuario existente', async () => {
        const response = await api
            .post(rutaUsuario + '/progresoUsuario')
            .send(bodyProgresoExistente);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Progreso del usuario");
        expect(response.body.progreso).toBeDefined();
        expect(typeof response.body.progreso).toBe('number');
    });

    it('Intentar obtener progreso de un usuario inexistente', async () => {
        const response = await api
            .post(rutaUsuario + '/progresoUsuario')
            .send(bodyProgresoInexistente);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(-1);
        expect(response.body.m).toBe("No se encontro el progreso del usuario");
    });

    it('Intentar obtener progreso sin proporcionar idUsuario', async () => {
        const response = await api
            .post(rutaUsuario + '/progresoUsuario')
            .send({});

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(-1);
        expect(response.body.m).toBe("No se encontro el progreso del usuario");
    });
});

// Registrar Periodo Académico
describe('Test de registro de periodo académico', () => {
    it('Registrar un nuevo periodo académico exitosamente', async () => {
        const response = await api
            .post(rutaPeriodo + '/registrarPeriodoAcademico')
            .send(bodyPeriodoValido);

        expect(response.statusCode).toBe(200);
        // Asumiendo que copiaSeguridadPeriodoAnterior devuelve un mensaje exitoso
        expect(response.body.en).toBe(1);
        expect(response.body.m).toBe("Se registró el periodo académico con éxito");
        expect(response.body.idPeriodo).toBeDefined();
        expect(typeof response.body.idPeriodo).toBe('number');
    });
});

// Registrar Periodo Académico
describe('Test de registro de periodo académico', () => {
    it('Registrar un nuevo periodo académico exitosamente', async () => {
        const response = await api
            .post(rutaPeriodo + '/registrarPeriodoAcademico')
            .send(bodyPeriodoValido);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        // Verificamos que el mensaje sea uno de los dos posibles mensajes de éxito
        expect([
            "Se registró el nuevo periodo académico y se realizó la copia de seguridad del periodo anterior con éxito",
            "Se registró el periodo académico. No se realizó copia de seguridad por ser el primer periodo."
        ]).toContain(response.body.m);

        // Verificamos que exista el ID del periodo académico
        expect(response.body.idPeriodoAcademico).toBeDefined();
        expect(typeof response.body.idPeriodoAcademico).toBe('number');

        // Si hay un periodo anterior, verificamos su ID
        if (response.body.m.includes("copia de seguridad del periodo anterior")) {
            expect(response.body.idPeriodoAnterior).toBeDefined();
            expect(typeof response.body.idPeriodoAnterior).toBe('number');
        }
    });

});

// Valoración Status
describe('Test de consulta de valoración', () => {
    it('Obtener valoración existente', async () => {
        const response = await api
            .post(rutaValoracion + '/valoracionStatus')
            .send(bodyValoracionExistente);

        expect(response.statusCode).toBe(200);
        expect(response.body.en).toBe(1);
        expect(response.body.valoracion).toBeDefined();
        expect(typeof response.body.valoracion).toBe('number');
        // La valoración solo puede ser -1 (no valorado) o 1 (like)
        expect([-1, 1]).toContain(response.body.valoracion);
    });
});

afterAll(() => {
    server.close();
});