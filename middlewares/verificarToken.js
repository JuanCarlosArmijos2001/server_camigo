var jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET_KEY;
// Función para generar un token JWT
function generarToken(payload) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '3h' });
}

// Función para verificar un token JWT
function verificarToken(token, next) {
    jwt.verify(token, SECRET_KEY, function (err, decoded) {
        if (err) {
            console.log("El token no es valido");
            return next(err);
        }
        return next(null, decoded);
    });
}

module.exports = {
    generarToken: generarToken,
    verificarToken: verificarToken,
};
