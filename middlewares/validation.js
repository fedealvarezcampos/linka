const jwt = require('jsonwebtoken');
const { usersRepository } = require('../repos');

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

        const user = await usersRepository.getUserByName(decodedToken.username);

        if (!user) {
            const error = new Error('User does not exist.');
            error.code = 401;
            throw error;
        }

        if (user.verified === 0) {
            const err = new Error(`User is not verified, either register or confirm your account.`);
            err.code = 401;

            throw err;
        }

        req.auth = decodedToken;
        next();
    } catch (err) {
        next(err);
    }
}

module.exports = { validateAuth };
