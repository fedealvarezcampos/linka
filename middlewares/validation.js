const jwt = require('jsonwebtoken');

const { database } = require('../infrastructure');

async function validateAuth(req, res, next) {
    try {
        const { authorization } = req.headers;

        if (!authorization || !authorization.startsWith('Bearer ')) {
            const error = new Error('Authorization header required');
            error.code = 401;
            throw error;
        }

        const token = authorization.slice(7, authorization.length);
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const query = 'SELECT * FROM users WHERE id = ?';
        const [users] = await database.pool.query(query, decodedToken.id);

        if (!users || !users.length) {
            const error = new Error('El usuario ya no existe');
            error.code = 401;
            throw error;
        }

        req.auth = decodedToken;
        next();
    } catch (err) {
        res.status(err.status || 500);
        res.send({ error: err.message });
    }
}

module.exports = { validateAuth };
