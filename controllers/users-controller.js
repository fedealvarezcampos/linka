const Joi = require('joi');
const bcrypt = require('bcryptjs');

const { usersRepository } = require('../repos');

async function getUserByName(req, res, next) {
    try {
        const { username } = req.params;
        const schema = Joi.string().min(5).max(15).required();
        await schema.validateAsync(username);

        const user = await usersRepository.getUserByName(username);

        res.send(user);
    } catch (err) {
        next(err);
    }
}

async function registerUser(req, res, next) {
    try {
        const { username, email, password, confirmPass } = req.body;

        const schema = Joi.object({
            username: Joi.string().min(5).max(15).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(5).max(20).required(),
            confirmPass: Joi.string().min(5).max(20).required(),
        });

        await schema.validateAsync({
            username,
            email,
            password,
            confirmPass,
        });

        if (password !== confirmPass) {
            const err = new Error(
                'Password and confirmed password must be the same.'
            );
            err.code = 400;

            throw err;
        }

        const userHasEmail = await usersRepository.getUserByEmail(email);

        if (userHasEmail) {
            const err = new Error(`Email adress already in use.`);
            err.code = 409;

            throw err;
        }

        const userHasUsername = await usersRepository.getUserByName(username);

        if (userHasUsername) {
            const err = new Error(`Username already taken.`);
            err.code = 409;

            throw err;
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await usersRepository.insertUser({
            username,
            email,
            password: passwordHash,
        });

        res.status(201);
        res.send({
            id: newUser.id,
            name: newUser.username,
            email: newUser.email,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getUserByName,
    registerUser,
};