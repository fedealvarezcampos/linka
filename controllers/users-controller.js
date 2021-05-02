const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
            username: Joi.string().min(4).max(18).required(),
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

        const msg = {
            to: `${newUser.email}`,
            from: 'linka.noreply@gmail.com',
            subject: 'Sending with Twilio SendGrid is Fun',
            templateId: 'd-115445c28a684e788f3197a79251ec9d',
            dynamicTemplateData: {
                name: newUser.username,
                header: 'localhost:3000',
                uuid: newUser.UUID,
            },
        };

        await sgMail.send(msg);

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

async function updateUser(req, res, next) {
    try {
        const { username } = req.params;
        const {
            password,
            confirmPass,
            bio,
            userSite,
            userTW,
            userIG,
        } = req.body;

        const schema = Joi.object({
            password: Joi.string().min(5).max(20),
            confirmPass: Joi.string().min(5).max(20),
            bio: Joi.string().min(5).max(100),
            userSite: Joi.string().min(5).max(50),
            userTW: Joi.string().min(5).max(50),
            userIG: Joi.string().min(5).max(50),
        });

        await schema.validateAsync({
            password,
            confirmPass,
            bio,
            userSite,
            userTW,
            userIG,
        });

        const userWithUsername = await usersRepository.getUserByName(username);

        if (!userWithUsername) {
            const err = new Error(`User does not exist.`);
            err.code = 409;

            throw err;
        }

        if (password !== confirmPass) {
            const err = new Error(
                'Password and confirmed password must be the same.'
            );
            err.code = 400;

            throw err;
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const updatedUser = await usersRepository.updateUser(username, {
            password: passwordHash,
            bio,
            userSite,
            userTW,
            userIG,
        });

        res.send({
            username,
            bio,
            userSite,
            userTW,
            userIG,
        });
    } catch (err) {
        next(err);
    }
}

async function loginUser(req, res, next) {
    try {
        const { email, password } = req.body;

        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(5).max(20).required(),
        });

        await schema.validateAsync({ email, password });

        const user = await usersRepository.getUserByEmail(email);

        if (!user) {
            const error = new Error(`User doesn't exist.`);
            error.code = 401;

            throw error;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            const error = new Error('Wrong password.');
            error.code = 401;

            throw error;
        }

        const tokenPayload = { UUID: user.UUID };

        const token = jwt.sign(tokenPayload, process.env.SECRET, {
            expiresIn: '3d',
        });

        res.send({
            id: user.id,
            token,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getUserByName,
    registerUser,
    loginUser,
    updateUser,
};
