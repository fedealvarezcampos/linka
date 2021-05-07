const jwt = require('jsonwebtoken');
const SQL = require('sql-template-strings');

const { database } = require('../infrastructure');

async function validateAuth(req, res, next) {
    try {
        const { authorization } = req.headers;

        if (!authorization || !authorization.startsWith('Bearer ')) {
            const error = new Error('Authorization required.');
            error.code = 401;
            throw error;
        }

        const token = authorization.slice(7, authorization.length);
        const decodedToken = jwt.verify(token, process.env.SECRET);

        const query = SQL`SELECT * FROM users WHERE id = ${decodedToken.id}`;
        const [users] = await database.pool.query(query);

        if (!users || !users.length) {
            const error = new Error('User does not exist.');
            error.code = 401;
            throw error;
        }

        req.auth = decodedToken;
        next();
    } catch (err) {
        next(err);
    }
}

module.exports = { validateAuth };
