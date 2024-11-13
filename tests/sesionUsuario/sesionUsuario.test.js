const { app, server } = require('../../server');
const request = require('supertest');
const api = request(app);
const rutaSesionUsuario = '/sesionUsuario';

// Bodies para pruebas de registro
const bodyEstudiante = {
    nombres: 'Juan',
    apellidos: 'Pérez',
    email: 'juan.perez@test.com',
    clave: '123456',
    tipoRol: 'estudiante'
};

const bodyDocente = {
    nombres: 'María',
    apellidos: 'García',
    email: 'maria.garcia@test.com',
    clave: '123456',
    tipoRol: 'docente'
};

const bodyAdministrador = {
    nombres: 'Carlos',
    apellidos: 'López',
    email: 'carlos.lopez@test.com',
    clave: '123456',
    tipoRol: 'administrador'
};

// Bodies para pruebas de edición
const bodyEdicionCompleta = {
    userId: 47,
    nombres: 'Juan Editado',
    apellidos: 'Pérez Editado',
    email: 'juan.editado@test.com',
    clave: 'nueva123'
};

const bodyEdicionSinClave = {
    userId: 47,
    nombres: 'Juan Editado',
    apellidos: 'Pérez Editado',
    email: 'juan.editado@test.com'
};

describe('Test de registro de usuarios', () => {
    it('Registrar un nuevo estudiante', async () => {
        const response = await api
            .post(rutaSesionUsuario + '/registro')
            .send(bodyEstudiante);
        expect(response.statusCode).toBe(200);
        expect(response.body.en).toEqual(1);
        expect(response.body.m).toEqual("Se registró correctamente el usuario");
    });

    it('Registrar un nuevo docente', async () => {
        const response = await api
            .post(rutaSesionUsuario + '/registro')
            .send(bodyDocente);
        expect(response.statusCode).toBe(200);
        expect(response.body.en).toEqual(1);
        expect(response.body.m).toEqual("Se registró correctamente el usuario");
    });

    it('Registrar un nuevo administrador', async () => {
        const response = await api
            .post(rutaSesionUsuario + '/registro')
            .send(bodyAdministrador);
        expect(response.statusCode).toBe(200);
        expect(response.body.en).toEqual(1);
        expect(response.body.m).toEqual("Se registró correctamente el usuario");
    });

    it('Intento de registro con email duplicado', async () => {
        const response = await api
            .post(rutaSesionUsuario + '/registro')
            .send(bodyEstudiante);
        expect(response.statusCode).toBe(200);
        expect(response.body.en).toEqual(-1);
        expect(response.body.m).toEqual("El email ya está registrado");
    });
});

describe('Test de edición de usuarios', () => {
    it('Editar usuario exitosamente con todos los campos incluyendo clave', async () => {
        const response = await api
            .post(rutaSesionUsuario + '/editarUsuario')
            .send(bodyEdicionCompleta);
        expect(response.statusCode).toBe(200);
        expect(response.body.en).toEqual(1);
        expect(response.body.m).toEqual("Usuario actualizado exitosamente");
        expect(response.body).toHaveProperty('usuarioEditado');
    });

    it('Editar usuario exitosamente sin cambiar la clave', async () => {
        const response = await api
            .post(rutaSesionUsuario + '/editarUsuario')
            .send(bodyEdicionSinClave);
        expect(response.statusCode).toBe(200);
        expect(response.body.en).toEqual(1);
        expect(response.body.m).toEqual("Usuario actualizado exitosamente");
        expect(response.body).toHaveProperty('usuarioEditado');
    });

    it('Intento de edición de usuario inexistente', async () => {
        const bodyUsuarioInexistente = {
            ...bodyEdicionCompleta,
            userId: 99999 // ID que no existe
        };
        const response = await api
            .post(rutaSesionUsuario + '/editarUsuario')
            .send(bodyUsuarioInexistente);
        expect(response.statusCode).toBe(404);
        expect(response.body.en).toEqual(-1);
        expect(response.body.m).toEqual("Usuario no encontrado");
    });
});

afterAll(() => {
    server.close();
});